import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { PNG } from "pngjs";

import { textbookLevels } from "../src/course/textbook-levels-001-050.generated.mjs";

const defaultLevels = [12, 13, 14, 15];
const requestedLevels = process.argv
  .slice(2)
  .map((item) => Number.parseInt(item, 10))
  .filter((item) => Number.isInteger(item));
const levelsToRender = new Set(requestedLevels.length > 0 ? requestedLevels : defaultLevels);

const cardWidth = 840;
const cardHeight = 630;
const renderScale = 2;
const sheetCellWidth = 280;
const sheetCellHeight = 210;
const sheetColumns = 6;

const numberWords = new Map([
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
  ["ten", 10]
]);

const palette = {
  wallTop: [255, 250, 240, 255],
  wallBottom: [246, 238, 222, 255],
  skyTop: [231, 248, 255, 255],
  skyBottom: [246, 252, 255, 255],
  floor: [239, 224, 196, 255],
  table: [222, 178, 122, 255],
  tableEdge: [187, 132, 78, 255],
  grass: [221, 241, 212, 255],
  shadow: [83, 69, 55, 45],
  outline: [83, 68, 55, 255],
  softOutline: [127, 105, 81, 170],
  red: [235, 88, 82, 255],
  blue: [68, 151, 235, 255],
  yellow: [255, 207, 81, 255],
  green: [91, 174, 94, 255],
  orange: [246, 151, 61, 255],
  purple: [136, 92, 210, 255],
  black: [45, 48, 55, 255],
  white: [250, 249, 242, 255],
  brown: [150, 98, 56, 255],
  pink: [243, 132, 169, 255],
  cream: [255, 212, 174, 255],
  hair: [79, 52, 34, 255],
  gray: [152, 160, 170, 255],
  page: [255, 250, 230, 255],
  window: [197, 233, 251, 255]
};

const colorWords = ["red", "blue", "yellow", "green", "black", "white", "orange", "purple", "pink", "brown"];

const defaultColors = {
  apple: "red",
  ball: "blue",
  book: "blue",
  cup: "yellow",
  cat: "orange",
  kite: "orange",
  star: "yellow",
  car: "red",
  bag: "blue",
  circle: "green",
  box: "orange",
  heart: "pink",
  square: "blue",
  hat: "brown",
  bird: "blue",
  fish: "orange",
  child: "pink"
};

const itemWords = [
  ["children", "child"],
  ["child", "child"],
  ["apples", "apple"],
  ["apple", "apple"],
  ["balls", "ball"],
  ["ball", "ball"],
  ["books", "book"],
  ["book", "book"],
  ["cups", "cup"],
  ["cup", "cup"],
  ["cats", "cat"],
  ["cat", "cat"],
  ["kites", "kite"],
  ["kite", "kite"],
  ["stars", "star"],
  ["star", "star"],
  ["cars", "car"],
  ["car", "car"],
  ["bags", "bag"],
  ["bag", "bag"],
  ["circles", "circle"],
  ["circle", "circle"],
  ["boxes", "box"],
  ["box", "box"],
  ["hearts", "heart"],
  ["heart", "heart"],
  ["squares", "square"],
  ["square", "square"],
  ["hats", "hat"],
  ["hat", "hat"],
  ["birds", "bird"],
  ["bird", "bird"],
  ["fish", "fish"]
];

const outdoorItems = new Set(["kite", "bird", "fish", "car"]);
const tableItems = new Set(["apple", "book", "cup", "box", "heart", "star", "circle", "square", "hat"]);

function rgba(name) {
  return palette[name] ?? palette.blue;
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    Math.round((a[3] ?? 255) + ((b[3] ?? 255) - (a[3] ?? 255)) * t)
  ];
}

function withAlpha(color, alpha) {
  return [color[0], color[1], color[2], alpha];
}

function lighten(color, amount) {
  return mix(color, [255, 255, 255, color[3] ?? 255], amount);
}

function darken(color, amount) {
  return mix(color, [0, 0, 0, color[3] ?? 255], amount);
}

function makePng(width, height) {
  return new PNG({ width, height });
}

