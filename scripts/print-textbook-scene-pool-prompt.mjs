import { readFileSync } from "node:fs";

const [, , batchArg] = process.argv;
if (!batchArg) {
  console.error("Usage: node scripts/print-textbook-scene-pool-prompt.mjs <batchNumber>");
  process.exit(1);
}

const batchId = String(Number(batchArg)).padStart(3, "0");
const manifest = JSON.parse(
  readFileSync(`assets/textbook/contact-sheets/stage3-scenes-batch-${batchId}.manifest.json`, "utf8")
);

const panels = manifest.cells
  .map((cell) => `${cell.cell}. ${cell.sentence}`)
  .join("\n");

console.log(`Use case: illustration-story
Asset type: production contact sheet for a children's English listening app, Level 101-300 unique scene pool batch ${batchId}.
Primary request: Create exactly ${manifest.cells.length} separate polished children's picture-card illustrations arranged exactly ${manifest.layout.columns} columns x ${manifest.layout.rows} rows. Each panel is independent. Clean white gutters. No text anywhere.

Global style, mandatory: polished children's picture book illustration, same finished quality as premium early-reader English learning app images and the app's Level 1-100 production images, soft pastel colors, warm lighting, clean simple background, centered subject, rounded cute cartoon character design, smooth brush texture, clean outlines, bright friendly expressions. No text, no letters, no numbers, no captions, no watermark, no logos.

Strict quality rules: Do NOT use simplified vector placeholder art, stick figures, geometric icon bodies, rough SVG style, flat toy-like blobs, missing hands, missing feet, distorted fingers, cropped limbs, cropped head, or awkward anatomy. Full body or clearly framed full action must be visible in each panel with generous padding.

Education accuracy rules: Each panel must show exactly the sentence listed for that panel. If the sentence has a number, show exactly that number. If it has a color, the target object must clearly use that color. If it has a preposition, the spatial relationship must be unambiguous. If it has an action, show one clear ongoing action only.

Panel list, left to right, top row first, then bottom row:
${panels}

Composition requirement: every panel has a single clear subject and the target meaning must be obvious within 5 seconds for a 6-10 year old child. Keep backgrounds simple and low distraction. No scary content, no unsafe behavior, no adult business scenes.`);
