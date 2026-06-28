import test from "node:test";
import assert from "node:assert/strict";

import { courseLevels } from "../src/course/levels-002-030.generated.mjs";

const bannedTerms = [
  "office",
  "meeting",
  "manager",
  "salary",
  "investment",
  "business",
  "bank",
  "loan",
  "stock market",
  "online shopping",
  "airport security",
  "passport",
  "hotel reception",
  "dream",
  "success",
  "freedom",
  "culture",
  "history",
  "future",
  "friendship",
  "opinion",
  "idea",
  "knowledge",
  "anxious",
  "embarrassed",
  "jealous",
  "regretful",
  "depressed"
];

function wordCount(sentence) {
  return sentence.replace(/[.?!]/g, "").split(/\s+/).filter(Boolean).length;
}

test("stage one generated curriculum includes Levels 2 through 30", () => {
  assert.equal(courseLevels.length, 29);
  assert.deepEqual(
    courseLevels.map((level) => level.level),
    Array.from({ length: 29 }, (_, index) => index + 2)
  );
});

test("each generated level has 15 complete picture-choice questions", () => {
  for (const level of courseLevels) {
    assert.equal(level.questions.length, 15, `Level ${level.level}`);
    assert.equal(typeof level.title, "string");
    assert.ok(level.learningFocus.length > 0);
    assert.ok(level.reviewFocus.length > 0);

    for (const question of level.questions) {
      assert.match(question.id, /^L\d{3}-Q\d{3}$/);
      assert.equal(typeof question.sentence, "string");
      assert.equal(typeof question.chineseMeaning, "string");
      assert.equal(typeof question.hintText, "string");
      assert.match(question.audioFile, /^assets\/course\/audio\/level-\d{3}\/q\d{3}\.m4a$/);
      assert.match(question.correctImage, /^assets\/course\/images\/level-\d{3}\/q\d{3}-correct\.png$/);
      assert.match(question.wrongImage, /^assets\/course\/images\/level-\d{3}\/q\d{3}-wrong\.png$/);
      assert.equal(typeof question.theme, "string");
      assert.equal(typeof question.difficulty, "number");
      assert.ok(["new", "recent-review", "long-review", "challenge"].includes(question.knowledgeType));
      assert.ok(Array.isArray(question.sourceLevels));
      assert.ok(question.imagePromptCorrect.includes("no text"));
      assert.ok(question.imagePromptWrong.includes("no text"));
      assert.notEqual(question.imagePromptCorrect, question.imagePromptWrong);
    }
  }
});

test("sentences are concrete, short, and unique for Stage 1", () => {
  const seen = new Set();

  for (const level of courseLevels) {
    for (const question of level.questions) {
      const normalized = question.sentence.toLowerCase();
      assert.ok(!seen.has(normalized), `Duplicate sentence: ${question.sentence}`);
      seen.add(normalized);

      assert.ok(wordCount(question.sentence) >= 3, question.sentence);
      assert.ok(wordCount(question.sentence) <= 5, question.sentence);

      const searchable = [
        question.sentence,
        question.chineseMeaning,
        question.hintText,
        question.imagePromptCorrect,
        question.imagePromptWrong
      ].join(" ").toLowerCase();

      for (const bannedTerm of bannedTerms) {
        assert.ok(!searchable.includes(bannedTerm), `${question.id} contains ${bannedTerm}`);
      }
    }
  }
});
