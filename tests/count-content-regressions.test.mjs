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

test("Level 22 family distractor uses the correct word for three babies", () => {
  assert.equal(question(22, 15).wrongSentence, "The three babies are triplets.");
  assert.equal(toChineseHint(question(22, 15).wrongSentence), "三个宝宝是三胞胎。");
});

test("Level 22 two-brother distractor uses natural plural English", () => {
  assert.equal(question(22, 14).wrongSentence, "We are two brothers.");
  assert.equal(toChineseHint(question(22, 14).wrongSentence), "我们是两兄弟。");
});

test("Level 22 questions 9 through 13 keep their manually reviewed family images", async () => {
  const approvedHashes = new Map([
    [question(22, 9).correctImage, "0d742f60cebfb74fe5418e2ac090c8eb4a207c3526b3b9e8418e55f817b50c8e"],
    [question(22, 9).wrongImage, "6293ef74d815273816152965d7273b1b800ad344c4d589f9bdeb85b147810fdb"],
    [question(22, 10).correctImage, "3a5cacc6cb301aae25ea3b55d6dd53fdd55761a8d1e96a59f4ec5fe6f7d4c03e"],
    [question(22, 10).wrongImage, "5c63274614c6cf7ce9e8619e770750050eec0bd3e0b4a3063b7bf109905f7ca6"],
    [question(22, 11).correctImage, "d145bf60f150cd14b16411f7402c130f72cfaa734895f5cb89076a4c3a0c8352"],
    [question(22, 11).wrongImage, "3a5cacc6cb301aae25ea3b55d6dd53fdd55761a8d1e96a59f4ec5fe6f7d4c03e"],
    [question(22, 12).correctImage, "33980405e1d4df50a72b16d0ffdfb54edb2455c61af3fe345f9292c2794d65cc"],
    [question(22, 12).wrongImage, "8a0cb42f35ad024c6eeec079aa9bdf2f05e9a84288eb192a6dec8b76b7c04dcf"],
    [question(22, 13).correctImage, "8a0cb42f35ad024c6eeec079aa9bdf2f05e9a84288eb192a6dec8b76b7c04dcf"],
    [question(22, 13).wrongImage, "33980405e1d4df50a72b16d0ffdfb54edb2455c61af3fe345f9292c2794d65cc"]
  ]);

  for (const [file, expectedHash] of approvedHashes) {
    const hash = createHash("sha256").update(await readFile(file)).digest("hex");
    assert.equal(hash, expectedHash, `${file} changed after manual family-role review`);
  }
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
