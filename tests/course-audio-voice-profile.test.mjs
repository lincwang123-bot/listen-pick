import test from "node:test";
import assert from "node:assert/strict";

import { textbookLevels } from "../src/course/textbook-levels-001-300.generated.mjs";
import {
  COURSE_AUDIO_VOICE_PROFILES,
  isDefaultCourseVoice,
  isCourseQualityAudioTarget
} from "../scripts/lib/course-audio-voice-profile.mjs";

test("all levels use the selected Andrew and Jenny voice profiles", () => {
  assert.deepEqual(COURSE_AUDIO_VOICE_PROFILES.unified, {
    defaultVoice: "male",
    male: { engine: "edge-tts", voice: "en-US-AndrewNeural" },
    female: { engine: "edge-tts", voice: "en-US-JennyNeural" }
  });
  assert.equal(isDefaultCourseVoice("male"), true);
  assert.equal(isDefaultCourseVoice("female"), false);
});

test("the quality-audio selector covers every changed Level 1-100 sentence", () => {
  const targets = textbookLevels
    .filter((level) => level.level <= 100)
    .flatMap((level) => level.questions)
    .filter(isCourseQualityAudioTarget);

  assert.equal(targets.length, 72);
  assert.ok(targets.some((question) => question.id === "L024-Q012"));
  assert.ok(targets.some((question) => question.id === "L024-Q014"));
  assert.ok(targets.some((question) => question.id === "L024-Q015"));
});
