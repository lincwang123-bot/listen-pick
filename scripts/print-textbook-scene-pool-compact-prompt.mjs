import { readFileSync } from "node:fs";

const [, , startArg, countArg] = process.argv;
if (!startArg) {
  console.error("Usage: node scripts/print-textbook-scene-pool-compact-prompt.mjs <startSceneNumber> [count]");
  process.exit(1);
}

const startSceneNumber = Number(startArg);
const count = Number(countArg ?? 12);
if (!Number.isInteger(startSceneNumber) || startSceneNumber < 1 || !Number.isInteger(count) || count < 1 || count > 12) {
  throw new Error(`Invalid compact prompt range: start=${startArg} count=${countArg ?? 12}`);
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
Asset type: production compact contact sheet for a children's English listening app, Level 101-300 unique scene pool, scenes ${scenes[0].id} - ${scenes.at(-1).id}.
Primary request: Create exactly ${scenes.length} separate polished children's picture-card illustrations. Arrange them in a 4 columns x 3 rows grid. If there are fewer than 12 panels, leave unused cells plain white. Each used panel is independent. Clean white gutters. No text anywhere.

Canvas and layout requirement: use a landscape canvas. Each used panel must feel like a square children's flashcard illustration, not a tall portrait crop. Keep the main subject large and centered with generous padding, full body visible when a person or animal is shown.

Global style, mandatory: warm hand-painted children's picture book illustration, same finished quality as the app's Level 1-100 production images, soft pastel colors, matte surfaces, gentle paper texture, clean simple background, centered subject, rounded cute cartoon design, clean outlines, bright friendly expressions. No text, no letters, no numbers, no captions, no watermark, no logos.

Strict quality rules: Do NOT use 3D render style, glossy plastic product-render style, photorealistic shading, simplified vector placeholder art, stick figures, geometric icon bodies, rough SVG style, cropped limbs, cropped head, distorted hands, fused countable objects, text, labels, numbers, or watermarks. Do not make tiny icons. Every panel must look like a finished app-ready illustration.

Education accuracy rules: Each used panel must show exactly the sentence listed for that panel. If the sentence has a number, show exactly that number of target objects. If it has a color, the target object must clearly use that color. If it has a preposition, the spatial relationship must be unambiguous. If it has an action, show one clear ongoing action only.

Panel list, left to right, top row first, then middle row, then bottom row:
${panels}

Composition requirement: every used panel has a single clear subject and the target meaning must be obvious within 5 seconds for a 6-10 year old child. Keep backgrounds simple and low distraction. No scary content, no unsafe behavior, no adult business scenes.`);
