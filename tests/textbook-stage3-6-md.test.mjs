import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const jsonPath = new URL("../docs/child-english-listening-levels-101-300.json", import.meta.url);
const requiredStyleWords = [
  "polished children's picture book illustration",
  "same finished illustration quality as the Level 1-100 production images",
  "soft pastel colors",
  "clean white background",
  "simple composition",
  "centered subject",
  "warm lighting",
  "rounded cartoon character design",
  "clean outlines",
  "full-body or clearly framed subject",
  "no cropped limbs",
  "not a simplified vector placeholder",
  "no stick-figure or geometric icon style",
  "no text",
  "no watermark"
];

test("Level 101-300 structured data contains 200 fixed levels with 15 questions each", () => {
  const levels = readCourse().levels;

  assert.equal(levels.length, 200);
  assert.deepEqual(
    levels.map((level) => level.level),
    Array.from({ length: 200 }, (_, index) => index + 101)
  );

  for (const level of levels) {
    assert.equal(level.questions.length, 15, `Level ${level.level}`);
  }

  assert.equal(levels.reduce((total, level) => total + level.questions.length, 0), 3000);
});

test("Level 101-300 questions expose the required production fields", () => {
  for (const level of readCourse().levels) {
    for (const [index, question] of level.questions.entries()) {
      const questionNumber = String(index + 1).padStart(2, "0");
      assert.equal(question.id, `level${level.level}_q${questionNumber}`);
      assert.equal(question.level, level.level);
      assert.ok(question.sentence.length > 0);
      assert.ok(question.wrongSentence.length > 0);
      assert.notEqual(question.sentence, question.wrongSentence);
      assert.equal(typeof question.concept, "string");
      assert.equal(question.concept, question.contrast);
      assert.equal(typeof question.difficulty, "number");
      assert.ok(question.difficulty >= 1 && question.difficulty <= 5);
      assert.ok(question.correctImagePrompt.includes(question.sentence));
      assert.ok(question.wrongImagePrompt.includes(question.wrongSentence));
      assert.deepEqual(question.options.map((option) => option.isCorrect), [true, false]);
      assert.match(question.options[0].image, /^assets\/textbook\/images\/level-\d{3}\/q\d{3}-correct\.png$/);
      assert.match(question.options[1].image, /^assets\/textbook\/images\/level-\d{3}\/q\d{3}-wrong\.png$/);
      for (const styleWord of requiredStyleWords) {
        assert.ok(question.correctImagePrompt.includes(styleWord), `${question.id} missing ${styleWord}`);
        assert.ok(question.wrongImagePrompt.includes(styleWord), `${question.id} missing ${styleWord}`);
      }
    }
  }
});

test("Level 101-300 structured data follows the required stage sentence patterns", () => {
  const stageChecks = [
    {
      range: [101, 130],
      pattern: /^The (boy|girl|child) is [a-z]+ing\.$/,
      contrast: "action"
    },
    {
      range: [131, 160],
      pattern: /^The (boy|girl|child) is [a-z]+ing (a|an|water|milk)[a-z ]*\.$/,
      contrast: "object"
    },
    {
      range: [161, 190],
      pattern: /^The (ball|book|toy|apple|bag|hat) is (in|on|under|behind|next to) the (box|bag)\.$/,
      contrast: "position"
    },
    {
      range: [191, 220],
      pattern: /^There are (two|three|four|five|six) (balls|books|toys|apples|bags|hats)\.$/,
      contrast: "number"
    },
    {
      range: [221, 250],
      pattern: /^The (ball|book|toy|bag|hat|cup) is (red|blue|yellow|green|black|white|pink|orange)\.$/,
      contrast: "color"
    },
    {
      range: [251, 280],
      pattern: /^My (mother|father|sister|brother) is [a-z]+ing\.$/,
      contrast: "action"
    },
    {
      range: [281, 300],
      pattern: /^The (boy|girl|child) is [a-z]+ing ((with )?(a|an)[a-z ]*|water|milk|at school|at home|in the park)\.$/,
      contrast: /^(scene|object)$/
    }
  ];

  for (const level of readCourse().levels) {
    const check = stageChecks.find(({ range }) => level.level >= range[0] && level.level <= range[1]);
    assert.ok(check, `Missing stage check for Level ${level.level}`);

    for (const question of level.questions) {
      assert.match(question.sentence, check.pattern, question.id);
      assert.match(question.wrongSentence, check.pattern, `${question.id} wrong`);
      if (typeof check.contrast === "string") {
        assert.equal(question.contrast, check.contrast, question.id);
      } else {
        assert.match(question.contrast, check.contrast, question.id);
      }
      assert.ok(wordCount(question.sentence) <= 8, `${question.id} is too long`);
    }
  }
});

