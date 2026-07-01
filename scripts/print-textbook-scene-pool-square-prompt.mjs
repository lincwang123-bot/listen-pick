import { readFileSync } from "node:fs";

const [, , startArg, countArg] = process.argv;
if (!startArg) {
  console.error("Usage: node scripts/print-textbook-scene-pool-square-prompt.mjs <startSceneNumber> [count]");
  process.exit(1);
}

const startSceneNumber = Number(startArg);
const count = Number(countArg ?? 6);
if (!Number.isInteger(startSceneNumber) || startSceneNumber < 1 || !Number.isInteger(count) || count < 1 || count > 6) {
  throw new Error(`Invalid square prompt range: start=${startArg} count=${countArg ?? 6}`);
}

const pool = JSON.parse(readFileSync("docs/textbook-image-scene-pool-101-300.json", "utf8"));
const scenes = pool.scenes.slice(startSceneNumber - 1, startSceneNumber - 1 + count);
if (scenes.length === 0) {
  throw new Error(`No scenes found from ${startSceneNumber}.`);
}

const panels = scenes
  .map((scene, index) => `${index + 1}. ${scene.sentence}`)
  .join("\n");

console.log(`Use case: illustration-story
Asset type: production square-cell contact sheet for a children's English listening app, Level 101-300 unique scene pool, scenes ${scenes[0].id} - ${scenes.at(-1).id}.
Primary request: Create exactly ${scenes.length} separate polished children's picture-card illustrations. Arrange them in a 3 columns x 2 rows grid with square cells. If there are fewer than 6 panels, leave the unused cells plain white. Each used panel is independent. Clean white gutters. No text anywhere.

Canvas and layout requirement: use a landscape canvas where the 3x2 grid creates square cells. Each used panel must feel like a square children's flashcard illustration, not a tall portrait crop. Keep the main subject large and centered inside each square cell with generous padding.

Global style, mandatory: warm hand-painted children's picture book illustration, same finished quality as the app's Level 1-100 production images, soft pastel colors, matte surfaces, gentle paper texture, clean simple background, centered subject, rounded cute cartoon design, clean outlines, bright friendly expressions. No text, no letters, no numbers, no captions, no watermark, no logos.

Strict quality rules: Do NOT use 3D render style, glossy plastic product-render style, photorealistic shading, simplified vector placeholder art, stick figures, geometric icon bodies, rough SVG style, cropped limbs, cropped head, distorted hands, fused countable objects, text, labels, numbers, or watermarks. Full body or clearly framed action must be visible with generous padding.

Education accuracy rules: Each used panel must show exactly the sentence listed for that panel. If the sentence has a number, show exactly that number. If it has a color, the target object must clearly use that color. If it has a preposition, the spatial relationship must be unambiguous. If it has an action, show one clear ongoing action only.

Panel list, left to right, top row first, then bottom row:
${panels}

Composition requirement: every used panel has a single clear subject and the target meaning must be obvious within 5 seconds for a 6-10 year old child. Keep backgrounds simple and low distraction. No scary content, no unsafe behavior, no adult business scenes.`);
