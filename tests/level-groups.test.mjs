import test from "node:test";
import assert from "node:assert/strict";

import {
  createLevelPacks,
  findPackForLevel,
  getPackStart,
  LEVELS_PER_DAY,
  LEVELS_PER_PACK
} from "../src/level-groups.mjs";

function makeLevels(count) {
  return Array.from({ length: count }, (_, index) => ({ level: index + 1 }));
}

test("levels are grouped into 25-level packs and 5-level days", () => {
  const packs = createLevelPacks(makeLevels(100));

  assert.equal(LEVELS_PER_PACK, 25);
  assert.equal(LEVELS_PER_DAY, 5);
  assert.equal(packs.length, 4);
  assert.deepEqual(
    packs.map((pack) => pack.label),
    ["Level 1-25", "Level 26-50", "Level 51-75", "Level 76-100"]
  );

  for (const pack of packs) {
    assert.equal(pack.levels.length, 25);
    assert.equal(pack.days.length, 5);
    for (const day of pack.days) {
      assert.equal(day.levels.length, 5);
    }
  }
});

test("pack lookup supports larger future course sizes", () => {
  const threeHundredPacks = createLevelPacks(makeLevels(300));
  const fiveHundredPacks = createLevelPacks(makeLevels(500));

  assert.equal(threeHundredPacks.length, 12);
  assert.equal(fiveHundredPacks.length, 20);
  assert.equal(getPackStart(1), 1);
  assert.equal(getPackStart(25), 1);
  assert.equal(getPackStart(26), 26);
  assert.equal(getPackStart(300), 276);
  assert.equal(findPackForLevel(threeHundredPacks, 137).label, "Level 126-150");
});
