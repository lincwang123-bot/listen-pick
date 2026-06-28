import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = resolve(root, "docs/child-english-listening-levels-101-300.md");

const reviewTypesByQuestion = [
  "old", "old", "old", "old", "old", "old",
  "new", "new", "new", "new", "new", "new",
  "variation", "variation", "variation"
];

const stageConfigs = [
  {
    start: 101,
    end: 130,
    title: "动作强化阶段",
    goal: "人物 + 正在发生的动作",
    pattern: /^The [A-Za-z ]+ is [a-z]+ing\.$/,
    sentences: () => cross(
      peopleSubjects,
      actionOnlyVerbs,
      (subject, action) => `The ${subject} is ${action}.`
    )
  },
  {
    start: 131,
    end: 160,
    title: "动作 + 物品",
    goal: "人物 + 动作 + 一个具体物品",
    pattern: /^The [A-Za-z ]+ is [a-z]+ing .+\.$/,
    sentences: () => cross(
      objectActionSubjects,
      objectActionTemplates,
      (subject, template) => template(subject)
    )
  },
  {
    start: 161,
    end: 190,
    title: "位置关系",
    goal: "一个主体 + 一个位置关系 + 一个参照物",
    pattern: /^The [A-Za-z ]+ is (on|in|under|behind|next to) the [a-z ]+\.$/,
    sentences: () => relationSentences()
  },
  {
    start: 191,
    end: 220,
    title: "数量 + 物品",
    goal: "There are + 数量 + 复数物品",
    pattern: /^There are (two|three|four|five|six|seven|eight|nine|ten) [a-z ]+s\.$/,
    sentences: () => cross(
      numbers,
      pluralObjects,
      (number, object) => `There are ${number} ${object}.`
    )
  },
  {
    start: 221,
    end: 250,
    title: "颜色 + 物品",
    goal: "一个物品 + 一个颜色属性",
    pattern: /^The [A-Za-z ]+ is (red|blue|yellow|green|black|white|pink|orange|purple|brown)\.$/,
    sentences: () => cross(
      colorObjects,
      colors,
      (object, color) => `The ${object} is ${color}.`
    )
  },
  {
    start: 251,
    end: 280,
    title: "家庭 + 动作",
    goal: "家庭成员 + 正在发生的动作",
    pattern: /^My [a-z ]+ is [a-z]+ing\.$/,
    sentences: () => cross(
      familySubjects,
      familyActionVerbs,
      (subject, action) => `My ${subject} is ${action}.`
    )
  },
  {
    start: 281,
    end: 300,
    title: "综合场景",
    goal: "人物 + 一个动作 + 一个物品 + 一个场景",
    pattern: /^The [A-Za-z ]+ is [a-z]+ing .+ (in|at|on) the [a-z ]+\.$/,
    sentences: () => cross(
      sceneSubjects,
      sceneActionObjectTemplates,
      (subject, template) => template(subject)
    )
  }
];

const peopleSubjects = [
  "girl",
  "boy",
  "child",
  "student",
  "teacher",
  "mother",
  "father",
  "sister",
  "brother",
  "friend",
  "classmate",
  "grandma",
  "grandpa",
  "aunt",
  "uncle",
  "woman",
  "man",
  "cousin"
];

const actionOnlyVerbs = [
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
  "swimming",
  "singing",
  "clapping",
  "sitting",
  "standing",
  "smiling",
  "waving",
  "laughing",
  "stretching",
  "resting",
  "waiting",
  "playing",
  "hopping",
  "marching",
  "painting"
];

const objectActionSubjects = [
  { text: "girl", possessive: "her" },
  { text: "boy", possessive: "his" },
  { text: "child", possessive: "both" },
  { text: "student", possessive: "both" },
  { text: "teacher", possessive: "both" },
  { text: "friend", possessive: "both" },
  { text: "classmate", possessive: "both" },
  { text: "sister", possessive: "her" },
  { text: "brother", possessive: "his" },
  { text: "mother", possessive: "her" },
  { text: "father", possessive: "his" },
  { text: "grandma", possessive: "her" },
  { text: "grandpa", possessive: "his" },
  { text: "woman", possessive: "her" },
  { text: "man", possessive: "his" }
];

