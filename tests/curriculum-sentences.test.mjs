import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sentencePath = "docs/curriculum-sentences-levels-001-300.md";

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
  "depressed",
  "Halloween",
  "Thanksgiving",
  "Prom",
  "Baseball League"
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

test("curriculum sentence draft has 300 levels with 15 sentences each", () => {
  const levels = parseLevels(readFileSync(sentencePath, "utf8"));

  assert.equal(levels.length, 300);
  assert.deepEqual(
    levels.map((item) => item.level),
    Array.from({ length: 300 }, (_, index) => index + 1)
  );

  for (const level of levels) {
    assert.equal(level.sentences.length, 15, `Level ${level.level}`);
  }
});

test("curriculum sentence draft does not repeat sentences inside a level", () => {
  const levels = parseLevels(readFileSync(sentencePath, "utf8"));

  for (const level of levels) {
    const uniqueCount = new Set(level.sentences.map((sentence) => sentence.toLowerCase())).size;
    assert.equal(uniqueCount, 15, `Level ${level.level} only has ${uniqueCount} unique sentences`);
  }
});

test("curriculum sentence draft avoids banned adult or abstract content", () => {
  const markdown = readFileSync(sentencePath, "utf8").toLowerCase();

  for (const bannedTerm of bannedTerms) {
    assert.ok(!markdown.includes(bannedTerm.toLowerCase()), `Contains banned term: ${bannedTerm}`);
  }
});

test("action recognition levels use ongoing action picture language", () => {
  const levels = parseLevels(readFileSync(sentencePath, "utf8"));
  const actionLevels = levels.filter((level) => level.level >= 11 && level.level <= 25);
  const bareActions = /\b(girl|boy|teacher|student) (runs|walks|jumps|dances|reads|writes|eats|drinks|sleeps|swims)\b/i;

  for (const level of actionLevels) {
    for (const sentence of level.sentences) {
      assert.ok(!bareActions.test(sentence), `${level.level}: ${sentence}`);
      assert.match(sentence, /\bis\b .*ing\b/i, `${level.level}: ${sentence}`);
    }
  }
});
