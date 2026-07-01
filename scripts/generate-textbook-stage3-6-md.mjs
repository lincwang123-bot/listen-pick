import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { textbookLevels as existingTextbookLevels } from "../src/course/textbook-levels-001-100.generated.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputJsonPath = resolve(root, "docs/child-english-listening-levels-101-300.json");
const outputMdPath = resolve(root, "docs/child-english-listening-levels-101-300.md");
const outputDataPath = resolve(root, "src/course/textbook-levels-101-300.generated.mjs");
const outputCombinedDataPath = resolve(root, "src/course/textbook-levels-001-300.generated.mjs");
const outputPromptPath = resolve(root, "docs/textbook-contact-sheet-prompts-101-300.md");
const QUESTIONS_PER_LEVEL = 15;
const CONTACT_SHEET_COLUMNS = 6;
const CONTACT_SHEET_ROWS = 5;
const PROMPT_SHEET_COLUMNS = 5;
const PROMPT_SHEET_ROWS = 2;
const PROMPT_SHEET_SIZE = PROMPT_SHEET_COLUMNS * PROMPT_SHEET_ROWS;
const IMAGE_STYLE = [
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
  "no watermark",
  "not realistic photo",
  "no complex scene"
].join(", ");

const people = ["boy", "girl", "child"];
const actions = [
  "running",
  "walking",
  "jumping",
  "dancing",
  "reading",
  "writing",
  "drawing",
  "eating",
  "drinking",
  "sleeping",
  "sitting",
  "standing",
  "singing",
  "clapping",
  "waving",
  "smiling",
  "laughing",
  "painting",
  "swimming",
  "playing"
];
const objectPairs = [
  ["reading", "a book", "a card"],
  ["drawing", "a flower", "a house"],
  ["eating", "an apple", "a banana"],
  ["drinking", "water", "milk"],
  ["holding", "a ball", "a toy"],
  ["holding", "a toy", "a ball"],
  ["opening", "a box", "a book"],
  ["closing", "a book", "a box"],
  ["kicking", "a ball", "a beanbag"],
  ["carrying", "a bag", "a basket"],
  ["flying", "a kite", "a paper plane"],
  ["folding", "a towel", "a shirt"],
  ["using", "a spoon", "a cup"],
  ["cleaning", "a table", "a desk"],
  ["watering", "a plant", "a flower"]
];
const positionSubjects = ["ball", "book", "toy", "apple", "bag", "hat"];
const positionPlaces = ["box", "bag"];
const prepositions = ["in", "on", "under", "behind", "next to"];
const countObjects = [
  ["balls", "ball"],
  ["books", "book"],
  ["toys", "toy"],
  ["apples", "apple"],
  ["bags", "bag"],
  ["hats", "hat"]
];
const numbers = ["two", "three", "four", "five", "six"];
const colorObjects = ["ball", "book", "toy", "bag", "hat", "cup"];
const colors = ["red", "blue", "yellow", "green", "black", "white", "pink", "orange"];
const familyMembers = ["mother", "father", "sister", "brother"];
const familyActions = ["cooking", "reading", "eating", "drinking", "walking", "sitting", "standing", "singing", "smiling", "waving"];
const childFamilyActions = ["reading", "eating", "drinking", "walking", "sitting", "standing", "singing", "smiling", "waving", "clapping"];
const scenes = ["at school", "at home", "in the park"];
const sceneActions = ["running", "walking", "reading", "drawing", "eating", "drinking", "playing", "sitting", "standing", "singing"];
const integratedObjects = [
  ["reading", "a book", "a card"],
  ["drawing", "a flower", "a house"],
  ["eating", "an apple", "a banana"],
  ["holding", "a ball", "a toy"],
  ["playing with", "a toy", "a ball"]
];

const stages = [
  { start: 101, end: 130, title: "动作认知", build: buildActionQuestions },
  { start: 131, end: 160, title: "物品结构", build: buildObjectQuestions },
  { start: 161, end: 190, title: "位置关系", build: buildPositionQuestions },
  { start: 191, end: 220, title: "数量理解", build: buildNumberQuestions },
  { start: 221, end: 250, title: "颜色理解", build: buildColorQuestions },
  { start: 251, end: 280, title: "家庭系统", build: buildFamilyQuestions },
  { start: 281, end: 300, title: "综合理解", build: buildIntegratedQuestions }
];

