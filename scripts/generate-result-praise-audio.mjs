import { mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

const run = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const edgeTtsBin = resolve(root, ".venv-edge-tts/bin/edge-tts");
const outputDir = resolve(root, "assets/result-audio/zh-cn");
const workDir = resolve(root, "tmp/result-praise-audio");
const voice = readOption("--voice") ?? "zh-CN-XiaoxiaoNeural";
const rate = readOption("--rate") ?? "-6%";
const pitch = readOption("--pitch") ?? "+0Hz";
const volume = readOption("--volume") ?? "+0%";
const force = args.includes("--force");

if (!existsSync(edgeTtsBin)) {
  throw new Error("Missing .venv-edge-tts. Create it and install edge-tts first.");
}

const scoreTexts = [
  "宝贝，没关系，我们慢慢来。这一关答对零题，再听一遍，再挑战一次。",
  "宝贝，没关系，我们慢慢来。这一关答对一题，再听一遍，再挑战一次。",
  "宝贝，没关系，我们慢慢来。这一关答对两题，再听一遍，再挑战一次。",
  "宝贝，没关系，我们慢慢来。这一关答对三题，再听一遍，再挑战一次。",
  "宝贝，没关系，我们慢慢来。这一关答对四题，再听一遍，再挑战一次。",
  "宝贝，没关系，我们慢慢来。这一关答对五题，再听一遍，再挑战一次。",
  "宝贝，继续加油！这一关答对六题，我们再练一次会更好。",
  "宝贝，继续加油！这一关答对七题，我们再练一次会更好。",
  "宝贝，继续加油！这一关答对八题，我们再练一次会更好。",
  "宝贝，继续加油！这一关答对九题，我们再练一次会更好。",
  "宝贝，表现很不错！这一关答对十题，继续听清楚每一句。",
  "宝贝，表现很不错！这一关答对十一题，继续听清楚每一句。",
  "宝贝，表现很不错！这一关答对十二题，继续听清楚每一句。",
  "宝贝，很棒！这一关答对十三题，已经很接近满分啦！",
  "宝贝，很棒！这一关答对十四题，已经很接近满分啦！",
  "宝贝，你太棒啦！这一关十五题全部答对，真厉害！"
];

await mkdir(outputDir, { recursive: true });
await mkdir(workDir, { recursive: true });

let generatedCount = 0;
for (const [score, text] of scoreTexts.entries()) {
  const paddedScore = String(score).padStart(3, "0");
  const outputM4a = resolve(outputDir, `score-${paddedScore}.m4a`);
  if (!force && existsSync(outputM4a)) continue;

  const outputMp3 = resolve(workDir, `score-${paddedScore}.mp3`);
  await run(edgeTtsBin, [
    "--voice",
    voice,
    "--rate",
    rate,
    "--pitch",
    pitch,
    "--volume",
    volume,
    "--text",
    text,
    "--write-media",
    outputMp3
  ]);

  await run("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    outputMp3,
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    outputM4a
  ]);

  generatedCount += 1;
  console.log(`Generated ${generatedCount}: score-${paddedScore}.m4a`);
}

await rm(workDir, { recursive: true, force: true });
console.log(`Result praise audio ready in ${outputDir} using ${voice}.`);

function readOption(name) {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);

  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  return null;
}
