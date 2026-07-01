import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { textbookLevels } from "../src/course/textbook-levels-101-300.generated.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputJsonPath = resolve(root, "docs/textbook-image-scene-pool-101-300.json");
const outputMdPath = resolve(root, "docs/textbook-image-scene-pool-101-300.md");
const manifestDir = resolve(root, "assets/textbook/contact-sheets");
const sceneDir = "assets/textbook/images/stage3-scenes";
const batchPrefix = "stage3-scenes-batch";
const batchSize = 12;
const columns = 4;
const rows = 3;

const sceneMap = new Map();

for (const level of textbookLevels) {
  for (const question of level.questions) {
    addScene(question.sentence, question.correctImagePrompt, {
      level: level.level,
      question: question.id,
      role: "correct",
      image: question.correctImage
    });
    addScene(question.wrongSentence, question.wrongImagePrompt, {
      level: level.level,
      question: question.id,
      role: "wrong",
      image: question.wrongImage
    });
  }
}

const scenes = Array.from(sceneMap.values()).map((scene, index) => {
  const id = `stage3_scene_${String(index + 1).padStart(4, "0")}`;
  return {
    ...scene,
    id,
    output: `${sceneDir}/${id}.png`,
    webp: `${sceneDir}/${id}.webp`
  };
});

await mkdir(dirname(outputJsonPath), { recursive: true });
await mkdir(manifestDir, { recursive: true });
await writeFile(outputJsonPath, `${JSON.stringify({ scenes }, null, 2)}\n`, "utf8");
await writeFile(outputMdPath, renderMarkdown(scenes), "utf8");

for (let start = 0; start < scenes.length; start += batchSize) {
  const batchNumber = Math.floor(start / batchSize) + 1;
  const batchScenes = scenes.slice(start, start + batchSize);
  const manifestPath = resolve(manifestDir, `${batchPrefix}-${pad(batchNumber)}.manifest.json`);
  await writeFile(
    manifestPath,
    `${JSON.stringify({
      batch: batchNumber,
      layout: { columns, rows },
      sheet: `assets/textbook/contact-sheets/${batchPrefix}-${pad(batchNumber)}.png`,
      cells: batchScenes.map((scene, index) => ({
        cell: index + 1,
        sceneId: scene.id,
        sentence: scene.sentence,
        prompt: scene.prompt,
        output: scene.output,
        webp: scene.webp,
        usedBy: scene.usedBy
      }))
    }, null, 2)}\n`,
    "utf8"
  );
}

console.log(`Generated ${scenes.length} unique image scenes in ${Math.ceil(scenes.length / batchSize)} batches.`);
console.log(outputJsonPath);
console.log(outputMdPath);

function addScene(sentence, prompt, usage) {
  const key = `${sentence}\n${prompt}`;
  const existing = sceneMap.get(key);
  if (existing) {
    existing.usedBy.push(usage);
    return;
  }

  sceneMap.set(key, {
    sentence,
    prompt,
    usedBy: [usage]
  });
}

function renderMarkdown(items) {
  const lines = [
    "# Level 101-300 Unique Image Scene Pool",
    "",
    "Use these batches to generate reusable scene images. Each panel is one independent picture.",
    "",
    "Default production workflow uses compact 12-panel sheets. For high-risk concepts such as close prepositions, exact counts, color-only contrasts, or family role contrasts, split the same scene range into 6-panel square sheets instead.",
    "",
    "After generating a compact 12-panel batch image, crop it with:",
    "",
    "```bash",
    "node scripts/crop-textbook-scene-pool-compact-sheet.mjs assets/textbook/contact-sheets/generated/stage3-compact-scenes-<start>-<end>.png <startSceneNumber> 12",
    "npm run generate:webp-images -- assets/textbook/images/stage3-scenes --force",
    "```",
    "",
    "For 6-panel square sheets, crop with:",
    "",
    "```bash",
    "node scripts/crop-textbook-scene-pool-square-sheet.mjs assets/textbook/contact-sheets/generated/stage3-square-scenes-<start>-<end>.png <startSceneNumber> 6",
    "npm run generate:webp-images -- assets/textbook/images/stage3-scenes --force",
    "```",
    ""
  ];

  for (let start = 0; start < items.length; start += batchSize) {
    const batchNumber = Math.floor(start / batchSize) + 1;
    const batch = items.slice(start, start + batchSize);
    lines.push(`## Batch ${pad(batchNumber)}｜${batch[0].id} - ${batch.at(-1).id}`);
    lines.push("");
    lines.push(`Create one compact contact sheet with ${columns} columns and ${rows} rows, exactly ${batch.length} separate panels.`);
    lines.push("Panel order must be left to right, top to bottom. Each panel is one independent illustration with clear white gutters.");
    lines.push("Each panel must feel like a square children's flashcard illustration, not a tall portrait crop. Keep the subject large and complete with generous padding.");
    lines.push("Style for every panel: polished children's picture book illustration, same finished illustration quality as the Level 1-100 production images, soft pastel colors, clean white background, simple composition, centered subject, warm lighting, rounded cartoon character design, clean outlines, full-body or clearly framed subject.");
    lines.push("Quality gate: do not use simplified vector placeholders, stick-figure drawings, geometric icon scenes, rough SVG mockups, cropped limbs, cropped heads, distorted hands, fused countable objects, text, labels, numbers, captions, speech bubbles, logos, or watermarks.");
    lines.push("");
    lines.push("Panels:");

    for (const [index, scene] of batch.entries()) {
      lines.push(`${index + 1}. ${scene.sentence}`);
    }

    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function pad(number) {
  return String(number).padStart(3, "0");
}
