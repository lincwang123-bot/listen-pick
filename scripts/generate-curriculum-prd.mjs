import { mkdirSync, writeFileSync } from "node:fs";

const outputPath = "docs/curriculum-prd-levels-001-300.md";

const roles = ["A 新知识", "B 强化辨认", "C 新旧混合", "D 场景练习", "E 挑战复习"];

const articleExceptions = new Set(["apple"]);
const pluralMap = new Map([
  ["baby", "babies"],
  ["fish", "fish"],
  ["box", "boxes"]
]);

function article(noun) {
  return articleExceptions.has(noun) || /^[aeiou]/.test(noun) ? "an" : "a";
}

function plural(noun) {
  return pluralMap.get(noun) ?? `${noun}s`;
}

function unique(items) {
  return [...new Set(items)];
}

function rotateTake(items, count, offset) {
  const source = unique(items);
  if (source.length < count) {
    throw new Error(`Need ${count} unique sentences, got ${source.length}`);
  }
  return Array.from({ length: count }, (_, index) => source[(offset + index) % source.length]);
}

function active(items, unitIndex, firstCount, step = 1) {
  return items.slice(0, Math.min(items.length, firstCount + unitIndex * step));
}

function buildPeopleBank(unitIndex) {
  const people = active(["girl", "boy", "baby", "teacher", "student", "man", "woman"], unitIndex, 4);
  return people.flatMap((person) => [
    `This is ${article(person)} ${person}.`,
    `I see ${article(person)} ${person}.`,
    `${capitalize(article(person))} ${person} is here.`,
    `The ${person} is here.`
  ]);
}

function buildActionBank(unitIndex) {
  const subjects = ["girl", "boy", "teacher", "student"];
  const actions = active(
    ["running", "walking", "jumping", "dancing", "reading", "writing", "eating", "drinking", "sleeping", "swimming"],
    unitIndex,
    4
  );
  return actions.flatMap((action) => subjects.map((subject) => `The ${subject} is ${action}.`));
}

function buildColorBank(unitIndex) {
  const colors = active(["red", "blue", "yellow", "green", "black", "white"], unitIndex, 4);
  const carriers = ["ball", "car", "bag", "book", "toy"];
  return colors.flatMap((color) =>
    carriers.flatMap((item) => [
      `I see ${article(color)} ${color} ${item}.`,
      `This is ${article(color)} ${color} ${item}.`,
      `The ${item} is ${color}.`
    ])
  );
}

function numberSentence(number, item, pattern) {
  if (pattern === "fragment") {
    return `${capitalize(number)} ${number === "one" ? item : plural(item)}.`;
  }
  if (pattern === "see") {
    return `I see ${number} ${number === "one" ? item : plural(item)}.`;
  }
  if (number === "one") {
    return `There is one ${item}.`;
  }
  return `There are ${number} ${plural(item)}.`;
}

function buildNumberBank(unitIndex) {
  const numbers = active(["one", "two", "three", "four", "five"], unitIndex, 3);
  const items = ["apple", "ball", "cat", "dog", "bird", "banana"];
  return numbers.flatMap((number) =>
    items.flatMap((item) => [
      numberSentence(number, item, "fragment"),
      numberSentence(number, item, "see"),
      numberSentence(number, item, "there")
    ])
  );
}

function buildAnimalBank(unitIndex) {
  const animals = active(["cat", "dog", "bird", "fish", "rabbit", "duck"], unitIndex, 4);
  const actionByAnimal = new Map([
    ["cat", ["sleeping", "eating"]],
    ["dog", ["running", "sleeping"]],
    ["bird", ["flying", "eating"]],
    ["fish", ["swimming", "eating"]],
    ["rabbit", ["jumping", "eating"]],
    ["duck", ["swimming", "walking"]]
  ]);
  return animals.flatMap((animal) => [
    `This is ${article(animal)} ${animal}.`,
    `I see ${article(animal)} ${animal}.`,
    `The ${animal} is ${actionByAnimal.get(animal)[0]}.`,
    `The ${animal} is ${actionByAnimal.get(animal)[1]}.`
  ]);
}