function blendPixel(png, x, y, color) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const index = (Math.floor(y) * png.width + Math.floor(x)) * 4;
  const sourceAlpha = (color[3] ?? 255) / 255;
  const targetAlpha = png.data[index + 3] / 255;
  const outAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);
  if (outAlpha <= 0) return;
  png.data[index] = Math.round((color[0] * sourceAlpha + png.data[index] * targetAlpha * (1 - sourceAlpha)) / outAlpha);
  png.data[index + 1] = Math.round((color[1] * sourceAlpha + png.data[index + 1] * targetAlpha * (1 - sourceAlpha)) / outAlpha);
  png.data[index + 2] = Math.round((color[2] * sourceAlpha + png.data[index + 2] * targetAlpha * (1 - sourceAlpha)) / outAlpha);
  png.data[index + 3] = Math.round(outAlpha * 255);
}

function fillRect(png, x, y, width, height, color) {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(png.width, Math.ceil(x + width));
  const y1 = Math.min(png.height, Math.ceil(y + height));
  for (let yy = y0; yy < y1; yy += 1) {
    for (let xx = x0; xx < x1; xx += 1) blendPixel(png, xx, yy, color);
  }
}

function fillVerticalGradient(png, x, y, width, height, topColor, bottomColor) {
  const y0 = Math.max(0, Math.floor(y));
  const y1 = Math.min(png.height, Math.ceil(y + height));
  for (let yy = y0; yy < y1; yy += 1) {
    const t = height <= 1 ? 0 : (yy - y) / height;
    fillRect(png, x, yy, width, 1, mix(topColor, bottomColor, Math.min(1, Math.max(0, t))));
  }
}

function fillEllipse(png, cx, cy, rx, ry, color) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) blendPixel(png, x, y, color);
    }
  }
}

function fillCircle(png, cx, cy, radius, color) {
  fillEllipse(png, cx, cy, radius, radius, color);
}

function fillRoundRect(png, x, y, width, height, radius, color) {
  fillRect(png, x + radius, y, width - radius * 2, height, color);
  fillRect(png, x, y + radius, width, height - radius * 2, color);
  fillCircle(png, x + radius, y + radius, radius, color);
  fillCircle(png, x + width - radius, y + radius, radius, color);
  fillCircle(png, x + radius, y + height - radius, radius, color);
  fillCircle(png, x + width - radius, y + height - radius, radius, color);
}

function fillPolygon(png, points, color) {
  const minX = Math.floor(Math.min(...points.map(([x]) => x)));
  const maxX = Math.ceil(Math.max(...points.map(([x]) => x)));
  const minY = Math.floor(Math.min(...points.map(([, y]) => y)));
  const maxY = Math.ceil(Math.max(...points.map(([, y]) => y)));

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
        const [xi, yi] = points[i];
        const [xj, yj] = points[j];
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      if (inside) blendPixel(png, x, y, color);
    }
  }
}

function drawLine(png, x1, y1, x2, y2, width, color) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  if (steps === 0) {
    fillCircle(png, x1, y1, width / 2, color);
    return;
  }
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    fillCircle(png, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, width / 2, color);
  }
}

function starPoints(cx, cy, outer, inner) {
  return Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  });
}

function parseScene(sentence) {
  const lower = sentence.toLowerCase();
  const countWord = [...numberWords.keys()].find((word) => new RegExp(`\\b${word}\\b`).test(lower));
  const colorName = colorWords.find((name) => new RegExp(`\\b${name}\\b`).test(lower));
  const item = itemWords.find(([word]) => new RegExp(`\\b${word}\\b`).test(lower))?.[1] ?? "ball";

  return {
    count: numberWords.get(countWord) ?? 1,
    item,
    colorName: colorName ?? defaultColors[item] ?? "blue"
  };
}

function rowPattern(count) {
  const patterns = {
    1: [1],
    2: [2],
    3: [3],
    4: [2, 2],
    5: [3, 2],
    6: [3, 3],
    7: [4, 3],
    8: [4, 4],
    9: [5, 4],
    10: [5, 5]
  };
  return patterns[count] ?? [count];
}

