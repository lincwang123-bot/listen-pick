import {
  completeDueWrongReview,
  createQuestionSession,
  createInitialState,
  getActiveQuestion,
  getNextPlayableLevel,
  getPreviewWordsForLevel,
  getQuestionsForLevel,
  getStarCount,
  playableLevels,
  recordWrongAttempt,
  submitCorrectAnswer
} from "./game.mjs?v=stage3-assets-v6";
import { toChineseHint } from "./hints.mjs?v=zh-hints-v5";
import { createLevelPacks, findPackForLevel, getPackStart } from "./level-groups.mjs?v=pack-picker-v1";
import {
  clearFollowReadPrompt,
  createFollowReadState,
  failFollowReadRecording,
  finishFollowReadRecording,
  prepareFollowReadPrompt,
  setFollowReadEnabled as setFollowReadStateEnabled,
  shouldPauseAutoAdvance,
  startFollowReadRecording
} from "./follow-read.mjs?v=follow-read-v1";
import {
  createAssetPreloader,
  getQuestionAudioUrl,
  versionAssetUrl
} from "./asset-preloader.mjs?v=asset-preload-audio-first-v1";

const els = {
  loginScreen: document.querySelector("#loginScreen"),
  profileScreen: document.querySelector("#profileScreen"),
  startScreen: document.querySelector("#startScreen"),
  quizScreen: document.querySelector("#quizScreen"),
  resultScreen: document.querySelector("#resultScreen"),
  wechatLoginBtn: document.querySelector("#wechatLoginBtn"),
  guestLoginBtn: document.querySelector("#guestLoginBtn"),
  childNameForm: document.querySelector("#childNameForm"),
  childNameInput: document.querySelector("#childNameInput"),
  childNameError: document.querySelector("#childNameError"),
  saveChildNameBtn: document.querySelector("#saveChildNameBtn"),
  skipChildNameBtn: document.querySelector("#skipChildNameBtn"),
  levelSelect: document.querySelector("#levelSelect"),
  selectedLevelBadge: document.querySelector("#selectedLevelBadge"),
  startBtn: document.querySelector("#startBtn"),
  playModeButtons: document.querySelectorAll("[data-play-mode]"),
  playModeNote: document.querySelector("#playModeNote"),
  backBtn: document.querySelector("#backBtn"),
  levelPill: document.querySelector("#levelPill"),
  hintToggleBtn: document.querySelector("#hintToggleBtn"),
  chineseHintToggleBtn: document.querySelector("#chineseHintToggleBtn"),
  followReadToggleBtn: document.querySelector("#followReadToggleBtn"),
  voiceSelect: document.querySelector("#voiceSelect"),
  speechRateSelect: document.querySelector("#speechRateSelect"),
  replayBtn: document.querySelector("#replayBtn"),
  choices: document.querySelector("#choices"),
  feedback: document.querySelector("#feedback"),
  followReadPanel: document.querySelector("#followReadPanel"),
  followReadSentence: document.querySelector("#followReadSentence"),
  followReadRecordBtn: document.querySelector("#followReadRecordBtn"),
  followReadPlayBtn: document.querySelector("#followReadPlayBtn"),
  followReadStatus: document.querySelector("#followReadStatus"),
  nextBtn: document.querySelector("#nextBtn"),
  retryBtn: document.querySelector("#retryBtn"),
  homeBtn: document.querySelector("#homeBtn"),
  nextLevelBtn: document.querySelector("#nextLevelBtn"),
  questionCounter: document.querySelector("#questionCounter"),
  sentenceText: document.querySelector("#sentenceText"),
  progressBar: document.querySelector("#progressBar"),
  scoreText: document.querySelector("#scoreText"),
  resultLevelLabel: document.querySelector("#resultLevelLabel"),
  resultTitle: document.querySelector("#resultTitle"),
  resultScore: document.querySelector("#resultScore"),
  resultStars: document.querySelector("#resultStars"),
  previewStrip: document.querySelector("#previewStrip")
};

function bindControl(element, eventName, handler) {
  if (!element) return false;
  element.addEventListener(eventName, handler);
  return true;
}

