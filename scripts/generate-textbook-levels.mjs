import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const sourcePath = process.argv[2] ?? "docs/child-english-listening-levels-001-050.md";
const dataPath = "src/course/textbook-levels-001-050.generated.mjs";
const promptPath = "docs/textbook-contact-sheet-prompts.md";
const manifestRoot = "assets/textbook/contact-sheets";
const imageRoot = "assets/textbook/images";
const audioRoot = "assets/textbook/audio";

const replacementGroups = [
  ["girl", "boy", "baby"],
  ["man", "woman"],
  ["teacher", "student"],
  ["mother", "father"],
  ["sister", "brother"],
  ["sisters", "brothers"],
  ["parents", "grandparents"],
  ["grandma", "grandpa"],
  ["grandmother", "grandfather"],
  ["grandmothers", "grandfathers"],
  ["granddaughter", "grandson"],
  ["family", "class"],
  ["cat", "dog", "rabbit", "turtle", "hamster"],
  ["bird", "duck", "fish", "frog", "swan"],
  ["cow", "horse", "sheep", "pig", "chicken"],
  ["lion", "elephant", "monkey", "giraffe", "panda"],
  ["red", "blue", "yellow", "green", "orange", "purple", "black", "white", "brown", "pink"],
  ["circle", "square", "triangle", "star", "heart"],
  ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
  ["running", "walking", "jumping", "dancing", "crawling", "standing"],
  ["reading", "writing", "drawing", "sitting", "sleeping"],
  ["eating", "drinking", "washing", "holding", "carrying"],
  ["in front of", "behind", "next to", "under", "on", "in", "between", "beside", "above"],
  ["apple", "banana", "orange", "pear", "grapes", "watermelon"],
  ["book", "bag", "cup", "box", "ball", "toy"],
  ["car", "bus", "bicycle", "train", "boat", "plane"],
  ["bedroom", "kitchen", "bathroom", "living room", "dining room", "garden", "classroom"],
  ["sunny", "raining", "snowing", "windy", "cloudy"]
];

