import { createReadStream, createWriteStream, copyFileSync, readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { PNG } from "pngjs";

const run = promisify(execFile);

function pad(number, size = 3) {
  return String(number).padStart(size, "0");
}

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

async function fitToCard(path, sourceWidth, sourceHeight) {
  const targetWidth = 840;
  const targetHeight = 630;
  const safeAreaScale = 0.88;
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

function gridBounds(size, parts, index) {
  const start = Math.round((size * index) / parts);
  const end = Math.round((size * (index + 1)) / parts);
  return { start, length: end - start };
}

function isWhitePixel(source, x, y) {
  const index = (Math.floor(y) * source.width + Math.floor(x)) * 4;
  return source.data[index] > 246 && source.data[index + 1] > 246 && source.data[index + 2] > 246;
}

function detectGridRuns(source, axis, expectedParts) {
  const mainSize = axis === "x" ? source.width : source.height;
  const crossSize = axis === "x" ? source.height : source.width;
  const minRunLength = Math.max(24, Math.floor(mainSize / expectedParts / 3));
  const gutter = [];

  for (let main = 0; main < mainSize; main += 1) {
    let white = 0;
    let total = 0;

    for (let cross = 0; cross < crossSize; cross += 4) {
      const x = axis === "x" ? main : cross;
      const y = axis === "x" ? cross : main;
      total += 1;
      if (isWhitePixel(source, x, y)) white += 1;
    }

    gutter.push(white / total > 0.9);
  }

  const runs = [];
  let start = null;

  for (let index = 0; index <= gutter.length; index += 1) {
    const isCellPixel = index < gutter.length && !gutter[index];

    if (isCellPixel && start === null) {
      start = index;
    } else if ((!isCellPixel || index === gutter.length) && start !== null) {
      const length = index - start;
      if (length >= minRunLength) runs.push({ start, length });
      start = null;
    }
  }

  if (runs.length !== expectedParts) return null;
  return runs;
}

async function cropSheet(level, sheetPath, insetRatio = 0.04) {
  const levelId = pad(level);
  const manifestPath = `assets/textbook/contact-sheets/level-${levelId}.manifest.json`;
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const source = await readPng(sheetPath);
  const { columns, rows } = manifest.layout;
  const detectedColumns = detectGridRuns(source, "x", columns);
  const detectedRows = detectGridRuns(source, "y", rows);

  await mkdir(dirname(manifest.sheet), { recursive: true });
  copyFileSync(sheetPath, manifest.sheet);

  for (const cell of manifest.cells) {
    const index = cell.cell - 1;
    const col = index % columns;
    const row = Math.floor(index / columns);
    const xBounds = detectedColumns?.[col] ?? gridBounds(source.width, columns, col);
    const yBounds = detectedRows?.[row] ?? gridBounds(source.height, rows, row);
    const rawX = xBounds.start;
    const rawY = yBounds.start;
    const rawWidth = xBounds.length;
    const rawHeight = yBounds.length;
    const inset = normalizeInsets(insetRatio);
    const insetLeft = Math.round(rawWidth * inset.left);
    const insetRight = Math.round(rawWidth * inset.right);
    const insetTop = Math.round(rawHeight * inset.top);
    const insetBottom = Math.round(rawHeight * inset.bottom);
    const x = rawX + insetLeft;
    const y = rawY + insetTop;
    const width = rawWidth - insetLeft - insetRight;
    const height = rawHeight - insetTop - insetBottom;
    const outputPath = resolve(cell.output);

    await mkdir(dirname(outputPath), { recursive: true });
    await writePng(outputPath, cropPng(source, x, y, width, height));
    await fitToCard(outputPath, width, height);
    console.log(`cell ${cell.cell} -> ${cell.output}`);
  }
}

function normalizeInsets(value) {
  if (typeof value === "number") {
    return { top: value, right: value, bottom: value, left: value };
  }

  const parts = String(value).split(",").map((part) => Number(part.trim()));
  if (parts.length === 4 && parts.every((part) => Number.isFinite(part))) {
    const [top, right, bottom, left] = parts;
    return { top, right, bottom, left };
  }

  const numberValue = Number(value);
  if (Number.isFinite(numberValue)) {
    return { top: numberValue, right: numberValue, bottom: numberValue, left: numberValue };
  }

  throw new Error(`Invalid inset value: ${value}`);
}

const [, , levelArg, sheetPath, insetArg] = process.argv;
const level = Number(levelArg);

if (!level || !sheetPath) {
  console.error("Usage: node scripts/crop-textbook-contact-sheet.mjs <level> <sheet-png-path>");
  process.exit(1);
}

await cropSheet(level, sheetPath, insetArg ?? 0);
