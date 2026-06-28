import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const curriculumPath = "docs/curriculum-prd-levels-001-300.md";
const bannedTerms = [
  "office",
  "meeting",
  "manager",
  "salary",
  "investment",
  "business",
  "bank",
  "loan",
  "stock market",
  "online shopping",
  "airport security",
  "passport",
  "hotel reception",
  "dream",
  "success",
  "freedom",
  "culture",
  "history",
  "future",
  "friendship",
  "opinion",
  "idea",
  "knowledge",
  "anxious",
  "embarrassed",
  "jealous",
  "regretful",
  "depressed"
];

function parseLevels(markdown) {
  return markdown
    .split(/^### Level /m)
    .slice(1)
    .map((block) => {
      const level = Number(block.match(/^(\d+)/)?.[1]);
      const sentences = [...block.matchAll(/^\d+\.\s+(.+)$/gm)].map((match) => match[1].trim());
      return { level, sentences };
    });
}

test("curriculum review draft has 300 levels with 15 sentences each", () => {
  const levels = parseLevels(readFileSync(curriculumPath, "utf8"));

  assert.equal(levels.length, 300);
  assert.deepEqual(
    levels.map((item) => item.level),
    Array.from({ length: 300 }, (_, index) => index + 1)
  );

  for (const level of levels) {
    assert.equal(level.sentences.length, 15, `Level ${level.level}`);
  }
});

test("curriculum review draft does not repeat sentences inside a level", () => {
  const levels = parseLevels(readFileSync(curriculumPath, "utf8"));

  for (const level of levels) {
    const uniqueCount = new Set(level.sentences.map((sentence) => sentence.toLowerCase())).size;
    assert.equal(uniqueCount, 15, `Level ${level.level} only has ${uniqueCount} unique sentences`);
  }
});

test("curriculum review draft avoids banned adult or abstract content", () => {
  const markdown = readFileSync(curriculumPath, "utf8").toLowerCase();

  for (const bannedTerm of bannedTerms) {
    assert.ok(!markdown.includes(bannedTerm), `Contains banned term: ${bannedTerm}`);
  }
});