let selectedLevel = 1;
let selectedPackStart = getPackStart(selectedLevel);
let currentQuestions = getQuestionsForLevel(selectedLevel);
let state = createInitialState(selectedLevel);
let locked = false;
let currentAudio = null;
let autoAdvanceTimer = null;
let autoAdvanceFrame = null;
let retryTimer = null;
let hintsVisible = false;
let chineseHintsVisible = false;
let speechRate = 0.85;
let audioVoice = "male";
let playMode = "learn";
let followReadState = createFollowReadState();
let followReadQuestion = null;
let mediaRecorder = null;
let recordingStream = null;
let recordingChunks = [];
let recordingSessionId = 0;
let recordingPlayback = null;
let missedQuestionIndexes = new Set();
let pendingLevelSelectTimer = null;
const CHILD_NAME_STORAGE_KEY = "listenPickChildName";
const CROSS_LEVEL_WRONG_STORAGE_KEY = "listenPickCrossLevelWrongReviews";
const assetVersion = "stage3-assets-v6";
const resultAudioVersion = "result-praise-v1";
const assetPreloader = createAssetPreloader({ maxConcurrent: 4 });
const PRELOAD_CURRENT_WINDOW_COUNT = 4;
const PRELOAD_NEXT_LEVEL_COUNT = 5;
const PRELOAD_NEXT_LEVEL_START_INDEX = 9;
const CORRECT_AUTO_ADVANCE_FRAME_COUNT = 4;
const QUESTIONS_PER_LEVEL = 15;
const WRONG_REVIEW_OFFSETS = [3, 10, 25];
let childName = loadChildName();

function preloadLevelStart(levelNumber, count = PRELOAD_CURRENT_WINDOW_COUNT) {
  const levelQuestions = getQuestionsForLevel(levelNumber);
  void assetPreloader.preloadQuestionWindow(levelQuestions, 0, count, {
    assetVersion,
    audioVoice
  });
}

function preloadCurrentLevelWindow() {
  void assetPreloader.preloadQuestionWindow(
    currentQuestions,
    state.currentIndex,
    PRELOAD_CURRENT_WINDOW_COUNT,
    { assetVersion, audioVoice }
  );

  if (state.currentIndex >= PRELOAD_NEXT_LEVEL_START_INDEX) {
    preloadNextLevelStart();
  }
}

function preloadNextLevelStart() {
  const nextLevel = getNextPlayableLevel(selectedLevel);
  if (!nextLevel) return;
  preloadLevelStart(nextLevel, PRELOAD_NEXT_LEVEL_COUNT);
}

function showScreen(screen) {
  els.loginScreen?.classList.toggle("hidden", screen !== "login");
  els.profileScreen?.classList.toggle("hidden", screen !== "profile");
  els.startScreen?.classList.toggle("hidden", screen !== "start");
  els.quizScreen?.classList.toggle("hidden", screen !== "quiz");
  els.resultScreen?.classList.toggle("hidden", screen !== "result");
}

function enterAppFromLogin() {
  showProfileSetup();
}

function showProfileSetup() {
  syncChildNameForm();
  showScreen("profile");
  window.requestAnimationFrame(() => els.childNameInput?.focus());
}

function normalizeChildName(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, 12);
}

function loadChildName() {
  try {
    return normalizeChildName(window.localStorage?.getItem(CHILD_NAME_STORAGE_KEY));
  } catch {
    return "";
  }
}

function saveChildName(nextName) {
  childName = normalizeChildName(nextName);
  try {
    if (childName) {
      window.localStorage?.setItem(CHILD_NAME_STORAGE_KEY, childName);
    } else {
      window.localStorage?.removeItem(CHILD_NAME_STORAGE_KEY);
    }
  } catch {
    // Local storage can be unavailable in strict privacy modes; the current session still keeps the name.
  }
}

function getGlobalQuestionIndex(levelNumber, questionIndex) {
  return (Number(levelNumber) - 1) * QUESTIONS_PER_LEVEL + Number(questionIndex);
}