const questionCounters = new Map();
const levels = [];
for (const stage of stages) {
  for (let level = stage.start; level <= stage.end; level += 1) {
    const questions = stage.build(level);
    if (questions.length !== QUESTIONS_PER_LEVEL) {
      throw new Error(`Level ${level} has ${questions.length} questions.`);
    }
    levels.push({ level, title: stage.title, questions });
  }
}

await mkdir(dirname(outputJsonPath), { recursive: true });
await mkdir(dirname(outputDataPath), { recursive: true });
await writeFile(outputJsonPath, `${JSON.stringify({ levels }, null, 2)}\n`, "utf8");
await writeFile(outputMdPath, renderMarkdown(levels), "utf8");
await writeTextbookDataFiles(levels);
await writeContactSheetManifests(levels);
await writeFile(outputPromptPath, renderContactSheetPrompts(levels), "utf8");

console.log(`Generated ${levels.length} levels and ${levels.length * QUESTIONS_PER_LEVEL} questions.`);
console.log(outputJsonPath);
console.log(outputMdPath);
console.log(outputDataPath);
console.log(outputCombinedDataPath);
console.log(outputPromptPath);

function buildActionQuestions(level) {
  const offset = level - 101;
  const activeActions = windowed(actions, offset * 2, 5);
  return people.flatMap((person) =>
    activeActions.map((action, index) => {
      const wrongAction = activeActions[(index + 1) % activeActions.length];
      return makeQuestion(level, personAction(person, action), personAction(person, wrongAction), "action");
    })
  );
}

function buildObjectQuestions(level) {
  const offset = level - 131;
  const activePairs = windowed(objectPairs, offset * 2, 5);
  return people.flatMap((person) =>
    activePairs.map(([action, object, wrongObject]) =>
      makeQuestion(level, personObject(person, action, object), personObject(person, action, wrongObject), "object")
    )
  );
}

function buildPositionQuestions(level) {
  const offset = level - 161;
  const place = positionPlaces[offset % positionPlaces.length];
  const subjects = windowedWithout(positionSubjects, offset, 3, place);
  return subjects.flatMap((subject) =>
    prepositions.map((prep, index) => {
      const wrongPrep = prepositions[(index + 1) % prepositions.length];
      return makeQuestion(level, positionSentence(subject, prep, place), positionSentence(subject, wrongPrep, place), "position");
    })
  );
}

function buildNumberQuestions(level) {
  const offset = level - 191;
  const objects = windowed(countObjects, offset, 3);
  return objects.flatMap(([plural]) =>
    numbers.map((number, index) => {
      const wrongNumber = numbers[(index + 1) % numbers.length];
      return makeQuestion(level, numberSentence(number, plural), numberSentence(wrongNumber, plural), "number");
    })
  );
}

function buildColorQuestions(level) {
  const offset = level - 221;
  const objects = windowed(colorObjects, offset, 3);
  const activeColors = windowed(colors, offset, 5);
  return objects.flatMap((object) =>
    activeColors.map((color, index) => {
      const wrongColor = activeColors[(index + 1) % activeColors.length];
      return makeQuestion(level, colorSentence(object, color), colorSentence(object, wrongColor), "color");
    })
  );
}

function buildFamilyQuestions(level) {
  const offset = level - 251;
  const members = windowed(familyMembers, offset, 3);
  return members.flatMap((member) =>
    windowed(familyActionPool(member), offset, 5).map((action, index, activeActions) => {
      const wrongAction = activeActions[(index + 1) % activeActions.length];
      return makeQuestion(level, familySentence(member, action), familySentence(member, wrongAction), "action");
    })
  );
}

function buildIntegratedQuestions(level) {
  const offset = level - 281;
  const mode = offset % 2;

  if (mode === 0) {
    const activeActions = windowed(sceneActions, offset, 5);
    return people.flatMap((person) =>
      activeActions.map((action, index) => {
        const scene = scenes[index % scenes.length];
        const wrongScene = scenes[(index + 1) % scenes.length];
        return makeQuestion(level, personScene(person, action, scene), personScene(person, action, wrongScene), "scene");
      })
    );
  }

  const activePairs = windowed(integratedObjects, offset, 5);
  return people.flatMap((person) =>
    activePairs.map(([action, object, wrongObject]) =>
      makeQuestion(level, personObject(person, action, object), personObject(person, action, wrongObject), "object")
    )
  );
}

