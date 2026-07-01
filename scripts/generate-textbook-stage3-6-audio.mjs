import { copyFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

import { textbookLevels } from "../src/course/textbook-levels-101-300.generated.mjs";

const run = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const firstLevelArg = readNumberArg(0);
const secondLevelArg = readNumberArg(1);
const startLevel = Number(firstLevelArg ?? 101);
const endLevel = Number(secondLevelArg ?? (firstLevelArg ? firstLevelArg : 300));
const requestedVoices = (readOption("--voices") ?? "female,male")
  .split(",")
  .map((voice) => voice.trim())
  .filter(Boolean);
const force = args.includes("--force");
const concurrency = Number(readOption("--concurrency") ?? 3);
const rate = readOption("--rate") ?? "-8%";
const pitch = readOption("--pitch") ?? "+0Hz";
const volume = readOption("--volume") ?? "+0%";
const retryCount = Number(readOption("--retries") ?? 4);
const keepMedia = args.includes("--keep-media");
const edgeTtsBin = resolve(root, ".venv-edge-tts/bin/edge-tts");
const workDir = resolve(root, "tmp/stage3-edge-tts-audio");
const cacheDir = resolve(root, "tmp/stage3-edge-tts-cache");

const voiceConfig = {
  female: readOption("--female-voice") ?? "en-US-JennyNeural",
  male: readOption("--male-voice") ?? "en-US-GuyNeural"
};

if (!existsSync(edgeTtsBin)) {
  throw new Error("Missing .venv-edge-tts. Create it and install edge-tts first.");
}

for (const voice of requestedVoices) {
  if (!voiceConfig[voice]) {
    throw new Error(`Invalid voice "${voice}". Use --voices=female,male.`);
  }
}

if (!Number.isInteger(startLevel) || !Number.isInteger(endLevel) || startLevel < 101 || endLevel < startLevel) {
  throw new Error(`Invalid level range: ${startLevel}-${endLevel}`);
}

if (!Number.isInteger(concurrency) || concurrency < 1) {
  throw new Error(`Invalid --concurrency value: ${concurrency}`);
}

const levels = textbookLevels.filter((level) => level.level >= startLevel && level.level <= endLevel);
const jobs = [];
const synthJobsByKey = new Map();

for (const level of levels) {
  for (const question of level.questions) {
    for (const voice of requestedVoices) {
      const finalM4a = resolve(root, toVoiceAudioPath(question.audioFile, voice));
      if (!force && existsSync(finalM4a)) continue;

      const key = makeCacheKey(question.sentence, voice, voiceConfig[voice], rate, pitch, volume);
      const cacheM4a = resolve(cacheDir, voice, `${key}.m4a`);
      const cacheMp3 = resolve(workDir, voice, `${key}.mp3`);

      jobs.push({
        text: question.sentence,
        voice,
        finalM4a,
        baseM4a: voice === "female" ? resolve(root, question.audioFile) : null,
        cacheM4a
      });

      if (!synthJobsByKey.has(key) && (force || !existsSync(cacheM4a))) {
        synthJobsByKey.set(key, {
          text: question.sentence,
          voice,
          edgeVoice: voiceConfig[voice],
          cacheM4a,
          cacheMp3
        });
      }
    }
  }
}

if (jobs.length === 0) {
  console.log("All requested Stage 3-6 audio files already exist. Use --force to regenerate.");
  process.exit(0);
}

await mkdir(workDir, { recursive: true });
await mkdir(cacheDir, { recursive: true });

const synthJobs = [...synthJobsByKey.values()];
let synthesized = 0;
await runQueue(synthJobs, concurrency, async (job) => {
  await mkdir(dirname(job.cacheMp3), { recursive: true });
  await mkdir(dirname(job.cacheM4a), { recursive: true });

  await runEdgeTtsWithRetry(job, retryCount);

  await run("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    job.cacheMp3,
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    job.cacheM4a
  ]);

  synthesized += 1;
  if (synthesized % 25 === 0 || synthesized === synthJobs.length) {
    console.log(`Synthesized ${synthesized}/${synthJobs.length} unique ${startLevel}-${endLevel} audio files.`);
  }
});

let copied = 0;
for (const job of jobs) {
  await mkdir(dirname(job.finalM4a), { recursive: true });
  await copyFile(job.cacheM4a, job.finalM4a);
  if (job.baseM4a) {
    await mkdir(dirname(job.baseM4a), { recursive: true });
    await copyFile(job.cacheM4a, job.baseM4a);
  }
  copied += 1;
}

console.log(`Stage 3-6 audio complete. synthesized=${synthJobs.length} copied=${copied} voices=${requestedVoices.join(",")}.`);

if (!keepMedia) {
  await rm(workDir, { recursive: true, force: true });
}

function readNumberArg(index) {
  return args.filter((arg) => /^\d+$/.test(arg))[index];
}

function readOption(name) {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);

  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  return null;
}

function toVoiceAudioPath(audioPath, voice) {
  return audioPath.replace("assets/textbook/audio/", `assets/textbook/audio-${voice}/`);
}

function makeCacheKey(text, voice, edgeVoice, rateValue, pitchValue, volumeValue) {
  return createHash("sha1")
    .update(JSON.stringify({ text, voice, edgeVoice, rateValue, pitchValue, volumeValue }))
    .digest("hex")
    .slice(0, 20);
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

async function runEdgeTtsWithRetry(job, maxRetries) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt += 1) {
    try {
      await run(edgeTtsBin, [
        "--voice",
        job.edgeVoice,
        "--rate",
        rate,
        "--pitch",
        pitch,
        "--volume",
        volume,
        "--text",
        job.text,
        "--write-media",
        job.cacheMp3
      ]);
      return;
    } catch (error) {
      lastError = error;
      if (attempt > maxRetries) break;
      const delayMs = 1200 * attempt;
      console.warn(`Edge TTS retry ${attempt}/${maxRetries}: ${job.voice} "${job.text}"`);
      await wait(delayMs);
    }
  }

  throw lastError;
}

function wait(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}
