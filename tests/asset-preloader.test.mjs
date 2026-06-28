import test from "node:test";
import assert from "node:assert/strict";

import {
  collectQuestionAssets,
  createAssetPreloader,
  versionAssetUrl
} from "../src/asset-preloader.mjs";

const sampleQuestions = [
  {
    audio: "assets/textbook/audio/level-001/q001.m4a",
    audioByVoice: {
      female: "assets/textbook/audio-female/level-001/q001.m4a",
      male: "assets/textbook/audio-male/level-001/q001.m4a"
    },
    choices: [
      {
        image: "assets/textbook/images/level-001/q001-correct.png"
      },
      {
        image: "assets/textbook/images/level-001/q001-wrong.png"
      }
    ]
  },
  {
    audio: "assets/textbook/audio/level-001/q002.m4a",
    choices: [
      {
        image: "assets/textbook/images/level-001/q002-correct.png"
      },
      {
        image: "assets/textbook/images/level-001/q002-wrong.png"
      }
    ]
  }
];

test("versionAssetUrl appends cache version without dropping query strings", () => {
  assert.equal(
    versionAssetUrl("assets/textbook/images/level-001/q001-correct.png", "sheet-v1"),
    "assets/textbook/images/level-001/q001-correct.png?v=sheet-v1"
  );
  assert.equal(
    versionAssetUrl("assets/textbook/images/level-001/q001-correct.png?size=small", "sheet-v1"),
    "assets/textbook/images/level-001/q001-correct.png?size=small&v=sheet-v1"
  );
  assert.equal(
    versionAssetUrl("assets/textbook/images/level-001/q001-correct.png", ""),
    "assets/textbook/images/level-001/q001-correct.png"
  );
});

test("collectQuestionAssets returns versioned image and audio urls", () => {
  assert.deepEqual(collectQuestionAssets(sampleQuestions[0], { assetVersion: "sheet-v1" }), [
    {
      kind: "audio",
      url: "assets/textbook/audio/level-001/q001.m4a?v=sheet-v1"
    },
    {
      kind: "image",
      url: "assets/textbook/images/level-001/q001-correct.png?v=sheet-v1"
    },
    {
      kind: "image",
      url: "assets/textbook/images/level-001/q001-wrong.png?v=sheet-v1"
    }
  ]);
});

test("collectQuestionAssets can preload a selected voice audio url", () => {
  assert.deepEqual(
    collectQuestionAssets(sampleQuestions[0], { assetVersion: "voice-v1", audioVoice: "male" }),
    [
      {
        kind: "audio",
        url: "assets/textbook/audio-male/level-001/q001.m4a?v=voice-v1"
      },
      {
        kind: "image",
        url: "assets/textbook/images/level-001/q001-correct.png?v=voice-v1"
      },
      {
        kind: "image",
        url: "assets/textbook/images/level-001/q001-wrong.png?v=voice-v1"
      }
    ]
  );
});

test("preloader warms a question window once with injected loaders", async () => {
  const calls = [];
  const preloader = createAssetPreloader({
    imageLoader: async (url) => calls.push(["image", url]),
    audioLoader: async (url) => calls.push(["audio", url])
  });

  await preloader.preloadQuestionWindow(sampleQuestions, 0, 2, { assetVersion: "sheet-v1" });
  await preloader.preloadQuestionWindow(sampleQuestions, 0, 2, { assetVersion: "sheet-v1" });

  assert.deepEqual(calls, [
    ["audio", "assets/textbook/audio/level-001/q001.m4a?v=sheet-v1"],
    ["image", "assets/textbook/images/level-001/q001-correct.png?v=sheet-v1"],
    ["image", "assets/textbook/images/level-001/q001-wrong.png?v=sheet-v1"],
    ["audio", "assets/textbook/audio/level-001/q002.m4a?v=sheet-v1"],
    ["image", "assets/textbook/images/level-001/q002-correct.png?v=sheet-v1"],
    ["image", "assets/textbook/images/level-001/q002-wrong.png?v=sheet-v1"]
  ]);
});

test("preloader limits concurrent asset work", async () => {
  let active = 0;
  let maxActive = 0;
  const loader = async () => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise((resolve) => setTimeout(resolve, 5));
    active -= 1;
  };
  const preloader = createAssetPreloader({
    maxConcurrent: 2,
    imageLoader: loader,
    audioLoader: loader
  });

  await preloader.preloadAssets(
    Array.from({ length: 6 }, (_, index) => ({
      kind: "image",
      url: `assets/image-${index}.png`
    }))
  );

  assert.equal(maxActive, 2);
});
