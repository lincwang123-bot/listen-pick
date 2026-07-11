import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { availableTextbookLevels } from "../src/course/textbook-playable.generated.mjs";
import { auditCourseAudio } from "./lib/course-audio-audit.mjs";
import { COURSE_AUDIO_VOICE_PROFILES } from "./lib/course-audio-voice-profile.mjs";

const run = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = resolve(root, "docs/course-audio-audit.json");
const shouldProbe = process.argv.includes("--probe");

const report = await auditCourseAudio(availableTextbookLevels, {
  rootDir: root,
  probe: shouldProbe ? probeAudio : null,
  expectedDefaultVoice: COURSE_AUDIO_VOICE_PROFILES.unified.defaultVoice
});

const output = {
  generatedAt: new Date().toISOString(),
  probed: shouldProbe,
  ...report,
  summary: {
    ...report.summary,
    findings: report.findings.length,
    errors: report.findings.filter((finding) => finding.severity === "error").length
  }
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.summary));

if (process.argv.includes("--strict") && output.summary.errors > 0) process.exitCode = 1;

async function probeAudio(file) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    file
  ]);
  return { duration: Number.parseFloat(stdout.trim()) };
}