function loadCrossLevelWrongReviews() {
  try {
    const raw = window.localStorage?.getItem(CROSS_LEVEL_WRONG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCrossLevelWrongReviews(reviews) {
  try {
    window.localStorage?.setItem(CROSS_LEVEL_WRONG_STORAGE_KEY, JSON.stringify(reviews ?? []));
  } catch {
    // Review scheduling still works inside the current level if localStorage is blocked.
  }
}

function persistCrossLevelWrongReviews(question, questionIndex) {
  const sourceGlobalIndex = getGlobalQuestionIndex(selectedLevel, questionIndex);
  const levelEndGlobalIndex = getGlobalQuestionIndex(selectedLevel, currentQuestions.length - 1);
  const crossLevelOffsets = WRONG_REVIEW_OFFSETS.filter((offset) =>
    sourceGlobalIndex + offset > levelEndGlobalIndex
  );

  if (crossLevelOffsets.length === 0) return;

  const storedReviews = loadCrossLevelWrongReviews();
  const reviewBaseId = `level-${selectedLevel}-q-${questionIndex}-t-${state.startedAt}`;
  const nextReviews = [
    ...storedReviews,
    ...crossLevelOffsets.map((offset) => ({
      reviewId: `${reviewBaseId}-plus-${offset}`,
      dueGlobalIndex: sourceGlobalIndex + offset,
      sourceLevel: selectedLevel,
      sourceQuestionIndex: questionIndex,
      sentence: question.sentence,
      question: {
        ...question,
        crossReviewId: `${reviewBaseId}-plus-${offset}`,
        sourceLevel: selectedLevel,
        sourceQuestionIndex: questionIndex,
        choices: question.choices?.map((choice) => ({ ...choice }))
      }
    }))
  ];

  saveCrossLevelWrongReviews(nextReviews);
}

function getDueCrossLevelWrongReview() {
  const dueGlobalIndex = getGlobalQuestionIndex(selectedLevel, state.currentIndex);
  return loadCrossLevelWrongReviews()
    .find((review) => review.dueGlobalIndex === dueGlobalIndex) ?? null;
}

function completeCrossLevelWrongReview(reviewId) {
  if (!reviewId) return;

  saveCrossLevelWrongReviews(
    loadCrossLevelWrongReviews().filter((review) => review.reviewId !== reviewId)
  );
}

function getCurrentDisplayQuestion() {
  if (playMode === "learn") return currentQuestions[state.currentIndex];
  return getDueCrossLevelWrongReview()?.question ?? getActiveQuestion(state, currentQuestions);
}

function syncChildNameForm() {
  if (els.childNameInput) els.childNameInput.value = childName;
  if (els.childNameError) els.childNameError.textContent = "";
}

function submitChildName(event) {
  event?.preventDefault();
  const nextName = normalizeChildName(els.childNameInput?.value);

  if (!nextName) {
    if (els.childNameError) els.childNameError.textContent = "请输入小朋友的小名，或者选择先体验。";
    els.childNameInput?.focus();
    return;
  }

  saveChildName(nextName);
  showScreen("start");
}

function skipChildName() {
  saveChildName("");
  showScreen("start");
}

function markPerformance(label, extra = {}) {
  if (!window.__listenPickPerf) window.__listenPickPerf = {};
  const now = window.performance?.now?.() ?? Date.now();
  window.__listenPickPerf[label] = now;
  document.documentElement.dataset[label] = String(Math.round(now));
  Object.assign(window.__listenPickPerf, extra);
  for (const [key, value] of Object.entries(extra)) {
    document.documentElement.dataset[key] = String(value ?? "");
  }
  return now;
}

function getResultFeedback(score, total) {
  const name = childName || "宝贝";
  const scoreVoiceText = `答对${score}题，一共${total}题`;
  const audioFile = getResultPraiseAudio(score);

  if (score === total) {
    return {
      title: `${name}，你太棒啦！`,
      audioFile,
      voiceText: `${name}，你太棒啦！这一关${total}题全部答对，真厉害！`
    };
  }

  if (score >= 13) {
    return {
      title: `${name}，离满分很近啦！`,
      audioFile,
      voiceText: `${name}，很棒！这一关${scoreVoiceText}，已经很接近满分啦！`
    };
  }

  if (score >= 10) {
    return {
      title: `${name}，表现很不错！`,
      audioFile,
      voiceText: `${name}，表现很不错！这一关${scoreVoiceText}，继续听清楚每一句。`
    };
  }

  if (score >= 6) {
    return {
      title: `${name}，继续加油！`,
      audioFile,
      voiceText: `${name}，继续加油！这一关${scoreVoiceText}，我们再练一次会更好。`
    };
  }

  return {
    title: `${name}，再试一次也很棒！`,
    audioFile,
    voiceText: `${name}，没关系，我们慢慢来。再听一遍，再挑战一次。`
  };
}

function getResultPraiseAudio(score) {
  const safeScore = Number.isFinite(score) ? score : 0;
  const clampedScore = Math.max(0, Math.min(15, Math.round(safeScore)));
  return `assets/result-audio/zh-cn/score-${String(clampedScore).padStart(3, "0")}.m4a`;
}

function startLevel() {
  markPerformance("startLevelAt", { firstAudioUrl: "", firstAudioDelayMs: null });
  clearPendingLevelSelect();
  clearFollowReadInteraction();
  currentQuestions = createQuestionSession(selectedLevel, { mode: playMode });
  state = createInitialState(selectedLevel);
  locked = false;
  missedQuestionIndexes = new Set();
  clearAutoAdvance();
  clearRetryTimer();
  showScreen("quiz");
  renderQuestion();
  speakCurrentSentence();
}

function setPlayMode(nextMode) {
  playMode = nextMode === "review" ? "review" : "learn";
  for (const button of els.playModeButtons ?? []) {
    const isActive = button.dataset.playMode === playMode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
  if (els.playModeNote) {
    els.playModeNote.textContent = playMode === "review"
      ? "复习模式：题目顺序随机，左右图片随机。"
      : "学习模式：题目顺序按课程推进，左右图片随机。";
  }
}

function clearAutoAdvance() {
  if (autoAdvanceTimer) {
    window.clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
  if (autoAdvanceFrame) {
    window.cancelAnimationFrame(autoAdvanceFrame);
    autoAdvanceFrame = null;
  }
}

function clearRetryTimer() {
  if (retryTimer) {
    window.clearTimeout(retryTimer);
    retryTimer = null;
  }
}

function clearPendingLevelSelect() {
  if (pendingLevelSelectTimer) {
    window.clearTimeout(pendingLevelSelectTimer);
    pendingLevelSelectTimer = null;
  }
}

function clearFollowReadInteraction() {
  stopRecordingResources();
  followReadQuestion = null;
  followReadState = clearFollowReadPrompt(followReadState);
  renderFollowReadPanel();
}

function setHintsVisible(nextVisible) {
  hintsVisible = nextVisible;
  els.quizScreen?.classList.toggle("hide-choice-hints", !hintsVisible);
  if (els.hintToggleBtn) {
    els.hintToggleBtn.textContent = `英文提示：${hintsVisible ? "开" : "关"}`;
    els.hintToggleBtn.setAttribute("aria-pressed", String(hintsVisible));
  }
}

function setChineseHintsVisible(nextVisible) {
  chineseHintsVisible = nextVisible;
  els.quizScreen?.classList.toggle("hide-chinese-hints", !chineseHintsVisible);
  if (els.chineseHintToggleBtn) {
    els.chineseHintToggleBtn.textContent = `中文提示：${chineseHintsVisible ? "开" : "关"}`;
    els.chineseHintToggleBtn.setAttribute("aria-pressed", String(chineseHintsVisible));
  }
}

function setFollowReadEnabled(nextEnabled) {
  stopRecordingResources();
  followReadQuestion = null;
  followReadState = setFollowReadStateEnabled(followReadState, nextEnabled);
  if (els.followReadToggleBtn) {
    els.followReadToggleBtn.textContent = `跟读：${followReadState.enabled ? "开" : "关"}`;
    els.followReadToggleBtn.setAttribute("aria-pressed", String(followReadState.enabled));
  }
  renderFollowReadPanel();
}

function setSpeechRate(nextRate) {
  const parsedRate = Number(nextRate);
  speechRate = Number.isFinite(parsedRate) ? parsedRate : 0.85;
  if (currentAudio) currentAudio.playbackRate = speechRate;
}

function setAudioVoice(nextVoice) {
  audioVoice = nextVoice === "male" ? "male" : "female";
  stopActiveAudio();
  preloadCurrentLevelWindow();
}

function renderQuestion() {
  const question = getCurrentDisplayQuestion();
  const isReviewQuestion = Boolean(question?.reviewId || question?.crossReviewId);
  const progress = (state.currentIndex / currentQuestions.length) * 100;

  clearAutoAdvance();
  clearRetryTimer();
  clearFollowReadInteraction();
  locked = false;
  if (els.scoreText) els.scoreText.textContent = String(state.score);
  if (els.progressBar) els.progressBar.style.width = `${progress}%`;
  if (els.questionCounter) {
    els.questionCounter.textContent = isReviewQuestion
      ? `复习 ${state.currentIndex + 1} / ${currentQuestions.length}`
      : `${state.currentIndex + 1} / ${currentQuestions.length}`;
  }
  if (els.levelPill) els.levelPill.innerHTML = `<span aria-hidden="true">★</span> Level ${selectedLevel}`;
  if (els.sentenceText) els.sentenceText.textContent = "Tap the audio button to hear the sentence.";
  if (els.feedback) {
    els.feedback.className = "feedback quiet";
    els.feedback.textContent = "Tap the audio button to hear the sentence.";
  }
  els.nextBtn?.classList.add("hidden");
  const nextButtonLabel = els.nextBtn?.querySelector("span:first-child");
  if (nextButtonLabel) {
    nextButtonLabel.textContent = state.currentIndex === currentQuestions.length - 1 ? "Finish" : "Continue";
  }
  setHintsVisible(hintsVisible);
  setChineseHintsVisible(chineseHintsVisible);

  els.choices?.replaceChildren(
    ...(question?.choices ?? []).map((choice, index) => createChoiceCard(choice, index))
  );
  preloadCurrentLevelWindow();
}

function createChoiceCard(choice, index) {
  const button = document.createElement("button");
  const imageUrl = versionAssetUrl(choice.image, assetVersion);
  button.className = "choice-card";
  button.type = "button";
  button.dataset.index = String(index);
  button.setAttribute("aria-label", `选择图片 ${index === 0 ? "A" : "B"}`);
  button.innerHTML = `
    <div class="choice-art visual-${choice.visual}">
      <img class="scene-image" src="${imageUrl}" alt="${choice.alt}" decoding="async" fetchpriority="high" draggable="false">
    </div>
    <div class="choice-copy">
      <p class="choice-title">${choice.label}</p>
      <p class="choice-meaning">${toChineseHint(choice.label)}</p>
    </div>
  `;
  button.addEventListener("click", () => handleChoice(index));
  return button;
}

function handleChoice(selectedIndex) {
  if (locked) return;

  const question = getCurrentDisplayQuestion();
  const isLocalReviewQuestion = Boolean(question?.reviewId);
  const isCrossLevelReviewQuestion = Boolean(question?.crossReviewId);
  const isReviewQuestion = isLocalReviewQuestion || isCrossLevelReviewQuestion;
  if (!question) return;
  const isCorrect = selectedIndex === question.correctIndex;
  const cards = [...(els.choices?.querySelectorAll(".choice-card") ?? [])];

  locked = true;
  cards.forEach((card, index) => {
    card.disabled = true;
    if (index === question.correctIndex) card.classList.add("correct");
    if (index === selectedIndex && !isCorrect) card.classList.add("incorrect");
  });

  if (els.feedback) {
    els.feedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
    els.feedback.textContent = isCorrect
      ? "Great job! You're doing awesome!"
      : "Try again. Listen carefully and choose one more time.";
  }

  if (isCorrect) {
    if (isReviewQuestion) {
      if (isCrossLevelReviewQuestion) {
        completeCrossLevelWrongReview(question.crossReviewId);
      } else {
        state = completeDueWrongReview(state);
      }
      if (els.scoreText) els.scoreText.textContent = String(state.score);
      els.nextBtn?.classList.add("hidden");
      scheduleCorrectAutoAdvance();
    } else {
      const questionIndex = state.currentIndex;
      const completedQuestion = question;
      state = submitCorrectAnswer(state, selectedIndex, {
        awardPoint: !missedQuestionIndexes.has(questionIndex),
        questions: currentQuestions
      });
      if (els.scoreText) els.scoreText.textContent = String(state.score);
      if (els.progressBar) els.progressBar.style.width = `${(state.currentIndex / currentQuestions.length) * 100}%`;
      preloadCurrentLevelWindow();
      followReadQuestion = completedQuestion;
      followReadState = prepareFollowReadPrompt(followReadState, completedQuestion.sentence);
      renderFollowReadPanel();

      if (shouldPauseAutoAdvance(followReadState)) {
        if (els.sentenceText) els.sentenceText.textContent = completedQuestion.sentence;
        els.nextBtn?.classList.remove("hidden");
      } else {
        els.nextBtn?.classList.add("hidden");
        scheduleCorrectAutoAdvance();
      }
    }
  } else {
    if (!isCrossLevelReviewQuestion && (isLocalReviewQuestion || !missedQuestionIndexes.has(state.currentIndex))) {
      state = recordWrongAttempt(state, selectedIndex, { questions: currentQuestions });
      if (!isLocalReviewQuestion) persistCrossLevelWrongReviews(question, state.currentIndex);
    }
    if (!isReviewQuestion) missedQuestionIndexes.add(state.currentIndex);
    els.nextBtn?.classList.add("hidden");
    retryTimer = window.setTimeout(resetCurrentQuestionAttempt, 1500);
  }
}

function scheduleCorrectAutoAdvance() {
  clearAutoAdvance();

  if (typeof window.requestAnimationFrame !== "function") {
    autoAdvanceTimer = window.setTimeout(() => {
      autoAdvanceTimer = null;
      nextQuestion();
    }, 0);
    return;
  }

  let framesRemaining = CORRECT_AUTO_ADVANCE_FRAME_COUNT;
  const tick = () => {
    framesRemaining -= 1;
    if (framesRemaining <= 0) {
      autoAdvanceFrame = null;
      nextQuestion();
      return;
    }
    autoAdvanceFrame = window.requestAnimationFrame(tick);
  };

  autoAdvanceFrame = window.requestAnimationFrame(tick);
}

function resetCurrentQuestionAttempt() {
  retryTimer = null;
  locked = false;
  clearFollowReadInteraction();

  for (const card of els.choices?.querySelectorAll(".choice-card") ?? []) {
    card.disabled = false;
    card.classList.remove("correct", "incorrect");
  }

  if (els.feedback) {
    els.feedback.className = "feedback quiet";
    els.feedback.textContent = "Listen again and choose the matching picture.";
  }
  speakCurrentSentence();
}

function nextQuestion() {
  clearAutoAdvance();
  clearRetryTimer();
  clearFollowReadInteraction();
  if (state.currentIndex >= currentQuestions.length) {
    showResult();
    return;
  }

  renderQuestion();
  speakCurrentSentence();
}

function showResult() {
  const stars = getStarCount(state.score);
  const resultFeedback = getResultFeedback(state.score, currentQuestions.length);
  const nextLevel = getNextPlayableLevel(selectedLevel);

  if (els.resultLevelLabel) els.resultLevelLabel.textContent = `Level ${selectedLevel} 完成`;
  if (els.resultTitle) els.resultTitle.textContent = resultFeedback.title;
  if (els.resultScore) els.resultScore.textContent = `答对 ${state.score} / ${currentQuestions.length} 题`;
  if (els.resultStars) els.resultStars.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
  els.nextLevelBtn?.classList.toggle("hidden", !nextLevel);
  preloadNextLevelStart();
  showScreen("result");
  playResultPraiseAudio(resultFeedback);
}

function speak(text, audioQuestion = currentQuestions[state.currentIndex]) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  const question = audioQuestion;
  const audioUrl = getQuestionAudioUrl(question, audioVoice);
  if (audioUrl) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(versionAssetUrl(audioUrl, assetVersion));
    const audioRequestAt = markPerformance("audioRequestAt", { firstAudioUrl: currentAudio.src });
    currentAudio.playbackRate = speechRate;
    currentAudio.preservesPitch = true;
    currentAudio.webkitPreservesPitch = true;
    currentAudio.addEventListener("canplay", () => {
      markPerformance("audioCanPlayAt");
    }, { once: true });
    currentAudio.addEventListener("playing", () => {
      const audioPlayingAt = markPerformance("audioPlayingAt");
      const firstAudioDelayMs = Math.round(audioPlayingAt - audioRequestAt);
      window.__listenPickPerf.firstAudioDelayMs = firstAudioDelayMs;
      document.documentElement.dataset.firstAudioDelayMs = String(firstAudioDelayMs);
    }, { once: true });
    currentAudio.play()
      .then(() => {
        markPerformance("audioPlayResolvedAt");
      })
      .catch(() => speakWithBrowserVoice(text));
    return;
  }

  speakWithBrowserVoice(text);
}

function playResultPraiseAudio(resultFeedback) {
  stopActiveAudio();

  if (resultFeedback?.audioFile) {
    currentAudio = new Audio(versionAssetUrl(resultFeedback.audioFile, resultAudioVersion));
    currentAudio.playbackRate = 1;
    currentAudio.preservesPitch = true;
    currentAudio.webkitPreservesPitch = true;
    currentAudio.play().catch(() => false);
    return true;
  }

  return false;
}

function speakWithBrowserVoice(text) {
  if (!("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) {
    if (els.feedback) {
      els.feedback.className = "feedback quiet";
      els.feedback.textContent = "Audio is unavailable. Please read the sentence and choose the matching picture.";
    }
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = speechRate;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function speakCurrentSentence() {
  if (followReadState.visible && followReadQuestion) {
    speak(followReadState.sentence, followReadQuestion);
    return;
  }

  const question = getCurrentDisplayQuestion();
  if (question) {
    speak(question.sentence, question);
  }
}

function stopActiveAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function stopRecordingResources() {
  recordingSessionId += 1;

  if (recordingPlayback) {
    recordingPlayback.pause();
    recordingPlayback = null;
  }

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  if (recordingStream) {
    for (const track of recordingStream.getTracks()) track.stop();
  }

  if (followReadState.recordingUrl) {
    URL.revokeObjectURL(followReadState.recordingUrl);
  }

  mediaRecorder = null;
  recordingStream = null;
  recordingChunks = [];
}

function renderFollowReadPanel() {
  if (!els.followReadPanel) return;

  els.followReadPanel.classList.toggle("hidden", !followReadState.visible);
  if (els.followReadSentence) els.followReadSentence.textContent = followReadState.sentence;
  if (els.followReadRecordBtn) {
    els.followReadRecordBtn.textContent = followReadState.isRecording ? "停止录音" : "开始跟读";
    els.followReadRecordBtn.disabled = followReadState.status === "unavailable";
  }
  if (els.followReadPlayBtn) {
    els.followReadPlayBtn.disabled = !followReadState.recordingUrl || followReadState.isRecording;
  }

  const statusText = {
    idle: "",
    ready: "可以读一遍，也可以直接继续。",
    recording: "正在录音...",
    recorded: "跟读完成，可以回放。",
    unavailable: "麦克风暂不可用，可以直接继续。"
  };
  if (els.followReadStatus) els.followReadStatus.textContent = statusText[followReadState.status] ?? "";
}

async function toggleFollowReadRecording() {
  if (followReadState.isRecording) {
    stopFollowReadRecording();
    return;
  }

  await startFollowReadRecordingFlow();
}

async function startFollowReadRecordingFlow() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    followReadState = failFollowReadRecording(followReadState);
    renderFollowReadPanel();
    return;
  }

  stopActiveAudio();
  stopRecordingResources();

  try {
    const sessionId = recordingSessionId + 1;
    recordingSessionId = sessionId;
    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(recordingStream);
    recordingChunks = [];

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) recordingChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      if (sessionId !== recordingSessionId) return;

      const mimeType = mediaRecorder.mimeType || "audio/webm";
      const recordingBlob = new Blob(recordingChunks, { type: mimeType });
      const recordingUrl = URL.createObjectURL(recordingBlob);
      recordingStream?.getTracks().forEach((track) => track.stop());
      recordingStream = null;
      mediaRecorder = null;
      recordingChunks = [];
      followReadState = finishFollowReadRecording(followReadState, recordingUrl);
      renderFollowReadPanel();
    });

    mediaRecorder.start();
    followReadState = startFollowReadRecording(followReadState);
    renderFollowReadPanel();
  } catch {
    recordingStream?.getTracks().forEach((track) => track.stop());
    recordingStream = null;
    mediaRecorder = null;
    recordingChunks = [];
    followReadState = failFollowReadRecording(followReadState);
    renderFollowReadPanel();
  }
}

function stopFollowReadRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}

