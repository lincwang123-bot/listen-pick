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

function inspectQuestion(level, question) {
  const searchable = [
    question.sentence,
    question.chineseMeaning,
    question.hintText,
    question.theme,
    question.imagePromptCorrect,
    question.imagePromptWrong
  ].join(" ").toLowerCase();

  assert.match(question.id, /^L\d{3}-Q\d{3}$/);
  assert.ok(wordCount(question.sentence) >= 3, `${question.id} is too short`);
  assert.ok(wordCount(question.sentence) <= 5, `${question.id} is too long: ${question.sentence}`);
  assert.match(question.audioFile, /^assets\/course\/audio\/level-\d{3}\/q\d{3}\.m4a$/);
  assert.match(question.correctImage, /^assets\/course\/images\/level-\d{3}\/q\d{3}-correct\.png$/);
  assert.match(question.wrongImage, /^assets\/course\/images\/level-\d{3}\/q\d{3}-wrong\.png$/);
  assert.ok(question.imagePromptCorrect.includes("no text"), question.id);
  assert.ok(question.imagePromptWrong.includes("no text"), question.id);
  assert.notEqual(question.imagePromptCorrect, question.imagePromptWrong, question.id);
  assert.ok(question.sourceLevels.every((sourceLevel) => sourceLevel >= 1 && sourceLevel <= level.level));

  for (const bannedTerm of bannedTerms) {
    assert.ok(!searchable.includes(bannedTerm), `${question.id} contains banned term: ${bannedTerm}`);
  }
}

const sentenceSet = new Set();

assert.equal(courseLevels.length, 29, "Expected Levels 2-30");

for (const [index, level] of courseLevels.entries()) {
  const expectedLevel = index + 2;
  assert.equal(level.level, expectedLevel, `Expected Level ${expectedLevel}`);
  assert.equal(level.questions.length, 15, `Level ${level.level} should contain 15 questions`);
  assert.ok(level.newWords.length <= 3, `Level ${level.level} has too many new words`);
  assert.ok(level.learningFocus.length > 0, `Level ${level.level} needs a learning focus`);
  assert.ok(level.reviewFocus.length > 0, `Level ${level.level} needs a review focus`);

  for (const question of level.questions) {
    const normalizedSentence = question.sentence.toLowerCase();
    assert.ok(!sentenceSet.has(normalizedSentence), `Duplicate sentence: ${question.sentence}`);
    sentenceSet.add(normalizedSentence);
    inspectQuestion(level, question);
  }
}

const totalQuestions = courseLevels.reduce((sum, level) => sum + level.questions.length, 0);
const cycleStats = courseLevels.reduce((stats, level) => {
  stats[level.cycleRole] = (stats[level.cycleRole] ?? 0) + 1;
  return stats;
}, {});
const knowledgeStats = courseLevels
  .flatMap((level) => level.questions)
  .reduce((stats, question) => {
    stats[question.knowledgeType] = (stats[question.knowledgeType] ?? 0) + 1;
    return stats;
  }, {});

console.log(`Course validation passed.`);
console.log(`Levels: ${courseLevels[0].level}-${courseLevels.at(-1).level}`);
console.log(`Questions: ${totalQuestions}`);
console.log(`Cycle roles: ${JSON.stringify(cycleStats)}`);
console.log(`Knowledge types: ${JSON.stringify(knowledgeStats)}`);
