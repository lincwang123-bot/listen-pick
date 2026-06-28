import test from "node:test";
import assert from "node:assert/strict";

import {
  clearFollowReadPrompt,
  createFollowReadState,
  finishFollowReadRecording,
  prepareFollowReadPrompt,
  setFollowReadEnabled,
  shouldPauseAutoAdvance,
  startFollowReadRecording
} from "../src/follow-read.mjs";

test("follow-read is off by default and does not pause auto advance", () => {
  const state = createFollowReadState();
  const promptState = prepareFollowReadPrompt(state, "The girl is reading.");

  assert.equal(state.enabled, false);
  assert.equal(promptState.visible, false);
  assert.equal(shouldPauseAutoAdvance(promptState), false);
});

test("enabled follow-read shows an optional prompt after a correct answer", () => {
  const state = setFollowReadEnabled(createFollowReadState(), true);
  const promptState = prepareFollowReadPrompt(state, "The girl is reading.");

  assert.equal(promptState.enabled, true);
  assert.equal(promptState.visible, true);
  assert.equal(promptState.status, "ready");
  assert.equal(promptState.sentence, "The girl is reading.");
  assert.equal(shouldPauseAutoAdvance(promptState), true);
});

test("follow-read recording can be started, finished, and cleared without disabling the option", () => {
  const readyState = prepareFollowReadPrompt(
    setFollowReadEnabled(createFollowReadState(), true),
    "The boy is running."
  );
  const recordingState = startFollowReadRecording(readyState);
  const recordedState = finishFollowReadRecording(recordingState, "blob:recording-url");
  const clearedState = clearFollowReadPrompt(recordedState);

  assert.equal(recordingState.status, "recording");
  assert.equal(recordingState.isRecording, true);
  assert.equal(recordedState.status, "recorded");
  assert.equal(recordedState.recordingUrl, "blob:recording-url");
  assert.equal(clearedState.enabled, true);
  assert.equal(clearedState.visible, false);
  assert.equal(clearedState.recordingUrl, null);
});

test("starting a new follow-read recording clears the previous recording", () => {
  const readyState = prepareFollowReadPrompt(
    setFollowReadEnabled(createFollowReadState(), true),
    "The cat is sleeping."
  );
  const recordedState = finishFollowReadRecording(readyState, "blob:first-recording");
  const recordingAgainState = startFollowReadRecording(recordedState);

  assert.equal(recordingAgainState.status, "recording");
  assert.equal(recordingAgainState.recordingUrl, null);
});