function playFollowReadRecording() {
  if (!followReadState.recordingUrl) return;

  if (recordingPlayback) {
    recordingPlayback.pause();
    recordingPlayback.currentTime = 0;
  }

  recordingPlayback = new Audio(followReadState.recordingUrl);
  recordingPlayback.play().catch(() => {
    followReadState = failFollowReadRecording(followReadState);
    renderFollowReadPanel();
  });
}

function selectLevel(levelNumber) {
  selectedLevel = Number(levelNumber);
  selectedPackStart = getPackStart(selectedLevel);
  currentQuestions = getQuestionsForLevel(selectedLevel);
  preloadLevelStart(selectedLevel);
}

function selectPack(pack) {
  selectedPackStart = pack.start;
  if (!pack.levels.includes(selectedLevel)) {
    selectedLevel = pack.levels[0];
    currentQuestions = getQuestionsForLevel(selectedLevel);
  }
}

function queueSingleSelection(action) {
  clearPendingLevelSelect();
  pendingLevelSelectTimer = window.setTimeout(() => {
    pendingLevelSelectTimer = null;
    action();
  }, 220);
}

function runDoubleSelection(action) {
  clearPendingLevelSelect();
  action();
}

function renderLevelSelect() {
  const packs = createLevelPacks(playableLevels);
  const selectedPack =
    packs.find((pack) => pack.start === selectedPackStart) ??
    findPackForLevel(packs, selectedLevel);

  if (selectedPack && !selectedPack.levels.includes(selectedLevel)) {
    selectLevel(selectedPack.levels[0]);
  }

  const packGrid = document.createElement("div");
  packGrid.className = "level-pack-grid";
  packGrid.setAttribute("aria-label", "关卡包");
  packGrid.replaceChildren(...packs.map(createPackButton));

  const packPanel = selectedPack ? createPackPanel(selectedPack) : document.createElement("div");
  els.levelSelect?.replaceChildren(packGrid, packPanel);
  if (els.startBtn) els.startBtn.textContent = `开始 Level ${selectedLevel}`;
  if (els.selectedLevelBadge) els.selectedLevelBadge.textContent = `Level ${selectedLevel}`;
  renderPreviewStrip();
}

