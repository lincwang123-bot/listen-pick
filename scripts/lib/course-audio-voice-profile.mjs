import { COURSE_CONTENT_OVERRIDES } from "./course-content-overrides.mjs";

export const COURSE_AUDIO_VOICE_PROFILES = Object.freeze({
  unified: Object.freeze({
    defaultVoice: "male",
    male: Object.freeze({ engine: "edge-tts", voice: "en-US-AndrewNeural" }),
    female: Object.freeze({ engine: "edge-tts", voice: "en-US-JennyNeural" })
  })
});

export function isDefaultCourseVoice(voice) {
  return voice === COURSE_AUDIO_VOICE_PROFILES.unified.defaultVoice;
}

export function isCourseQualityAudioTarget(question) {
  if (COURSE_CONTENT_OVERRIDES.get(question.id)?.sentence) return true;
  return / is (?:reading an open book|holding (?:an open (?:book|box)|a kite|a closed (?:book|box)|a folded (?:towel|shirt)))\.$/.test(question.sentence);
}
