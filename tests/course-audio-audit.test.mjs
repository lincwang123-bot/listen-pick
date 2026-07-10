import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

import { auditCourseAudio } from "../scripts/lib/course-audio-audit.mjs";

async function fixtureRoot() {
  return mkdtemp(join(tmpdir(), "listen-pick-audio-audit-"));
}

function levels() {
  return [{
    level: 1,
    questions: [
      { id: "L001-Q001", sentence: "A cat is sleeping.", audioFile: "assets/textbook/audio/level-001/q001.m4a" },
      { id: "L001-Q002", sentence: "A dog is running.", audioFile: "assets/textbook/audio/level-001/q002.m4a" },
      { id: "L001-Q003", sentence: "A cat is sleeping.", audioFile: "assets/textbook/audio/level-001/q003.m4a" }
    ]
  }];
}

async function writeAudio(root, relativePath, bytes) {
  const target = join(root, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, bytes);
}

test("audio audit catches missing, empty, and cross-sentence duplicate media", async () => {
  const root = await fixtureRoot();
  const sameBytes = Buffer.from("same valid-looking media bytes");

  await writeAudio(root, "assets/textbook/audio/level-001/q001.m4a", sameBytes);
  await writeAudio(root, "assets/textbook/audio/level-001/q002.m4a", sameBytes);
  await writeAudio(root, "assets/textbook/audio/level-001/q003.m4a", sameBytes);
  await writeAudio(root, "assets/textbook/audio-male/level-001/q001.m4a", Buffer.alloc(0));
  await writeAudio(root, "assets/textbook/audio-female/level-001/q001.m4a", Buffer.from("female"));

  const report = await auditCourseAudio(levels(), { rootDir: root, probe: async () => ({ duration: 1.2 }) });
  const rules = new Set(report.findings.map((finding) => finding.rule));

  assert.ok(rules.has("missing-audio"));
  assert.ok(rules.has("empty-audio"));
  assert.ok(rules.has("cross-sentence-audio-duplicate"));
});

test("audio audit allows byte-identical files for the same sentence", async () => {
  const root = await fixtureRoot();
  const sameBytes = Buffer.from("same sentence media");
  const oneSentenceLevel = [{
    level: 1,
    questions: [
      { id: "L001-Q001", sentence: "A cat is sleeping.", audioFile: "assets/textbook/audio/level-001/q001.m4a" },
      { id: "L001-Q002", sentence: "A cat is sleeping.", audioFile: "assets/textbook/audio/level-001/q002.m4a" }
    ]
  }];

  for (const voice of ["audio", "audio-male", "audio-female"]) {
    await writeAudio(root, `assets/textbook/${voice}/level-001/q001.m4a`, sameBytes);
    await writeAudio(root, `assets/textbook/${voice}/level-001/q002.m4a`, sameBytes);
  }

  const report = await auditCourseAudio(oneSentenceLevel, { rootDir: root, probe: async () => ({ duration: 1.2 }) });

  assert.deepEqual(report.findings, []);
});