function createPackButton(pack) {
  const button = document.createElement("button");
  button.className = "level-pack-button";
  button.type = "button";
  button.setAttribute("aria-pressed", String(pack.start === selectedPackStart));
  button.setAttribute("aria-label", `选择 ${pack.label}`);
  button.innerHTML = `
    <span class="level-pack-title">${pack.label}</span>
    <span class="level-pack-meta">${pack.days.length}天 · ${pack.levels.length}关</span>
  `;

  button.addEventListener("click", () => {
    queueSingleSelection(() => {
      selectPack(pack);
      renderLevelSelect();
    });
  });

  button.addEventListener("dblclick", () => {
    runDoubleSelection(() => {
      selectLevel(pack.levels[0]);
      startLevel();
    });
  });

  return button;
}

function createPackPanel(pack) {
  const panel = document.createElement("section");
  panel.className = "level-pack-panel";
  panel.setAttribute("aria-label", `${pack.label} 关卡列表`);

  const heading = document.createElement("div");
  heading.className = "level-pack-panel-head";
  heading.innerHTML = `
    <strong>${pack.label}</strong>
    <span>当前 Level ${selectedLevel}</span>
  `;

  const dayGroups = document.createElement("div");
  dayGroups.className = "day-groups";
  dayGroups.replaceChildren(...pack.days.map(createDayGroup));

  panel.replaceChildren(heading, dayGroups);
  return panel;
}

