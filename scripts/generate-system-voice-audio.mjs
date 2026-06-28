import { mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

import { getQuestionsForLevel } from "../src/game.mjs";

const run = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);

const firstNumberArg = args.find((arg) => /^\d+$/.test(arg));
const secondNumberArg = args.filter((arg) => /^\d+$/.test(arg))[1];
const startLevel = Number(firstNumberArg ?? 1);
const endLevel = Number(secondNumberArg ?? firstNumberArg ?? 1);
const targetVoice = readOption("--target") ?? "male";
const systemVoice = readOption("--system-voice") ?? "Daniel";
const rate = Number(readOption("--rate") ?? 130);
const force = args.includes("--force");
const concurrency = Number(readOption("--concurrency") ?? 3);
const keepAiff = args.includes("--keep-aiff");
const workDir = resolve(root, "tmp/system-voice-audio");

if (!["female", "male"].includes(targetVoice)) {
  throw new Error(`Invalid --target "${targetVoice}". Use --target=male or --target=female.`);
}

if (!Number.isInteger(startLevel) || !Number.isInteger(endLevel) || startLevel < 1 || endLevel < startLevel) {
  throw new Error(`Invalid level range: ${startLevel}-${endLevel}`);
}

if (!Number.isFinite(rate) || rate <= 0) {
  throw new Error(`Invalid --rate value: ${rate}`);
}

if (!Number.isInteger(concurrency) || concurrency < 1) {
  throw new Error(`Invalid --concurrency value: ${concurrency}`);
}

const jobs = [];

for (let level = startLevel; level <= endLevel; level += 1) {
  const questions = getQuestionsForLevel(level);
  for (const [index, question] of questions.entries()) {
    const outputM4a = resolve(root, question.audioByVoice?.[targetVoice] ?? toVoiceAudioPath(question.audio, targetVoice));
    if (!force && existsSync(outputM4a)) continue;

    jobs.push({
      level,
      index: index + 1,
      text: question.sentence,
      outputAiff: resolve(workDir, targetVoice, `level-${padLevel(level)}/q${String(index + 1).padStart(3, "0")}.aiff`),
      outputM4a
    });
  }
}

if (jobs.length === 0) {
  console.log("All requested system voice audio files already exist. Use --force to regenerate.");
  process.exit(0);
}

await mkdir(workDir, { recursive: true });

let completed = 0;
await runQueue(jobs, concurrency, async (job) => {
  await mkdir(dirname(job.outputAiff), { recursive: true });
  await mkdir(dirname(job.outputM4a), { recursive: true });

  await run("say", [
    "-v",
    systemVoice,
    "-r",
    String(rate),
    "-o",
    job.outputAiff,
    job.text
  ]);

  await run("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    job.outputAiff,
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    job.outputM4a
  ]);

  completed += 1;
  if (completed % 25 === 0 || completed === jobs.length) {
    console.log(`Generated ${completed}/${jobs.length} ${targetVoice} files with ${systemVoice}.`);
  }
});

console.log(`Generated ${jobs.length} system voice audio files for Level ${startLevel}-${endLevel}: ${targetVoice}=${systemVoice}.`);

if (!keepAiff) {
  await rm(workDir, { recursive: true, force: true });
}

function readOption(name) {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);

  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  return null;
}

function padLevel(level) {
  return String(level).padStart(3, "0");
}

function toVoiceAudioPath(audioPath, voice) {
  if (audioPath.startsWith("assets/textbook/audio/")) {
    return audioPath.replace("assets/textbook/audio/", `assets/textbook/audio-${voice}/`);
  }

  if (audioPath.startsWith("assets/course/audio/")) {
    return audioPath.replace("assets/course/audio/", `assets/course/audio-${voice}/`);
  }

  if (audioPath.startsWith("assets/audio/")) {
    return audioPath.replace("assets/audio/", `assets/audio-${voice}/`);
  }

  return audioPath;
}

async function runQueue(items, maxConcurrent, worker) {
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(maxConcurrent, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await worker(items[currentIndex]);
    }
  });

  await Promise.all(workers);
}