function pad(number, size = 3) {
  return String(number).padStart(size, "0");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function preserveCase(original, replacement) {
  if (original[0] === original[0].toUpperCase()) {
    return `${replacement[0].toUpperCase()}${replacement.slice(1)}`;
  }
  return replacement;
}

function nextInGroup(group, value) {
  const index = group.indexOf(value.toLowerCase());
  if (index === -1) return null;
  return group[(index + 1) % group.length];
}

function replacePhrase(sentence, from, to) {
  const expression = new RegExp(`\\b${escapeRegExp(from)}\\b`, "i");
  if (!expression.test(sentence)) return null;
  return sentence.replace(expression, (match) => preserveCase(match, to));
}

function repairArticles(sentence) {
  return sentence
    .replace(/\ba ([aeiou])/gi, (match, vowel) => `an ${vowel}`)
    .replace(/\ban ([^aeiou\s])/gi, (match, consonant) => `a ${consonant}`);
}

function singularize(noun) {
  if (noun === "children") return "child";
  if (noun === "fish") return "fish";
  if (noun.endsWith("ies")) return `${noun.slice(0, -3)}y`;
  if (noun.endsWith("s")) return noun.slice(0, -1);
  return noun;
}

function pluralize(noun) {
  if (noun === "child") return "children";
  if (noun === "children") return "children";
  if (noun === "fish") return "fish";
  if (noun.endsWith("s")) return noun;
  if (noun.endsWith("y")) return `${noun.slice(0, -1)}ies`;
  return `${noun}s`;
}

function repairNumberAgreement(sentence) {
  return sentence
    .replace(/\bThere is (two|three|four|five|six|seven|eight|nine|ten) ((?:[a-z]+\s+)*)([a-z]+)(?=\.|$)/gi, (match, number, modifiers, noun) =>
      `There are ${number.toLowerCase()} ${modifiers.toLowerCase()}${pluralize(noun.toLowerCase())}`
    )
    .replace(/\bThere are one ((?:[a-z]+\s+)*)([a-z]+)(?=\.|$)/gi, (match, modifiers, noun) =>
      `There is one ${modifiers.toLowerCase()}${singularize(noun.toLowerCase())}`
    )
    .replace(/\bThere are (two|three|four|five|six|seven|eight|nine|ten) ((?:[a-z]+\s+)*)([a-z]+)(?=\.|$)/gi, (match, number, modifiers, noun) =>
      `There are ${number.toLowerCase()} ${modifiers.toLowerCase()}${pluralize(noun.toLowerCase())}`
    )
    .replace(/\bThere is one ((?:[a-z]+\s+)*)([a-z]+)(?=\.|$)/gi, (match, modifiers, noun) =>
      `There is one ${modifiers.toLowerCase()}${singularize(noun.toLowerCase())}`
    );
}

function repairHaveAgreement(sentence) {
  return sentence
    .replace(/\bI have (two|three|four|five|six|seven|eight|nine|ten) ((?:[a-z]+\s+)*)([a-z]+)(?=\.|$)/gi, (match, number, modifiers, noun) =>
      `I have ${number.toLowerCase()} ${modifiers.toLowerCase()}${pluralize(noun.toLowerCase())}`
    )
    .replace(/\bI have one ((?:[a-z]+\s+)*)([a-z]+)(?=\.|$)/gi, (match, modifiers, noun) =>
      `I have one ${modifiers.toLowerCase()}${singularize(noun.toLowerCase())}`
    );
}

function repairFamilyGender(sentence) {
  return sentence
    .replace(/\bShe is my father\b/gi, "He is my father")
    .replace(/\bHe is my mother\b/gi, "She is my mother")
    .replace(/\bShe is my older brother\b/gi, "He is my older brother")
    .replace(/\bHe is my younger sister\b/gi, "She is my younger sister")
    .replace(/\bShe is my grandfather\b/gi, "He is my grandfather")
    .replace(/\bHe is my grandmother\b/gi, "She is my grandmother")
    .replace(/\bThe woman is my father\b/gi, "The man is my father")
    .replace(/\bThe man is my mother\b/gi, "The woman is my mother")
    .replace(/\bThe older woman is my grandpa\b/gi, "The older man is my grandpa")
    .replace(/\bThe older man is my grandma\b/gi, "The older woman is my grandma")
    .replace(/\bThis woman is my father\b/gi, "This man is my father")
    .replace(/\bThis man is my mother\b/gi, "This woman is my mother")
    .replace(/\bThis older woman is my grandpa\b/gi, "This older man is my grandpa")
    .replace(/\bThis older man is my grandma\b/gi, "This older woman is my grandma")
    .replace(/\bThe boy is my sister\b/gi, "The boy is my brother")
    .replace(/\bThis boy is my sister\b/gi, "This boy is my brother")
    .replace(/\bThe girl is my little brother\b/gi, "The girl is my little sister")
    .replace(/\bMy mother is a man\b/gi, "My father is a man")
    .replace(/\bMy father is a woman\b/gi, "My mother is a woman")
    .replace(/\bbaby boy is with her\b/gi, "baby boy is with his")
    .replace(/\bbaby girl is with his\b/gi, "baby girl is with her");
}

function repairSentence(sentence) {
  return repairFamilyGender(repairHaveAgreement(repairNumberAgreement(repairArticles(sentence))));
}

function repairSubjectPronouns(sentence) {
  let repaired = sentence;

  if (/\b(The|A) (girl|woman|mother|sister|grandma|grandmother)\b/i.test(sentence)) {
    repaired = sentence.replace(/\bhis\b/gi, (match) => preserveCase(match, "her"));
  }

  if (/\b(The|A) (boy|man|father|brother|grandpa|grandfather)\b/i.test(sentence)) {
    repaired = sentence.replace(/\bher\b/gi, (match) => preserveCase(match, "his"));
  }

  return repairSentence(repaired);
}

function makeWrongSentence(sentence) {
  const exactWrongSentences = new Map([
    ["This is a pencil.", "This is a ruler."],
    ["This is a ruler.", "This is a pencil."],
    ["This is an eraser.", "This is a notebook."],
    ["This is a notebook.", "This is an eraser."],
    ["This is a schoolbag.", "This is a book."],
    ["The baby is sitting.", "The baby is sleeping."],
    ["The books are in the schoolbag.", "The books are on the schoolbag."],
    ["The girl is writing in her notebook.", "The girl is drawing in her notebook."],
    ["The child is making the bed.", "The child is sleeping in the bed."],
    ["The boy is putting on a shirt.", "The boy is taking off a shirt."],
    ["The girl is putting on her shoes.", "The girl is taking off her shoes."],
    ["The child is brushing his teeth.", "The child is washing his hands."],
    ["The child is eating breakfast.", "The child is drinking milk."],
    ["The child is putting on a coat.", "The child is taking off a coat."],
    ["The child is waiting by the door.", "The child is sitting by the door."],
    ["The child is drying both hands.", "The child is washing both hands."],
    ["The child is using a clean towel.", "The child is using a toothbrush."],
    ["The child is throwing rubbish away.", "The child is holding rubbish."],
    ["The child is zipping the schoolbag.", "The child is opening the schoolbag."],
    ["The boy is putting on his uniform.", "The boy is taking off his uniform."],
    ["The children are opening their books.", "The children are closing their books."],
    ["The children are playing at break.", "The children are reading at break."],
    ["The students are eating lunch.", "The students are drinking water."],
    ["This is a bowl of rice.", "This is a bowl of noodles."],
    ["This is a bowl of noodles.", "This is a bowl of rice."],
    ["This is a piece of bread.", "This is a boiled egg."],
    ["This is a boiled egg.", "This is a piece of bread."],
    ["This is a glass of milk.", "This is a glass of water."],
    ["The children have lunch at school.", "The children have lunch at home."],
    ["The children are cleaning up after lunch.", "The children are eating lunch."],
    ["The child is clapping both hands.", "The child is raising both hands."],
    ["This is a shirt.", "This is a coat."],
    ["This is a pair of trousers.", "This is a pair of shorts."],
    ["This is a dress.", "This is a skirt."],
    ["This is a skirt.", "This is a dress."],
    ["This is a coat.", "This is a shirt."],
    ["This is a hat.", "This is a cap."],
    ["These are shoes.", "These are socks."],
    ["These are socks.", "These are shoes."],
    ["The girl is putting on a hat.", "The girl is taking off a hat."],
    ["The child is taking off a jacket.", "The child is putting on a jacket."],
    ["The sun is shining.", "The sun is behind a cloud."],
    ["Rain is falling.", "Snow is falling."],
    ["The wind is moving the trees.", "The trees are still."],
    ["The day is hot.", "The day is cold."],
    ["The day is cold.", "The day is hot."],
    ["Snowflakes are falling.", "Raindrops are falling."],
    ["The child is climbing a ladder.", "The child is going down a ladder."],
    ["The children are building a sandcastle.", "The children are knocking down a sandcastle."],
    ["The mother and father are parents.", "The girl and boy are children."],
    ["The girl and boy are siblings.", "The girl and boy are friends."],
    ["The child is riding a scooter.", "The child is walking beside a scooter."],
    ["The friends are playing together.", "The friends are reading together."],
    ["The child is hitting a shuttlecock.", "The child is catching a shuttlecock."],
    ["The children are passing a basketball.", "The children are holding a basketball."],
    ["The team is cheering together.", "The team is sitting quietly."],
    ["The children are eating lunch at school.", "The children are drinking water at school."],
    ["This is an orange.", "This is a pear."],
    ["This is a pear.", "This is an apple."],
    ["These are grapes.", "These are bananas."],
    ["The apple is red.", "The apple is green."],
    ["The orange is round.", "The banana is long."],
    ["There is juice in the bottle.", "There is juice beside the bottle."],
    ["There are vegetables on the plate.", "There are vegetables under the plate."],
    ["There is rice in the lunch box.", "There is rice on the lunch box."],
    ["The child is drinking milk.", "The child is drinking water."],
    ["The child is spreading jam on bread.", "The child is spreading butter on bread."],
    ["The apple is in the lunch box.", "The apple is on the lunch box."],
    ["The bread is on a small plate.", "The bread is under a small plate."],
    ["The milk is in the glass.", "The milk is beside the glass."],
    ["The noodles are in the lunch box.", "The noodles are on the lunch box."],
    ["The lunch box has rice and vegetables.", "The lunch box has bread and fruit."],
    ["The family is sitting around the table.", "The family is standing around the table."],
    ["The girl has two eyes.", "The girl has two ears."],
    ["The boy has two ears.", "The boy has two eyes."],
    ["The woman has two hands.", "The woman has two feet."],
    ["The child has two feet.", "The child has two hands."],
    ["The baby is opening its mouth.", "The baby is closing its mouth."],
    ["The man is raising one hand.", "The man is raising two hands."],
    ["The girl is standing on one foot.", "The girl is standing on two feet."],
    ["The baby is touching its toes.", "The baby is touching its head."],
    ["Snow is on the ground.", "Snow is in the sky."],
    ["Dark clouds are in the sky.", "White clouds are in the sky."],
    ["A rainbow is in the sky.", "A rainbow is on the ground."],
    ["Puddles are on the road.", "Puddles are beside the road."],
    ["The baby is wrapped in a blanket.", "The baby is wrapped in a towel."],
    ["The boy has a kite in the wind.", "The boy has a kite on the ground."],
    ["The woman has an umbrella in the rain.", "The woman has an umbrella in the sunshine."],
    ["The children are playing in the snow.", "The children are playing in the rain."],
    ["The plane is flying in the sky.", "The plane is on the ground."],
    ["The boy is sitting on a swing.", "The boy is standing by a swing."],
    ["The children are on the seesaw.", "The children are beside the seesaw."],
    ["The baby is playing in the sandbox.", "The baby is playing beside the sandbox."],
    ["The child is swimming in the pool.", "The child is sitting beside the pool."],
    ["The family is riding in a car.", "The family is standing beside a car."],
    ["The children are sitting on a bus.", "The children are standing by a bus."],
    ["The train is moving on the tracks.", "The train is stopped on the tracks."],
    ["The boat is sailing on the water.", "The boat is sitting on the sand."],
    ["The girl is reading in the library.", "The girl is reading in the classroom."],
    ["The boy is playing in the park.", "The boy is playing in the bedroom."],
    ["The family is shopping in the supermarket.", "The family is shopping in a small shop."],
    ["The children are looking at animals in the zoo.", "The children are looking at animals in a book."],
    ["The girl is swimming in the pool.", "The girl is sitting beside the pool."],
    ["The doctor is checking a child in the clinic.", "The doctor is checking a child at home."],
    ["The cook is cooking in the restaurant kitchen.", "The cook is cooking in a home kitchen."],
    ["The farmer is feeding a cow on the farm.", "The farmer is feeding a horse on the farm."],
    ["The children are playing in the playground.", "The children are playing in the classroom."],
    ["The teacher is drawing a star on the board.", "The teacher is drawing a star on paper."]
  ]);

  const exactWrongSentence = exactWrongSentences.get(sentence);
  if (exactWrongSentence) return exactWrongSentence;

  const attributePairs = [
    ["has a beard", "has a hat"],
    ["has glasses", "has a bag"],
    ["has long hair", "has short hair"],
    ["has short hair", "has long hair"],
    ["has a hat", "has a bag"],
    ["has a bag", "has a hat"],
    ["has a toy", "has a cup"],
    ["has a cup", "has a toy"],
    ["has a banana", "has an apple"],
    ["has an apple", "has a banana"],
    ["big mane", "small mane"],
    ["long trunk", "short trunk"],
    ["long ears", "short ears"],
    ["long tail", "short tail"],
    ["long neck", "short neck"],
    ["black and white", "black and brown"],
    ["on the sofa", "on the bed"],
    ["on a mat", "on a chair"],
    ["on a chair", "on a mat"],
    ["on paper", "in a notebook"],
    ["in a little box", "on a little box"],
    ["in the water", "above the water"],
    ["beside a tree", "behind a tree"],
    ["in the sun", "in the shade"],
    ["in the kitchen", "in the living room"],
    ["in the living room", "in the kitchen"],
    ["in the bedroom", "in the garden"],
    ["in the bathroom", "in the bedroom"],
    ["in the garden", "in the bedroom"],
    ["in the playroom", "in the kitchen"],
    ["in the dining room", "in the playroom"],
    ["in the family picture", "around the table"],
    ["around the table", "in the family picture"],
    ["by the front door", "in the garden"],
    ["in the bowl", "on the bowl"],
    ["in the box", "on the box"],
    ["in the bag", "on the bag"],
    ["in the basket", "on the basket"],
    ["in the tank", "outside the tank"],
    ["in the closet", "beside the closet"],
    ["on the table", "under the table"],
    ["on the chair", "under the chair"],
    ["on the shelf", "under the shelf"],
    ["on the wall", "on the table"],
    ["in the cup", "beside the cup"],
    ["on the desk", "under the desk"],
    ["beside the bed", "under the bed"],
    ["beside the desk", "under the desk"],
    ["above the bed", "beside the bed"],
    ["above the sink", "beside the sink"],
    ["under the tree", "next to the tree"],
    ["next to the boy", "behind the boy"],
    ["under the boy", "behind the boy"],
    ["under the plate", "next to the plate"],
    ["beside the window", "behind the window"],
    ["above the window", "beside the window"]
  ];

  for (const [from, to] of attributePairs) {
    const changed = replacePhrase(sentence, from, to);
    if (changed && changed !== sentence) return repairSubjectPronouns(changed);
  }

  const lower = sentence.toLowerCase();
  const priorityGroups = [
    replacementGroups.find((group) => group.includes("red")),
    replacementGroups.find((group) => group.includes("one")),
    replacementGroups.find((group) => group.includes("running")),
    replacementGroups.find((group) => group.includes("in front of")),
    ...replacementGroups
  ].filter(Boolean);

  for (const group of priorityGroups) {
    const hit = group.find((item) => new RegExp(`\\b${escapeRegExp(item)}\\b`, "i").test(sentence));
    if (!hit) continue;

    const replacement = nextInGroup(group, hit);
    const changed = replacePhrase(sentence, hit, replacement);
    if (changed && changed !== sentence) return repairSubjectPronouns(changed);
  }

  return sentence.replace(/\.$/, " in the picture.");
}

function makeFallbackWrongSentence(sentence) {
  const alternatives = new Map([
    ["The woman is my mother.", "The man is my father."],
    ["The man is my father.", "The woman is my mother."],
    ["The older woman is my grandma.", "The older man is my grandpa."],
    ["The older man is my grandpa.", "The older woman is my grandma."],
    ["This woman is my mother.", "This man is my father."],
    ["This man is my father.", "This woman is my mother."],
    ["This older woman is my grandma.", "This older man is my grandpa."],
    ["This older man is my grandpa.", "This older woman is my grandma."],
    ["She is my mother.", "He is my father."],
    ["He is my father.", "She is my mother."],
    ["She is my grandmother.", "He is my grandfather."],
    ["He is my grandfather.", "She is my grandmother."]
  ]);

  return alternatives.get(sentence) ?? sentence.replace(/\.$/, " in another picture.");
}

function parseMarkdown(markdown) {
  const levels = [];
  let current = null;

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^## Level (\d+)｜(.+)$/);
    if (heading) {
      current = {
        level: Number(heading[1]),
        title: heading[2].trim(),
        questions: []
      };
      levels.push(current);
      continue;
    }

    const question = line.match(/^(\d+)-(\d+)\.\s+(.+)$/);
    if (question && current) {
      current.questions.push({
        id: `L${pad(Number(question[1]))}-Q${pad(Number(question[2]))}`,
        sentence: question[3].trim()
      });
    }
  }

  if (levels.length !== 50) {
    throw new Error(`Expected 50 levels, found ${levels.length}`);
  }

  for (const level of levels) {
    if (level.questions.length !== 15) {
      throw new Error(`Level ${level.level} has ${level.questions.length} questions`);
    }
  }

  return levels;
}

