import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import {
  playableLevels,
  createQuestionSession,
  createQuestionSessionFromQuestions,
  createInitialState,
  getNextPlayableLevel,
  getPreviewWordsForLevel,
  getQuestionsForLevel,
  getStarCount,
  questions,
  submitCorrectAnswer,
  submitAnswer
} from "../src/game.mjs";

function createSequenceRng(values) {
  let index = 0;
  return () => values[index++ % values.length];
}

test("level contains exactly 15 two-choice questions", () => {
  assert.equal(questions.length, 15);
  for (const question of questions) {
    assert.equal(typeof question.sentence, "string");
    assert.equal(question.choices.length, 2);
    assert.ok(question.correctIndex === 0 || question.correctIndex === 1);
  }
});

test("textbook playable levels are available with complete question assets", () => {
  assert.equal(playableLevels.length, 100);
  assert.deepEqual(
    playableLevels.map((level) => level.level),
    Array.from({ length: 100 }, (_, index) => index + 1)
  );

  for (const level of playableLevels) {
    const levelQuestions = getQuestionsForLevel(level.level);
    assert.equal(levelQuestions.length, 15, `Level ${level.level}`);

    for (const question of levelQuestions) {
      assert.equal(question.choices.length, 2);
      if (question.audio) {
        assert.match(question.audio, /^assets\/(?:audio|course\/audio\/level-\d{3}|textbook\/audio\/level-\d{3})\/.+\.m4a$/);
        assert.ok(existsSync(resolve(question.audio)), question.audio);
        assert.equal(typeof question.audioByVoice.female, "string");
        assert.equal(typeof question.audioByVoice.male, "string");
        assert.match(question.audioByVoice.female, /^assets\/(?:audio-female|course\/audio-female\/level-\d{3}|textbook\/audio-female\/level-\d{3})\/.+\.m4a$/);
        assert.match(question.audioByVoice.male, /^assets\/(?:audio-male|course\/audio-male\/level-\d{3}|textbook\/audio-male\/level-\d{3})\/.+\.m4a$/);
      }
      for (const choice of question.choices) {
        assert.match(choice.image, /^assets\/(?:scenes|course\/images\/level-\d{3}|textbook\/images\/level-\d{3})\/.+\.(?:png|webp)$/);
        assert.ok(existsSync(resolve(choice.image)), choice.image);
        assert.ok(choice.alt.length > 6);
      }
    }
  }
});

test("first 100 levels use each question's dedicated wrong image by default", () => {
  for (const level of playableLevels) {
    assert.ok(level.level >= 1 && level.level <= 100, `Unexpected playable level ${level.level}`);
    const levelQuestions = getQuestionsForLevel(level.level);

    for (const question of levelQuestions) {
      assert.equal(question.distractorChoices.length, 1, `Level ${level.level} ${question.sentence}`);
      const [distractor] = question.distractorChoices;
      assert.notEqual(distractor.label, question.sentence);
      assert.match(question.correctChoice.image, /^assets\/textbook\/images\/level-\d{3}\/q\d{3}-correct\.webp$/);
      assert.equal(
        distractor.image,
        question.correctChoice.image.replace("-correct.webp", "-wrong.webp")
      );
      assert.ok(existsSync(resolve(distractor.image)), distractor.image);
      assert.ok(distractor.alt.length > 6);

      const sessionQuestion = createQuestionSessionFromQuestions([question], {
        rng: createSequenceRng([0.9, 0.1])
      })[0];
      assert.equal(sessionQuestion.choices.length, 2);
    }
  }
});

test("Level 1 question 8 uses a unique baby sleeping distractor", () => {
  const question = getQuestionsForLevel(1)[7];

  assert.equal(question.sentence, "The baby is sitting.");
  assert.equal(question.correctChoice.image, "assets/textbook/images/level-001/q008-correct.webp");
  assert.deepEqual(question.distractorChoices.map((choice) => choice.label), [
    "The baby is sleeping."
  ]);
  assert.deepEqual(question.distractorChoices.map((choice) => choice.image), [
    "assets/textbook/images/level-001/q008-wrong.webp"
  ]);
});

test("homepage preview words change by selected level", () => {
  assert.deepEqual(getPreviewWordsForLevel(1), ["girl", "boy", "baby"]);
  assert.deepEqual(getPreviewWordsForLevel(36), ["apple", "banana", "grapes"]);
  assert.deepEqual(getPreviewWordsForLevel(49), ["library", "park", "zoo"]);
  assert.deepEqual(getPreviewWordsForLevel(50), ["apples", "bicycle", "bus"]);
  assert.deepEqual(getPreviewWordsForLevel(51), ["eyes", "ears", "nose"]);
  assert.deepEqual(getPreviewWordsForLevel(75), ["soap", "towel", "toothbrush"]);
  assert.deepEqual(getPreviewWordsForLevel(100), ["review", "school", "home"]);

  for (const level of playableLevels) {
    const words = getPreviewWordsForLevel(level.level);
    assert.equal(words.length, 3, `Level ${level.level}`);
    for (const word of words) {
      assert.equal(typeof word, "string");
      assert.ok(word.length > 1, `Level ${level.level}: ${word}`);
    }
  }
});

