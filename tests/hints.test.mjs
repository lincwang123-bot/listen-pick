import test from "node:test";
import assert from "node:assert/strict";

import { playableLevels, getQuestionsForLevel } from "../src/game.mjs";
import { toChineseHint } from "../src/hints.mjs";

const englishLetterPattern = /[A-Za-z]/;

test("Level 95 Chinese hints do not contain English words", () => {
  const leaks = collectHintLeaks([{ level: 95, questions: getQuestionsForLevel(95) }]);

  assert.deepEqual(leaks, []);
});

test("all playable Chinese hints do not contain English words", () => {
  const leaks = collectHintLeaks(playableLevels);

  assert.deepEqual(leaks, []);
});

test("Chinese hints keep the two choices distinct in every playable question", () => {
  const duplicates = collectDuplicateHints(playableLevels);

  assert.deepEqual(duplicates, []);
});

test("Chinese hints use natural child-facing wording for common action phrases", () => {
  const examples = new Map([
    ["The girl is drawing a cat.", "女孩正在画一只猫。"],
    ["The boy is reading a book.", "男孩正在读一本书。"],
    ["The boy is drinking water.", "男孩正在喝水。"],
    ["The girl is eating an apple.", "女孩正在吃一个苹果。"],
    ["The baby is looking at a picture.", "宝宝正在看一张图片。"],
    ["The man is sleeping on the sofa.", "男人正在沙发上睡觉。"],
    ["The teacher is pointing at the board.", "老师正在指着黑板。"],
    ["The students are sitting at their desks.", "学生们正坐在课桌前。"],
    ["The teacher is drawing a star on the board.", "老师正在黑板上画一颗星星。"],
    ["The baby is sitting.", "宝宝坐着。"],
    ["The baby is sleeping.", "宝宝正在睡觉。"],
    ["The turtle is green.", "乌龟是绿色的。"],
    ["The turtle is orange.", "乌龟是橙色的。"]
  ]);

  for (const [sentence, expected] of examples) {
    assert.equal(toChineseHint(sentence), expected, sentence);
  }
});

test("all playable Chinese hints avoid known machine-translation artifacts", () => {
  const artifacts = collectHintArtifacts(playableLevels);

  assert.deepEqual(artifacts, []);
});

function collectHintLeaks(levels) {
  const leaks = [];

  for (const level of levels) {
    for (const [questionIndex, question] of level.questions.entries()) {
      for (const [choiceIndex, choice] of question.choices.entries()) {
        const hint = toChineseHint(choice.label);
        if (englishLetterPattern.test(hint)) {
          leaks.push({
            level: level.level,
            question: questionIndex + 1,
            choice: choiceIndex + 1,
            label: choice.label,
            hint
          });
        }
      }
    }
  }

  return leaks;
}

function collectDuplicateHints(levels) {
  const duplicates = [];

  for (const level of levels) {
    for (const [questionIndex, question] of level.questions.entries()) {
      const hints = question.choices.map((choice) => toChineseHint(choice.label));
      if (new Set(hints).size !== hints.length) {
        duplicates.push({
          level: level.level,
          question: questionIndex + 1,
          labels: question.choices.map((choice) => choice.label),
          hints
        });
      }
    }
  }

  return duplicates;
}

function collectHintArtifacts(levels) {
  const artifacts = [];
  const artifactPattern = /画画(?:猫|狗|房子|图片|太阳|队伍|页面|星星|一个)|读书书|喝水水|吃东西(?:苹果|米饭|面条|早餐|午餐|晚餐|点心|水果|水煮蛋|杯子)|看在|指在|正在(?:睡觉|坐着|写字|读书|画|吃|喝|看).+在|有长的|有短的/;

  for (const level of levels) {
    for (const [questionIndex, question] of level.questions.entries()) {
      for (const [choiceIndex, choice] of question.choices.entries()) {
        const hint = toChineseHint(choice.label);
        if (artifactPattern.test(hint)) {
          artifacts.push({
            level: level.level,
            question: questionIndex + 1,
            choice: choiceIndex + 1,
            label: choice.label,
            hint
          });
        }
      }
    }
  }

  return artifacts;
}