const objectActionTemplates = [
  (subject) => `The ${subject.text} is reading a book.`,
  (subject) => `The ${subject.text} is writing a word.`,
  (subject) => `The ${subject.text} is drawing a flower.`,
  (subject) => `The ${subject.text} is eating an apple.`,
  (subject) => `The ${subject.text} is drinking water.`,
  (subject) => `The ${subject.text} is holding a pencil.`,
  (subject) => `The ${subject.text} is opening a book.`,
  (subject) => `The ${subject.text} is closing a box.`,
  (subject) => `The ${subject.text} is kicking a ball.`,
  (subject) => `The ${subject.text} is throwing a ball.`,
  (subject) => `The ${subject.text} is catching a ball.`,
  (subject) => `The ${subject.text} is flying a kite.`,
  (subject) => `The ${subject.text} is carrying a bag.`,
  (subject) => `The ${subject.text} is packing a schoolbag.`,
  (subject) => `The ${subject.text} is washing ${bodyObject(subject, "hands")}.`,
  (subject) => `The ${subject.text} is playing with a ball.`,
  (subject) => `The ${subject.text} is playing with blocks.`,
  (subject) => `The ${subject.text} is looking at a picture.`,
  (subject) => `The ${subject.text} is pointing to the board.`,
  (subject) => `The ${subject.text} is touching ${bodyObject(subject, "nose")}.`,
  (subject) => `The ${subject.text} is wearing a hat.`,
  (subject) => `The ${subject.text} is folding a towel.`,
  (subject) => `The ${subject.text} is using a spoon.`,
  (subject) => `The ${subject.text} is cleaning a table.`,
  (subject) => `The ${subject.text} is moving a toy car.`,
  (subject) => `The ${subject.text} is pulling a toy train.`,
  (subject) => `The ${subject.text} is building a tower.`,
  (subject) => `The ${subject.text} is making a bed.`,
  (subject) => `The ${subject.text} is watering a plant.`,
  (subject) => `The ${subject.text} is feeding a cat.`
];

const positionSubjects = [
  "cat",
  "dog",
  "bird",
  "rabbit",
  "duck",
  "fish",
  "ball",
  "book",
  "bag",
  "toy car",
  "teddy bear",
  "robot",
  "pencil",
  "cup",
  "bottle",
  "apple",
  "kite",
  "hat"
];

const prepositions = ["on", "in", "under", "behind", "next to"];

const positionObjects = [
  "table",
  "chair",
  "box",
  "bed",
  "sofa",
  "schoolbag",
  "shelf",
  "tree",
  "desk",
  "bench"
];