function layoutPositions(scene, width, height) {
  const rows = rowPattern(scene.count);
  const maxCols = Math.max(...rows);
  const top = scene.item === "kite" || scene.item === "bird" ? height * 0.2 : height * 0.28;
  const usableHeight = scene.item === "kite" || scene.item === "bird" ? height * 0.52 : height * 0.42;
  const gapY = rows.length === 1 ? 0 : usableHeight / (rows.length - 1);
  const positions = [];
  for (const [rowIndex, cols] of rows.entries()) {
    const y = rows.length === 1 ? top + usableHeight * 0.38 : top + rowIndex * gapY;
    const marginX = width * (maxCols >= 5 ? 0.13 : 0.18);
    const rowWidth = width - marginX * 2;
    for (let col = 0; col < cols; col += 1) {
      const x = cols === 1 ? width / 2 : marginX + (rowWidth * col) / (cols - 1);
      positions.push([x, y]);
    }
  }
  return positions;
}

function baseSize(scene, width, height) {
  const maxCols = Math.max(...rowPattern(scene.count));
  const maxRows = rowPattern(scene.count).length;
  const byWidth = (width * 0.78) / maxCols;
  const byHeight = (height * 0.5) / Math.max(1, maxRows);
  const itemFactor = scene.item === "child" ? 1.1 : scene.item === "kite" ? 0.95 : 1;
  return Math.min(155, Math.max(78, Math.min(byWidth, byHeight) * itemFactor));
}

function drawBackground(png, scene) {
  if (outdoorItems.has(scene.item)) {
    fillVerticalGradient(png, 0, 0, png.width, png.height * 0.78, palette.skyTop, palette.skyBottom);
    fillRect(png, 0, png.height * 0.78, png.width, png.height * 0.22, palette.grass);
    fillCircle(png, png.width * 0.13, png.height * 0.17, 42 * renderScale, palette.yellow);
    fillEllipse(png, png.width * 0.78, png.height * 0.2, 80 * renderScale, 22 * renderScale, [255, 255, 255, 170]);
    fillEllipse(png, png.width * 0.84, png.height * 0.18, 56 * renderScale, 22 * renderScale, [255, 255, 255, 160]);
    return;
  }

  fillVerticalGradient(png, 0, 0, png.width, png.height * 0.8, palette.wallTop, palette.wallBottom);
  fillRect(png, 0, png.height * 0.8, png.width, png.height * 0.2, palette.floor);
  fillRoundRect(png, png.width * 0.08, png.height * 0.1, png.width * 0.22, png.height * 0.2, 18 * renderScale, [226, 242, 252, 255]);
  fillRect(png, png.width * 0.08, png.height * 0.3, png.width * 0.22, 8 * renderScale, [210, 168, 102, 255]);

  if (tableItems.has(scene.item) && scene.item !== "child") {
    fillRoundRect(png, png.width * 0.08, png.height * 0.69, png.width * 0.84, png.height * 0.12, 18 * renderScale, palette.table);
    fillRect(png, png.width * 0.08, png.height * 0.79, png.width * 0.84, 8 * renderScale, palette.tableEdge);
  }
}

function drawShadow(png, cx, cy, size, item) {
  const yOffset = item === "kite" || item === "bird" ? size * 0.55 : size * 0.46;
  fillEllipse(png, cx, cy + yOffset, size * 0.42, size * 0.08, palette.shadow);
}

function drawApple(png, cx, cy, size, main) {
  fillCircle(png, cx - size * 0.15, cy, size * 0.32, darken(main, 0.04));
  fillCircle(png, cx + size * 0.15, cy, size * 0.32, main);
  fillEllipse(png, cx, cy + size * 0.1, size * 0.38, size * 0.31, main);
  fillRect(png, cx - size * 0.045, cy - size * 0.5, size * 0.09, size * 0.22, palette.brown);
  fillEllipse(png, cx + size * 0.18, cy - size * 0.43, size * 0.17, size * 0.08, palette.green);
  fillEllipse(png, cx - size * 0.14, cy - size * 0.06, size * 0.08, size * 0.13, [255, 255, 255, 95]);
}

function drawBall(png, cx, cy, size, main) {
  fillCircle(png, cx, cy, size * 0.38, main);
  drawLine(png, cx - size * 0.32, cy - size * 0.12, cx + size * 0.34, cy + size * 0.1, size * 0.05, [255, 255, 255, 120]);
  drawLine(png, cx - size * 0.1, cy - size * 0.34, cx + size * 0.11, cy + size * 0.34, size * 0.045, [255, 255, 255, 110]);
  fillCircle(png, cx - size * 0.13, cy - size * 0.13, size * 0.1, [255, 255, 255, 75]);
}

