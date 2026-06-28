import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";

import { textbookLevels } from "../src/course/textbook-levels-001-100.generated.mjs";
import { availableTextbookLevels } from "../src/course/textbook-playable.generated.mjs";

test("textbook source is parsed into Level 1 through 100 with 15 questions each", () => {
  assert.equal(textbookLevels.length, 100);
  assert.deepEqual(
    textbookLevels.map((level) => level.level),
    Array.from({ length: 100 }, (_, index) => index + 1)
  );

  for (const level of textbookLevels) {
    assert.equal(level.questions.length, 15, `Level ${level.level}`);
    for (const question of level.questions) {
      assert.match(question.id, /^L\d{3}-Q\d{3}$/);
      assert.ok(question.sentence.length > 0);
      assert.ok(question.wrongSentence.length > 0);
      assert.notEqual(question.sentence, question.wrongSentence);
      assert.match(question.audioFile, /^assets\/textbook\/audio\/level-\d{3}\/q\d{3}\.m4a$/);
      assert.match(question.correctImage, /^assets\/textbook\/images\/level-\d{3}\/q\d{3}-correct\.png$/);
      assert.match(question.wrongImage, /^assets\/textbook\/images\/level-\d{3}\/q\d{3}-wrong\.png$/);
      assert.match(question.contactSheet, /^assets\/textbook\/contact-sheets\/level-\d{3}\.png$/);
    }
  }
});

test("available textbook levels include Level 1 through 100 with complete assets", () => {
  assert.equal(availableTextbookLevels.length, 100);
  assert.deepEqual(
    availableTextbookLevels.map((level) => level.level),
    Array.from({ length: 100 }, (_, index) => index + 1)
  );

  for (const level of availableTextbookLevels) {
    assert.equal(level.questions.length, 15);
    for (const question of level.questions) {
      assert.ok(existsSync(question.correctImage), question.correctImage);
      assert.ok(existsSync(question.wrongImage), question.wrongImage);
      assert.ok(existsSync(question.audioFile), question.audioFile);
    }
  }
});

test("textbook sentences avoid unsafe or misleading child-facing scenes", () => {
  const bannedScenePatterns = [
    /slide in the classroom/i,
    /slide beside the classroom board/i,
    /pushing on the slide/i,
    /children are pushing on the swing/i,
    /under the seesaw/i,
    /sleeping in the sandbox/i,
    /brushing teeth with a comb/i,
    /lunch box has socks/i,
    /toy box has noodles/i,
    /fighting over/i,
    /crying on the swing/i,
    /raising one foot with a glove/i,
    /washing feet before putting on a shirt/i,
    /friends like sitting apart/i,
    /father and father are parents/i,
    /boy and boy are siblings/i
  ];
  const hits = [];

  for (const level of textbookLevels) {
    for (const question of level.questions) {
      for (const field of ["sentence", "wrongSentence"]) {
        const text = question[field];
        if (bannedScenePatterns.some((pattern) => pattern.test(text))) {
          hits.push({
            level: level.level,
            id: question.id,
            field,
            text
          });
        }
      }
    }
  }

  assert.deepEqual(hits, []);
});

test("textbook English uses natural sentence patterns for children", () => {
  const unnaturalPatterns = [
    /\bholding rope\b/i,
    /\blike lunch together\b/i,
    /\blike snacks together\b/i,
    /\bdrying feet\b/i,
    /\bdrying hands\b/i,
    /\bbrushing hair\b/i,
    /\bbrushing teeth\b/i,
    /\bwashing feet\b/i,
    /\bwashing hands\b/i
  ];
  const allowed = new Set([
    "The man is washing his hands.",
    "The woman is washing her hands.",
    "The children are washing their hands before lunch.",
    "The children are washing their hands after lunch.",
    "The child is washing his shoes after school.",
    "The child is washing his hands after school.",
    "The child is washing his hands at the sink.",
    "The child is washing his hands before putting on a shirt."
  ]);
  const hits = [];

  for (const level of textbookLevels) {
    for (const question of level.questions) {
      for (const field of ["sentence", "wrongSentence"]) {
        const text = question[field];
        if (!allowed.has(text) && unnaturalPatterns.some((pattern) => pattern.test(text))) {
          hits.push({
            level: level.level,
            id: question.id,
            field,
            text
          });
        }
      }
    }
  }

  assert.deepEqual(hits, []);
});
