import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { PNG } from "pngjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backupRoot = resolve(root, "tmp/image-backups/semantic-clarity-20260706");
const quality = "70";
const method = "6";
const targets = [
  { level: 79, question: 8, correct: "taking-off-shoes", wrong: "putting-on-shoes" },
  { level: 74, question: 2, correct: "putting-in", wrong: "taking-out" },
  { level: 60, question: 3, correct: "putting-on-shoes", wrong: "taking-off-shoes" },
  { level: 34, question: 14, correct: "putting-on-torso", wrong: "taking-off-torso" },
  { level: 58, question: 5, correct: "putting-on-torso", wrong: "taking-off-torso" },
  { level: 43, question: 6, correct: "putting-on-head", wrong: "taking-off-head" },
  { level: 93, question: 7, correct: "taking-off-shoes", wrong: "putting-on-shoes" },
  { level: 33, question: 12, correct: "putting-on-torso", wrong: "taking-off-torso" },
  { level: 33, question: 5, correct: "putting-on-shoes", wrong: "taking-off-shoes" },
  { level: 58, question: 4, correct: "taking-off-shoes", wrong: "putting-on-shoes" },
  { level: 58, question: 3, correct: "putting-on-shoes", wrong: "taking-off-shoes" },
  { level: 58, question: 7, correct: "putting-on-torso", wrong: "taking-off-torso" },
  { level: 58, question: 1, correct: "putting-on-head", wrong: "taking-off-head" },
  { level: 43, question: 15, correct: "taking-off-torso", wrong: "putting-on-torso" },
  { level: 76, question: 6, correct: "putting-on-torso", wrong: "taking-off-torso" },
  { level: 33, question: 4, correct: "putting-on-torso", wrong: "taking-off-torso" },
  { level: 96, question: 6, correct: "putting-on-torso", wrong: "taking-off-torso" },
  { level: 76, question: 7, correct: "putting-on-shoes", wrong: "taking-off-shoes" },
  { level: 58, question: 6, correct: "taking-off-torso", wrong: "putting-on-torso" },
  { level: 58, question: 2, correct: "taking-off-head", wrong: "putting-on-head" },
  { level: 74, question: 3, correct: "putting-in", wrong: "taking-out" }
];

let updated = 0;

mkdirSync(backupRoot, { recursive: true });

for (const target of targets) {
  for (const role of ["correct", "wrong"]) {
    const action = target[role];
    const base = `assets/textbook/images/level-${pad(target.level)}/q${pad(target.question)}-${role}`;
    const pngPath = resolve(root, `${base}.png`);
    const webpPath = resolve(root, `${base}.webp`);
    if (!existsSync(pngPath)) throw new Error(`Missing source PNG: ${pngPath}`);

    backupOnce(pngPath);
    if (existsSync(webpPath)) backupOnce(webpPath);

    const image = PNG.sync.read(readFileSync(pngPath));
    drawActionArrow(image, action);
    writeFileSync(pngPath, PNG.sync.write(image));
    execFileSync("cwebp", ["-quiet", "-q", quality, "-m", method, "-resize", "640", "480", pngPath, "-o", webpPath]);
    updated += 1;
  }
}

console.log(`Clarified semantic review images. updated=${updated} backup=${backupRoot}`);

function backupOnce(filePath) {
  const relativePath = filePath.slice(root.length + 1);
  const backupPath = join(backupRoot, relativePath);
  if (existsSync(backupPath)) return;
  mkdirSync(dirname(backupPath), { recursive: true });
  copyFileSync(filePath, backupPath);
}