function buildFamilyBank(unitIndex) {
  const family = active(["mother", "father", "sister", "brother", "grandma", "grandpa"], unitIndex, 4);
  return family.flatMap((person) => [
    `This is my ${person}.`,
    `I see my ${person}.`,
    `Here is my ${person}.`,
    `My ${person} is here.`
  ]);
}

function buildObjectBank(unitIndex) {
  const objects = active(["book", "bag", "chair", "table", "ball", "apple", "banana", "toy", "box", "bed"], unitIndex, 6);
  return objects.flatMap((item) => [
    `This is ${article(item)} ${item}.`,
    `I see ${article(item)} ${item}.`,
    `There is ${article(item)} ${item}.`
  ]);
}

function buildPositionBank(unitIndex) {
  const positions = active(["on", "in", "under", "behind", "next to", "between"], unitIndex, 3);
  const subjects = ["cat", "dog", "rabbit", "ball", "book", "bag"];
  const places = ["table", "chair", "box", "bed"];
  const sentences = [];
  for (const position of positions) {
    for (const subject of subjects) {
      if (position === "between") {
        sentences.push(`The ${subject} is between the chair and the table.`);
      } else {
        for (const place of places) {
          sentences.push(`The ${subject} is ${position} the ${place}.`);
        }
      }
    }
  }
  return sentences;
}

function buildDailyBank(unitIndex) {
  const routines = active(["brushing teeth", "washing hands", "eating breakfast", "going to school", "riding a bike", "playing football"], unitIndex, 5);
  const subjects = ["boy", "girl", "student"];
  return routines.flatMap((routine) =>
    subjects.map((subject) => {
      if (routine === "brushing teeth") {
        return `The ${subject} is brushing ${subject === "girl" ? "her" : "his"} teeth.`;
      }
      if (routine === "washing hands") {
        return `The ${subject} is washing ${subject === "girl" ? "her" : "his"} hands.`;
      }
      return `The ${subject} is ${routine}.`;
    })
  );
}

function buildWeatherBank(unitIndex) {
  const weather = active(["sunny", "rainy", "snowy", "windy", "cloudy", "hot", "cold"], unitIndex, 5);
  return weather.flatMap((word) => [
    `It is ${word}.`,
    `It is ${word} today.`,
    `The day is ${word}.`
  ]);
}

function buildAbilityBank(unitIndex) {
  const abilityPairs = [
    ["bird", "fly", "swim"],
    ["fish", "swim", "jump"],
    ["duck", "swim", "read"],
    ["rabbit", "jump", "fly"],
    ["boy", "run", "fly"],
    ["girl", "read", "fly"]
  ];
  const likeItems = active(["apples", "bananas", "books", "balls", "dogs", "cats"], unitIndex, 4);
  const sentences = [];
  for (const [subject, canDo, cannotDo] of abilityPairs) {
    sentences.push(`The ${subject} can ${canDo}.`);
    sentences.push(`The ${subject} cannot ${cannotDo}.`);
  }
  for (const subject of ["boy", "girl", "student"]) {
    for (const item of likeItems) {
      sentences.push(`The ${subject} likes ${item}.`);
    }
  }
  return sentences;
}

function buildTimeBank(unitIndex) {
  const timeWords = active(["morning", "afternoon", "evening", "today", "yesterday", "tomorrow"], unitIndex, 4);
  const routineByTime = new Map([
    [
      "morning",
      [
        "It is morning.",
        "The boy is eating breakfast in the morning.",
        "The girl is brushing her teeth in the morning.",
        "The student is going to school in the morning."
      ]
    ],
    [
      "afternoon",
      [
        "It is afternoon.",
        "The boy is playing football in the afternoon.",
        "The girl is reading in the afternoon.",
        "The student is writing in the afternoon."
      ]
    ],
    [
      "evening",
      [
        "It is evening.",
        "The boy is reading in the evening.",
        "The girl is sleeping in the evening.",
        "The student is eating dinner in the evening."
      ]
    ],
    [
      "today",
      [
        "It is sunny today.",
        "The boy is going to school today.",
        "The girl is riding a bike today.",
        "The student is reading today."
      ]
    ],
    [
      "yesterday",
      [
        "It was rainy yesterday.",
        "The boy played football yesterday.",
        "The girl read a book yesterday.",
        "The student went to school yesterday."
      ]
    ],
    [
      "tomorrow",
      [
        "It will be sunny tomorrow.",
        "The boy will go to school tomorrow.",
        "The girl will ride a bike tomorrow.",
        "The student will read tomorrow."
      ]
    ]
  ]);
  return timeWords.flatMap((word) => routineByTime.get(word));
}