function makeQuestion(level, sentence, wrongSentence, contrast) {
  const questionNumber = nextQuestionNumber(level);
  const id = `level${level}_q${String(questionNumber).padStart(2, "0")}`;
  const correctImage = `assets/textbook/images/level-${String(level).padStart(3, "0")}/q${String(questionNumber).padStart(3, "0")}-correct.png`;
  const wrongImage = `assets/textbook/images/level-${String(level).padStart(3, "0")}/q${String(questionNumber).padStart(3, "0")}-wrong.png`;

  return {
    id,
    level,
    sentence,
    wrongSentence,
    concept: contrast,
    difficulty: getDifficultyForLevel(level),
    contrast,
    correctImagePrompt: imagePrompt(sentence),
    wrongImagePrompt: imagePrompt(wrongSentence),
    options: [
      { image: correctImage, isCorrect: true },
      { image: wrongImage, isCorrect: false }
    ]
  };
}

function getDifficultyForLevel(level) {
  if (level <= 130) return 1;
  if (level <= 160) return 2;
  if (level <= 220) return 3;
  if (level <= 280) return 4;
  return 5;
}

function nextQuestionNumber(level) {
  const next = (questionCounters.get(level) ?? 0) + 1;
  questionCounters.set(level, next);
  return next;
}

function imagePrompt(sentence) {
  return `${IMAGE_STYLE}. Scene: ${sentence}`;
}

function personAction(person, action) {
  return `The ${person} is ${action}.`;
}

function personObject(person, action, object) {
  return `The ${person} is ${action} ${object}.`;
}

function positionSentence(subject, prep, place) {
  return `The ${subject} is ${prep} the ${place}.`;
}

function numberSentence(number, object) {
  return `There are ${number} ${object}.`;
}

function colorSentence(object, color) {
  return `The ${object} is ${color}.`;
}

function familySentence(member, action) {
  return `My ${member} is ${action}.`;
}

function personScene(person, action, scene) {
  return `The ${person} is ${action} ${scene}.`;
}

function windowed(items, offset, count) {
  return Array.from({ length: count }, (_, index) => items[(offset + index) % items.length]);
}

function familyActionPool(member) {
  return ["sister", "brother"].includes(member) ? childFamilyActions : familyActions;
}

function windowedWithout(items, offset, count, blockedItem) {
  const result = [];
  let index = 0;

  while (result.length < count && index < items.length * 2) {
    const item = items[(offset + index) % items.length];
    if (item !== blockedItem && !result.includes(item)) {
      result.push(item);
    }
    index += 1;
  }

  if (result.length !== count) {
    throw new Error(`Unable to build ${count} unique items without ${blockedItem}.`);
  }

  return result;
}

async function writeTextbookDataFiles(items) {
  const stageLevels = items.map(toTextbookLevel);
  const combinedLevels = [...existingTextbookLevels, ...stageLevels];

  await writeFile(
    outputDataPath,
    `// Generated by scripts/generate-textbook-stage3-6-md.mjs.\n` +
      `// Do not edit by hand.\n\n` +
      `export const textbookLevels = ${JSON.stringify(stageLevels, null, 2)};\n`,
    "utf8"
  );

  await writeFile(
    outputCombinedDataPath,
    `// Generated by scripts/generate-textbook-stage3-6-md.mjs.\n` +
      `// Do not edit by hand.\n\n` +
      `export const textbookLevels = ${JSON.stringify(combinedLevels, null, 2)};\n`,
    "utf8"
  );
}

function toTextbookLevel(level) {
  const title = `Level ${level.level}：${level.title}`;
  return {
    level: level.level,
    title,
    previewWords: getPreviewWords(level),
    questions: level.questions.map((question, index) => {
      const questionNumber = index + 1;
      return {
        id: `L${pad(level.level)}-Q${pad(questionNumber)}`,
        sentence: question.sentence,
        wrongSentence: question.wrongSentence,
        audioFile: `assets/textbook/audio/level-${pad(level.level)}/q${pad(questionNumber)}.m4a`,
        correctImage: `assets/textbook/images/level-${pad(level.level)}/q${pad(questionNumber)}-correct.png`,
        wrongImage: `assets/textbook/images/level-${pad(level.level)}/q${pad(questionNumber)}-wrong.png`,
        contactSheet: `assets/textbook/contact-sheets/level-${pad(level.level)}.png`,
        theme: title,
        concept: question.concept,
        difficulty: question.difficulty,
        correctImagePrompt: question.correctImagePrompt,
        wrongImagePrompt: question.wrongImagePrompt,
        source: "child-english-listening-levels-101-300.json"
      };
    })
  };
}

