import { courseLevels } from "./course/levels-002-030.generated.mjs";
import { availableTextbookLevels } from "./course/textbook-playable.generated.mjs?v=stage2-v100";
import { textbookLevels } from "./course/textbook-levels-001-100.generated.mjs?v=stage2-v100";

const levelQuestions = [
  {
    sentence: "The girl is reading.",
    correctIndex: 1,
    choices: [
      { label: "A boy is drinking water.", scene: "boy-drinking", visual: "drink" },
      { label: "A girl is reading.", scene: "girl-reading", visual: "read" }
    ]
  },
  {
    sentence: "The boy is eating an apple.",
    correctIndex: 0,
    choices: [
      { label: "A boy is eating an apple.", scene: "boy-apple", visual: "apple" },
      { label: "A dog is sleeping.", scene: "dog-sleeping", visual: "sleep" }
    ]
  },
  {
    sentence: "The cat is under the table.",
    correctIndex: 1,
    choices: [
      { label: "The cat is on the chair.", scene: "cat-chair", visual: "chair" },
      { label: "The cat is under the table.", scene: "cat-table", visual: "table" }
    ]
  },
  {
    sentence: "The baby is sleeping.",
    correctIndex: 0,
    choices: [
      { label: "The baby is sleeping.", scene: "baby-sleeping", visual: "moon" },
      { label: "The baby is laughing.", scene: "baby-laughing", visual: "laugh" }
    ]
  },
  {
    sentence: "The teacher is writing.",
    correctIndex: 1,
    choices: [
      { label: "The teacher is singing.", scene: "teacher-singing", visual: "sing" },
      { label: "The teacher is writing.", scene: "teacher-writing", visual: "write" }
    ]
  },
  {
    sentence: "The dog is running.",
    correctIndex: 0,
    choices: [
      { label: "The dog is running.", scene: "dog-running", visual: "run" },
      { label: "The dog is sitting.", scene: "dog-sitting", visual: "sit" }
    ]
  },
  {
    sentence: "The girl is brushing her teeth.",
    correctIndex: 1,
    choices: [
      { label: "The girl is washing her hands.", scene: "girl-washing", visual: "wash" },
      { label: "The girl is brushing her teeth.", scene: "girl-brushing", visual: "brush" }
    ]
  },
  {
    sentence: "The boy is kicking a ball.",
    correctIndex: 0,
    choices: [
      { label: "The boy is kicking a ball.", scene: "boy-kicking", visual: "ball" },
      { label: "The boy is flying a kite.", scene: "boy-kite", visual: "kite" }
    ]
  },
  {
    sentence: "The bird is in the tree.",
    correctIndex: 1,
    choices: [
      { label: "The bird is in the sky.", scene: "bird-sky", visual: "sky" },
      { label: "The bird is in the tree.", scene: "bird-tree", visual: "tree" }
    ]
  },
  {
    sentence: "The mother is cooking.",
    correctIndex: 0,
    choices: [
      { label: "The mother is cooking.", scene: "mother-cooking", visual: "cook" },
      { label: "The mother is shopping.", scene: "mother-shopping", visual: "shop" }
    ]
  },
  {
    sentence: "The children are dancing.",
    correctIndex: 1,
    choices: [
      { label: "The children are drawing.", scene: "children-drawing", visual: "draw" },
      { label: "The children are dancing.", scene: "children-dancing", visual: "dance" }
    ]
  },
  {
    sentence: "The duck is swimming.",
    correctIndex: 0,
    choices: [
      { label: "The duck is swimming.", scene: "duck-swimming", visual: "swim" },
      { label: "The duck is jumping.", scene: "duck-jumping", visual: "jump" }
    ]
  },
  {
    sentence: "The boy is opening the door.",
    correctIndex: 1,
    choices: [
      { label: "The boy is closing the window.", scene: "boy-window", visual: "window" },
      { label: "The boy is opening the door.", scene: "boy-door", visual: "door" }
    ]
  },
  {
    sentence: "The girl is wearing a red hat.",
    correctIndex: 0,
    choices: [
      { label: "The girl is wearing a red hat.", scene: "girl-hat", visual: "hat" },
      { label: "The girl is wearing blue shoes.", scene: "girl-shoes", visual: "shoes" }
    ]
  },
  {
    sentence: "The family is having dinner.",
    correctIndex: 1,
    choices: [
      { label: "The family is watching TV.", scene: "family-tv", visual: "tv" },
      { label: "The family is having dinner.", scene: "family-dinner", visual: "dinner" }
    ]
  }
];

function normalizeLevelOneQuestion(question, questionIndex) {
  const audio = `assets/audio/q${String(questionIndex + 1).padStart(2, "0")}.m4a`;
  return {
  ...question,
  audio,
  audioByVoice: createVoiceAudioPaths(audio),
  choices: question.choices.map((choice) => ({
    ...choice,
    image: `assets/scenes/${choice.scene}.png`,
    alt: choice.label
  }))
  };
}

