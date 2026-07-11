import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

import { COURSE_AUDIO_VOICE_PROFILES } from "./lib/course-audio-voice-profile.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const node = process.execPath;
const voices = COURSE_AUDIO_VOICE_PROFILES.unified;

await run("generate-textbook-stage3-6-audio.mjs", [
  "1", "300", "--quality-fixes", "--overwrite", "--concurrency=4",
  `--female-voice=${voices.female.voice}`, `--male-voice=${voices.male.voice}`
]);

function run(script, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(node, [resolve(root, "scripts", script), ...args], {
      cwd: root,
      stdio: "inherit"
    });
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`${script} exited with code ${code}`));
    });
  });
}
