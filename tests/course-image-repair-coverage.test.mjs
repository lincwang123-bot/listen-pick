import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";

import { PNG } from "pngjs";

import { COURSE_IMAGE_REPAIR_TARGETS } from "../scripts/lib/course-image-repair-targets.mjs";
import { textbookLevels } from "../src/course/textbook-levels-001-300.generated.mjs";

const repairRoot = "assets/textbook/repair-sheets";

test("every audited image target is covered by a generated batch or reviewed reuse", () => {
  const covered = new Set();

  for (const file of readdirSync(repairRoot).filter((name) => /^batch-.*\.json$/.test(name))) {
    const report = JSON.parse(readFileSync(`${repairRoot}/${file}`, "utf8"));
    for (const target of report.targets) covered.add(toKey(target));
  }

  const reused = JSON.parse(readFileSync(`${repairRoot}/reused-candidates.json`, "utf8"));
  const choiceByImage = new Map(allChoices().map((choice) => [choice.image, choice]));
  for (const item of reused.copied) covered.add(toKey(choiceByImage.get(item.target)));

  const missing = COURSE_IMAGE_REPAIR_TARGETS.map(toKey).filter((key) => !covered.has(key));
  assert.deepEqual(missing, []);
});

test("all repaired image targets have complete 4 by 3 PNG and WebP assets", () => {
  for (const target of COURSE_IMAGE_REPAIR_TARGETS) {
    const choice = allChoices().find((candidate) => toKey(candidate) === toKey(target));
    assert.ok(choice, toKey(target));
    assert.ok(existsSync(choice.image), choice.image);
    assert.ok(existsSync(choice.image.replace(/\.png$/, ".webp")), choice.image);
    const image = PNG.sync.read(readFileSync(choice.image));
    assert.equal(image.width / image.height, 4 / 3, choice.image);
    assert.ok(image.width >= 640, choice.image);
    assert.ok(image.height >= 480, choice.image);
  }
});

test("ambiguous reused action labels were replaced with literal visible states", () => {
  const bannedStaticAction = / is (?:reading a card|opening a book|closing a book|closing a box|folding a towel|folding a shirt)\.$/;
  const bannedHeldPlane = /^The (?:girl|child) is flying a paper plane\.$/;
  const findings = textbookLevels.flatMap((level) => level.questions.flatMap((question) =>
    [question.sentence, question.wrongSentence]
      .filter((sentence) => bannedStaticAction.test(sentence) || bannedHeldPlane.test(sentence))
      .map((sentence) => `${question.id}: ${sentence}`)
  ));
  assert.deepEqual(findings, []);
});

test("every ball-under-box path uses the reviewed unambiguous source image", () => {
  const sourcePath = "assets/textbook/images/stage3-scenes/stage3_scene_0147.png";
  const expectedHash = sha256(sourcePath);
  const paths = allChoices()
    .filter((choice) => choice.sentence === "The ball is under the box.")
    .map((choice) => choice.image);

  assert.equal(paths.length, 20);
  for (const path of paths) assert.equal(sha256(path), expectedHash, path);
});

function allChoices() {
  return textbookLevels.flatMap((level) => level.questions.flatMap((question, index) => [
    { level: level.level, question: index + 1, role: "correct", sentence: question.sentence, image: question.correctImage },
    { level: level.level, question: index + 1, role: "wrong", sentence: question.wrongSentence, image: question.wrongImage }
  ]));
}

function toKey(item) {
  return `${item.level}-${item.question}-${item.role}`;
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}