function drawBook(png, cx, cy, size, main) {
  fillRoundRect(png, cx - size * 0.48, cy - size * 0.34, size * 0.96, size * 0.68, size * 0.06, darken(main, 0.08));
  fillRoundRect(png, cx - size * 0.42, cy - size * 0.28, size * 0.84, size * 0.56, size * 0.04, main);
  fillRect(png, cx - size * 0.02, cy - size * 0.3, size * 0.04, size * 0.6, [255, 255, 255, 140]);
  fillRect(png, cx - size * 0.32, cy - size * 0.18, size * 0.22, size * 0.05, [255, 255, 255, 105]);
  fillRect(png, cx + size * 0.1, cy - size * 0.18, size * 0.22, size * 0.05, [255, 255, 255, 105]);
}

function drawCup(png, cx, cy, size, main) {
  fillRoundRect(png, cx - size * 0.3, cy - size * 0.36, size * 0.6, size * 0.68, size * 0.08, darken(main, 0.06));
  fillRoundRect(png, cx - size * 0.25, cy - size * 0.3, size * 0.5, size * 0.58, size * 0.07, main);
  fillEllipse(png, cx, cy - size * 0.3, size * 0.25, size * 0.07, lighten(main, 0.35));
  fillCircle(png, cx + size * 0.34, cy - size * 0.02, size * 0.17, main);
  fillCircle(png, cx + size * 0.34, cy - size * 0.02, size * 0.1, palette.wallBottom);
  fillRect(png, cx - size * 0.05, cy - size * 0.22, size * 0.1, size * 0.32, [255, 255, 255, 90]);
}

function drawCat(png, cx, cy, size, main) {
  fillEllipse(png, cx, cy + size * 0.18, size * 0.35, size * 0.28, main);
  fillCircle(png, cx, cy - size * 0.18, size * 0.31, main);
  fillPolygon(png, [[cx - size * 0.28, cy - size * 0.32], [cx - size * 0.15, cy - size * 0.62], [cx - size * 0.04, cy - size * 0.3]], main);
  fillPolygon(png, [[cx + size * 0.28, cy - size * 0.32], [cx + size * 0.15, cy - size * 0.62], [cx + size * 0.04, cy - size * 0.3]], main);
  fillCircle(png, cx - size * 0.11, cy - size * 0.19, size * 0.035, palette.outline);
  fillCircle(png, cx + size * 0.11, cy - size * 0.19, size * 0.035, palette.outline);
  fillEllipse(png, cx, cy - size * 0.08, size * 0.05, size * 0.035, palette.pink);
  drawLine(png, cx + size * 0.32, cy + size * 0.08, cx + size * 0.55, cy - size * 0.08, size * 0.08, main);
}

function drawKite(png, cx, cy, size, main) {
  fillPolygon(png, [[cx, cy - size * 0.52], [cx + size * 0.35, cy], [cx, cy + size * 0.52], [cx - size * 0.35, cy]], darken(main, 0.05));
  fillPolygon(png, [[cx, cy - size * 0.45], [cx + size * 0.28, cy], [cx, cy + size * 0.45], [cx - size * 0.28, cy]], main);
  drawLine(png, cx, cy - size * 0.43, cx, cy + size * 0.43, size * 0.03, [255, 255, 255, 150]);
  drawLine(png, cx - size * 0.26, cy, cx + size * 0.26, cy, size * 0.03, [255, 255, 255, 150]);
  drawLine(png, cx, cy + size * 0.48, cx - size * 0.16, cy + size * 0.86, size * 0.025, palette.softOutline);
  fillPolygon(png, [[cx - size * 0.18, cy + size * 0.7], [cx - size * 0.31, cy + size * 0.62], [cx - size * 0.23, cy + size * 0.8]], palette.orange);
}

