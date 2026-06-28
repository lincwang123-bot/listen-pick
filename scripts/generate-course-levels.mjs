import { mkdir, writeFile } from "node:fs/promises";

const outputPath = new URL("../src/course/levels-002-030.generated.mjs", import.meta.url);

const stylePrefix =
  "Children's picture book style, warm bright soft colors, light background, clear single subject, low detail, no text, no watermark";

const colors = [
  ["red", "红色"],
  ["blue", "蓝色"],
  ["yellow", "黄色"],
  ["green", "绿色"],
  ["pink", "粉色"],
  ["orange", "橙色"],
  ["white", "白色"],
  ["black", "黑色"],
  ["purple", "紫色"]
];

const objects = [
  ["ball", "球"],
  ["kite", "风筝"],
  ["cup", "杯子"],
  ["bag", "书包"],
  ["car", "小汽车"],
  ["box", "盒子"],
  ["hat", "帽子"],
  ["book", "书"],
  ["pencil", "铅笔"],
  ["chair", "椅子"],
  ["table", "桌子"],
  ["door", "门"],
  ["window", "窗户"],
  ["bed", "床"],
  ["bike", "自行车"],
  ["shoe", "鞋子"],
  ["apple", "苹果"],
  ["flower", "花"],
  ["umbrella", "伞"],
  ["plate", "盘子"]
];

const subjects = [
  ["boy", "男孩", "he"],
  ["girl", "女孩", "she"],
  ["father", "爸爸", "he"],
  ["mother", "妈妈", "she"],
  ["teacher", "老师", "she"],
  ["baby", "宝宝", "he"],
  ["brother", "哥哥", "he"],
  ["sister", "姐姐", "she"],
  ["grandma", "奶奶", "she"],
  ["grandpa", "爷爷", "he"],
  ["friend", "朋友", "he"]
];

const actions = [
  ["runs", "跑步", "running happily"],
  ["jumps", "跳", "jumping"],
  ["reads", "读书", "reading a book"],
  ["draws", "画画", "drawing on paper"],
  ["sings", "唱歌", "singing"],
  ["dances", "跳舞", "dancing"],
  ["swims", "游泳", "swimming in a small pool"],
  ["sleeps", "睡觉", "sleeping"],
  ["smiles", "微笑", "smiling"],
  ["claps", "拍手", "clapping hands"],
  ["waves", "挥手", "waving"],
  ["cooks", "做饭", "cooking simple food"],
  ["walks", "走路", "walking"],
  ["drinks", "喝水", "drinking water"],
  ["eats", "吃东西", "eating"]
];

const subjectActionMap = {
  boy: ["runs", "jumps", "reads", "draws", "sings", "dances", "swims", "sleeps", "smiles", "claps", "waves", "walks", "drinks", "eats"],
  girl: ["runs", "jumps", "reads", "draws", "sings", "dances", "swims", "sleeps", "smiles", "claps", "waves", "walks", "drinks", "eats"],
  father: ["runs", "reads", "draws", "sings", "dances", "sleeps", "smiles", "claps", "waves", "cooks", "walks", "drinks", "eats"],
  mother: ["runs", "reads", "draws", "sings", "dances", "sleeps", "smiles", "claps", "waves", "cooks", "walks", "drinks", "eats"],
  teacher: ["reads", "draws", "sings", "smiles", "claps", "waves", "walks", "drinks", "eats"],
  baby: ["sleeps", "smiles", "claps", "waves", "drinks", "eats"],
  brother: ["runs", "jumps", "reads", "draws", "sings", "dances", "swims", "sleeps", "smiles", "claps", "waves", "walks", "drinks", "eats"],
  sister: ["runs", "jumps", "reads", "draws", "sings", "dances", "swims", "sleeps", "smiles", "claps", "waves", "walks", "drinks", "eats"],
  grandma: ["reads", "draws", "sings", "dances", "sleeps", "smiles", "claps", "waves", "cooks", "walks", "drinks", "eats"],
  grandpa: ["reads", "draws", "sings", "dances", "sleeps", "smiles", "claps", "waves", "cooks", "walks", "drinks", "eats"],
  friend: ["runs", "jumps", "reads", "draws", "sings", "dances", "swims", "sleeps", "smiles", "claps", "waves", "walks", "drinks", "eats"]
};

const actionByVerb = new Map(actions.map((action) => [action[0], action]));

