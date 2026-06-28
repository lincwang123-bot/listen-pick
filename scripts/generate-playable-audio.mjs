import { mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

import { getQuestionsForLevel } from "../src/game.mjs";

const run = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const playableLevels = [1, 2, 3, 4, 5];
const speechRate = "105";

async function createAudio(sentence, finalM4a) {
  const tempAiff = finalM4a.replace(/\.m4a$/, ".aiff");
  await mkdir(dirname(finalM4a), { recursive: true });

  await run("say", [
    "-v",
    "Samantha",
    "-r",
    speechRate,
    "-o",
    tempAiff,
    sentence
  ]);

  await run("afconvert", [
    tempAiff,
    finalM4a,
    "-f",
    "m4af",
    "-d",
    "aac ",
    "-q",
    "127"
  ]);

  await rm(tempAiff, { force: true });
}

let audioCount = 0;

for (const level of playableLevels) {
  const questions = getQuestionsForLevel(level);

  for (const [index, question] of questions.entries()) {
    const outputPath = level === 1
      ? resolve(root, `assets/audio/q${String(index + 1).padStart(2, "0")}.m4a`)
      : resolve(root, `assets/course/audio/level-${String(level).padStart(3, "0")}/q${String(index + 1).padStart(3, "0")}.m4a`);

    await createAudio(question.sentence, outputPath);
    audioCount += 1;
  }
}

console.log(`Generated ${audioCount} slow, clear audio files at rate ${speechRate}.`);
