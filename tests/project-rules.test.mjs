import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("project agent rules require strict education content alignment", () => {
  assert.ok(existsSync("AGENTS.md"), "AGENTS.md must document project maintenance rules");
  const source = readFileSync("AGENTS.md", "utf8");

  assert.ok(source.includes("儿童启蒙"), "AGENTS.md must name the child education purpose");
  assert.ok(source.includes("图片、音频、中英文"), "AGENTS.md must cover images, audio, Chinese, and English");
  assert.ok(source.includes("必须严谨"), "AGENTS.md must make strictness a hard rule");
  assert.ok(source.includes("不能出错"), "AGENTS.md must state that content errors are unacceptable");
});