const animals = [
  ["cat", "cats", "猫"],
  ["dog", "dogs", "狗"],
  ["bird", "birds", "鸟"],
  ["duck", "ducks", "鸭子"],
  ["rabbit", "rabbits", "兔子"],
  ["fish", "fish", "鱼"],
  ["monkey", "monkeys", "猴子"],
  ["panda", "pandas", "熊猫"],
  ["tiger", "tigers", "老虎"],
  ["elephant", "elephants", "大象"]
];

const animalActions = [
  ["runs", "跑", "run"],
  ["jumps", "跳", "jump"],
  ["sleeps", "睡觉", "sleep"],
  ["swims", "游泳", "swim"],
  ["flies", "飞", "fly"],
  ["sits", "坐着", "sit"],
  ["eats", "吃东西", "eat"]
];

const animalActionMap = {
  cat: ["runs", "jumps", "sleeps", "sits", "eats"],
  dog: ["runs", "jumps", "sleeps", "sits", "eats"],
  bird: ["flies", "sits", "eats"],
  duck: ["runs", "swims", "sits", "eats"],
  rabbit: ["runs", "jumps", "sleeps", "sits", "eats"],
  fish: ["swims", "eats"],
  monkey: ["runs", "jumps", "sleeps", "sits", "eats"],
  panda: ["runs", "sleeps", "sits", "eats"],
  tiger: ["runs", "jumps", "sleeps", "sits", "eats"],
  elephant: ["runs", "sleeps", "sits", "eats"]
};

const animalActionByVerb = new Map(animalActions.map((action) => [action[0], action]));

const foods = [
  ["apples", "苹果"],
  ["bananas", "香蕉"],
  ["eggs", "鸡蛋"],
  ["rice", "米饭"],
  ["noodles", "面条"],
  ["milk", "牛奶"],
  ["bread", "面包"],
  ["fish", "鱼肉"],
  ["carrots", "胡萝卜"],
  ["water", "水"],
  ["corn", "玉米"],
  ["cake", "蛋糕"],
  ["soup", "汤"],
  ["pears", "梨"],
  ["grapes", "葡萄"],
  ["juice", "果汁"]
];

const toys = [
  ["a ball", "球", "ball"],
  ["a kite", "风筝", "kite"],
  ["a doll", "娃娃", "doll"],
  ["a car", "玩具车", "toy car"],
  ["a train", "玩具火车", "toy train"],
  ["a plane", "玩具飞机", "toy plane"],
  ["a robot", "机器人", "toy robot"],
  ["a drum", "鼓", "toy drum"],
  ["a boat", "玩具船", "toy boat"],
  ["a block", "积木", "toy block"],
  ["a bear", "玩具熊", "teddy bear"],
  ["a hoop", "呼啦圈", "toy hoop"]
];

const numbers = [
  ["Two", "两只", 2],
  ["Three", "三只", 3],
  ["Four", "四只", 4],
  ["Five", "五只", 5]
];

