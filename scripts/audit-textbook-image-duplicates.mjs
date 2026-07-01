import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PNG } from "pngjs";

import { availableTextbookLevels } from "../src/course/textbook-playable.generated.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportDir = path.join(rootDir, "docs");
const jsonPath = path.join(reportDir, "textbook-image-duplicate-audit.json");
const mdPath = path.join(reportDir, "textbook-image-duplicate-audit.md");

const sampleWidth = 48;
const sampleHeight = 36;

const imageCache = new Map();

await mkdir(reportDir, { recursive: true });

const records = [];
const missing = [];

for (const level of availableTextbookLevels) {
  for (const [questionIndex, question] of level.questions.entries()) {
    const correctPath = path.join(rootDir, question.correctImage);
    const wrongPath = path.join(rootDir, question.wrongImage);

    if (!existsSync(correctPath) || !existsSync(wrongPath)) {
      missing.push({
        level: level.level,
        question: questionIndex + 1,
        id: question.id,
        sentence: question.sentence,
        wrongSentence: question.wrongSentence,
        correctImage: question.correctImage,
        wrongImage: question.wrongImage,
        missingCorrect: !existsSync(correctPath),
        missingWrong: !existsSync(wrongPath)
      });
      continue;
    }

    const correct = await loadImageStats(correctPath);
    const wrong = await loadImageStats(wrongPath);
    const mse = normalizedMse(correct.sample, wrong.sample);
    const dHashDistance = hamming(correct.dHash, wrong.dHash);
    const aHashDistance = hamming(correct.aHash, wrong.aHash);
    const exactSame = correct.sha256 === wrong.sha256;
    const semanticRisk = getSemanticRisk(question.sentence, question.wrongSentence);
    const severity = classifyRisk({ exactSame, mse, dHashDistance, aHashDistance, semanticRisk });

    records.push({
      level: level.level,
      question: questionIndex + 1,
      id: question.id,
      severity,
      exactSame,
      mse: round(mse),
      dHashDistance,
      aHashDistance,
      semanticRisk,
      sentence: question.sentence,
      wrongSentence: question.wrongSentence,
      correctImage: question.correctImage,
      wrongImage: question.wrongImage,
      correctSize: `${correct.width}x${correct.height}`,
      wrongSize: `${wrong.width}x${wrong.height}`
    });
  }
}

const suspicious = records
  .filter((record) => record.severity !== "ok")
  .sort(compareRisk);

const summary = {
  generatedAt: new Date().toISOString(),
  totalPairs: records.length,
  missingPairs: missing.length,
  suspiciousPairs: suspicious.length,
  bySeverity: countBy(records, "severity")
};

await writeFile(jsonPath, JSON.stringify({ summary, missing, suspicious, records }, null, 2));
await writeFile(mdPath, renderMarkdown(summary, missing, suspicious));

console.log(JSON.stringify({
  totalPairs: summary.totalPairs,
  missingPairs: summary.missingPairs,
  suspiciousPairs: summary.suspiciousPairs,
  bySeverity: summary.bySeverity,
  report: path.relative(rootDir, mdPath)
}, null, 2));

async function loadImageStats(filePath) {
  if (imageCache.has(filePath)) return imageCache.get(filePath);

  const buffer = await readFile(filePath);
  const png = PNG.sync.read(buffer);
  const stats = {
    width: png.width,
    height: png.height,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    sample: sampleImage(png, sampleWidth, sampleHeight),
    dHash: differenceHash(png),
    aHash: averageHash(png)
  };

  imageCache.set(filePath, stats);
  return stats;
}

function sampleImage(png, width, height) {
  const values = new Float32Array(width * height * 3);
  let outputIndex = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.min(png.width - 1, Math.floor((x + 0.5) * png.width / width));
      const sourceY = Math.min(png.height - 1, Math.floor((y + 0.5) * png.height / height));
      const { r, g, b } = readRgbOnWhite(png, sourceX, sourceY);
      values[outputIndex++] = r / 255;
      values[outputIndex++] = g / 255;
      values[outputIndex++] = b / 255;
    }
  }

  return values;
}

function differenceHash(png) {
  const width = 9;
  const height = 8;
  const luminance = sampleLuminance(png, width, height);
  let bits = "";

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width - 1; x += 1) {
      bits += luminance[y * width + x] > luminance[y * width + x + 1] ? "1" : "0";
    }
  }

  return bits;
}

function averageHash(png) {
  const width = 8;
  const height = 8;
  const luminance = sampleLuminance(png, width, height);
  const mean = luminance.reduce((sum, value) => sum + value, 0) / luminance.length;
  return luminance.map((value) => (value >= mean ? "1" : "0")).join("");
}

