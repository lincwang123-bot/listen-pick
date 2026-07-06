const endpointPath = "/listen-pick/__analytics/visit";
const visitorKey = "listenPickAnonymousVisitorId";
const sessionKey = "listenPickAnalyticsSessionId";
const heartbeatIntervalMs = 60_000;

if (location.protocol === "http:" || location.protocol === "https:") {
  try {
    startAnonymousAnalytics();
  } catch {
    // Analytics must never block the learning experience.
  }
}

function startAnonymousAnalytics() {
  const visitorId = getOrCreateId(visitorKey);
  const sessionId = getOrCreateSessionId();

  sendAnalyticsEvent("pageview", visitorId, sessionId);

  let heartbeatTimer = window.setInterval(() => {
    if (document.visibilityState === "visible") {
      sendAnalyticsEvent("heartbeat", visitorId, sessionId);
    }
  }, heartbeatIntervalMs);

  window.addEventListener("pagehide", () => {
    sendAnalyticsEvent("leave", visitorId, sessionId);
    window.clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      sendAnalyticsEvent("heartbeat", visitorId, sessionId);
    }
  });
}

function getOrCreateId(key) {
  const existing = window.localStorage.getItem(key);
  if (existing && /^[a-f0-9-]{16,64}$/.test(existing)) return existing;

  const id = createRandomId();
  window.localStorage.setItem(key, id);
  return id;
}

function getOrCreateSessionId() {
  const existing = window.sessionStorage.getItem(sessionKey);
  if (existing && /^[a-f0-9-]{16,64}$/.test(existing)) return existing;

  const id = createRandomId();
  window.sessionStorage.setItem(sessionKey, id);
  return id;
}

function createRandomId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();

  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sendAnalyticsEvent(eventName, visitorId, sessionId) {
  const url = new URL(endpointPath, location.origin);
  url.searchParams.set("event", eventName);
  url.searchParams.set("vid", visitorId);
  url.searchParams.set("sid", sessionId);
  url.searchParams.set("path", location.pathname);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url);
    return;
  }

  fetch(url, {
    method: "POST",
    keepalive: true,
    credentials: "omit"
  }).catch(() => {});
}
