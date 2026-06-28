import { mkdirSync, writeFileSync } from "node:fs";

const outputPath = "docs/curriculum-sentences-levels-001-300.md";
const roles = ["A New Input", "B Reinforcement", "C Mixed Review", "D Scene Practice", "E Challenge Review"];

const articleExceptions = new Set(["apple", "orange", "umbrella"]);
const pluralExceptions = new Map([
  ["baby", "babies"],
  ["fish", "fish"],
  ["box", "boxes"],
  ["bus", "buses"]
]);

function article(noun) {
  return articleExceptions.has(noun) || /^[aeiou]/.test(noun) ? "an" : "a";
}

function plural(noun) {
  return pluralExceptions.get(noun) ?? `${noun}s`;
}

function cap(value) {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function unique(items) {
  return [...new Set(items)];
}

function select(pool, count, offset) {
  const source = unique(pool);
  if (source.length < count) {
    throw new Error(`Sentence pool needs ${count} items, got ${source.length}`);
  }
  const output = [];
  let cursor = offset % source.length;
  while (output.length < count) {
    output.push(source[cursor]);
    cursor = (cursor + 1) % source.length;
  }
  return output;
}

function personPool(people, options = {}) {
  const places = options.places ?? ["in the picture", "at school", "in the park"];
  return people.flatMap((person) => [
    `This is ${article(person)} ${person}.`,
    `I see ${article(person)} ${person}.`,
    `${cap(article(person))} ${person} is here.`,
    `The ${person} is here.`,
    `Here is ${article(person)} ${person}.`,
    `Look at the ${person}.`,
    `The ${person} is ${places[0]}.`,
    `I see the ${person} ${places[1]}.`,
    `Here is the ${person} ${places[2]}.`,
    `This ${person} is in the picture.`
  ]);
}

function actionPool(actions, subjects = ["girl", "boy"], places = ["in the park", "at school", "outside"]) {
  return actions.flatMap((action) =>
    subjects.flatMap((subject) => [
      `The ${subject} is ${action}.`,
      `${cap(article(subject))} ${subject} is ${action}.`,
      `The ${subject} is ${action} here.`,
      `The ${subject} is ${action} ${places[0]}.`,
      `The ${subject} is ${action} ${places[1]}.`,
      `The ${subject} is ${action} ${places[2]}.`
    ])
  );
}

function colorPool(colors, objects) {
  return colors.flatMap((color) =>
    objects.flatMap((object) => [
      `The ${object} is ${color}.`,
      `I see ${article(color)} ${color} ${object}.`,
      `This is ${article(color)} ${color} ${object}.`,
      `${cap(article(color))} ${color} ${object} is here.`,
      `Look at the ${color} ${object}.`
    ])
  );
}

function numberPhrase(number, item) {
  return number === "one" ? `${number} ${item}` : `${number} ${plural(item)}`;
}

function numberPool(numbers, items) {
  return numbers.flatMap((number) =>
    items.flatMap((item) => {
      const phrase = numberPhrase(number, item);
      const there = number === "one" ? `There is ${phrase}.` : `There are ${phrase}.`;
      return [
        `${cap(phrase)}.`,
        `I see ${phrase}.`,
        there,
        `${cap(phrase)} is here.`,
        `Look at ${phrase}.`
      ];
    })
  );
}

const animalActions = {
  cat: ["sleeping", "eating", "jumping"],
  dog: ["running", "sleeping", "drinking"],
  bird: ["flying", "eating", "sitting"],
  fish: ["swimming", "eating"],
  rabbit: ["jumping", "eating", "running"],
  duck: ["swimming", "walking"],
  horse: ["running", "walking"],
  cow: ["eating", "walking"]
};

function animalPool(animals) {
  return animals.flatMap((animal) => [
    `This is ${article(animal)} ${animal}.`,
    `I see ${article(animal)} ${animal}.`,
    `${cap(article(animal))} ${animal} is here.`,
    `The ${animal} is here.`,
    ...animalActions[animal].map((action) => `The ${animal} is ${action}.`),
    ...animalActions[animal].map((action) => `I see the ${animal} ${action}.`)
  ]);
}

function familyPool(members) {
  return members.flatMap((member) => [
    `This is my ${member}.`,
    `I see my ${member}.`,
    `Here is my ${member}.`,
    `My ${member} is here.`,
    `Look at my ${member}.`,
    `My ${member} is in the picture.`,
    `This is my ${member} at home.`,
    `I see my ${member} at home.`
  ]);
}

function objectPool(objects, options = {}) {
  const colors = options.colors ?? ["red", "blue", "yellow", "green"];
  const counts = options.counts ?? ["one", "two"];
  return objects.flatMap((object) => [
    `This is ${article(object)} ${object}.`,
    `I see ${article(object)} ${object}.`,
    `${cap(article(object))} ${object} is here.`,
    `Here is ${article(object)} ${object}.`,
    `There is ${article(object)} ${object}.`,
    `Look at the ${object}.`,
    ...colors.slice(0, 2).map((color) => `I see ${article(color)} ${color} ${object}.`),
    ...counts.map((count) => `I see ${numberPhrase(count, object)}.`)
  ]);
}

function positionPool(positions, subjects, places) {
  const sentences = [];
  for (const position of positions) {
    for (const subject of subjects) {
      if (position === "between") {
        sentences.push(`The ${subject} is between the chair and the table.`);
        sentences.push(`I see the ${subject} between the chair and the table.`);
      } else {
        for (const place of places) {
          sentences.push(`The ${subject} is ${position} the ${place}.`);
          sentences.push(`I see the ${subject} ${position} the ${place}.`);
        }
      }
    }
  }
  return sentences;
}

function dailyPool(items) {
  return items.flatMap((item) => {
    const [routine, sentences] = item;
    return sentences.map((sentence) => sentence.replace("__", routine));
  });
}

function weatherPool(weatherWords, extras = []) {
  const places = ["in the park", "at school", "at home"];
  return weatherWords.flatMap((word) => [
    `It is ${word}.`,
    `It is ${word} today.`,
    `The day is ${word}.`,
    `The weather is ${word}.`,
    `It is ${word} ${places[0]}.`,
    `It is ${word} ${places[1]}.`,
    `I see a ${word} day.`,
    ...extras.map((extra) => extra(word))
  ]);
}

function timePool(times) {
  const byTime = {
    morning: [
      "It is morning.",
      "The boy is eating breakfast in the morning.",
      "The girl is brushing her teeth in the morning.",
      "The student is going to school in the morning.",
      "I see the sun in the morning.",
      "The boy is washing his hands in the morning.",
      "The girl is going to school in the morning.",
      "The student is carrying a bag in the morning.",
      "The cat is sleeping in the morning.",
      "The dog is drinking water in the morning.",
      "The bird is flying in the morning.",
      "The book is on the table in the morning.",
      "The bag is on the chair in the morning.",
      "The apple is on the table in the morning.",
      "The ball is in the box in the morning."
    ],
    afternoon: [
      "It is afternoon.",
      "The boy is playing football in the afternoon.",
      "The girl is reading in the afternoon.",
      "The student is writing in the afternoon.",
      "I see the park in the afternoon.",
      "The boy is riding a bike in the afternoon.",
      "The girl is flying a kite in the afternoon.",
      "The student is reading in the afternoon.",
      "The dog is running in the afternoon.",
      "The cat is sleeping in the afternoon.",
      "Three birds are flying in the afternoon.",
      "The ball is under the chair in the afternoon.",
      "The book is in the bag in the afternoon.",
      "The rabbit is jumping in the afternoon.",
      "The duck is swimming in the afternoon."
    ],
    evening: [
      "It is evening.",
      "The boy is reading in the evening.",
      "The girl is sleeping in the evening.",
      "The student is at home in the evening.",
      "I see the moon in the evening.",
      "The boy is washing his hands in the evening.",
      "The girl is reading at home in the evening.",
      "The student is holding a book in the evening.",
      "The cat is sleeping at home in the evening.",
      "The dog is next to the chair in the evening.",
      "The book is on the table in the evening.",
      "The ball is in the box in the evening.",
      "The bag is next to the chair in the evening.",
      "The rabbit is under the table in the evening.",
      "The duck is in the water in the evening."
    ],
    today: [
      "It is sunny today.",
      "The boy is going to school today.",
      "The girl is riding a bike today.",
      "The student is reading today.",
      "I see a red ball today.",
      "It is rainy today.",
      "The boy is drinking water today.",
      "The girl is flying a kite today.",
      "The student is writing today.",
      "The cat is sleeping today.",
      "The dog is running today.",
      "Three birds are flying today.",
      "The book is on the table today.",
      "The ball is under the chair today.",
      "The apple is in the box today."
    ]
  };
  return times.flatMap((time) => byTime[time]);
}

function unit(range, domain, focus, build) {
  return { range, domain, focus, build };
}

const units = [
  unit("Level 1-5", "People", "girl / boy", () => personPool(["girl", "boy"])),
  unit("Level 6-10", "People", "baby / teacher / student / man / woman", () =>
    personPool(["baby", "teacher", "student", "man", "woman"])
  ),
  unit("Level 11-15", "Actions", "run / walk / jump", () =>
    actionPool(["running", "walking", "jumping"], ["girl", "boy"])
  ),
  unit("Level 16-20", "Actions", "dance / read / write", () =>
    actionPool(["dancing", "reading", "writing"], ["girl", "boy"])
  ),
  unit("Level 21-25", "Actions", "eat / drink / sleep / swim", () =>
    actionPool(["eating", "drinking", "sleeping", "swimming"], ["girl", "boy"])
  ),
  unit("Level 26-30", "Colors", "red / blue", () => colorPool(["red", "blue"], ["ball", "car", "bag", "book"])),
  unit("Level 31-35", "Colors", "yellow / green", () =>
    colorPool(["yellow", "green"], ["ball", "car", "bag", "book", "toy"])
  ),
  unit("Level 36-40", "Colors", "black / white", () =>
    colorPool(["black", "white", "red", "blue", "yellow", "green"], ["bag", "cup", "ball", "car"])
  ),
  unit("Level 41-45", "Numbers", "one / two", () => numberPool(["one", "two"], ["apple", "ball", "banana", "cat"])),
  unit("Level 46-50", "Numbers", "three / four", () =>
    numberPool(["three", "four", "one", "two"], ["apple", "ball", "dog", "cat", "book"])
  ),
  unit("Level 51-55", "Numbers", "five", () =>
    numberPool(["five", "one", "two", "three", "four"], ["bird", "banana", "apple", "ball", "duck"])
  ),
  unit("Level 56-60", "Animals", "cat / dog", () => animalPool(["cat", "dog"])),
  unit("Level 61-65", "Animals", "bird / fish", () => animalPool(["bird", "fish", "cat", "dog"])),
  unit("Level 66-70", "Animals", "rabbit / duck / horse / cow", () =>
    animalPool(["rabbit", "duck", "horse", "cow", "cat", "dog"])
  ),
  unit("Level 71-75", "Family", "mother / father", () => familyPool(["mother", "father"])),
  unit("Level 76-80", "Family", "sister / brother", () => familyPool(["sister", "brother", "mother", "father"])),
  unit("Level 81-85", "Family", "grandma / grandpa", () => familyPool(["grandma", "grandpa", "mother", "father"])),
  unit("Level 86-90", "Family", "family review", () =>
    familyPool(["mother", "father", "sister", "brother", "grandma", "grandpa"])
  ),
  unit("Level 91-95", "Objects", "book / bag", () => objectPool(["book", "bag"])),
  unit("Level 96-100", "Objects", "chair / table", () => objectPool(["chair", "table", "book", "bag"])),
  unit("Level 101-105", "Objects", "ball / toy", () => objectPool(["ball", "toy", "car", "kite"])),
  unit("Level 106-110", "Objects", "apple / banana", () => objectPool(["apple", "banana", "cup", "box"])),
  unit("Level 111-115", "Objects", "cup / box", () => objectPool(["cup", "box", "apple", "banana"])),
  unit("Level 116-120", "Objects", "object review", () =>
    objectPool(["book", "bag", "chair", "table", "ball", "toy", "apple", "banana", "cup", "box"])
  ),
  unit("Level 121-125", "Positions", "on", () =>
    positionPool(["on"], ["ball", "book", "bag", "apple"], ["chair", "table", "box"])
  ),
  unit("Level 126-130", "Positions", "in", () =>
    positionPool(["in", "on"], ["apple", "ball", "toy", "book"], ["box", "bag", "cup"])
  ),
  unit("Level 131-135", "Positions", "under", () =>
    positionPool(["under", "on", "in"], ["cat", "dog", "ball", "book"], ["table", "chair", "box"])
  ),
  unit("Level 136-140", "Positions", "behind", () =>
    positionPool(["behind", "under", "on"], ["dog", "cat", "bag", "ball"], ["chair", "table", "box"])
  ),
  unit("Level 141-145", "Positions", "next to", () =>
    positionPool(["next to", "behind", "under"], ["bag", "book", "cat", "dog"], ["chair", "table", "box"])
  ),
  unit("Level 146-150", "Positions", "between", () =>
    positionPool(["between", "next to", "behind", "under"], ["ball", "cat", "dog", "bag", "book"], ["chair", "table"])
  ),
  unit("Level 151-155", "Positions", "animals + positions", () =>
    positionPool(["under", "on", "in"], ["cat", "dog", "rabbit"], ["table", "chair", "box"])
  ),
  unit("Level 156-160", "Positions", "position review", () =>
    positionPool(["on", "in", "under", "behind", "next to", "between"], ["book", "bag", "ball", "cat"], ["table", "chair", "box"])
  ),
  unit("Level 161-165", "Daily Life", "brush teeth / wash hands", () =>
    dailyPool([
      ["brushing his teeth", ["The boy is __.", "The student is __.", "I see the boy __.", "The boy is __ at home.", "The boy is __ in the morning."]],
      ["brushing her teeth", ["The girl is __.", "I see the girl __.", "The girl is __ at home.", "The girl is __ in the morning."]],
      ["washing his hands", ["The boy is __.", "The student is __.", "I see the boy __.", "The boy is __ at home.", "The boy is __ in the morning."]],
      ["washing her hands", ["The girl is __.", "I see the girl __.", "The girl is __ at home.", "The girl is __ in the morning."]]
    ])
  ),
  unit("Level 166-170", "Daily Life", "eat breakfast / drink water", () =>
    dailyPool([
      ["eating breakfast", ["The boy is __.", "The girl is __.", "The student is __.", "I see the boy __.", "I see the girl __.", "The boy is __ in the morning."]],
      ["drinking water", ["The boy is __.", "The girl is __.", "The student is __.", "I see the boy __.", "I see the girl __.", "The girl is __ at home."]],
      ["holding a cup", ["The boy is __.", "The girl is __.", "The student is __.", "I see the student __."]]
    ])
  ),
  unit("Level 171-175", "Daily Life", "go to school / carry a bag", () =>
    dailyPool([
      ["going to school", ["The boy is __.", "The girl is __.", "The student is __.", "I see the boy __.", "I see the girl __.", "The boy is __ in the morning."]],
      ["carrying a bag", ["The boy is __.", "The girl is __.", "The student is __.", "I see the boy __.", "I see the girl __.", "The student is __ at school."]],
      ["walking to school", ["The boy is __.", "The girl is __.", "The student is __.", "I see the student __."]]
    ])
  ),
  unit("Level 176-180", "Daily Life", "read a book / write in a book", () =>
    dailyPool([
      ["reading a book", ["The boy is __.", "The girl is __.", "The student is __.", "I see the boy __.", "I see the girl __.", "The teacher is __."]],
      ["writing in a book", ["The boy is __.", "The girl is __.", "The student is __.", "I see the boy __.", "I see the girl __.", "The student is __ in the classroom."]],
      ["sitting in the classroom", ["The boy is __.", "The girl is __.", "The student is __.", "The teacher is __."]]
    ])
  ),
  unit("Level 181-185", "Daily Life", "ride a bike / play football", () =>
    dailyPool([
      ["riding a bike", ["The boy is __.", "The girl is __.", "I see the boy __.", "I see the girl __.", "The student is __.", "The boy is __ in the park."]],
      ["playing football", ["The boy is __.", "The girl is __.", "I see the boy __.", "I see the girl __.", "The student is __.", "The girl is __ in the park."]],
      ["running in the park", ["The boy is __.", "The girl is __.", "The student is __.", "I see the student __."]]
    ])
  ),
  unit("Level 186-190", "Daily Life", "fly a kite / park play", () =>
    dailyPool([
      ["flying a kite", ["The boy is __.", "The girl is __.", "I see the boy __.", "I see the girl __.", "The student is __.", "The girl is __ on a windy day."]],
      ["playing in the park", ["The boy is __.", "The girl is __.", "The student is __.", "I see the boy __.", "I see the girl __.", "The boy is __ on a sunny day."]],
      ["holding a kite", ["The boy is __.", "The girl is __.", "The student is __.", "I see the student __."]]
    ])
  ),
  unit("Level 191-195", "Daily Life", "play with toys / hold a ball", () =>
    dailyPool([
      ["playing with a toy", ["The boy is __.", "The girl is __.", "The student is __.", "I see the boy __.", "I see the girl __.", "The boy is __ at home."]],
      ["holding a red ball", ["The boy is __.", "The girl is __.", "The student is __.", "I see the boy __.", "I see the girl __."]],
      ["holding a blue bag", ["The boy is __.", "The girl is __.", "The student is __.", "I see the student __.", "The girl is __ at school."]]
    ])
  ),
  unit("Level 196-200", "Daily Life", "look at animals", () =>
    dailyPool([
      ["looking at a rabbit", ["The boy is __.", "The girl is __.", "I see the boy __.", "I see the girl __."]],
      ["looking at a duck", ["The boy is __.", "The girl is __.", "I see the boy __.", "I see the girl __."]],
      ["looking at a dog", ["The boy is __.", "The girl is __.", "The student is __.", "I see the student __."]],
      ["looking at a cat", ["The boy is __.", "The girl is __.", "The student is __.", "I see the student __."]]
    ])
  ),
  unit("Level 201-205", "Daily Life", "buy apples / bananas", () =>
    dailyPool([
      ["buying apples", ["The boy is __.", "The girl is __.", "The student is __.", "I see the boy __.", "I see the girl __.", "The boy is __ in the shop."]],
      ["buying bananas", ["The boy is __.", "The girl is __.", "The student is __.", "I see the boy __.", "I see the girl __.", "The girl is __ in the shop."]],
      ["holding apples", ["The boy is __.", "The girl is __.", "The student is __.", "I see the student __."]]
    ])
  ),
  unit("Level 206-210", "Daily Life", "put / take", () =>
    [
      "The girl is putting a toy in the box.",
      "The boy is putting a toy in the box.",
      "The student is putting a book in the bag.",
      "The girl is putting an apple in the box.",
      "The boy is putting a ball in the bag.",
      "The girl is taking a toy from the box.",
      "The boy is taking a book from the bag.",
      "The student is taking an apple from the box.",
      "I see the toy in the box.",
      "I see the book in the bag.",
      "The ball is in the box.",
      "The apple is in the bag.",
      "The toy is on the table.",
      "The book is on the chair.",
      "The bag is next to the box.",
      "The box is under the table."
    ]
  ),
  unit("Level 211-215", "Daily Life", "home quiet activities", () =>
    dailyPool([
      ["reading at home", ["The boy is __.", "The girl is __.", "The student is __.", "I see the boy __.", "I see the girl __.", "The teacher is __."]],
      ["sleeping in bed", ["The boy is __.", "The girl is __.", "I see the boy __.", "I see the girl __.", "The cat is __."]],
      ["holding a book at home", ["The boy is __.", "The girl is __.", "The student is __.", "I see the student __.", "The girl is __ in the evening."]]
    ])
  ),
  unit("Level 216-220", "Daily Life", "daily routine review", () =>
    dailyPool([
      ["brushing his teeth", ["The boy is __.", "The student is __."]],
      ["washing her hands", ["The girl is __.", "I see the girl __."]],
      ["eating breakfast", ["The boy is __.", "The girl is __."]],
      ["going to school", ["The boy is __.", "The girl is __.", "The student is __."]],
      ["reading a book", ["The boy is __.", "The girl is __."]],
      ["playing football", ["The boy is __.", "The girl is __."]],
      ["sleeping in bed", ["The boy is __.", "The girl is __."]]
    ])
  ),
  unit("Level 221-225", "Weather and Time", "sunny / rainy", () =>
    weatherPool(["sunny", "rainy"], [(word) => (word === "rainy" ? "The girl has an umbrella." : "The boy is in the park.")])
  ),
  unit("Level 226-230", "Weather and Time", "snowy / windy", () =>
    weatherPool(["snowy", "windy", "sunny", "rainy"], [
      (word) => (word === "windy" ? "The girl is flying a kite." : `It is ${word} outside.`)
    ])
  ),
  unit("Level 231-235", "Weather and Time", "morning", () => timePool(["morning"])),
  unit("Level 236-240", "Weather and Time", "afternoon", () => timePool(["afternoon", "morning"])),
  unit("Level 241-245", "Weather and Time", "evening", () => timePool(["evening", "afternoon", "morning"])),
  unit("Level 246-250", "Weather and Time", "today", () => timePool(["today", "morning", "afternoon", "evening"])),
  unit("Level 251-255", "Weather and Time", "weather + time", () => [
    "It is rainy in the morning.",
    "It is sunny in the afternoon.",
    "It is windy in the park.",
    "It is snowy outside.",
    "The boy is reading in the evening.",
    "The girl is riding a bike today.",
    "The student is going to school today.",
    "The girl is flying a kite on a windy day.",
    "The boy has an umbrella on a rainy day.",
    "The girl has a coat on a snowy day.",
    "The boy is playing football on a sunny day.",
    "The dog is under the table today.",
    "The cat is sleeping in the morning.",
    "Three birds are flying in the afternoon.",
    "The book is on the table today.",
    "The ball is in the box today."
  ]),
  unit("Level 256-260", "Weather and Time", "weather objects", () => [
    "The girl has an umbrella today.",
    "The boy has a coat today.",
    "The student has a water cup.",
    "The umbrella is yellow.",
    "The coat is blue.",
    "The cup is red.",
    "I see an umbrella on a rainy day.",
    "I see a coat on a snowy day.",
    "The boy is drinking water on a sunny day.",
    "The girl is under an umbrella.",
    "The umbrella is next to the bag.",
    "The coat is on the chair.",
    "The cup is on the table.",
    "The boy is outside today.",
    "The girl is at school today.",
    "It is windy outside."
  ]),
  unit("Level 261-265", "Mixed Use", "person + action + color object", () => [
    "The boy is holding a red ball.",
    "The girl is holding a blue bag.",
    "The student is holding a yellow book.",
    "The teacher is holding a green book.",
    "The boy is reading a red book.",
    "The girl is writing in a blue book.",
    "The boy is playing with a green toy.",
    "The girl is holding a yellow cup.",
    "The student is carrying a black bag.",
    "The boy is drinking from a white cup.",
    "The girl is eating a red apple.",
    "The boy is eating a yellow banana.",
    "The teacher is next to a blue chair.",
    "The student is next to a green table.",
    "The red ball is under the chair.",
    "The blue bag is on the table."
  ]),
  unit("Level 266-270", "Mixed Use", "number + animal + action", () => [
    "Three birds are flying.",
    "Two cats are sleeping.",
    "Four dogs are running.",
    "Five ducks are swimming.",
    "Three rabbits are jumping.",
    "Two fish are swimming.",
    "One horse is running.",
    "Four cows are eating.",
    "Five birds are sitting.",
    "Two dogs are drinking water.",
    "Three cats are under the table.",
    "Four ducks are in the water.",
    "Five birds are in the tree.",
    "One rabbit is next to the box.",
    "Two fish are in the cup.",
    "Three dogs are in the park."
  ]),
  unit("Level 271-275", "Mixed Use", "positions review", () =>
    positionPool(["on", "in", "under", "behind", "next to", "between"], ["cat", "dog", "ball", "book", "bag"], ["chair", "table", "box"])
  ),
  unit("Level 276-280", "Mixed Use", "action + place", () => [
    "The girl is reading in the park.",
    "The boy is running in the park.",
    "The student is writing in the classroom.",
    "The teacher is reading in the classroom.",
    "The boy is sleeping at home.",
    "The girl is washing her hands at home.",
    "The boy is looking at a dog in the zoo.",
    "The girl is looking at a duck in the zoo.",
    "The student is carrying a bag at school.",
    "The boy is flying a kite in the park.",
    "The girl is riding a bike outside.",
    "The boy is playing football in the park.",
    "The cat is sleeping at home.",
    "The dog is running outside.",
    "The bird is flying in the park.",
    "The rabbit is jumping in the zoo."
  ]),
  unit("Level 281-285", "Mixed Use", "weather + activity", () => [
    "The boy is flying a kite on a windy day.",
    "The girl has an umbrella on a rainy day.",
    "The boy is drinking water on a sunny day.",
    "The girl has a coat on a snowy day.",
    "The dog is running on a sunny day.",
    "The cat is sleeping on a rainy day.",
    "The student is going to school on a rainy day.",
    "The girl is riding a bike on a sunny day.",
    "The boy is reading at home on a rainy day.",
    "The teacher is at school on a windy day.",
    "The bird is flying on a windy day.",
    "The duck is swimming on a rainy day.",
    "The rabbit is under the table on a rainy day.",
    "The ball is in the box on a windy day.",
    "The book is on the table on a rainy day.",
    "The kite is in the sky on a windy day."
  ]),
  unit("Level 286-290", "Mixed Use", "family + objects", () => [
    "My mother has a book.",
    "My father has a cup.",
    "My sister has a red ball.",
    "My brother has a blue bag.",
    "My grandma has an apple.",
    "My grandpa has a banana.",
    "My mother is next to the table.",
    "My father is next to the chair.",
    "My sister is at home.",
    "My brother is at school.",
    "My grandma is in the picture.",
    "My grandpa is in the picture.",
    "I see my mother with a book.",
    "I see my father with a cup.",
    "I see my sister with a toy.",
    "I see my brother with a ball."
  ]),
  unit("Level 291-295", "Mixed Use", "time + daily routine", () => [
    "The boy goes to school in the morning.",
    "The girl eats breakfast in the morning.",
    "The student reads in the afternoon.",
    "The boy plays football in the afternoon.",
    "The girl reads at home in the evening.",
    "The boy sleeps in bed in the evening.",
    "The student carries a bag in the morning.",
    "The girl rides a bike in the afternoon.",
    "The boy drinks water in the afternoon.",
    "The girl brushes her teeth in the morning.",
    "The boy washes his hands in the morning.",
    "The student writes in the classroom in the afternoon.",
    "The cat sleeps at home in the evening.",
    "The dog runs in the park in the afternoon.",
    "The bird flies in the morning.",
    "The rabbit jumps in the park in the afternoon."
  ]),
  unit("Level 296-300", "Mixed Use", "final review", () => [
    "The girl is reading in the park.",
    "The boy is holding a red ball.",
    "Three birds are flying.",
    "The cat is under the chair.",
    "The dog is next to the table.",
    "The apple is in the box.",
    "The blue bag is on the chair.",
    "My mother has a book.",
    "My brother has a yellow toy.",
    "It is rainy today.",
    "The girl has an umbrella today.",
    "The boy is riding a bike in the afternoon.",
    "The student is writing in the classroom.",
    "The duck is swimming in the water.",
    "Five bananas are on the table.",
    "The rabbit is between the chair and the table."
  ])
];

function levelRange(range) {
  const match = range.match(/Level (\d+)-(\d+)/);
  return [Number(match[1]), Number(match[2])];
}

function validateUnits() {
  if (units.length !== 60) {
    throw new Error(`Expected 60 units, got ${units.length}`);
  }
  units.forEach((unitItem, index) => {
    const [start, end] = levelRange(unitItem.range);
    const expectedStart = index * 5 + 1;
    if (start !== expectedStart || end !== expectedStart + 4) {
      throw new Error(`Bad unit range: ${unitItem.range}`);
    }
    const pool = unique(unitItem.build());
    if (pool.length < 15) {
      throw new Error(`${unitItem.range} has only ${pool.length} sentences`);
    }
  });
}

function buildMarkdown() {
  validateUnits();

  const lines = [
    "# Level 1-300 Concrete English Sentences",
    "",
    "> This draft follows `docs/curriculum-map-levels-001-300.md`. It contains English listening sentences only; it does not change app logic, images, or audio.",
    "",
    "## Sentence Design Rules",
    "",
    "- Each level has 15 short, drawable English sentences.",
    "- Each sentence should make a clear picture in a child's mind.",
    "- Distractor images should change only one key meaning point.",
    "- Early levels focus on one core cognition at a time; later levels combine learned blocks.",
    ""
  ];

  for (const [unitIndex, unitItem] of units.entries()) {
    const [start, end] = levelRange(unitItem.range);
    const pool = unique(unitItem.build());
    lines.push(`## Unit ${String(unitIndex + 1).padStart(2, "0")} | ${unitItem.range} | ${unitItem.domain} | ${unitItem.focus}`, "");

    for (let level = start; level <= end; level += 1) {
      const role = roles[level - start];
      const offset = ((level - start) * 11 + unitIndex * 3) % pool.length;
      const sentences = select(pool, 15, offset);
      lines.push(`### Level ${level} | ${role}`, "");
      sentences.forEach((sentence, index) => {
        lines.push(`${index + 1}. ${sentence}`);
      });
      lines.push("");
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

mkdirSync("docs", { recursive: true });
writeFileSync(outputPath, buildMarkdown());
console.log(`Wrote ${outputPath}`);
