export const LEVELS_PER_DAY = 5;
export const LEVELS_PER_PACK = 25;

function toLevelNumber(level) {
  return typeof level === "number" ? level : level?.level;
}

export function getPackStart(levelNumber, levelsPerPack = LEVELS_PER_PACK) {
  const numericLevel = Number(levelNumber);
  if (!Number.isFinite(numericLevel) || numericLevel < 1) return 1;
  return Math.floor((numericLevel - 1) / levelsPerPack) * levelsPerPack + 1;
}

export function createLevelPacks(levels, options = {}) {
  const {
    levelsPerPack = LEVELS_PER_PACK,
    levelsPerDay = LEVELS_PER_DAY
  } = options;

  const groupedLevels = new Map();
  const levelNumbers = levels
    .map(toLevelNumber)
    .map(Number)
    .filter((level) => Number.isInteger(level) && level > 0)
    .sort((a, b) => a - b);

  for (const level of levelNumbers) {
    const packStart = getPackStart(level, levelsPerPack);
    if (!groupedLevels.has(packStart)) groupedLevels.set(packStart, []);
    groupedLevels.get(packStart).push(level);
  }

  return [...groupedLevels.entries()].map(([start, packLevels]) => {
    const end = Math.max(...packLevels);
    const days = [];

    for (let index = 0; index < packLevels.length; index += levelsPerDay) {
      const dayLevels = packLevels.slice(index, index + levelsPerDay);
      days.push({
        day: days.length + 1,
        label: `Day ${days.length + 1}`,
        levels: dayLevels
      });
    }

    return {
      start,
      end,
      label: `Level ${start}-${end}`,
      levels: packLevels,
      days
    };
  });
}

export function findPackForLevel(packs, levelNumber) {
  const selectedPackStart = getPackStart(levelNumber);
  return packs.find((pack) => pack.start === selectedPackStart) ?? packs[0] ?? null;
}
