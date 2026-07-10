import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const fixture = JSON.parse(
  readFileSync("tests/fixtures/level18-count-assets.json", "utf8")
);

test("Level 18 question 15 keeps the reviewed five-versus-six chicken images", () => {
  assert.deepEqual(
    Object.values(fixture).map(({ count }) => count),
    [5, 6]
  );

  for (const [filename, expected] of Object.entries(fixture)) {
    const image = readFileSync(`assets/textbook/images/level-018/${filename}`);
    const actualHash = createHash("sha256").update(image).digest("hex");
    assert.equal(actualHash, expected.sha256, filename);
  }
});