test("Level 101-300 distractors change only one semantic variable", () => {
  for (const level of readCourse().levels) {
    for (const question of level.questions) {
      const difference = semanticDifference(question.sentence, question.wrongSentence);
      assert.equal(difference, question.contrast, `${question.id}: ${question.sentence} / ${question.wrongSentence}`);
    }
  }
});

test("position questions never place an object relative to itself", () => {
  for (const level of readCourse().levels) {
    for (const question of level.questions) {
      for (const sentence of [question.sentence, question.wrongSentence]) {
        const parts = parseSemanticParts(sentence);
        if ("position" in parts) {
          assert.notEqual(parts.subject, parts.place, `${question.id}: ${sentence}`);
        }
      }
    }
  }
});

test("color questions only use objects that can naturally carry arbitrary colors", () => {
  const unnaturalColorObjects = new Set(["apple", "banana"]);

  for (const level of readCourse().levels) {
    for (const question of level.questions) {
      for (const sentence of [question.sentence, question.wrongSentence]) {
        const parts = parseSemanticParts(sentence);
        if ("color" in parts) {
          assert.equal(
            unnaturalColorObjects.has(parts.object),
            false,
            `${question.id}: ${sentence}`
          );
        }
      }
    }
  }
});

test("child family members do not perform unsafe cooking actions", () => {
  for (const level of readCourse().levels) {
    for (const question of level.questions) {
      for (const sentence of [question.sentence, question.wrongSentence]) {
        assert.doesNotMatch(sentence, /^My (sister|brother) is cooking\.$/, `${question.id}: ${sentence}`);
      }
    }
  }
});

test("Level 101-300 course data avoids banned adult, abstract, unsafe, and random content", () => {
  const content = readFileSync(jsonPath, "utf8");
  const bannedPatterns = [
    /\boffice\b/i,
    /\bmeeting\b/i,
    /\bmanager\b/i,
    /\bsalary\b/i,
    /\binvestment\b/i,
    /\bbusiness\b/i,
    /\bbank\b/i,
    /\bloan\b/i,
    /\bstock\b/i,
    /\bpassport\b/i,
    /\bhotel\b/i,
    /\bdream\b/i,
    /\bsuccess\b/i,
    /\bfreedom\b/i,
    /\bculture\b/i,
    /\bhistory\b/i,
    /\bfuture\b/i,
    /\bfriendship\b/i,
    /\bopinion\b/i,
    /\bidea\b/i,
    /\bknowledge\b/i,
    /\banxious\b/i,
    /\bembarrassed\b/i,
    /\bjealous\b/i,
    /\bregretful\b/i,
    /\bdepressed\b/i,
    /\bfighting\b/i,
    /\bpushing\b/i,
    /\bunder the seesaw\b/i,
    /\bslide in the classroom\b/i,
    /\bin the table\b/i,
    /\bin the chair\b/i,
    /\bin the school\b/i,
    /\bin the home\b/i
  ];

  for (const pattern of bannedPatterns) {
    assert.doesNotMatch(content, pattern);
  }
});

function readCourse() {
  return JSON.parse(readFileSync(jsonPath, "utf8"));
}

function wordCount(sentence) {
  return sentence.replace(/\.$/, "").split(/\s+/).length;
}

function semanticDifference(sentence, wrongSentence) {
  if (sentence === wrongSentence) return "same";

  const target = parseSemanticParts(sentence);
  const wrong = parseSemanticParts(wrongSentence);
  const changed = Object.keys(target).filter((key) => target[key] !== wrong[key]);

  return changed.length === 1 ? changed[0] : "multiple";
}

function parseSemanticParts(sentence) {
  const cleaned = sentence.replace(/\.$/, "");

  let match = cleaned.match(/^The (boy|girl|child) is ([a-z]+ing)$/);
  if (match) return { subject: match[1], action: match[2] };

  match = cleaned.match(/^The (boy|girl|child) is ([a-z]+ing) (.+)$/);
  if (match) {
    const tail = match[3];
    if (["at school", "at home", "in the park"].includes(tail)) {
      return { subject: match[1], action: match[2], scene: tail };
    }
    return { subject: match[1], action: match[2], object: tail };
  }

  match = cleaned.match(/^The (ball|book|toy|apple|bag|hat) is (in|on|under|behind|next to) the (box|bag)$/);
  if (match) return { subject: match[1], position: match[2], place: match[3] };

  match = cleaned.match(/^There are (two|three|four|five|six) (balls|books|toys|apples|bags|hats)$/);
  if (match) return { number: match[1], object: match[2] };

  match = cleaned.match(/^The (ball|book|toy|bag|hat|cup) is (red|blue|yellow|green|black|white|pink|orange)$/);
  if (match) return { object: match[1], color: match[2] };

  match = cleaned.match(/^My (mother|father|sister|brother) is ([a-z]+ing)$/);
  if (match) return { family: match[1], action: match[2] };

  return { raw: cleaned };
}