const levelPlans = [
  ["Action Review", ["simple actions"], ["Level 1 actions"], ["wave", "clap"], ["simple actions"]],
  ["Color Choices", ["colors", "toys"], ["simple actions"], ["pink", "purple"], ["colors", "toys", "simple actions"]],
  ["Animal Actions", ["animals", "actions"], ["colors"], ["panda", "rabbit"], ["animals", "simple actions"]],
  ["Day 1 Challenge", ["mixed review"], ["Levels 1-4"], ["challenge"], ["simple actions", "colors", "animals", "toys"]],
  ["Toy Words", ["toys", "colors"], ["mixed review"], ["robot", "train"], ["toys", "colors"]],
  ["Food Words", ["food", "likes"], ["toys"], ["bread", "milk"], ["food", "family", "toys"]],
  ["Number Pictures", ["numbers", "animals"], ["food"], ["four", "five"], ["numbers", "animals"]],
  ["School Actions", ["school", "actions"], ["numbers"], ["teacher", "pencil"], ["simple actions", "colors"]],
  ["Day 2 Challenge", ["mixed review"], ["Levels 6-9"], ["challenge"], ["toys", "food", "numbers", "simple actions"]],
  ["Pet Actions", ["pets", "actions"], ["school actions"], ["fish", "duck"], ["animals", "simple actions"]],
  ["Food And Family", ["family", "food"], ["pet actions"], ["noodles", "eggs"], ["family", "food"]],
  ["Home Objects", ["home objects", "colors"], ["family food"], ["chair", "box"], ["colors", "toys"]],
  ["Animal Colors", ["colors", "animals"], ["home objects"], ["white", "black"], ["colors", "animals"]],
  ["Day 3 Challenge", ["mixed review"], ["Levels 11-14"], ["challenge"], ["animals", "family", "colors", "food"]],
  ["Friend Actions", ["friends", "actions"], ["animal colors"], ["friends", "walks"], ["simple actions", "toys"]],
  ["Toy Review", ["toys", "numbers"], ["friend actions"], ["plane", "drum"], ["toys", "numbers"]],
  ["Zoo Pictures", ["zoo animals"], ["toys"], ["elephant", "tiger"], ["animals", "numbers"]],
  ["Snack Time", ["food", "actions"], ["zoo animals"], ["carrots", "water"], ["food", "simple actions"]],
  ["Day 4 Challenge", ["mixed review"], ["Levels 16-19"], ["challenge"], ["simple actions", "toys", "animals", "food"]],
  ["Classroom Pictures", ["classroom objects"], ["snack time"], ["book", "bag"], ["colors", "toys"]],
  ["Park Animals", ["park", "animals"], ["classroom"], ["birds", "tree"], ["animals", "numbers"]],
  ["Happy Actions", ["simple feelings", "actions"], ["park animals"], ["happy", "tired"], ["simple actions", "animals"]],
  ["Color And Number", ["colors", "numbers"], ["simple feelings"], ["orange", "yellow"], ["colors", "numbers"]],
  ["Day 5 Challenge", ["mixed review"], ["Levels 21-24"], ["challenge"], ["colors", "numbers", "animals", "simple actions"]],
  ["Family Review", ["family", "daily actions"], ["color numbers"], ["baby", "smiles"], ["family", "simple actions"]],
  ["Animal Review", ["animals", "actions"], ["family review"], ["monkey", "eats"], ["animals", "numbers"]],
  ["Food Review", ["food", "family"], ["animal review"], ["rice", "fish"], ["food", "family"]],
  ["Mixed Pictures", ["mixed semantic review"], ["Levels 2-28"], ["review"], ["simple actions", "colors", "toys", "animals", "food"]],
  ["Stage 1 Checkpoint", ["stage review"], ["Levels 2-29"], ["checkpoint"], ["simple actions", "colors", "animals", "toys", "food", "numbers", "family"]]
];

function pick(list, seed) {
  return list[((seed % list.length) + list.length) % list.length];
}

function articleFor(word) {
  return /^[aeiou]/.test(word) ? "an" : "a";
}