function createDayGroup(dayGroup) {
  const group = document.createElement("div");
  group.className = "day-group";

  const label = document.createElement("p");
  label.className = "day-label";
  label.textContent = dayGroup.label;

  const levels = document.createElement("div");
  levels.className = "day-levels";
  levels.replaceChildren(...dayGroup.levels.map(createLevelButton));

  group.replaceChildren(label, levels);
  return group;
}

function createLevelButton(levelNumber) {
  const button = document.createElement("button");
  button.className = "day-level-button";
  button.type = "button";
  button.textContent = String(levelNumber);
  button.setAttribute("aria-label", `Level ${levelNumber}`);
  button.setAttribute("aria-pressed", String(levelNumber === selectedLevel));

  button.addEventListener("click", () => {
    queueSingleSelection(() => {
      selectLevel(levelNumber);
      renderLevelSelect();
    });
  });

  button.addEventListener("dblclick", () => {
    runDoubleSelection(() => {
      selectLevel(levelNumber);
      startLevel();
    });
  });

  return button;
}

function renderPreviewStrip() {
  if (!els.previewStrip) return;

  els.previewStrip.replaceChildren(
    ...getPreviewWordsForLevel(selectedLevel).map((word) => {
      const chip = document.createElement("span");
      chip.textContent = word;
      return chip;
    })
  );
}