function buildLogicBank(unitIndex) {
  const becauseSentences = [
    "The dog is wet because it is raining.",
    "The boy is happy because he has a ball.",
    "The girl is happy because she has a book.",
    "The cat is sleeping because it is tired.",
    "The boy drinks water because he is thirsty.",
    "The girl eats breakfast because she is hungry.",
    "The bird can fly because it has wings.",
    "The fish can swim because it is a fish.",
    "The boy wears a coat because it is cold.",
    "The girl uses an umbrella because it is rainy."
  ];
  const ruleSentences = [
    "The boy cannot run in the classroom.",
    "The girl cannot jump on the bed.",
    "The student can read in the classroom.",
    "The student can wash his hands.",
    "The dog cannot read a book.",
    "The cat cannot ride a bike.",
    "The bird can sit on the tree.",
    "The fish cannot walk on the grass."
  ];
  const review = [
    "There are three apples on the table.",
    "The cat is under the chair.",
    "The ball is between the chair and the table.",
    "The boy is brushing his teeth.",
    "It is sunny today.",
    "The girl will read tomorrow.",
    "The boy played football yesterday."
  ];
  return unitIndex < 2 ? [...ruleSentences, ...becauseSentences] : [...becauseSentences, ...ruleSentences, ...review];
}

function capitalize(value) {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

const blocks = [
  {
    units: 5,
    domain: "人物认知",
    vocabulary: "girl, boy, baby, teacher, student, man, woman",
    patterns: "This is ... / I see ...",
    buildBank: buildPeopleBank
  },
  {
    units: 10,
    domain: "动作认知",
    vocabulary: "run, walk, jump, dance, read, write, eat, drink, sleep, swim",
    patterns: "The girl is ...ing. / The boy is ...ing.",
    buildBank: buildActionBank
  },
  {
    units: 5,
    domain: "颜色",
    vocabulary: "red, blue, yellow, green, black, white",
    patterns: "I see a red ball. / The ball is red.",
    buildBank: buildColorBank
  },
  {
    units: 5,
    domain: "数量",
    vocabulary: "one, two, three, four, five",
    patterns: "Three apples. / There are three apples.",
    buildBank: buildNumberBank
  },
  {
    units: 5,
    domain: "动物",
    vocabulary: "cat, dog, bird, fish, rabbit, duck",
    patterns: "This is a cat. / The cat is sleeping.",
    buildBank: buildAnimalBank
  },
  {
    units: 5,
    domain: "家庭成员",
    vocabulary: "mother, father, sister, brother, grandma, grandpa",
    patterns: "This is my mother.",
    buildBank: buildFamilyBank
  },
  {
    units: 5,
    domain: "常见物品",
    vocabulary: "book, bag, chair, table, ball, apple, banana, toy, box, bed",
    patterns: "This is a book. / There is a book.",
    buildBank: buildObjectBank
  },
  {
    units: 5,
    domain: "位置关系",
    vocabulary: "on, in, under, behind, next to, between",
    patterns: "The cat is under the table.",
    buildBank: buildPositionBank
  },
  {
    units: 5,
    domain: "日常生活",
    vocabulary: "brush teeth, wash hands, eat breakfast, go to school, ride a bike, play football",
    patterns: "The boy is brushing his teeth.",
    buildBank: buildDailyBank
  },
  {
    units: 3,
    domain: "天气",
    vocabulary: "sunny, rainy, snowy, windy, cloudy, hot, cold",
    patterns: "It is rainy today.",
    buildBank: buildWeatherBank
  },
  {
    units: 2,
    domain: "能力与喜好",
    vocabulary: "can, cannot, like, likes",
    patterns: "The bird can fly. / The girl likes books.",
    buildBank: buildAbilityBank
  },
  {
    units: 2,
    domain: "时间概念",
    vocabulary: "morning, afternoon, evening, today, yesterday, tomorrow",
    patterns: "It is morning. / The boy played football yesterday.",
    buildBank: buildTimeBank
  },
  {
    units: 3,
    domain: "简单逻辑与综合复习",
    vocabulary: "because, can, cannot, yesterday, tomorrow",
    patterns: "The dog is wet because it is raining.",
    buildBank: buildLogicBank
  }
];

function unitReviewText(unitNumber, domain) {
  if (unitNumber === 1) {
    return "无";
  }
  return unitNumber % 5 === 0 ? "本阶段前四个单元" : domain;
}

function buildMarkdown() {
  const lines = [
    "# Level 1-300 儿童英语听力闯关课程蓝图与英文短句审稿版",
    "",
    "> 版本：课程研发审稿稿。此文件只用于审查课程逻辑与英文短句，不自动改动现有小程序点击逻辑、图片或音频。",
    "",
    "## 总体设计原则",
    "",
    "- 目标儿童：6-10 岁中国儿童，英语零基础至小学阶段。",
    "- 核心训练：听到英语 -> 形成画面 -> 理解含义。",
    "- 一个阶段只学习一个主知识领域，不随机拼接词汇；已经学过的内容可以在复习关中少量回收。",
    "- 人物词会按阶段逐步增加，不限制为 girl / boy；进入动作阶段后，可使用已经学过的人物词做动作主体。",
    "- 动作画面优先使用 be + 动词 ing，因为插图表达的是“正在发生的动作”；非动作阶段按知识目标选择更自然的句型。",
    "- 家庭成员认知阶段统一使用 This is my ...；暂不把家庭成员和动作混合，避免孩子分不清当前学习重点。",
    "- 同一关内不使用少量句子循环填满题目；基础复现要服务于听辨巩固，而不是机械重复。",
    "- 每 5 关为一个学习单元：A 新知识，B 强化辨认，C 新旧混合，D 场景练习，E 挑战复习。",
    "- 图片要求：儿童绘本风、温暖、明亮、低干扰、主体突出、无文字、无水印。",
    "",
    "## 语法开放节奏",
    "",
    "- Level 1-75：This is ..., I see ..., The girl is ..., The boy is ...，以人物和动作为主。",
    "- Level 76-150：增加颜色、数量、动物与 There is / There are。",
    "- Level 151-250：增加家庭、物品、位置、日常生活和天气场景。",
    "- Level 251-300：集中加入 can, cannot, likes, yesterday, tomorrow, because，并做综合复习。",
    "",
    "---"
  ];

  let unitNumber = 1;
  let levelNumber = 1;

  for (const block of blocks) {
    for (let unitIndex = 0; unitIndex < block.units; unitIndex += 1) {
      const startLevel = levelNumber;
      const endLevel = levelNumber + 4;
      const bank = block.buildBank(unitIndex);

      lines.push(
        "",
        `## Unit ${String(unitNumber).padStart(2, "0")} | Level ${startLevel}-${endLevel} | ${block.domain}`,
        "",
        `- 每5关学习目标：围绕「${block.domain}」建立听觉-图像对应，不引入无关新领域。`,
        `- 核心词汇：${block.vocabulary}`,
        `- 核心句型：${block.patterns}`,
        `- 新知识：${block.domain}`,
        `- 复习知识：${unitReviewText(unitNumber, block.domain)}`
      );

      for (let roleIndex = 0; roleIndex < roles.length; roleIndex += 1) {
        const offset = roleIndex === 0 ? 0 : (unitNumber * 7 + roleIndex * 11) % bank.length;
        const sentences = rotateTake(bank, 15, offset);

        lines.push("", `### Level ${levelNumber} | ${roles[roleIndex]}`, "");
        sentences.forEach((sentence, index) => {
          lines.push(`${index + 1}. ${sentence}`);
        });
        levelNumber += 1;
      }

      lines.push("", "---");
      unitNumber += 1;
    }
  }

  if (levelNumber !== 301) {
    throw new Error(`Expected to generate through Level 300, stopped at ${levelNumber - 1}`);
  }

  return `${lines.join("\n")}\n`;
}

mkdirSync("docs", { recursive: true });
writeFileSync(outputPath, buildMarkdown());
console.log(`Wrote ${outputPath}`);
