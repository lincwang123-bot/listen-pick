import {
  createInitialState,
  getStarCount,
  questions,
  submitAnswer
} from "./game.mjs";

const els = {
  startScreen: document.querySelector("#startScreen"),
  quizScreen: document.querySelector("#quizScreen"),
  resultScreen: document.querySelector("#resultScreen"),
  startBtn: document.querySelector("#startBtn"),
  backBtn: document.querySelector("#backBtn"),
  hintToggleBtn: document.querySelector("#hintToggleBtn"),
  replayBtn: document.querySelector("#replayBtn"),
  choices: document.querySelector("#choices"),
  feedback: document.querySelector("#feedback"),
  nextBtn: document.querySelector("#nextBtn"),
  retryBtn: document.querySelector("#retryBtn"),
  homeBtn: document.querySelector("#homeBtn"),
  questionCounter: document.querySelector("#questionCounter"),
  sentenceText: document.querySelector("#sentenceText"),
  progressBar: document.querySelector("#progressBar"),
  scoreText: document.querySelector("#scoreText"),
  resultTitle: document.querySelector("#resultTitle"),
  resultScore: document.querySelector("#resultScore"),
  resultStars: document.querySelector("#resultStars")
};

let state = createInitialState();
let locked = false;
let currentAudio = null;
let autoAdvanceTimer = null;
let hintsVisible = true;

function showScreen(screen) {
  els.startScreen.classList.toggle("hidden", screen !== "start");
  els.quizScreen.classList.toggle("hidden", screen !== "quiz");
  els.resultScreen.classList.toggle("hidden", screen !== "result");
}

function startLevel() {
  state = createInitialState();
  locked = false;
  clearAutoAdvance();
  showScreen("quiz");
  renderQuestion();
  speakCurrentSentence();
}

function clearAutoAdvance() {
  if (autoAdvanceTimer) {
    window.clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
}

function setHintsVisible(nextVisible) {
  hintsVisible = nextVisible;
  els.quizScreen.classList.toggle("hide-choice-hints", !hintsVisible);
  els.hintToggleBtn.textContent = `英文提示：${hintsVisible ? "开" : "关"}`;
  els.hintToggleBtn.setAttribute("aria-pressed", String(hintsVisible));
}

function renderQuestion() {
  const question = questions[state.currentIndex];
  const progress = (state.currentIndex / questions.length) * 100;

  clearAutoAdvance();
  locked = false;
  els.scoreText.textContent = String(state.score);
  els.progressBar.style.width = `${progress}%`;
  els.questionCounter.textContent = `${state.currentIndex + 1} / ${questions.length}`;
  els.sentenceText.textContent = "Tap the audio button to hear the sentence.";
  els.feedback.className = "feedback quiet";
  els.feedback.textContent = "Tap the audio button to hear the sentence.";
  els.nextBtn.classList.add("hidden");
  els.nextBtn.querySelector("span:first-child").textContent = state.currentIndex === questions.length - 1 ? "Finish" : "Continue";
  setHintsVisible(hintsVisible);

  els.choices.replaceChildren(
    ...question.choices.map((choice, index) => createChoiceCard(choice, index))
  );
}

function createChoiceCard(choice, index) {
  const button = document.createElement("button");
  button.className = "choice-card";
  button.type = "button";
  button.dataset.index = String(index);
  button.setAttribute("aria-label", `选择图片 ${index === 0 ? "A" : "B"}`);
  button.innerHTML = `
    <div class="choice-art visual-${choice.visual}">
      <img class="scene-image" src="${choice.image}" alt="${choice.alt}">
    </div>
    <p class="choice-title">${choice.label}</p>
  `;
  button.addEventListener("click", () => handleChoice(index));
  return button;
}

function handleChoice(selectedIndex) {
  if (locked) return;

  const question = questions[state.currentIndex];
  const wasLastQuestion = state.currentIndex === questions.length - 1;
  const isCorrect = selectedIndex === question.correctIndex;
  const cards = [...els.choices.querySelectorAll(".choice-card")];

  locked = true;
  cards.forEach((card, index) => {
    card.disabled = true;
    if (index === question.correctIndex) card.classList.add("correct");
    if (index === selectedIndex && !isCorrect) card.classList.add("incorrect");
  });

  els.feedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
  els.feedback.textContent = isCorrect
    ? "Great job! You're doing awesome!"
    : `Try again next time. The right picture is: ${question.choices[question.correctIndex].label}`;

  state = submitAnswer(state, selectedIndex);
  els.scoreText.textContent = String(state.score);
  els.progressBar.style.width = `${(state.currentIndex / questions.length) * 100}%`;

  if (isCorrect) {
    els.nextBtn.classList.add("hidden");
    autoAdvanceTimer = window.setTimeout(() => {
      autoAdvanceTimer = null;
      nextQuestion();
    }, 850);
  } else {
    els.nextBtn.classList.remove("hidden");
  }

  if (wasLastQuestion && !isCorrect) {
    els.nextBtn.querySelector("span:first-child").textContent = "Finish";
  }
}

function nextQuestion() {
  clearAutoAdvance();
  if (state.currentIndex >= questions.length) {
    showResult();
    return;
  }

  renderQuestion();
  speakCurrentSentence();
}

function showResult() {
  const stars = getStarCount(state.score);
  const title = stars === 3 ? "太棒了！" : stars === 2 ? "很不错！" : stars === 1 ? "继续加油！" : "再试一次！";

  els.resultTitle.textContent = title;
  els.resultScore.textContent = `答对 ${state.score} / ${questions.length} 题`;
  els.resultStars.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
  showScreen("result");
}

function speak(text) {
  const question = questions[state.currentIndex];
  if (question?.audio) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(question.audio);
    currentAudio.play().catch(() => speakWithBrowserVoice(text));
    return;
  }

  speakWithBrowserVoice(text);
}

function speakWithBrowserVoice(text) {
  if (!("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) {
    els.feedback.className = "feedback quiet";
    els.feedback.textContent = "Audio is unavailable. Please read the sentence and choose the matching picture.";
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.68;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function speakCurrentSentence() {
  const question = questions[state.currentIndex];
  if (question) {
    speak(question.sentence);
  }
}

els.startBtn.addEventListener("click", startLevel);
els.backBtn.addEventListener("click", () => {
  clearAutoAdvance();
  showScreen("start");
});
els.hintToggleBtn.addEventListener("click", () => setHintsVisible(!hintsVisible));
els.replayBtn.addEventListener("click", speakCurrentSentence);
els.nextBtn.addEventListener("click", nextQuestion);
els.retryBtn.addEventListener("click", startLevel);
els.homeBtn.addEventListener("click", () => showScreen("start"));

showScreen("start");
