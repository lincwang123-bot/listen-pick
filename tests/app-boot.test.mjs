import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const appSource = readFileSync("src/app.mjs", "utf8");
const indexSource = readFileSync("index.html", "utf8");

test("app boot binds controls through a null-safe helper", () => {
  assert.match(appSource, /function bindControl\(/);
  assert.doesNotMatch(appSource, /els\.[a-zA-Z0-9]+\.addEventListener\(/);
});

test("optional follow-read panel rendering is null-safe", () => {
  assert.match(appSource, /if \(!els\.followReadPanel\) return;/);
});

test("app warms current and next level assets through the asset preloader", () => {
  assert.match(appSource, /createAssetPreloader/);
  assert.match(appSource, /PRELOAD_CURRENT_WINDOW_COUNT/);
  assert.match(appSource, /preloadCurrentLevelWindow/);
  assert.match(appSource, /preloadNextLevelStart/);
});

test("index points to the preload-aware app module version", () => {
  assert.ok(indexSource.includes('src="src/app.mjs?v=stage3-assets-v5"'));
});

test("app starts from login then asks for a child name before the level picker", () => {
  assert.ok(indexSource.includes('id="loginScreen"'));
  assert.ok(indexSource.includes('id="profileScreen"'));
  assert.ok(indexSource.includes('id="wechatLoginBtn"'));
  assert.ok(indexSource.includes('id="guestLoginBtn"'));
  assert.ok(indexSource.includes('id="childNameInput"'));
  assert.ok(indexSource.includes('id="childNameForm"'));
  assert.ok(appSource.includes('showScreen("login")'));
  assert.ok(appSource.includes('showScreen("profile")'));
  assert.ok(appSource.includes("enterAppFromLogin"));
  assert.ok(appSource.includes("listenPickChildName"));
  assert.ok(appSource.includes("getResultFeedback"));
});

test("result screen uses score-specific Chinese praise and generated praise audio", () => {
  assert.ok(appSource.includes("function getResultFeedback(score, total)"));
  assert.ok(appSource.includes("score === total"));
  assert.ok(appSource.includes("score >= 13"));
  assert.ok(appSource.includes("score >= 10"));
  assert.ok(appSource.includes("score >= 6"));
  assert.ok(appSource.includes("function getResultPraiseAudio(score)"));
  assert.ok(appSource.includes("function playResultPraiseAudio(resultFeedback)"));
  assert.ok(appSource.includes("assets/result-audio/zh-cn/score-"));
  assert.ok(appSource.includes("playResultPraiseAudio(resultFeedback)"));
  assert.doesNotMatch(appSource, /function speakChinese\(/);
  assert.doesNotMatch(appSource, /getChineseVoice/);
  assert.doesNotMatch(appSource, /utterance\.lang = "zh-CN"/);
  assert.doesNotMatch(appSource, /speakChinese\(resultFeedback\.voiceText\);/);
});

test("generated Chinese result praise audio exists for every possible score", () => {
  for (let score = 0; score <= 15; score += 1) {
    const paddedScore = String(score).padStart(3, "0");
    assert.ok(
      existsSync(`assets/result-audio/zh-cn/score-${paddedScore}.m4a`),
      `score-${paddedScore}.m4a exists`
    );
  }
});

test("app points to the refreshed Chinese hint module version", () => {
  assert.ok(appSource.includes("hints.mjs?v=zh-hints-v5"));
});

test("app exposes a selectable voice control for generated audio", () => {
  assert.ok(indexSource.includes('id="voiceSelect"'));
  assert.ok(indexSource.includes('value="female"'));
  assert.ok(indexSource.includes('<option value="male" selected>男声</option>'));
  assert.ok(appSource.includes("getQuestionAudioUrl(question, audioVoice)"));
});

test("sentence audio defaults to male voice and preloads the next prompt after a correct answer", () => {
  assert.ok(appSource.includes('let audioVoice = "male"'));
  assert.ok(appSource.includes("const CORRECT_AUTO_ADVANCE_FRAME_COUNT = 4"));
  assert.ok(appSource.includes("function scheduleCorrectAutoAdvance()"));
  assert.ok(appSource.includes("window.requestAnimationFrame(tick)"));
  assert.match(
    appSource,
    /state = submitCorrectAnswer[\s\S]*?preloadCurrentLevelWindow\(\);[\s\S]*?scheduleCorrectAutoAdvance\(\);/
  );
});

test("app inserts due wrong reviews without advancing the main level progress", () => {
  assert.ok(appSource.includes("getActiveQuestion(state, currentQuestions)"));
  assert.ok(appSource.includes("listenPickCrossLevelWrongReviews"));
  assert.ok(appSource.includes("persistCrossLevelWrongReviews(question, state.currentIndex)"));
  assert.ok(appSource.includes("completeCrossLevelWrongReview(question.crossReviewId)"));
  assert.ok(appSource.includes("recordWrongAttempt(state, selectedIndex"));
  assert.ok(appSource.includes("completeDueWrongReview(state)"));
  assert.ok(appSource.includes("? `复习 ${state.currentIndex + 1} / ${currentQuestions.length}`"));
});

test("sentence audio defaults to standard speed instead of slow speed", () => {
  assert.ok(indexSource.includes('<option value="0.85" selected>标准</option>'));
  assert.ok(indexSource.includes('<option value="0.72">慢速</option>'));
  assert.ok(appSource.includes("let speechRate = 0.85"));
  assert.ok(appSource.includes("Number.isFinite(parsedRate) ? parsedRate : 0.85"));
});

test("start screen exposes learn and review modes without changing preload window size", () => {
  assert.ok(indexSource.includes('data-play-mode="learn"'));
  assert.ok(indexSource.includes('data-play-mode="review"'));
  assert.ok(appSource.includes("createQuestionSession(selectedLevel"));
  assert.ok(appSource.includes("mode: playMode"));
  assert.ok(appSource.includes("questions: currentQuestions"));
  assert.ok(appSource.includes("const PRELOAD_CURRENT_WINDOW_COUNT = 4"));
});

test("follow-read entry is removed from the learning controls", () => {
  assert.doesNotMatch(indexSource, /id="followReadToggleBtn"/);
  assert.doesNotMatch(indexSource, /跟读：关/);
});
