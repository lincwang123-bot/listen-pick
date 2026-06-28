import { mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

import { textbookLevels } from "../src/course/textbook-levels-001-100.generated.mjs";

const run = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const speechRate = "105";
const speechTimeoutMs = 20000;
const convertTimeoutMs = 10000;

function parseRange() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const rangeArgs = args.filter((arg) => arg !== "--force");
  const [startArg, endArg] = rangeArgs;
  const start = startArg ? Number(startArg) : 1;
  const end = endArg ? Number(endArg) : 100;

  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
    throw new Error("Usage: node scripts/generate-textbook-audio.mjs [startLevel] [endLevel] [--force]");
  }

  return { force, start, end };
}

async function createAudio(sentence, relativeOutputPath) {
  const finalM4a = resolve(root, relativeOutputPath);
  const tempAiff = finalM4a.replace(/\.m4a$/, ".aiff");

  await mkdir(dirname(finalM4a), { recursive: true });
  await rm(tempAiff, { force: true });

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      await run("say", [
        "-v",
        "Samantha",
        "-r",
        speechRate,
        "-o",
        tempAiff,
        sentence
      ], { timeout: speechTimeoutMs });
      break;
    } catch (error) {
      await rm(tempAiff, { force: true });
      if (attempt === 2) throw error;
    }
  }

  await run("afconvert", [
    tempAiff,
    finalM4a,
    "-f",
    "m4af",
    "-d",
    "aac ",
    "-q",
    "127"
  ], { timeout: convertTimeoutMs });

  await rm(tempAiff, { force: true });
}

const { force, start, end } = parseRange();
let generated = 0;
let skipped = 0;

for (const level of textbookLevels) {
  if (level.level < start || level.level > end) continue;

  for (const question of level.questions) {
    if (!force && existsSync(resolve(root, question.audioFile))) {
      skipped += 1;
      continue;
    }

    await createAudio(question.sentence, question.audioFile);
    generated += 1;
    console.log(`audio ${question.id} -> ${question.audioFile}`);
  }
}

console.log(`Generated ${generated} textbook audio files at rate ${speechRate}; skipped ${skipped}.`);
