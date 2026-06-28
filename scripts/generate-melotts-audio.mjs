import { mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { execFile, spawn } from "node:child_process";

import { getQuestionsForLevel } from "../src/game.mjs";

const run = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);

const firstNumberArg = args.find((arg) => /^\d+$/.test(arg));
const secondNumberArg = args.filter((arg) => /^\d+$/.test(arg))[1];
const startLevel = Number(firstNumberArg ?? 1);
const endLevel = Number(secondNumberArg ?? firstNumberArg ?? 1);
const force = args.includes("--force");
const requestedVoices = (readOption("--voices") ?? readOption("--voice") ?? "female")
  .split(",")
  .map((voice) => voice.trim())
  .filter(Boolean);
const speaker = readOption("--speaker");
const femaleSpeaker = readOption("--female-speaker") ?? speaker ?? "EN-US";
const maleSpeaker = readOption("--male-speaker") ?? speaker ?? "EN-BR";
const speed = Number(readOption("--speed") ?? 0.82);
const device = readOption("--device") ?? "cpu";
const keepWav = args.includes("--keep-wav");

const pythonBin = resolve(root, ".venv-melotts/bin/python");
const melottsRoot = resolve(root, "tmp/MeloTTS");
const synthScript = resolve(root, "scripts/melotts-synth-level.py");
const workDir = resolve(root, "tmp/melotts-audio");
const manifestPath = resolve(workDir, `manifest-${padLevel(startLevel)}-${padLevel(endLevel)}.json`);

if (!existsSync(pythonBin)) {
  throw new Error("Missing .venv-melotts. Create it and install MeloTTS dependencies first.");
}

if (!existsSync(melottsRoot)) {
  throw new Error("Missing tmp/MeloTTS. Clone https://github.com/myshell-ai/MeloTTS.git first.");
}

if (!Number.isFinite(speed) || speed <= 0) {
  throw new Error(`Invalid --speed value: ${speed}`);
}

const voiceConfigs = {
  female: {
    speaker: femaleSpeaker
  },
  male: {
    speaker: maleSpeaker
  }
};

for (const voice of requestedVoices) {
  if (!voiceConfigs[voice]) {
    throw new Error(`Invalid voice "${voice}". Use --voices=female,male.`);
  }
}

const jobs = [];

for (let level = startLevel; level <= endLevel; level += 1) {
  const questions = getQuestionsForLevel(level);
  for (const [index, question] of questions.entries()) {
    for (const voice of requestedVoices) {
      const finalM4a = resolve(root, question.audioByVoice?.[voice] ?? toVoiceAudioPath(question.audio, voice));
      if (!force && existsSync(finalM4a)) {
        continue;
      }

      jobs.push({
        text: question.sentence,
        speaker: voiceConfigs[voice].speaker,
        voice,
        outputWav: resolve(workDir, voice, `level-${padLevel(level)}/q${String(index + 1).padStart(3, "0")}.wav`),
        outputM4a: finalM4a
      });
    }
  }
}

await mkdir(workDir, { recursive: true });
await writeFile(
  manifestPath,
  `${JSON.stringify(jobs.map(({ text, speaker, voice, outputWav }) => ({ text, speaker, voice, outputWav })), null, 2)}\n`,
  "utf8"
);

if (jobs.length === 0) {
  console.log("All requested MeloTTS audio files already exist. Use --force to regenerate.");
  process.exit(0);
}

await runStreaming(pythonBin, [
  synthScript,
  "--manifest",
  manifestPath,
  "--speed",
  String(speed),
  "--device",
  device
], {
  cwd: root,
  env: {
    ...process.env,
    PYTHONPATH: melottsRoot,
    TOKENIZERS_PARALLELISM: "false"
  }
});

for (const [index, job] of jobs.entries()) {
  await mkdir(dirname(job.outputM4a), { recursive: true });
  if ((index + 1) % 50 === 0 || index === jobs.length - 1) {
    console.log(`Converting ${index + 1}/${jobs.length} -> ${job.outputM4a}`);
  }
  await run("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    job.outputWav,
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    job.outputM4a
  ]);
}

console.log(`Generated ${jobs.length} MeloTTS audio files for Level ${startLevel}-${endLevel}: ${requestedVoices.join(", ")}.`);

if (!keepWav) {
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

function runStreaming(command, commandArgs, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, commandArgs, {
      ...options,
      stdio: "inherit"
    });

    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`${command} exited with code ${code}`));
    });
  });
}
