import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { availableTextbookLevels } from "../src/course/textbook-playable.generated.mjs";
import { toChineseHint } from "../src/hints.mjs";

function question(levelNumber, questionNumber) {
  return availableTextbookLevels[levelNumber - 1].questions[questionNumber - 1];
}

test("reported body-action distractors use natural English and Chinese", () => {
  assert.equal(question(52, 9).wrongSentence, "The baby is kicking both feet.");
  assert.equal(toChineseHint(question(52, 9).wrongSentence), "宝宝正在踢动双脚。");

  assert.equal(question(93, 11).wrongSentence, "The baby is holding a sock in one hand.");
  assert.equal(toChineseHint(question(93, 11).wrongSentence), "宝宝一只手里拿着一只袜子。");
});

test("manually reviewed count-scene images keep their approved content", async () => {
  const approvedHashes = new Map([
    [question(18, 14).correctImage, "54acd6c2acd911add0a522ab99d3378a2a934a6f959c6557c47e407b9c2483de"],
    [question(18, 14).wrongImage, "55846425997e0ca67921d271c925619fbdf8b6adb24ed726b25a7612a9628427"],
    [question(22, 8).correctImage, "3ad55ff0dfd7a20e687e944f230be1f5b88543679f08ee1b0b06363cd21ce40f"],
    [question(22, 8).wrongImage, "3ccf425e72dc286e8f15a08bd804aa561f1a25f3d597b2eedf71df0628d33d04"],
    [question(29, 7).wrongImage, "359e860a950488b63f1099435955af402f72a94fd94b353a4bd8c3d4c1847f94"]
  ]);

  for (const [file, expectedHash] of approvedHashes) {
    const hash = createHash("sha256").update(await readFile(file)).digest("hex");
    assert.equal(hash, expectedHash, `${file} changed after manual semantic review`);
  }
});
