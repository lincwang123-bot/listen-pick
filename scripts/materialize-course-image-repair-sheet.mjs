import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { PNG } from "pngjs";

import { textbookLevels } from "../src/course/textbook-levels-001-300.generated.mjs";
import { COURSE_IMAGE_REPAIR_TARGETS } from "./lib/course-image-repair-targets.mjs";

const run = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const [sheetArg, startArg, countArg = "12", batchArg, targetKeysArg] = process.argv.slice(2);
const start = Number(startArg);
const count = Number(countArg);
const batch = batchArg ?? String(Math.floor(start / count) + 1).padStart(3, "0");

if (!sheetArg || !Number.isInteger(start) || start < 0 || !Number.isInteger(count) || count < 1 || count > 12) {
  throw new Error("Usage: node scripts/materialize-course-image-repair-sheet.mjs <sheet.png> <start-index> [count<=12] [batch-id]");
}

const choices = textbookLevels.flatMap((level) =>
  level.questions.flatMap((question, index) => [
    { level: level.level, question: index + 1, role: "correct", sentence: question.sentence, image: question.correctImage },
    { level: level.level, question: index + 1, role: "wrong", sentence: question.wrongSentence, image: question.wrongImage }
  ])
);
const targetKeys = new Set(COURSE_IMAGE_REPAIR_TARGETS.map(toKey));
const generationRequired = COURSE_IMAGE_REPAIR_TARGETS
  .map((target) => choices.find((choice) => toKey(choice) === toKey(target)))
  .filter((choice) => {
    const candidates = choices.filter((candidate) =>
      candidate.sentence === choice.sentence &&
      !targetKeys.has(toKey(candidate)) &&
      toKey(candidate) !== toKey(choice)
    );
    return candidates.length === 0;
  });
const requestedKeys = targetKeysArg?.split(",").filter(Boolean) ?? [];
const selected = requestedKeys.length > 0
  ? requestedKeys.map((key) => choices.find((choice) => toKey(choice) === key))
  : generationRequired.slice(start, start + count);
if (selected.some((target) => !target)) throw new Error(`Unknown repair target in ${targetKeysArg}`);
if (selected.length !== count) throw new Error(`Expected ${count} targets from ${start}, found ${selected.length}.`);

const sheetPath = resolve(sheetArg);
const source = PNG.sync.read(await readFile(sheetPath));
const columns = 4;
const rows = 3;
const cellWidth = Math.floor(source.width / columns);
const cellHeight = Math.floor(source.height / rows);
const batchDir = resolve(root, "assets/textbook/repair-sheets");
const storedSheet = resolve(batchDir, `batch-${batch}.png`);
await mkdir(batchDir, { recursive: true });
await copyFile(sheetPath, storedSheet);

const manifest = [];
for (const [index, target] of selected.entries()) {
  const column = index % columns;
  const row = Math.floor(index / columns);
  const cell = crop(source, column * cellWidth, row * cellHeight, cellWidth, cellHeight);
  const output = letterbox(cell, 640, 480);
  const pngPath = resolve(root, target.image);
  const webpPath = pngPath.replace(/\.png$/, ".webp");
  const bytes = PNG.sync.write(output);

  await mkdir(dirname(pngPath), { recursive: true });
  await writeFile(pngPath, bytes);
  await run("cwebp", ["-quiet", "-q", "75", "-m", "6", pngPath, "-o", webpPath]);
  manifest.push({
    ...target,
    png: target.image,
    webp: target.image.replace(/\.png$/, ".webp"),
    sha256: createHash("sha256").update(bytes).digest("hex")
  });
}

await writeFile(resolve(batchDir, `batch-${batch}.json`), `${JSON.stringify({ start, count, sheet: storedSheet.slice(root.length + 1), targets: manifest }, null, 2)}\n`);
console.log(JSON.stringify({ batch, start, count, targets: manifest.map((item) => `${item.level}-${item.question}-${item.role}`) }));

function crop(image, startX, startY, width, height) {
  const output = new PNG({ width, height });
  PNG.bitblt(image, output, startX, startY, width, height, 0, 0);
  return output;
}

function letterbox(image, width, height) {
  const output = new PNG({ width, height, fill: true });
  output.data.fill(255);
  const scale = Math.min(width / image.width, height / image.height);
  const scaledWidth = Math.max(1, Math.round(image.width * scale));
  const scaledHeight = Math.max(1, Math.round(image.height * scale));
  const scaled = resizeNearest(image, scaledWidth, scaledHeight);
  PNG.bitblt(scaled, output, 0, 0, scaledWidth, scaledHeight, Math.floor((width - scaledWidth) / 2), Math.floor((height - scaledHeight) / 2));
  return output;
}

function resizeNearest(image, width, height) {
  const output = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    const sourceY = Math.min(image.height - 1, Math.floor(y * image.height / height));
    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.min(image.width - 1, Math.floor(x * image.width / width));
      const sourceIndex = (sourceY * image.width + sourceX) * 4;
      const targetIndex = (y * width + x) * 4;
      image.data.copy(output.data, targetIndex, sourceIndex, sourceIndex + 4);
    }
  }
  return output;
}

function toKey(item) {
  return `${item.level}-${item.question}-${item.role}`;
}