function sentenceCase(text) {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

function sourceLevelsFor(level, questionNumber) {
  if (questionNumber >= 14) return [level];
  if (level > 26 && questionNumber === 1) return [level - 25];
  if (level > 11 && questionNumber <= 3) return [level - 10];
  if (level > 4 && questionNumber <= 6) return [level - 3];
  return [Math.max(1, level - 1)];
}

function knowledgeTypeFor(level, questionNumber) {
  if (questionNumber >= 14) return "new";
  if (level % 5 === 0) return "challenge";
  if (level > 4 && questionNumber <= 6) return "recent-review";
  return "long-review";
}

function imagePath(level, questionNumber, variant) {
  return `assets/course/images/level-${String(level).padStart(3, "0")}/q${String(questionNumber).padStart(3, "0")}-${variant}.png`;
}

function audioPath(level, questionNumber) {
  return `assets/course/audio/level-${String(level).padStart(3, "0")}/q${String(questionNumber).padStart(3, "0")}.m4a`;
}

function makeQuestion(level, questionNumber, raw) {
  return {
    id: `L${String(level).padStart(3, "0")}-Q${String(questionNumber).padStart(3, "0")}`,
    sentence: raw.sentence,
    wrongSentence: raw.wrongSentence,
    chineseMeaning: raw.chineseMeaning,
    hintText: raw.hintText,
    audioFile: audioPath(level, questionNumber),
    correctImage: imagePath(level, questionNumber, "correct"),
    wrongImage: imagePath(level, questionNumber, "wrong"),
    theme: raw.theme,
    difficulty: 1,
    knowledgeType: knowledgeTypeFor(level, questionNumber),
    sourceLevels: sourceLevelsFor(level, questionNumber),
    imagePromptCorrect: `${stylePrefix}: ${raw.correctPrompt}.`,
    imagePromptWrong: `${stylePrefix}: ${raw.wrongPrompt}.`
  };
}

function makeSubjectActionRaw(subjectRow, verb, wrongVerb) {
  const [subject, subjectZh] = subjectRow;
  const [, verbZh, actionPrompt] = actionByVerb.get(verb);
  const [, , wrongAction] = actionByVerb.get(wrongVerb);
  return {
    sentence: `The ${subject} ${verb}.`,
    wrongSentence: `The ${subject} ${wrongVerb}.`,
    chineseMeaning: `${subjectZh}在${verbZh}。`,
    hintText: "Listen for who and what action.",
    theme: "simple actions",
    correctPrompt: `one ${subject} ${actionPrompt}`,
    wrongPrompt: `the same ${subject} ${wrongAction}`
  };
}

function makeColorObjectRaw(colorRow, objectRow, wrongColor) {
  const [color, colorZh] = colorRow;
  const [object, objectZh] = objectRow;
  return {
    sentence: `The ${object} is ${color}.`,
    wrongSentence: `The ${object} is ${wrongColor}.`,
    chineseMeaning: `${objectZh}是${colorZh}的。`,
    hintText: "Listen for the color.",
    theme: "colors",
    correctPrompt: `one ${color} ${object}`,
    wrongPrompt: `the same ${object} but ${wrongColor}`
  };
}

function makeAnimalActionRaw(animalRow, verb, wrongVerb) {
  const [animal, , animalZh] = animalRow;
  const [, verbZh] = animalActionByVerb.get(verb);
  return {
    sentence: `The ${animal} ${verb}.`,
    wrongSentence: `The ${animal} ${wrongVerb}.`,
    chineseMeaning: `${animalZh}在${verbZh}。`,
    hintText: "Listen for the animal action.",
    theme: "animals",
    correctPrompt: `one ${animal} clearly ${verb}`,
    wrongPrompt: `the same ${animal} but it ${wrongVerb}`
  };
}

function makeSubjectHasToyRaw(subjectRow, toyRow, wrongToy) {
  const [subject, subjectZh] = subjectRow;
  const [toyPhrase, toyZh, toyPrompt] = toyRow;
  return {
    sentence: `The ${subject} has ${toyPhrase}.`,
    wrongSentence: `The ${subject} has ${articleFor(wrongToy)} ${wrongToy}.`,
    chineseMeaning: `${subjectZh}有一个${toyZh}。`,
    hintText: "Listen for the toy.",
    theme: "toys",
    correctPrompt: `one ${subject} holding ${toyPrompt}`,
    wrongPrompt: `the same ${subject} holding ${articleFor(wrongToy)} ${wrongToy}`
  };
}

function makeSubjectLikesFoodRaw(subjectRow, foodRow, wrongFood) {
  const [subject, subjectZh] = subjectRow;
  const [food, foodZh] = foodRow;
  return {
    sentence: `The ${subject} likes ${food}.`,
    wrongSentence: `The ${subject} likes ${wrongFood}.`,
    chineseMeaning: `${subjectZh}喜欢${foodZh}。`,
    hintText: "Listen for the food.",
    theme: "food",
    correctPrompt: `one ${subject} smiling at ${food}`,
    wrongPrompt: `the same ${subject} smiling at ${wrongFood}`
  };
}

function makeNumberAnimalRaw(numberRow, animalRow, verb, wrongNumber) {
  const [numberWord, numberZh] = numberRow;
  const [animal, pluralAnimal, animalZh] = animalRow;
  const [, verbZh, pluralVerb] = animalActionByVerb.get(verb);
  return {
    sentence: `${numberWord} ${pluralAnimal} ${pluralVerb}.`,
    wrongSentence: `${wrongNumber} ${pluralAnimal} ${pluralVerb}.`,
    chineseMeaning: `${numberZh}${animalZh}在${verbZh}。`,
    hintText: "Listen for the number.",
    theme: "numbers",
    correctPrompt: `${numberWord.toLowerCase()} ${pluralAnimal} clearly ${pluralVerb}`,
    wrongPrompt: `${wrongNumber} ${pluralAnimal} clearly ${pluralVerb}`
  };
}

const familyMembers = [
  ["father", "爸爸"],
  ["mother", "妈妈"],
  ["grandma", "奶奶"],
  ["grandpa", "爷爷"],
  ["sister", "姐姐"],
  ["brother", "哥哥"],
  ["uncle", "叔叔"],
  ["aunt", "阿姨"]
];

function makeFamilyFoodRaw(family, foodRow, wrongFood) {
  const [food, foodZh] = foodRow;
  return {
    sentence: `${sentenceCase(family[0])} eats ${food}.`,
    wrongSentence: `${sentenceCase(family[0])} eats ${wrongFood}.`,
    chineseMeaning: `${family[1]}在吃${foodZh}。`,
    hintText: "Listen for the family member and food.",
    theme: "family",
    correctPrompt: `${family[0]} eating ${food}`,
    wrongPrompt: `${family[0]} eating ${wrongFood}`
  };
}

function buildQuestionPool() {
  const pool = [];

  for (const subjectRow of subjects) {
    const [subject] = subjectRow;
    const allowed = subjectActionMap[subject];
    for (const [index, verb] of allowed.entries()) {
      pool.push(makeSubjectActionRaw(subjectRow, verb, pick(allowed, index + 1)));
    }
  }

  for (const [colorIndex, colorRow] of colors.entries()) {
    for (const objectRow of objects) {
      pool.push(makeColorObjectRaw(colorRow, objectRow, pick(colors, colorIndex + 1)[0]));
    }
  }

  for (const animalRow of animals) {
    const [animal] = animalRow;
    const allowed = animalActionMap[animal];
    for (const [index, verb] of allowed.entries()) {
      pool.push(makeAnimalActionRaw(animalRow, verb, pick(allowed, index + 1)));
    }
  }

  for (const subjectRow of subjects) {
    for (const [toyIndex, toyRow] of toys.entries()) {
      pool.push(makeSubjectHasToyRaw(subjectRow, toyRow, pick(toys, toyIndex + 1)[2]));
    }
  }

  for (const subjectRow of subjects) {
    for (const [foodIndex, foodRow] of foods.entries()) {
      pool.push(makeSubjectLikesFoodRaw(subjectRow, foodRow, pick(foods, foodIndex + 1)[0]));
    }
  }

  for (const [numberIndex, numberRow] of numbers.entries()) {
    for (const animalRow of animals) {
      const [animal] = animalRow;
      const allowed = animalActionMap[animal];
      for (const verb of allowed) {
        pool.push(makeNumberAnimalRaw(numberRow, animalRow, verb, pick(numbers, numberIndex + 1)[2]));
      }
    }
  }

  for (const family of familyMembers) {
    for (const [foodIndex, foodRow] of foods.entries()) {
      pool.push(makeFamilyFoodRaw(family, foodRow, pick(foods, foodIndex + 1)[0]));
    }
  }

  return pool;
}

function hashText(text) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function groupQuestionPool(pool) {
  const grouped = new Map();

  for (const raw of pool) {
    if (!grouped.has(raw.theme)) grouped.set(raw.theme, []);
    grouped.get(raw.theme).push(raw);
  }

  for (const questions of grouped.values()) {
    questions.sort((left, right) => hashText(left.sentence) - hashText(right.sentence));
  }

  return grouped;
}

function buildLevels() {
  const usedSentences = new Set();
  const questionPool = buildQuestionPool();
  const groupedPool = groupQuestionPool(questionPool);

  return levelPlans.map((plan, planIndex) => {
    const level = planIndex + 2;
    const [title, learningFocus, reviewFocus, newWords, questionThemes] = plan;
    const questions = [];

    while (questions.length < 15) {
      const questionNumber = questions.length + 1;
      const theme = pick(questionThemes, questionNumber - 1);
      const themedPool = groupedPool.get(theme) ?? questionPool;
      let raw = themedPool.find((candidate) => !usedSentences.has(candidate.sentence.toLowerCase()));
      if (!raw) {
        raw = questionPool.find((candidate) => !usedSentences.has(candidate.sentence.toLowerCase()));
      }
      if (!raw) {
        throw new Error("Not enough unique curriculum questions in the Stage 1 pool.");
      }

      usedSentences.add(raw.sentence.toLowerCase());
      questions.push(makeQuestion(level, questionNumber, raw));
    }

    return {
      level,
      title: `Level ${level} - ${title}`,
      learningFocus,
      reviewFocus,
      cycleRole: ["B Reinforcement", "C Mixed Practice", "D Scene Practice", "E Challenge Review", "A New Knowledge"][
        (level - 2) % 5
      ],
      newWords: newWords.slice(0, 3),
      questions
    };
  });
}

const levels = buildLevels();
const file = `// Generated by scripts/generate-course-levels.mjs. Do not edit by hand.\n\nexport const courseLevels = ${JSON.stringify(levels, null, 2)};\n`;

await mkdir(new URL("../src/course/", import.meta.url), { recursive: true });
await writeFile(outputPath, file);

console.log(`Generated ${levels.length} levels and ${levels.length * 15} questions.`);