bindControl(els.wechatLoginBtn, "click", enterAppFromLogin);
bindControl(els.guestLoginBtn, "click", enterAppFromLogin);
bindControl(els.childNameForm, "submit", submitChildName);
bindControl(els.skipChildNameBtn, "click", skipChildName);
bindControl(els.startBtn, "click", startLevel);
for (const button of els.playModeButtons ?? []) {
  bindControl(button, "click", () => setPlayMode(button.dataset.playMode));
}
bindControl(els.backBtn, "click", () => {
  clearAutoAdvance();
  clearRetryTimer();
  clearFollowReadInteraction();
  stopActiveAudio();
  showScreen("start");
});
bindControl(els.hintToggleBtn, "click", () => setHintsVisible(!hintsVisible));
bindControl(els.chineseHintToggleBtn, "click", () => setChineseHintsVisible(!chineseHintsVisible));
bindControl(els.followReadToggleBtn, "click", () => setFollowReadEnabled(!followReadState.enabled));
bindControl(els.voiceSelect, "change", (event) => setAudioVoice(event.target.value));
bindControl(els.speechRateSelect, "change", (event) => setSpeechRate(event.target.value));
bindControl(els.replayBtn, "click", speakCurrentSentence);
bindControl(els.followReadRecordBtn, "click", toggleFollowReadRecording);
bindControl(els.followReadPlayBtn, "click", playFollowReadRecording);
bindControl(els.nextBtn, "click", nextQuestion);
bindControl(els.retryBtn, "click", startLevel);
bindControl(els.homeBtn, "click", () => {
  clearFollowReadInteraction();
  stopActiveAudio();
  showScreen("start");
});
bindControl(els.nextLevelBtn, "click", () => {
  const nextLevel = getNextPlayableLevel(selectedLevel);
  if (!nextLevel) return;

  selectLevel(nextLevel);
  renderLevelSelect();
  startLevel();
});

renderLevelSelect();
setPlayMode(playMode);
preloadLevelStart(selectedLevel);
showScreen("login");