test("getNextPlayableLevel returns the next available level", () => {
  assert.equal(getNextPlayableLevel(1), 2);
  assert.equal(getNextPlayableLevel(49), 50);
  assert.equal(getNextPlayableLevel(50), 51);
  assert.equal(getNextPlayableLevel(99), 100);
  assert.equal(getNextPlayableLevel(100), null);
  assert.equal(getNextPlayableLevel(999), null);
});

test("learning sessions keep curriculum order but randomize answer side once per attempt", () => {
  const sourceQuestions = [
    {
      sentence: "First sentence.",
      correctIndex: 0,
      choices: [
        { label: "First correct", image: "correct-1.png", alt: "First correct" },
        { label: "First wrong", image: "wrong-1.png", alt: "First wrong" }
      ]
    },
    {
      sentence: "Second sentence.",
      correctIndex: 1,
      choices: [
        { label: "Second wrong", image: "wrong-2.png", alt: "Second wrong" },
        { label: "Second correct", image: "correct-2.png", alt: "Second correct" }
      ]
    }
  ];

  const session = createQuestionSessionFromQuestions(sourceQuestions, {
    mode: "learn",
    rng: createSequenceRng([0.8, 0.2])
  });

  assert.deepEqual(session.map((question) => question.sentence), [
    "First sentence.",
    "Second sentence."
  ]);
  assert.equal(session[0].correctIndex, 1);
  assert.equal(session[0].choices[1].label, "First correct");
  assert.equal(session[1].correctIndex, 0);
  assert.equal(session[1].choices[0].label, "Second correct");
});

test("review sessions shuffle question order without adding preload-only choices", () => {
  const sourceQuestions = Array.from({ length: 5 }, (_, index) => ({
    sentence: `Sentence ${index + 1}.`,
    correctIndex: 0,
    choices: [
      { label: `Correct ${index + 1}`, image: `correct-${index + 1}.png`, alt: `Correct ${index + 1}` },
      { label: `Wrong ${index + 1}`, image: `wrong-${index + 1}.png`, alt: `Wrong ${index + 1}` }
    ]
  }));

  const session = createQuestionSessionFromQuestions(sourceQuestions, {
    mode: "review",
    rng: createSequenceRng([0.9, 0.1, 0.7, 0.2, 0.6, 0.4, 0.8, 0.3, 0.5])
  });

  assert.notDeepEqual(
    session.map((question) => question.sentence),
    sourceQuestions.map((question) => question.sentence)
  );
  assert.ok(session.every((question) => question.choices.length === 2));
});

test("session questions pick one distractor from a distractor pool", () => {
  const session = createQuestionSessionFromQuestions(
    [
      {
        sentence: "The ball is red.",
        correctIndex: 0,
        choices: [
          { label: "The ball is red.", image: "red-ball.png", alt: "red ball" },
          { label: "The ball is blue.", image: "blue-ball.png", alt: "blue ball" }
        ],
        distractorChoices: [
          { label: "The ball is blue.", image: "blue-ball.png", alt: "blue ball" },
          { label: "The ball is yellow.", image: "yellow-ball.png", alt: "yellow ball" },
          { label: "The ball is green.", image: "green-ball.png", alt: "green ball" }
        ]
      }
    ],
    {
      rng: createSequenceRng([0.8, 0.8])
    }
  );

  assert.equal(session[0].choices.length, 2);
  assert.equal(session[0].correctIndex, 1);
  assert.deepEqual(
    session[0].choices.map((choice) => choice.image),
    ["green-ball.png", "red-ball.png"]
  );
});

test("session answer scoring uses randomized session choices", () => {
  const [question] = createQuestionSession(1, { rng: createSequenceRng([0.8]) });
  const state = createInitialState(1);
  const nextState = submitCorrectAnswer(state, question.correctIndex, {
    questions: [question]
  });

  assert.equal(nextState.currentIndex, 1);
  assert.equal(nextState.score, 1);
});

test("each answer choice has a local illustration asset", () => {
  for (const question of questions) {
    for (const choice of question.choices) {
      assert.match(choice.image, /^assets\/(?:scenes\/[a-z0-9-]+\.png|textbook\/images\/level-\d{3}\/q\d{3}-(?:correct|wrong)\.webp)$/);
      assert.equal(typeof choice.alt, "string");
      assert.ok(choice.alt.length > 8);
    }
  }
});

test("each question has a local sentence audio file", () => {
  questions.forEach((question, index) => {
    const expectedNumber = String(index + 1).padStart(3, "0");
    assert.equal(question.audio, `assets/textbook/audio/level-001/q${expectedNumber}.m4a`);
    assert.equal(question.audioByVoice.female, `assets/textbook/audio-female/level-001/q${expectedNumber}.m4a`);
    assert.equal(question.audioByVoice.male, `assets/textbook/audio-male/level-001/q${expectedNumber}.m4a`);
    assert.ok(existsSync(resolve(question.audio)), question.audio);
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