function drawStar(png, cx, cy, size, main) {
  fillPolygon(png, starPoints(cx, cy, size * 0.44, size * 0.2), darken(main, 0.03));
  fillPolygon(png, starPoints(cx - size * 0.02, cy - size * 0.02, size * 0.39, size * 0.17), main);
  fillCircle(png, cx - size * 0.1, cy - size * 0.15, size * 0.05, [255, 255, 255, 90]);
}

function drawCar(png, cx, cy, size, main) {
  fillRoundRect(png, cx - size * 0.48, cy - size * 0.08, size * 0.96, size * 0.36, size * 0.08, main);
  fillPolygon(png, [[cx - size * 0.25, cy - size * 0.08], [cx - size * 0.08, cy - size * 0.34], [cx + size * 0.22, cy - size * 0.34], [cx + size * 0.36, cy - size * 0.08]], main);
  fillPolygon(png, [[cx - size * 0.08, cy - size * 0.29], [cx + size * 0.18, cy - size * 0.29], [cx + size * 0.27, cy - size * 0.08], [cx - size * 0.18, cy - size * 0.08]], palette.window);
  fillCircle(png, cx - size * 0.28, cy + size * 0.28, size * 0.13, palette.outline);
  fillCircle(png, cx + size * 0.28, cy + size * 0.28, size * 0.13, palette.outline);
  fillCircle(png, cx - size * 0.28, cy + size * 0.28, size * 0.065, palette.gray);
  fillCircle(png, cx + size * 0.28, cy + size * 0.28, size * 0.065, palette.gray);
}

function drawBag(png, cx, cy, size, main) {
  fillRoundRect(png, cx - size * 0.38, cy - size * 0.12, size * 0.76, size * 0.6, size * 0.08, darken(main, 0.07));
  fillRoundRect(png, cx - size * 0.33, cy - size * 0.06, size * 0.66, size * 0.5, size * 0.07, main);
  drawLine(png, cx - size * 0.18, cy - size * 0.12, cx - size * 0.11, cy - size * 0.34, size * 0.07, main);
  drawLine(png, cx + size * 0.18, cy - size * 0.12, cx + size * 0.11, cy - size * 0.34, size * 0.07, main);
  fillRoundRect(png, cx - size * 0.2, cy + size * 0.12, size * 0.4, size * 0.19, size * 0.04, lighten(main, 0.18));
}

function drawBox(png, cx, cy, size, main) {
  fillPolygon(png, [[cx - size * 0.35, cy - size * 0.15], [cx, cy - size * 0.36], [cx + size * 0.35, cy - size * 0.15], [cx, cy + size * 0.07]], lighten(main, 0.16));
  fillPolygon(png, [[cx - size * 0.35, cy - size * 0.15], [cx, cy + size * 0.07], [cx, cy + size * 0.45], [cx - size * 0.35, cy + size * 0.22]], main);
  fillPolygon(png, [[cx + size * 0.35, cy - size * 0.15], [cx, cy + size * 0.07], [cx, cy + size * 0.45], [cx + size * 0.35, cy + size * 0.22]], darken(main, 0.08));
}

function drawSquare(png, cx, cy, size, main) {
  fillRoundRect(png, cx - size * 0.34, cy - size * 0.34, size * 0.68, size * 0.68, size * 0.04, darken(main, 0.06));
  fillRoundRect(png, cx - size * 0.29, cy - size * 0.29, size * 0.58, size * 0.58, size * 0.03, main);
}

function drawHeart(png, cx, cy, size, main) {
  fillCircle(png, cx - size * 0.15, cy - size * 0.08, size * 0.21, main);
  fillCircle(png, cx + size * 0.15, cy - size * 0.08, size * 0.21, main);
  fillPolygon(png, [[cx - size * 0.36, cy], [cx + size * 0.36, cy], [cx, cy + size * 0.45]], main);
  fillCircle(png, cx - size * 0.11, cy - size * 0.14, size * 0.055, [255, 255, 255, 90]);
}

function drawHat(png, cx, cy, size, main) {
  fillRoundRect(png, cx - size * 0.36, cy - size * 0.25, size * 0.72, size * 0.34, size * 0.08, main);
  fillRoundRect(png, cx - size * 0.52, cy + size * 0.02, size * 1.04, size * 0.16, size * 0.06, darken(main, 0.04));
  fillRect(png, cx - size * 0.28, cy - size * 0.05, size * 0.56, size * 0.08, palette.yellow);
}

