const DEFAULT_PRELOAD_CONCURRENCY = 4;

export function versionAssetUrl(url, assetVersion = "") {
  if (!url || !assetVersion) return url;

  const hashIndex = url.indexOf("#");
  const baseUrl = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : url.slice(hashIndex);
  const separator = baseUrl.includes("?") ? "&" : "?";

  return `${baseUrl}${separator}v=${encodeURIComponent(assetVersion)}${hash}`;
}

export function collectQuestionAssets(question, options = {}) {
  const { assetVersion = "", audioVoice = "" } = options;
  const assets = [];

  const audioUrl = getQuestionAudioUrl(question, audioVoice);
  if (audioUrl) {
    assets.push({
      kind: "audio",
      url: versionAssetUrl(audioUrl, assetVersion)
    });
  }

  for (const choice of question?.choices ?? []) {
    if (choice?.image) {
      assets.push({
        kind: "image",
        url: versionAssetUrl(choice.image, assetVersion)
      });
    }
  }

  return assets;
}

export function getQuestionAudioUrl(question, audioVoice = "") {
  return question?.audioByVoice?.[audioVoice] ?? question?.audio ?? "";
}

export function defaultImageLoader(url) {
  if (typeof Image === "undefined") {
    return defaultFetchLoader(url);
  }

  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve(url);
    };

    image.decoding = "async";
    image.onload = done;
    image.onerror = done;
    image.src = url;

    if (typeof image.decode === "function") {
      image.decode().then(done).catch(done);
    }
  });
}

export function defaultAudioLoader(url) {
  return defaultFetchLoader(url);
}

function defaultFetchLoader(url) {
  if (typeof fetch !== "function") {
    return Promise.resolve(url);
  }

  return fetch(url, { cache: "force-cache" }).catch(() => null);
}

export function createAssetPreloader(options = {}) {
  const {
    maxConcurrent = DEFAULT_PRELOAD_CONCURRENCY,
    imageLoader = defaultImageLoader,
    audioLoader = defaultAudioLoader
  } = options;
  const concurrency = Math.max(1, Number(maxConcurrent) || DEFAULT_PRELOAD_CONCURRENCY);
  const seenUrls = new Set();
  const queue = [];
  let activeCount = 0;

  function runQueue() {
    while (activeCount < concurrency && queue.length > 0) {
      const { asset, resolve } = queue.shift();
      const loader = asset.kind === "audio" ? audioLoader : imageLoader;
      activeCount += 1;

      Promise.resolve()
        .then(() => loader(asset.url))
        .catch(() => null)
        .finally(() => {
          activeCount -= 1;
          resolve(asset.url);
          runQueue();
        });
    }
  }

  function preload(asset) {
    if (!asset?.url || seenUrls.has(asset.url)) {
      return Promise.resolve(null);
    }

    seenUrls.add(asset.url);
    return new Promise((resolve) => {
      queue.push({ asset, resolve });
      runQueue();
    });
  }

  function preloadAssets(assets) {
    return Promise.all((assets ?? []).map(preload));
  }

  function preloadQuestion(question, preloadOptions = {}) {
    return preloadAssets(collectQuestionAssets(question, preloadOptions));
  }

  function preloadQuestionWindow(questions, startIndex, count, preloadOptions = {}) {
    const safeStart = Math.max(0, Number(startIndex) || 0);
    const safeCount = Math.max(0, Number(count) || 0);
    const selectedQuestions = (questions ?? []).slice(safeStart, safeStart + safeCount);
    const assets = selectedQuestions.flatMap((question) =>
      collectQuestionAssets(question, preloadOptions)
    );

    return preloadAssets(assets);
  }

  return {
    preload,
    preloadAssets,
    preloadQuestion,
    preloadQuestionWindow,
    hasSeen: (url) => seenUrls.has(url)
  };
}
