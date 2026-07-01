import { createReadStream, createWriteStream, readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { PNG } from "pngjs";

const run = promisify(execFile);
const targetWidth = 840;
const targetHeight = 630;
const safeAreaScale = 0.94;
const columns = 4;
const rows = 3;

function readPng(path) {
  return new Promise((resolvePng, reject) => {
    createReadStream(path)
      .pipe(new PNG())
      .on("parsed", function parsed() {
        resolvePng(this);
      })
      .on("error", reject);
  });
}

function writePng(path, png) {
  return new Promise((resolveWrite, reject) => {
    png.pack()
      .pipe(createWriteStream(path))
      .on("finish", resolveWrite)
      .on("error", reject);
  });
}

function cropPng(source, x, y, width, height) {
  const output = new PNG({ width, height });
  PNG.bitblt(source, output, x, y, width, height, 0, 0);
  return output;
}

function gridBounds(size, parts, index) {
  const start = Math.round((size * index) / parts);
  const end = Math.round((size * (index + 1)) / parts);
  return { start, length: end - start };
}

async function fitToCard(path, sourceWidth, sourceHeight) {
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight) * safeAreaScale;
  const scaledWidth = Math.max(1, Math.round(sourceWidth * scale));
  const scaledHeight = Math.max(1, Math.round(sourceHeight * scale));

  await run("sips", ["-z", String(scaledHeight), String(scaledWidth), path]);
  await run("sips", [
    "-p",
    String(targetHeight),
    String(targetWidth),
    "--padColor",
    "F7FBFF",
    path
  ]);
}

async function cropCompactSheet({ sheetPath, startSceneNumber, count, insetRatio }) {
  const pool = JSON.parse(readFileSync("docs/textbook-image-scene-pool-101-300.json", "utf8"));
  const scenes = pool.scenes.slice(startSceneNumber - 1, startSceneNumber - 1 + count);
  if (scenes.length === 0) {
    throw new Error(`No scenes found from ${startSceneNumber}.`);
  }

  const source = await readPng(sheetPath);
  const inset = Number(insetRatio);

  for (const [index, scene] of scenes.entries()) {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const xBounds = gridBounds(source.width, columns, col);
    const yBounds = gridBounds(source.height, rows, row);
    const insetX = Math.round(xBounds.length * inset);
    const insetY = Math.round(yBounds.length * inset);
    const x = xBounds.start + insetX;
    const y = yBounds.start + insetY;
    const width = xBounds.length - insetX * 2;
    const height = yBounds.length - insetY * 2;
    const outputPath = resolve(scene.output);

    await mkdir(dirname(outputPath), { recursive: true });
    await writePng(outputPath, cropPng(source, x, y, width, height));
    await fitToCard(outputPath, width, height);
    console.log(`${scene.id} -> ${scene.output}`);
  }
}

const [, , sheetPath, startArg, countArg, insetArg] = process.argv;
if (!sheetPath || !startArg) {
  console.error("Usage: node scripts/crop-textbook-scene-pool-compact-sheet.mjs <sheet-png-path> <startSceneNumber> [count] [insetRatio]");
  process.exit(1);
}

await cropCompactSheet({
  sheetPath,
  startSceneNumber: Number(startArg),
  count: Number(countArg ?? 12),
  insetRatio: insetArg ?? 0.008
});