function getPreviewWords(level) {
  const words = [];
  const ignored = new Set(["the", "is", "are", "a", "an", "my", "with", "in", "on", "under", "behind", "next", "to", "at", "there"]);

  for (const question of level.questions) {
    const parts = question.sentence
      .replace(/[.]/g, "")
      .split(/\s+/)
      .map((word) => word.toLowerCase())
      .filter((word) => !ignored.has(word));

    for (const part of parts) {
      if (!words.includes(part)) words.push(part);
      if (words.length === 3) return words;
    }
  }

  return ["listen", "pick", "review"];
}

async function writeContactSheetManifests(items) {
  for (const level of items.map(toTextbookLevel)) {
    const manifestPath = resolve(root, `assets/textbook/contact-sheets/level-${pad(level.level)}.manifest.json`);
    const cells = [];

    for (const [index, question] of level.questions.entries()) {
      cells.push({
        cell: index * 2 + 1,
        question: index + 1,
        role: "correct",
        sentence: question.sentence,
        prompt: question.correctImagePrompt,
        output: question.correctImage
      });
      cells.push({
        cell: index * 2 + 2,
        question: index + 1,
        role: "wrong",
        sentence: question.wrongSentence,
        prompt: question.wrongImagePrompt,
        output: question.wrongImage
      });
    }

    await mkdir(dirname(manifestPath), { recursive: true });
    await writeFile(
      manifestPath,
      `${JSON.stringify({
        level: level.level,
        title: level.title,
        layout: {
          columns: CONTACT_SHEET_COLUMNS,
          rows: CONTACT_SHEET_ROWS
        },
        sheet: `assets/textbook/contact-sheets/level-${pad(level.level)}.png`,
        cells
      }, null, 2)}\n`,
      "utf8"
    );
  }
}

function renderContactSheetPrompts(items) {
  return items.map((level) => {
    const cells = level.questions.flatMap((question, index) => [
      `${index * 2 + 1}. ${question.sentence}`,
      `${index * 2 + 2}. ${question.wrongSentence}`
    ]);
    const parts = [];

    for (let start = 0; start < cells.length; start += PROMPT_SHEET_SIZE) {
      const partNumber = start / PROMPT_SHEET_SIZE + 1;
      const partCells = cells.slice(start, start + PROMPT_SHEET_SIZE);
      const startCell = start + 1;
      const endCell = start + partCells.length;

      parts.push([
        `### Part ${partNumber}｜cells ${startCell}-${endCell}`,
        "",
        `Create one contact sheet with ${PROMPT_SHEET_COLUMNS} columns and ${PROMPT_SHEET_ROWS} rows, exactly ${partCells.length} separate panels.`,
        "Panel order must be left to right, top to bottom. Each panel is one independent illustration. Keep clear white gutters between panels for cropping.",
        "Style for every panel: polished children's picture book illustration, same finished illustration quality as the Level 1-100 production images, soft pastel colors, clean white background, simple composition, centered subject, warm lighting, rounded cartoon character design, clean outlines, full-body or clearly framed subject.",
        "Quality gate: do not use simplified vector placeholders, stick-figure drawings, geometric icon scenes, rough SVG mockups, cropped limbs, distorted hands, text, labels, numbers, captions, logos, or watermarks.",
        "Do not include any text, labels, numbers, captions, speech bubbles, logos, or watermarks inside the image.",
        "",
        "Panels:",
        ...partCells
      ].join("\n"));
    }

    return [
      `## Level ${level.level} - ${level.title}`,
      "",
      "Generate this level as three smaller contact sheets. Smaller sheets reduce panel drift and make cropping more reliable than one 30-panel image.",
      "",
      ...parts,
      ""
    ].join("\n");
  }).join("\n\n");
}

function pad(number, size = 3) {
  return String(number).padStart(size, "0");
}

function renderMarkdown(items) {
  const lines = [
    "# 儿童英语听句选图教材｜Level 101-300｜结构化生产版",
    "",
    "> JSON 数据包含 sentence、wrongSentence、correctImagePrompt、wrongImagePrompt 和 options。课程句子固定，选项展示由运行时随机。",
    ""
  ];

  for (const level of items) {
    lines.push(`## Level ${level.level}`);
    lines.push("");
    for (const [index, question] of level.questions.entries()) {
      lines.push(`${String(index + 1).padStart(2, "0")}. 学习句：${question.sentence}`);
      lines.push(`    干扰图：${question.wrongSentence}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}