function drawBird(png, cx, cy, size, main) {
  fillEllipse(png, cx, cy, size * 0.36, size * 0.25, main);
  fillCircle(png, cx + size * 0.28, cy - size * 0.15, size * 0.17, main);
  fillEllipse(png, cx - size * 0.06, cy + size * 0.02, size * 0.2, size * 0.11, lighten(main, 0.2));
  fillPolygon(png, [[cx + size * 0.43, cy - size * 0.15], [cx + size * 0.62, cy - size * 0.08], [cx + size * 0.43, cy]], palette.yellow);
  fillCircle(png, cx + size * 0.33, cy - size * 0.18, size * 0.025, palette.outline);
}

function drawFish(png, cx, cy, size, main) {
  fillEllipse(png, cx, cy, size * 0.38, size * 0.24, main);
  fillPolygon(png, [[cx - size * 0.35, cy], [cx - size * 0.65, cy - size * 0.23], [cx - size * 0.65, cy + size * 0.23]], main);
  fillPolygon(png, [[cx - size * 0.08, cy - size * 0.04], [cx - size * 0.25, cy - size * 0.27], [cx + size * 0.02, cy - size * 0.18]], lighten(main, 0.18));
  fillCircle(png, cx + size * 0.2, cy - size * 0.07, size * 0.035, palette.outline);
}

function drawChild(png, cx, cy, size, main) {
  fillCircle(png, cx, cy - size * 0.28, size * 0.22, palette.cream);
  fillEllipse(png, cx, cy - size * 0.42, size * 0.22, size * 0.1, palette.hair);
  fillRoundRect(png, cx - size * 0.24, cy - size * 0.05, size * 0.48, size * 0.46, size * 0.1, main);
  drawLine(png, cx - size * 0.23, cy + size * 0.03, cx - size * 0.44, cy + size * 0.18, size * 0.08, palette.cream);
  drawLine(png, cx + size * 0.23, cy + size * 0.03, cx + size * 0.44, cy + size * 0.18, size * 0.08, palette.cream);
  drawLine(png, cx - size * 0.08, cy + size * 0.4, cx - size * 0.13, cy + size * 0.61, size * 0.09, palette.brown);
  drawLine(png, cx + size * 0.08, cy + size * 0.4, cx + size * 0.13, cy + size * 0.61, size * 0.09, palette.brown);
  fillCircle(png, cx - size * 0.07, cy - size * 0.29, size * 0.024, palette.outline);
  fillCircle(png, cx + size * 0.07, cy - size * 0.29, size * 0.024, palette.outline);
  drawLine(png, cx - size * 0.06, cy - size * 0.18, cx + size * 0.06, cy - size * 0.18, size * 0.025, palette.red);
}

function drawItemShape(png, scene, cx, cy, size) {
  const main = rgba(scene.colorName);
  if (scene.item === "apple") drawApple(png, cx, cy, size, main);
  else if (scene.item === "ball" || scene.item === "circle") drawBall(png, cx, cy, size, main);
  else if (scene.item === "book") drawBook(png, cx, cy, size, main);
  else if (scene.item === "cup") drawCup(png, cx, cy, size, main);
  else if (scene.item === "cat") drawCat(png, cx, cy, size, main);
  else if (scene.item === "kite") drawKite(png, cx, cy, size, main);
  else if (scene.item === "star") drawStar(png, cx, cy, size, main);
  else if (scene.item === "car") drawCar(png, cx, cy, size, main);
  else if (scene.item === "bag") drawBag(png, cx, cy, size, main);
  else if (scene.item === "box") drawBox(png, cx, cy, size, main);
  else if (scene.item === "square") drawSquare(png, cx, cy, size, main);
  else if (scene.item === "heart") drawHeart(png, cx, cy, size, main);
  else if (scene.item === "hat") drawHat(png, cx, cy, size, main);
  else if (scene.item === "bird") drawBird(png, cx, cy, size, main);
  else if (scene.item === "fish") drawFish(png, cx, cy, size, main);
  else drawChild(png, cx, cy, size, main);
}