const numbers = ["two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

const pluralObjects = [
  "apples",
  "bananas",
  "oranges",
  "pears",
  "books",
  "pencils",
  "erasers",
  "rulers",
  "balls",
  "blocks",
  "cars",
  "trains",
  "kites",
  "cups",
  "bottles",
  "chairs",
  "tables",
  "bags",
  "boxes",
  "hats",
  "caps",
  "shoes",
  "socks",
  "shirts",
  "coats",
  "stars",
  "circles",
  "squares",
  "triangles",
  "flowers",
  "trees",
  "birds",
  "cats",
  "dogs",
  "rabbits",
  "ducks",
  "turtles",
  "spoons",
  "forks",
  "plates",
  "bowls",
  "toys",
  "robots",
  "towels",
  "combs",
  "brushes",
  "pictures",
  "notebooks",
  "lunch boxes",
  "storybooks"
];

const colorObjects = [
  "apple",
  "banana",
  "orange",
  "pear",
  "ball",
  "book",
  "pencil",
  "eraser",
  "ruler",
  "schoolbag",
  "chair",
  "table",
  "box",
  "cup",
  "bottle",
  "hat",
  "cap",
  "shirt",
  "coat",
  "dress",
  "skirt",
  "shoe",
  "sock",
  "kite",
  "car",
  "train",
  "bus",
  "toy",
  "robot",
  "block",
  "star",
  "circle",
  "square",
  "triangle",
  "flower",
  "leaf",
  "bird",
  "fish",
  "rabbit",
  "duck",
  "plate",
  "bowl",
  "spoon",
  "towel",
  "comb"
];

const colors = ["red", "blue", "yellow", "green", "black", "white", "pink", "orange", "purple", "brown"];

const familySubjects = [
  "mother",
  "father",
  "sister",
  "brother",
  "grandma",
  "grandpa",
  "aunt",
  "uncle",
  "cousin",
  "older sister",
  "older brother",
  "little sister",
  "little brother",
  "grandmother",
  "grandfather"
];

const familyActionVerbs = [
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
  "swimming",
  "singing",
  "clapping",
  "sitting",
  "standing",
  "smiling",
  "waving",
  "laughing",
  "stretching",
  "resting",
  "waiting",
  "playing",
  "hopping",
  "marching",
  "painting",
  "counting",
  "cooking",
  "cleaning",
  "gardening",
  "exercising"
];

const sceneSubjects = [
  { text: "girl", possessive: "her" },
  { text: "boy", possessive: "his" },
  { text: "child", possessive: "both" },
  { text: "student", possessive: "both" },
  { text: "friend", possessive: "both" },
  { text: "classmate", possessive: "both" },
  { text: "sister", possessive: "her" },
  { text: "brother", possessive: "his" },
  { text: "teacher", possessive: "both" },
  { text: "cousin", possessive: "both" }
];

const scenePlaces = [
  "in the park",
  "in the classroom",
  "in the kitchen",
  "in the garden",
  "on the playground",
  "in the library",
  "in the bedroom",
  "in the living room",
  "in the bathroom",
  "at the zoo"
];

const sceneActionObjects = [
  "reading a book",
  "drawing a picture",
  "holding a pencil",
  "eating an apple",
  "drinking water",
  "playing with a ball",
  "flying a kite",
  "carrying a bag",
  "opening a book",
  "closing a box",
  "using a spoon",
  "building a tower",
  "throwing a ball",
  "catching a ball",
  "kicking a football",
  "wearing a hat",
  "folding a towel",
  "cleaning a table",
  "watering a plant",
  "feeding a rabbit",
  "looking at a picture",
  "pointing to a flower",
  "touching a toy",
  "packing a schoolbag",
  "holding a cup",
  "choosing a book",
  "making a sandcastle",
  "moving a toy car",
  "pulling a toy train",
  "counting stars"
];

const sceneActionObjectTemplates = sceneActionObjects.map((actionObject, index) => {
  const place = scenePlaces[index % scenePlaces.length];
  return (subject) => `The ${subject.text} is ${actionObject} ${place}.`;
});

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
  /\bslide in the classroom\b/i
];

const levels = buildLevels();
validateLevels(levels);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, renderMarkdown(levels), "utf8");
console.log(`Generated ${levels.length} levels and ${levels.length * 15} sentences at ${outputPath}`);

function buildLevels() {
  const levels = [];

  for (const stage of stageConfigs) {
    const requiredCount = (stage.end - stage.start + 1) * 15;
    const sentences = unique(stage.sentences()).slice(0, requiredCount);
    if (sentences.length < requiredCount) {
      throw new Error(`${stage.title} needs ${requiredCount} sentences, got ${sentences.length}`);
    }

    let sentenceIndex = 0;
    for (let level = stage.start; level <= stage.end; level += 1) {
      levels.push({
        level,
        title: stage.title,
        goal: stage.goal,
        stage,
        sentences: Array.from({ length: 15 }, (_, questionIndex) => ({
          text: sentences[sentenceIndex++],
          reviewType: reviewTypesByQuestion[questionIndex]
        }))
      });
    }
  }

  return levels;
}