function normalizeCourseQuestion(question, questionIndex) {
  const correctIndex = questionIndex % 2;
  const choices = [
    {
      label: question.sentence,
      image: toOptimizedImagePath(question.correctImage),
      alt: question.sentence,
      visual: question.theme
    },
    {
      label: question.wrongSentence,
      image: toOptimizedImagePath(question.wrongImage),
      alt: question.wrongSentence,
      visual: question.theme
    }
  ];

  if (correctIndex === 1) choices.reverse();

  return {
    sentence: question.sentence,
    correctIndex,
    audio: question.audioFile,
    audioByVoice: createVoiceAudioPaths(question.audioFile),
    choices
  };
}

function normalizeTextbookQuestion(question, questionIndex) {
  const correctIndex = questionIndex % 2;
  const choices = [
    {
      label: question.sentence,
      image: toOptimizedImagePath(question.correctImage),
      alt: question.sentence,
      visual: "textbook"
    },
    {
      label: question.wrongSentence,
      image: toOptimizedImagePath(question.wrongImage),
      alt: question.wrongSentence,
      visual: "textbook"
    }
  ];

  if (correctIndex === 1) choices.reverse();

  return {
    sentence: question.sentence,
    correctIndex,
    audio: question.audioFile,
    audioByVoice: createVoiceAudioPaths(question.audioFile),
    choices
  };
}

function createVoiceAudioPaths(audioPath) {
  return {
    female: toVoiceAudioPath(audioPath, "female"),
    male: toVoiceAudioPath(audioPath, "male")
  };
}

function toOptimizedImagePath(imagePath) {
  if (
    imagePath.startsWith("assets/textbook/images/") ||
    imagePath.startsWith("assets/course/images/")
  ) {
    return imagePath.replace(/\.png$/i, ".webp");
  }

  return imagePath;
}

function toVoiceAudioPath(audioPath, voice) {
  if (audioPath.startsWith("assets/textbook/audio/")) {
    return audioPath.replace("assets/textbook/audio/", `assets/textbook/audio-${voice}/`);
  }

  if (audioPath.startsWith("assets/course/audio/")) {
    return audioPath.replace("assets/course/audio/", `assets/course/audio-${voice}/`);
  }

  if (audioPath.startsWith("assets/audio/")) {
    return audioPath.replace("assets/audio/", `assets/audio-${voice}/`);
  }

  return audioPath;
}

const levelOne = {
  level: 1,
  title: "Level 1",
  questions: levelQuestions.map(normalizeLevelOneQuestion)
};

const generatedPlayableLevels = courseLevels.slice(0, 4).map((level) => ({
  level: level.level,
  title: level.title,
  questions: level.questions.map(normalizeCourseQuestion)
}));

const textbookPlayableLevels = availableTextbookLevels.map((level) => ({
  level: level.level,
  title: level.title,
  questions: level.questions.map(normalizeTextbookQuestion)
}));

function mergePlayableLevels(primaryLevels, fallbackLevels) {
  const merged = new Map();
  for (const level of fallbackLevels) merged.set(level.level, level);
  for (const level of primaryLevels) merged.set(level.level, level);
  return [...merged.values()].sort((a, b) => a.level - b.level);
}

export const playableLevels = mergePlayableLevels(textbookPlayableLevels, [
  levelOne,
  ...generatedPlayableLevels
]);
export const questions = playableLevels[0].questions;

const levelPreviewWords = new Map([
  [1, ["girl", "boy", "baby"]],
  [2, ["teacher", "student", "school"]],
  [3, ["running", "walking", "jumping"]],
  [4, ["reading", "writing", "drawing"]],
  [5, ["eating", "drinking", "washing"]],
  [6, ["red", "blue", "yellow"]],
  [7, ["green", "black", "white"]],
  [8, ["circle", "square", "star"]],
  [9, ["ball", "car", "kite"]],
  [10, ["colors", "shapes", "toys"]],
  [11, ["one", "two", "three"]],
  [12, ["four", "five", "apples"]],
  [13, ["books", "cups", "boxes"]],
  [14, ["dogs", "cats", "birds"]],
  [15, ["counting", "animals", "objects"]],
  [16, ["cat", "dog", "rabbit"]],
  [17, ["bird", "fish", "duck"]],
  [18, ["horse", "cow", "sheep"]],
  [19, ["lion", "elephant", "panda"]],
  [20, ["animals", "colors", "numbers"]],
  [21, ["mother", "father", "parents"]],
  [22, ["sister", "brother", "baby"]],
  [23, ["grandma", "grandpa", "family"]],
  [24, ["home", "parents", "children"]],
  [25, ["family", "photo", "home"]],
  [26, ["on", "in", "under"]],
  [27, ["behind", "beside", "between"]],
  [28, ["rooms", "furniture", "home"]],
  [29, ["park", "tree", "basket"]],
  [30, ["position", "colors", "objects"]],
  [31, ["pencil", "ruler", "eraser"]],
  [32, ["teacher", "student", "board"]],
  [33, ["wake", "breakfast", "school"]],
  [34, ["wash", "brush", "dress"]],
  [35, ["classroom", "lunch", "home"]],
  [36, ["apple", "banana", "grapes"]],
  [37, ["rice", "noodles", "milk"]],
  [38, ["eating", "drinking", "chopsticks"]],
  [39, ["plate", "bowl", "cup"]],
  [40, ["food", "family", "lunch"]],
  [41, ["eyes", "ears", "hands"]],
  [42, ["shirt", "trousers", "shoes"]],
  [43, ["dress", "coat", "boots"]],
  [44, ["sunny", "rainy", "snowy"]],
  [45, ["umbrella", "raincoat", "snow"]],
  [46, ["slide", "swing", "sandbox"]],
  [47, ["football", "basketball", "swimming"]],
  [48, ["car", "bus", "train"]],
  [49, ["library", "park", "zoo"]],
  [50, ["apples", "bicycle", "bus"]]
]);