function makePrompt(level, cellItems) {
  const cells = [];
  for (let index = 0; index < cellItems.length; index += 2) {
    const correct = cellItems[index];
    const wrong = cellItems[index + 1];
    cells.push(
      `${String(correct.cell).padStart(2, "0")}. correct for Q${String(correct.question).padStart(2, "0")}: ${correct.sentence}`,
      `${String(wrong.cell).padStart(2, "0")}. distractor for Q${String(wrong.question).padStart(2, "0")}: ${wrong.sentence}`
    );
  }

  return [
    `## Level ${pad(level.level)} | ${level.title}`,
    "",
    "Use case: illustration-story",
    "Asset type: one contact sheet for a children's English listening app",
    "Primary request: Create ONE clean contact sheet containing exactly 30 independent illustrations for 15 picture-choice questions.",
    "Layout: exactly 6 columns x 5 rows, one illustration per cell, equal cell sizes, straight white gutters between every cell. No extra rows, no extra columns, no merged cells, no overlapping, no collage, no text, no numbers, no labels.",
    "Style/medium: warm bright children's picture-book illustration, same character design across all cells, soft colors, clean outlines, low-detail background, subject large and clear.",
    "Composition/framing: each cell is an independent scene, centered subject, iPad-friendly crop, no speech bubbles, no writing on books/boards/signs, no watermarks.",
    "Important: The final image itself must contain illustrations only. Do not draw cell numbers or captions.",
    "Cell order is row-major, left to right, top to bottom. Odd-numbered cells are correct pictures. Even-numbered cells are distractor pictures for the previous odd cell.",
    "Within each adjacent pair, keep the two scenes visually similar and change only the one semantic point described.",
    "",
    "Cells:",
    cells.join("\n"),
    "",
    "Quality target: similar clarity to polished kindergarten English picture-card illustrations; every scene should be understandable at small size."
  ].join("\n");
}