function sampleLuminance(png, width, height) {
  const values = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.min(png.width - 1, Math.floor((x + 0.5) * png.width / width));
      const sourceY = Math.min(png.height - 1, Math.floor((y + 0.5) * png.height / height));
      const { r, g, b } = readRgbOnWhite(png, sourceX, sourceY);
      values.push((0.299 * r + 0.587 * g + 0.114 * b) / 255);
    }
  }

  return values;
}

function readRgbOnWhite(png, x, y) {
  const index = (png.width * y + x) << 2;
  const alpha = png.data[index + 3] / 255;
  return {
    r: png.data[index] * alpha + 255 * (1 - alpha),
    g: png.data[index + 1] * alpha + 255 * (1 - alpha),
    b: png.data[index + 2] * alpha + 255 * (1 - alpha)
  };
}

function normalizedMse(left, right) {
  let sum = 0;
  const length = Math.min(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const diff = left[index] - right[index];
    sum += diff * diff;
  }

  return sum / length;
}

function hamming(left, right) {
  let distance = 0;
  const length = Math.min(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    if (left[index] !== right[index]) distance += 1;
  }

  return distance + Math.abs(left.length - right.length);
}

function classifyRisk({ exactSame, mse, dHashDistance, aHashDistance, semanticRisk }) {
  if (exactSame) return "exact";
  if (mse <= 0.0035 && dHashDistance <= 8) return "very_high";
  if (mse <= 0.0075 && (dHashDistance <= 12 || aHashDistance <= 10)) return "high";
  if (semanticRisk) return "semantic_review";
  if (mse <= 0.012 && dHashDistance <= 10 && aHashDistance <= 12) return "visual_review";
  return "ok";
}

function getSemanticRisk(sentence, wrongSentence) {
  const pair = `${normalize(sentence)} || ${normalize(wrongSentence)}`;
  const patterns = [
    [/putting .+ in .+ \|\| .+taking .+ out of .+/, "static in/out action may be visually identical"],
    [/taking .+ out of .+ \|\| .+putting .+ in .+/, "static in/out action may be visually identical"],
    [/packing .+schoolbag.+ \|\| .+emptying .+schoolbag/, "packing/emptying schoolbag can be visually ambiguous"],
    [/emptying .+schoolbag.+ \|\| .+packing .+schoolbag/, "packing/emptying schoolbag can be visually ambiguous"],
    [/putting on .+ \|\| .+taking off .+/, "putting-on/taking-off clothing can be visually ambiguous"],
    [/taking off .+ \|\| .+putting on .+/, "putting-on/taking-off clothing can be visually ambiguous"]
  ];

  return patterns.find(([pattern]) => pattern.test(pair))?.[1] ?? "";
}

function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[.!?]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function compareRisk(left, right) {
  const ranks = {
    exact: 0,
    very_high: 1,
    high: 2,
    visual_review: 3,
    semantic_review: 4,
    ok: 5
  };

  return ranks[left.severity] - ranks[right.severity]
    || left.mse - right.mse
    || left.level - right.level
    || left.question - right.question;
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    counts[item[key]] = (counts[item[key]] ?? 0) + 1;
    return counts;
  }, {});
}

function round(value) {
  return Number(value.toFixed(6));
}

function renderMarkdown(summary, missing, suspicious) {
  const lines = [
    "# Textbook Image Duplicate Audit",
    "",
    `Generated: ${summary.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Total question pairs checked: ${summary.totalPairs}`,
    `- Missing image pairs: ${summary.missingPairs}`,
    `- Suspicious pairs: ${summary.suspiciousPairs}`,
    `- Severity counts: ${Object.entries(summary.bySeverity).map(([key, value]) => `${key}: ${value}`).join(", ")}`,
    "",
    "## Suspicious Pairs",
    ""
  ];

  if (missing.length) {
    lines.push("## Missing Images", "");
    for (const item of missing) {
      lines.push(`- L${item.level} Q${String(item.question).padStart(2, "0")}: missing correct=${item.missingCorrect}, wrong=${item.missingWrong}`);
    }
    lines.push("");
  }

  if (!suspicious.length) {
    lines.push("No suspicious pairs found.");
    return lines.join("\n");
  }

  lines.push("| Severity | Level | Question | MSE | dHash | aHash | Sentence | Wrong | Note |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |");

  for (const item of suspicious) {
    lines.push(`| ${item.severity} | ${item.level} | ${item.question} | ${item.mse} | ${item.dHashDistance} | ${item.aHashDistance} | ${escapeMd(item.sentence)} | ${escapeMd(item.wrongSentence)} | ${escapeMd(item.semanticRisk || "")} |`);
  }

  return lines.join("\n");
}

function escapeMd(value) {
  return String(value ?? "").replace(/\|/g, "\\|");
}
