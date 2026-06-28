const EMPTY_PROMPT = {
  visible: false,
  sentence: "",
  status: "idle",
  isRecording: false,
  recordingUrl: null
};

export function createFollowReadState(options = {}) {
  return {
    enabled: Boolean(options.enabled),
    ...EMPTY_PROMPT
  };
}

export function setFollowReadEnabled(state, enabled) {
  return {
    ...createFollowReadState({ enabled })
  };
}

export function prepareFollowReadPrompt(state, sentence) {
  if (!state.enabled) return clearFollowReadPrompt(state);

  return {
    ...state,
    visible: true,
    sentence,
    status: "ready",
    isRecording: false,
    recordingUrl: null
  };
}

export function startFollowReadRecording(state) {
  if (!state.enabled || !state.visible) return state;

  return {
    ...state,
    status: "recording",
    isRecording: true,
    recordingUrl: null
  };
}

export function finishFollowReadRecording(state, recordingUrl = null) {
  if (!state.enabled || !state.visible) return state;

  return {
    ...state,
    status: recordingUrl ? "recorded" : "ready",
    isRecording: false,
    recordingUrl
  };
}

export function failFollowReadRecording(state) {
  if (!state.enabled || !state.visible) return state;

  return {
    ...state,
    status: "unavailable",
    isRecording: false,
    recordingUrl: null
  };
}

export function clearFollowReadPrompt(state) {
  return {
    ...state,
    ...EMPTY_PROMPT
  };
}

export function shouldPauseAutoAdvance(state) {
  return Boolean(state.enabled && state.visible);
}