function drawActionArrow(image, action) {
  const w = image.width;
  const h = image.height;
  const routes = {
    "putting-on-head": [0.70 * w, 0.24 * h, 0.50 * w, 0.38 * h],
    "taking-off-head": [0.50 * w, 0.38 * h, 0.72 * w, 0.20 * h],
    "putting-on-torso": [0.78 * w, 0.50 * h, 0.53 * w, 0.54 * h],
    "taking-off-torso": [0.52 * w, 0.54 * h, 0.80 * w, 0.44 * h],
    "putting-on-shoes": [0.73 * w, 0.78 * h, 0.50 * w, 0.80 * h],
    "taking-off-shoes": [0.50 * w, 0.80 * h, 0.76 * w, 0.76 * h],
    "putting-in": [0.72 * w, 0.38 * h, 0.50 * w, 0.62 * h],
    "taking-out": [0.50 * w, 0.62 * h, 0.72 * w, 0.34 * h]
  };

  const route = routes[action];
  if (!route) throw new Error(`Unknown action ${action}`);
  drawArrow(image, ...route);
}

function drawArrow(image, x1, y1, x2, y2) {
  drawLine(image, x1, y1, x2, y2, 23, [255, 255, 255, 215]);
  drawLine(image, x1, y1, x2, y2, 15, [45, 134, 245, 225]);

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLength = 42;
  const spread = Math.PI / 7;
  const left = [x2 - headLength * Math.cos(angle - spread), y2 - headLength * Math.sin(angle - spread)];
  const right = [x2 - headLength * Math.cos(angle + spread), y2 - headLength * Math.sin(angle + spread)];

  fillTriangle(image, [x2, y2], left, right, [255, 255, 255, 230]);
  const innerLeft = [x2 - headLength * 0.75 * Math.cos(angle - spread), y2 - headLength * 0.75 * Math.sin(angle - spread)];
  const innerRight = [x2 - headLength * 0.75 * Math.cos(angle + spread), y2 - headLength * 0.75 * Math.sin(angle + spread)];
  fillTriangle(image, [x2, y2], innerLeft, innerRight, [45, 134, 245, 235]);
}

function drawLine(image, x1, y1, x2, y2, width, rgba) {
  const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1));
  const radius = width / 2;
  for (let step = 0; step <= steps; step += 1) {
    const t = steps === 0 ? 0 : step / steps;
    fillCircle(image, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, radius, rgba);
  }
}

function fillCircle(image, cx, cy, radius, rgba) {
  const minX = Math.floor(cx - radius);
  const maxX = Math.ceil(cx + radius);
  const minY = Math.floor(cy - radius);
  const maxY = Math.ceil(cy + radius);

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) blendPixel(image, x, y, rgba);
    }
  }
}

function fillTriangle(image, p1, p2, p3, rgba) {
  const minX = Math.floor(Math.min(p1[0], p2[0], p3[0]));
  const maxX = Math.ceil(Math.max(p1[0], p2[0], p3[0]));
  const minY = Math.floor(Math.min(p1[1], p2[1], p3[1]));
  const maxY = Math.ceil(Math.max(p1[1], p2[1], p3[1]));
  const area = edge(p1, p2, p3);

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const point = [x + 0.5, y + 0.5];
      const w1 = edge(p2, p3, point);
      const w2 = edge(p3, p1, point);
      const w3 = edge(p1, p2, point);
      if ((area >= 0 && w1 >= 0 && w2 >= 0 && w3 >= 0) || (area < 0 && w1 <= 0 && w2 <= 0 && w3 <= 0)) {
        blendPixel(image, x, y, rgba);
      }
    }
  }
}

function edge(a, b, c) {
  return (c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0]);
}

function blendPixel(image, x, y, rgba) {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;

  const index = (image.width * y + x) << 2;
  const sourceAlpha = rgba[3] / 255;
  const targetAlpha = image.data[index + 3] / 255;
  const outputAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);
  if (outputAlpha <= 0) return;

  for (let channel = 0; channel < 3; channel += 1) {
    image.data[index + channel] = Math.round((rgba[channel] * sourceAlpha + image.data[index + channel] * targetAlpha * (1 - sourceAlpha)) / outputAlpha);
  }
  image.data[index + 3] = Math.round(outputAlpha * 255);
}

function pad(value) {
  return String(value).padStart(3, "0");
}