for (const level of textbookLevels) {
  if (Array.isArray(level.previewWords) && level.previewWords.length === 3) {
    levelPreviewWords.set(level.level, level.previewWords);
  }
}

export function getQuestionsForLevel(levelNumber = 1) {
  return (
    playableLevels.find((level) => level.level === Number(levelNumber)) ??
    levelOne
  ).questions;
}

function toSafeRandom(rng) {
  const value = typeof rng === "function" ? Number(rng()) : Math.random();
  if (!Number.isFinite(value)) return 0;
  return Math.min(0.999999, Math.max(0, value));
}

function shuffleItems(items, rng) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(toSafeRandom(rng) * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function cloneChoice(choice) {
  return { ...(choice ?? {}) };
}

function getCorrectChoice(question) {
  return cloneChoice(question.correctChoice ?? question.choices?.[question.correctIndex]);
}

function getDistractorChoices(question) {
  if (Array.isArray(question.distractorChoices) && question.distractorChoices.length > 0) {
    return question.distractorChoices.map(cloneChoice);
  }

  return (question.choices ?? [])
    .filter((choice, index) => index !== question.correctIndex && choice)
    .map(cloneChoice);
}

function pickDistractor(question, rng) {
  const distractors = getDistractorChoices(question);
  if (distractors.length <= 1) return distractors[0];
  return distractors[Math.floor(toSafeRandom(rng) * distractors.length)];
}

function createSessionQuestion(question, rng) {
  const correctChoice = getCorrectChoice(question);
  const distractorChoice = pickDistractorChoice(question, rng);
  const correctFirst = toSafeRandom(rng) < 0.5;
  const choices = correctFirst
    ? [correctChoice, distractorChoice]
    : [distractorChoice, correctChoice];

  return {
    ...question,
    correctChoice,
    distractorChoices: getDistractorChoices(question),
    choices,
    correctIndex: correctFirst ? 0 : 1
  };
}

function pickDistractorChoice(question, rng) {
  return pickDistractor(question, rng) ?? cloneChoice(question.choices?.[question.correctIndex === 0 ? 1 : 0]);
}

export function createQuestionSessionFromQuestions(levelQuestions, options = {}) {
  const { mode = "learn", rng = Math.random } = options;
  const orderedQuestions = mode === "review"
    ? shuffleItems(levelQuestions ?? [], rng)
    : [...(levelQuestions ?? [])];

  return orderedQuestions.map((question) => createSessionQuestion(question, rng));
}

export function createQuestionSession(levelNumber = 1, options = {}) {
  return createQuestionSessionFromQuestions(getQuestionsForLevel(levelNumber), options);
}

export function getPreviewWordsForLevel(levelNumber = 1) {
  return levelPreviewWords.get(Number(levelNumber)) ?? levelPreviewWords.get(1);
}

export function getNextPlayableLevel(levelNumber = 1) {
  const currentIndex = playableLevels.findIndex((level) => level.level === Number(levelNumber));
  return currentIndex === -1 ? null : playableLevels[currentIndex + 1]?.level ?? null;
}

export function createInitialState(level = 1) {
  return {
    level,
    currentIndex: 0,
    score: 0,
    answers: [],
    startedAt: Date.now()
  };
}

export function submitAnswer(state, selectedIndex, options = {}) {
  const levelQuestions = options.questions ?? getQuestionsForLevel(state.level);
  const question = levelQuestions[state.currentIndex];

  if (!question) {
    return state;
  }

  const isCorrect = selectedIndex === question.correctIndex;

  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    score: state.score + (isCorrect ? 1 : 0),
    answers: [
      ...state.answers,
      {
        questionIndex: state.currentIndex,
        selectedIndex,
        correctIndex: question.correctIndex,
        isCorrect
      }
    ]
  };
}

export function submitCorrectAnswer(state, selectedIndex, options = {}) {
  const levelQuestions = options.questions ?? getQuestionsForLevel(state.level);
  const question = levelQuestions[state.currentIndex];
  const { awardPoint = true } = options;

  if (!question || selectedIndex !== question.correctIndex) {
    return state;
  }

  const nextState = submitAnswer(state, selectedIndex, { questions: levelQuestions });

  if (awardPoint) {
    return nextState;
  }

  return {
    ...nextState,
    score: state.score
  };
}

export function getStarCount(score) {
  if (score >= 13) return 3;
  if (score >= 10) return 2;
  if (score >= 6) return 1;
  return 0;
}