function drawItem(png, scene, cx, cy, size) {
  drawShadow(png, cx, cy, size, scene.item);

  if (scene.colorName === "white") {
    drawItemShape(png, { ...scene, colorName: "gray" }, cx, cy, size * 1.09);
  }

  drawItemShape(png, scene, cx, cy, size);
}

function downsample(source, width, height, scale) {
  const target = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sums = [0, 0, 0, 0];
      for (let sy = 0; sy < scale; sy += 1) {
        for (let sx = 0; sx < scale; sx += 1) {
          const sourceIndex = ((y * scale + sy) * source.width + (x * scale + sx)) * 4;
          sums[0] += source.data[sourceIndex];
          sums[1] += source.data[sourceIndex + 1];
          sums[2] += source.data[sourceIndex + 2];
          sums[3] += source.data[sourceIndex + 3];
        }
      }
      const pixels = scale * scale;
      const targetIndex = (y * width + x) * 4;
      target.data[targetIndex] = Math.round(sums[0] / pixels);
      target.data[targetIndex + 1] = Math.round(sums[1] / pixels);
      target.data[targetIndex + 2] = Math.round(sums[2] / pixels);
      target.data[targetIndex + 3] = Math.round(sums[3] / pixels);
    }
  }
  return target;
}

function renderScene(sentence, width, height, scale = renderScale) {
  const scene = parseScene(sentence);
  const highWidth = width * scale;
  const highHeight = height * scale;
  const png = makePng(highWidth, highHeight);
  drawBackground(png, scene);

  const positions = layoutPositions(scene, highWidth, highHeight);
  const size = baseSize(scene, highWidth, highHeight);
  for (const [x, y] of positions) drawItem(png, scene, x, y, size);

  return downsample(png, width, height, scale);
}

function writePng(path, png) {
  return new Promise((resolve, reject) => {
    png
      .pack()
      .pipe(createWriteStream(path))
      .on("finish", resolve)
      .on("error", reject);
  });
}

function blitScaled(source, target, targetX, targetY, targetWidth, targetHeight) {
  for (let y = 0; y < targetHeight; y += 1) {
    for (let x = 0; x < targetWidth; x += 1) {
      const sourceX = Math.floor((x / targetWidth) * source.width);
      const sourceY = Math.floor((y / targetHeight) * source.height);
      const sourceIndex = (sourceY * source.width + sourceX) * 4;
      const targetIndex = ((targetY + y) * target.width + targetX + x) * 4;
      target.data[targetIndex] = source.data[sourceIndex];
      target.data[targetIndex + 1] = source.data[sourceIndex + 1];
      target.data[targetIndex + 2] = source.data[sourceIndex + 2];
      target.data[targetIndex + 3] = source.data[sourceIndex + 3];
    }
  }
}

for (const level of textbookLevels.filter((item) => levelsToRender.has(item.level))) {
  const levelId = String(level.level).padStart(3, "0");
  const cells = level.questions.flatMap((question) => [
    { sentence: question.sentence, output: question.correctImage },
    { sentence: question.wrongSentence, output: question.wrongImage }
  ]);
  const sheetRows = Math.ceil(cells.length / sheetColumns);
  const sheet = new PNG({ width: sheetCellWidth * sheetColumns, height: sheetCellHeight * sheetRows });
  fillRect(sheet, 0, 0, sheet.width, sheet.height, [255, 255, 255, 255]);

  for (const [index, cell] of cells.entries()) {
    const card = renderScene(cell.sentence, cardWidth, cardHeight);
    await mkdir(dirname(cell.output), { recursive: true });
    await writePng(cell.output, card);

    const col = index % sheetColumns;
    const row = Math.floor(index / sheetColumns);
    const thumbnail = renderScene(cell.sentence, sheetCellWidth - 12, sheetCellHeight - 12, 2);
    blitScaled(thumbnail, sheet, col * sheetCellWidth + 6, row * sheetCellHeight + 6, sheetCellWidth - 12, sheetCellHeight - 12);
  }

  const sheetPath = `assets/textbook/contact-sheets/level-${levelId}.png`;
  await mkdir(dirname(sheetPath), { recursive: true });
  await writePng(sheetPath, sheet);
  console.log(`Generated polished count illustrations for Level ${levelId}.`);
}
