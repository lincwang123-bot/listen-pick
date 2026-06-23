import test from "node:test";
import assert from "node:assert/strict";

import {
  createInitialState,
  getStarCount,
  questions,
  submitCorrectAnswer,
  submitAnswer
} from "../src/game.mjs";

test("level contains exactly 15 two-choice questions", () => {
  assert.equal(questions.length, 15);
  for (const question of questions) {
    assert.equal(typeof question.sentence, "string");
    assert.equal(question.choices.length, 2);
    assert.ok(question.correctIndex === 0 || question.correctIndex === 1);
  }
});

test("each answer choice has a local illustration asset", () => {
  for (const question of questions) {
    for (const choice of question.choices) {
      assert.match(choice.image, /^assets\/scenes\/[a-z0-9-]+\.png$/);
      assert.equal(typeof choice.alt, "string");
      assert.ok(choice.alt.length > 8);
    }
  }
});

test("each question has a local sentence audio file", () => {
  questions.forEach((question, index) => {
    const expectedNumber = String(index + 1).padStart(2, "0");
    assert.equal(question.audio, `assets/audio/q${expectedNumber}.m4a`);
  });
});

test("submitAnswer records correct answers and advances progress", () => {
  const state = createInitialState();
  const nextState = submitAnswer(state, questions[0].correctIndex);

  assert.equal(nextState.score, 1);
  assert.equal(nextState.currentIndex, 1);
  assert.equal(nextState.answers.length, 1);
  assert.equal(nextState.answers[0].isCorrect, true);
});

test("submitAnswer records incorrect answers without increasing score", () => {
  const state = createInitialState();
  const wrongIndex = questions[0].correctIndex === 0 ? 1 : 0;
  const nextState = submitAnswer(state, wrongIndex);

  assert.equal(nextState.score, 0);
  assert.equal(nextState.currentIndex, 1);
  assert.equal(nextState.answers[0].isCorrect, false);
});

test("submitCorrectAnswer only advances for the correct choice", () => {
  const state = createInitialState();
  const wrongIndex = questions[0].correctIndex === 0 ? 1 : 0;
  const afterWrong = submitCorrectAnswer(state, wrongIndex);

  assert.equal(afterWrong, state);

  const afterCorrect = submitCorrectAnswer(state, questions[0].correctIndex);
  assert.equal(afterCorrect.currentIndex, 1);
  assert.equal(afterCorrect.score, 1);
});

test("submitCorrectAnswer can advance without awarding a retry point", () => {
  const state = createInitialState();
  const afterRetryCorrect = submitCorrectAnswer(
    state,
    questions[0].correctIndex,
    { awardPoint: false }
  );

  assert.equal(afterRetryCorrect.currentIndex, 1);
  assert.equal(afterRetryCorrect.score, 0);
  assert.equal(afterRetryCorrect.answers[0].isCorrect, true);
});

test("getStarCount maps final score to result stars", () => {
  assert.equal(getStarCount(15), 3);
  assert.equal(getStarCount(12), 2);
  assert.equal(getStarCount(8), 1);
  assert.equal(getStarCount(5), 0);
});
