import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const mapPath = "docs/curriculum-map-levels-001-300.md";

function parseUnits(markdown) {
  return [...markdown.matchAll(/^### Unit (\d+) \| Level (\d+)-(\d+) \| (.+)$/gm)].map((match) => ({
    unit: Number(match[1]),
    start: Number(match[2]),
    end: Number(match[3]),
    domain: match[4],
    blockStart: match.index
  }));
}

test("curriculum map covers Level 1-300 in exact five-level units", () => {
  const units = parseUnits(readFileSync(mapPath, "utf8"));

  assert.equal(units.length, 60);

  units.forEach((unit, index) => {
    const expectedStart = index * 5 + 1;
    assert.equal(unit.unit, index + 1);
    assert.equal(unit.start, expectedStart);
    assert.equal(unit.end, expectedStart + 4);
  });
});

test("each curriculum map unit declares goal, vocabulary, patterns, new knowledge, review, and image contrast", () => {
  const markdown = readFileSync(mapPath, "utf8");
  const unitBlocks = markdown.split(/^### Unit /m).slice(1);

  for (const block of unitBlocks) {
    assert.match(block, /- 学习目标：.+/);
    assert.match(block, /- 核心词汇：.+/);
    assert.match(block, /- 核心句型：.+/);
    assert.match(block, /- 新知识：.+/);
    assert.match(block, /- 复习知识：.+/);
    assert.match(block, /- 画面辨析点：.+/);
  }
});

test("curriculum map avoids staying on one concrete new knowledge point for 20 levels", () => {
  const unitBlocks = readFileSync(mapPath, "utf8").split(/^### Unit /m).slice(1);
  const newKnowledge = unitBlocks.map((block) => block.match(/- 新知识：(.+)/)?.[1].trim());

  for (let index = 0; index <= newKnowledge.length - 4; index += 1) {
    const window = newKnowledge.slice(index, index + 4);
    assert.notEqual(new Set(window).size, 1, `Repeated for 20 levels: ${window[0]}`);
  }
});
