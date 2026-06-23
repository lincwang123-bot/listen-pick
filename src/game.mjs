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

export const questions = levelQuestions.map((question, questionIndex) => ({
  ...question,
  audio: `assets/audio/q${String(questionIndex + 1).padStart(2, "0")}.m4a`,
  choices: question.choices.map((choice) => ({
    ...choice,
    image: `assets/scenes/${choice.scene}.png`,
    alt: choice.label
  }))
}));

export function createInitialState() {
  return {
    currentIndex: 0,
    score: 0,
    answers: [],
    startedAt: Date.now()
  };
}

export function submitAnswer(state, selectedIndex) {
  const question = questions[state.currentIndex];

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
  const question = questions[state.currentIndex];
  const { awardPoint = true } = options;

  if (!question || selectedIndex !== question.correctIndex) {
    return state;
  }

  const nextState = submitAnswer(state, selectedIndex);

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
