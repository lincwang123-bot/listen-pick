import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const markdownPath = new URL("../docs/child-english-listening-levels-101-300.md", import.meta.url);

test("Level 101-300 markdown contains 200 levels with 15 sentences each", () => {
  const levels = parseLevels(readMarkdown());

  assert.equal(levels.length, 200);
  assert.deepEqual(
    levels.map((level) => level.level),
    Array.from({ length: 200 }, (_, index) => index + 101)
  );

  for (const level of levels) {
    assert.equal(level.sentences.length, 15, `Level ${level.level}`);
  }

  assert.equal(levels.reduce((total, level) => total + level.sentences.length, 0), 3000);
});

test("Level 101-300 markdown follows the required stage sentence patterns", () => {
  const levels = parseLevels(readMarkdown());
  const checks = [
    {
      range: [101, 130],
      pattern: /^The [A-Za-z ]+ is [a-z]+ing\.$/,
      reject: /\b(with|a|an|the)\s+(ball|book|kite|apple|table|park|home|classroom)\b/i
    },
    {
      range: [131, 160],
      pattern: /^The [A-Za-z ]+ is [a-z]+ing .+\.$/
    },
    {
      range: [161, 190],
      pattern: /^The [A-Za-z ]+ is (on|in|under|behind|next to) the [a-z ]+\.$/
    },
    {
      range: [191, 220],
      pattern: /^There are (two|three|four|five|six|seven|eight|nine|ten) [a-z ]+s\.$/
    },
    {
      range: [221, 250],
      pattern: /^The [A-Za-z ]+ is (red|blue|yellow|green|black|white|pink|orange|purple|brown)\.$/
    },
    {
      range: [251, 280],
      pattern: /^My [a-z ]+ is [a-z]+ing\.$/
    },
    {
      range: [281, 300],
      pattern: /^The [A-Za-z ]+ is [a-z]+ing .+ (in|at|on) the [a-z ]+\.$/
    }
  ];

  for (const level of levels) {
    const check = checks.find(({ range }) => level.level >= range[0] && level.level <= range[1]);
    assert.ok(check, `Missing check for Level ${level.level}`);

    for (const sentence of level.sentences) {
      assert.match(sentence, check.pattern, `${level.level}: ${sentence}`);
      if (check.reject) assert.doesNotMatch(sentence, check.reject, `${level.level}: ${sentence}`);
    }
  }
});

test("Level 101-300 markdown avoids banned adult, abstract, unsafe, and logic words", () => {
  const content = readMarkdown();
  const bannedPatterns = [
    /\boffice\b/i,
    /\bmeeting\b/i,
    /\bmanager\b/i,
    /\bsalary\b/i,
    /\binvestment\b/i,
    /\bbusiness\b/i,
    /\bbank\b/i,
    /\bloan\b/i,
    /\bstock\b/i,
    /\bpassport\b/i,
    /\bhotel\b/i,
    /\bdream\b/i,
    /\bsuccess\b/i,
    /\bfreedom\b/i,
    /\bculture\b/i,
    /\bhistory\b/i,
    /\bfuture\b/i,
    /\bfriendship\b/i,
    /\bopinion\b/i,
    /\bidea\b/i,
    /\bknowledge\b/i,
    /\banxious\b/i,
    /\bembarrassed\b/i,
    /\bjealous\b/i,
    /\bregretful\b/i,
    /\bdepressed\b/i,
    /\bfighting\b/i,
    /\bpushing\b/i,
    /\bunder the seesaw\b/i,
    /\bslide in the classroom\b/i
  ];

  for (const pattern of bannedPatterns) {
    assert.doesNotMatch(content, pattern);
  }
});

function readMarkdown() {
  return readFileSync(markdownPath, "utf8");
}

function parseLevels(content) {
  const levels = [];
  let current = null;

  for (const line of content.split(/\r?\n/)) {
    const levelMatch = line.match(/^## Level (\d{3})/);
    if (levelMatch) {
      current = { level: Number(levelMatch[1]), sentences: [] };
      levels.push(current);
      continue;
    }

    const sentenceMatch = line.match(/^(\d{3})-(\d{2})\. (.+)$/);
    if (sentenceMatch && current) {
      current.sentences.push(sentenceMatch[3]);
    }
  }

  return levels;
}
