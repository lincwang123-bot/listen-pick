import test from "node:test";
import assert from "node:assert/strict";

import {
  getContentType,
  getNoCacheHeaders,
  resolveRequestPath,
} from "../scripts/serve-no-cache.mjs";

test("local server sends no-cache headers for development reloads", () => {
  const headers = getNoCacheHeaders();

  assert.match(headers["Cache-Control"], /no-store/);
  assert.equal(headers.Pragma, "no-cache");
  assert.equal(headers.Expires, "0");
});

test("local server serves module files with a browser-safe content type", () => {
  assert.equal(getContentType("/demo/app.mjs"), "text/javascript; charset=utf-8");
  assert.equal(getContentType("/demo/styles.css"), "text/css; charset=utf-8");
  assert.equal(getContentType("/demo/index.html"), "text/html; charset=utf-8");
});

test("local server blocks paths outside the project root", () => {
  const root = "/tmp/english-demo";

  assert.equal(resolveRequestPath("/", root), "/tmp/english-demo/index.html");
  assert.equal(resolveRequestPath("/src/app.mjs", root), "/tmp/english-demo/src/app.mjs");
  assert.equal(resolveRequestPath("/../secret.txt", root), null);
});
