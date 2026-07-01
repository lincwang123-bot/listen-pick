import { createReadStream, createWriteStream, readFileSync } from "node:fs";
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
  const safeAreaScale = 0.9;
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

async function cropSheetRange({ level, sheetPath, startCell, columns, rows, insetRatio }) {
  const levelId = pad(level);
  const manifest = JSON.parse(readFileSync(`assets/textbook/contact-sheets/level-${levelId}.manifest.json`, "utf8"));
  const source = await readPng(sheetPath);
  const inset = Number(insetRatio);

  for (let localIndex = 0; localIndex < columns * rows; localIndex += 1) {
    const cellNumber = startCell + localIndex;
    const cell = manifest.cells.find((item) => item.cell === cellNumber);
    if (!cell) continue;

    const col = localIndex % columns;
    const row = Math.floor(localIndex / columns);
    const xBounds = gridBounds(source.width, columns, col);
    const yBounds = gridBounds(source.height, rows, row);
    const insetX = Math.round(xBounds.length * inset);
    const insetY = Math.round(yBounds.length * inset);
    const x = xBounds.start + insetX;
    const y = yBounds.start + insetY;
    const width = xBounds.length - insetX * 2;
    const height = yBounds.length - insetY * 2;
    const outputPath = resolve(cell.output);

    await mkdir(dirname(outputPath), { recursive: true });
    await writePng(outputPath, cropPng(source, x, y, width, height));
    await fitToCard(outputPath, width, height);
    console.log(`cell ${cellNumber} -> ${cell.output}`);
  }
}

const [, , levelArg, sheetPath, startCellArg, columnsArg, rowsArg, insetArg] = process.argv;
if (!levelArg || !sheetPath || !startCellArg || !columnsArg || !rowsArg) {
  console.error("Usage: node scripts/crop-textbook-contact-sheet-range.mjs <level> <sheet-png-path> <startCell> <columns> <rows> [insetRatio]");
  process.exit(1);
}

await cropSheetRange({
  level: Number(levelArg),
  sheetPath,
  startCell: Number(startCellArg),
  columns: Number(columnsArg),
  rows: Number(rowsArg),
  insetRatio: insetArg ?? 0.01
});
