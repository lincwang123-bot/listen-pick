import { createReadStream, createWriteStream, statSync, readdirSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { PNG } from "pngjs";

const run = promisify(execFile);
const defaultGeneratedRoot = process.env.GENERATED_IMAGES_ROOT ?? "";

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

async function resizeToProjectStandard(path) {
  await run("sips", ["-z", "540", "840", path]);
}

async function splitPair(inputPath, correctPath, wrongPath) {
  const source = await readPng(inputPath);
  const cropWidth = Math.floor(source.width * 0.47);
  const gutter = Math.floor(source.width * 0.06);
  const leftX = 0;
  const rightX = source.width - cropWidth;
  const y = 0;
  const height = source.height;

  await mkdir(dirname(correctPath), { recursive: true });
  await writePng(correctPath, cropPng(source, leftX, y, cropWidth, height));
  await writePng(wrongPath, cropPng(source, rightX + gutter * 0, y, cropWidth, height));
  await resizeToProjectStandard(correctPath);
  await resizeToProjectStandard(wrongPath);
}

function generatedFilesBetween(generatedRoot, startStamp, endStamp) {
  const start = statSync(startStamp).mtimeMs;
  const end = endStamp ? statSync(endStamp).mtimeMs : Number.POSITIVE_INFINITY;
  return readdirSync(generatedRoot)
    .filter((file) => file.endsWith(".png"))
    .map((file) => {
      const path = join(generatedRoot, file);
      return { path, mtime: statSync(path).mtimeMs };
    })
    .filter((item) => item.mtime > start && item.mtime < end)
    .sort((a, b) => a.mtime - b.mtime);
}

const [, , levelArg, startStamp, endStamp, orderArg, generatedRootArg] = process.argv;
const level = Number(levelArg);
const generatedRoot = generatedRootArg ?? defaultGeneratedRoot;

if (!level || !startStamp || !generatedRoot) {
  console.error("Usage: GENERATED_IMAGES_ROOT=<dir> node scripts/split-image-pairs.mjs <level> <startStamp> [endStamp] [order] [generatedRoot]");
  process.exit(1);
}

const files = generatedFilesBetween(generatedRoot, startStamp, endStamp);
if (files.length !== 15) {
  console.error(`Expected 15 generated pair images, found ${files.length}`);
  process.exit(1);
}

const questionOrder = orderArg
  ? orderArg.split(",").map((item) => Number(item.trim()))
  : Array.from({ length: files.length }, (_, index) => index + 1);

if (questionOrder.length !== files.length) {
  console.error(`Question order has ${questionOrder.length} items, but found ${files.length} files`);
  process.exit(1);
}

for (const [index, file] of files.entries()) {
  const question = String(questionOrder[index]).padStart(3, "0");
  const base = `assets/course/images/level-${String(level).padStart(3, "0")}/q${question}`;
  await splitPair(file.path, resolve(`${base}-correct.png`), resolve(`${base}-wrong.png`));
  console.log(`${file.path} -> ${base}-{correct,wrong}.png`);
}