function buildCellItems(level) {
  return level.questions.flatMap((question, index) => [
    {
      cell: index * 2 + 1,
      question: index + 1,
      role: "correct",
      sentence: question.sentence,
      output: `${imageRoot}/level-${pad(level.level)}/q${pad(index + 1)}-correct.png`
    },
    {
      cell: index * 2 + 2,
      question: index + 1,
      role: "wrong",
      sentence: question.wrongSentence,
      output: `${imageRoot}/level-${pad(level.level)}/q${pad(index + 1)}-wrong.png`
    }
  ]);
}

function writeOutputs(levels) {
  const generatedLevels = levels.map((level) => {
    const questions = level.questions.map((question, index) => {
      const sentence = repairSentence(question.sentence);
      let wrongSentence = makeWrongSentence(sentence);
      if (wrongSentence === sentence) {
        wrongSentence = makeFallbackWrongSentence(sentence);
      }
      return {
        ...question,
        sentence,
        wrongSentence,
        audioFile: `${audioRoot}/level-${pad(level.level)}/q${pad(index + 1)}.m4a`,
        correctImage: `${imageRoot}/level-${pad(level.level)}/q${pad(index + 1)}-correct.png`,
        wrongImage: `${imageRoot}/level-${pad(level.level)}/q${pad(index + 1)}-wrong.png`,
        contactSheet: `${manifestRoot}/level-${pad(level.level)}.png`,
        theme: level.title,
        source: "child-english-listening-levels-01-50.md"
      };
    });

    return { ...level, questions };
  });

  mkdirSync(dirname(dataPath), { recursive: true });
  writeFileSync(
    dataPath,
    `// Generated by scripts/generate-textbook-levels.mjs from a local Level 1-50 source file.\n` +
      `// Do not edit by hand.\n\n` +
      `export const textbookLevels = ${JSON.stringify(generatedLevels, null, 2)};\n`
  );

  mkdirSync(manifestRoot, { recursive: true });
  const promptSections = [
    "# Textbook Contact Sheet Prompts",
    "",
    "> Each level uses one AI-generated 6x5 contact sheet. Crop it with `npm run crop:textbook-sheet -- <level> <sheet-path>`.",
    ""
  ];

  for (const level of generatedLevels) {
    const cellItems = buildCellItems(level);
    writeFileSync(
      `${manifestRoot}/level-${pad(level.level)}.manifest.json`,
      JSON.stringify(
        {
          level: level.level,
          title: level.title,
          layout: { columns: 6, rows: 5 },
          sheet: `${manifestRoot}/level-${pad(level.level)}.png`,
          cells: cellItems
        },
        null,
        2
      )
    );
    promptSections.push(makePrompt(level, cellItems), "");
  }

  writeFileSync(promptPath, promptSections.join("\n"));
}

const markdown = readFileSync(sourcePath, "utf8");
const levels = parseMarkdown(markdown);
writeOutputs(levels);
console.log(`Generated textbook data, 50 manifests, and contact-sheet prompts for ${levels.length * 15} questions.`);