function validateLevels(levels) {
  if (levels.length !== 200) throw new Error(`Expected 200 levels, got ${levels.length}`);
  const allSentences = [];

  for (const level of levels) {
    if (level.sentences.length !== 15) throw new Error(`Level ${level.level} does not have 15 sentences`);
    for (const sentence of level.sentences) {
      if (!level.stage.pattern.test(sentence.text)) {
        throw new Error(`Pattern mismatch in Level ${level.level}: ${sentence.text}`);
      }
      if (bannedPatterns.some((pattern) => pattern.test(sentence.text))) {
        throw new Error(`Banned content in Level ${level.level}: ${sentence.text}`);
      }
      allSentences.push(sentence.text);
    }
  }

  const duplicate = findDuplicate(allSentences);
  if (duplicate) throw new Error(`Duplicate sentence: ${duplicate}`);

  for (let start = 101; start <= 300; start += 10) {
    const block = levels.filter((level) => level.level >= start && level.level < start + 10);
    const counts = { old: 0, new: 0, variation: 0 };
    for (const level of block) {
      for (const sentence of level.sentences) counts[sentence.reviewType] += 1;
    }
    if (counts.old !== 60 || counts.new !== 60 || counts.variation !== 30) {
      throw new Error(`Review mix failed for Level ${start}-${start + 9}: ${JSON.stringify(counts)}`);
    }
  }
}

function renderMarkdown(levels) {
  const lines = [
    "# 儿童英语听句选图教材｜Level 101-300",
    "",
    "> Generated from deterministic sentence templates and vocabulary pools. No random sentence drafting.",
    "",
    "## 生成规则",
    "",
    "- Level 101-130：动作强化，`The X is V-ing.`",
    "- Level 131-160：动作 + 物品，`The X is V-ing object.`",
    "- Level 161-190：位置关系，`The X is prep Y.`",
    "- Level 191-220：数量 + 物品，`There are number objects.`",
    "- Level 221-250：颜色 + 物品，`The X is color.`",
    "- Level 251-280：家庭 + 动作，`My family member is V-ing.`",
    "- Level 281-300：综合场景，`The X is V-ing object in/at/on the scene.`",
    "- 每 10 关内部按 40% 旧句式、40% 新组合、20% 轻微变化分配。",
    ""
  ];

  for (const level of levels) {
    lines.push(`## Level ${pad(level.level)}｜${level.title}`);
    lines.push("");
    lines.push(`> ${level.goal}`);
    lines.push("");
    for (const [index, sentence] of level.sentences.entries()) {
      lines.push(`${pad(level.level)}-${String(index + 1).padStart(2, "0")}. ${sentence.text}`);
    }
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function relationSentences() {
  const sentences = [];
  for (const subject of positionSubjects) {
    for (const prep of prepositions) {
      for (const object of positionObjects) {
        if (subject === object) continue;
        sentences.push(`The ${subject} is ${prep} the ${object}.`);
      }
    }
  }
  return sentences;
}

function cross(leftItems, rightItems, render) {
  const sentences = [];
  for (const left of leftItems) {
    for (const right of rightItems) {
      sentences.push(render(left, right));
    }
  }
  return sentences;
}

function bodyObject(subject, bodyPart) {
  if (subject.possessive === "both") return bodyPart === "nose" ? "a nose" : `both ${bodyPart}`;
  return `${subject.possessive} ${bodyPart}`;
}

function unique(items) {
  return [...new Set(items)];
}

function findDuplicate(items) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item)) return item;
    seen.add(item);
  }
  return "";
}

function pad(level) {
  return String(level).padStart(3, "0");
}
