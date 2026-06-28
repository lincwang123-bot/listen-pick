import { mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

import { questions } from "../src/game.mjs";

const run = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = resolve(root, "assets/audio");
const speechRate = "105";

await mkdir(outputDir, { recursive: true });

for (const [index, question] of questions.entries()) {
  const number = String(index + 1).padStart(2, "0");
  const tempAiff = resolve(outputDir, `q${number}.aiff`);
  const finalM4a = resolve(outputDir, `q${number}.m4a`);

  await run("say", [
    "-v",
    "Samantha",
    "-r",
    speechRate,
    "-o",
    tempAiff,
    question.sentence
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

console.log(`Generated ${questions.length} sentence audio files in ${outputDir} at rate ${speechRate}`);
