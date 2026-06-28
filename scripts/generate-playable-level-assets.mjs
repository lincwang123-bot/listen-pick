import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

import { courseLevels } from "../src/course/levels-002-030.generated.mjs";

const run = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const playableLevels = new Set([2, 3, 4, 5]);

const palette = {
  red: "#ff6f61",
  blue: "#53a8ff",
  yellow: "#ffd75f",
  green: "#65c783",
  pink: "#ff9ac2",
  orange: "#ffa64d",
  white: "#ffffff",
  black: "#344050",
  purple: "#9a7cff"
};

const foodColors = {
  apples: "#ff6f61",
  bananas: "#ffd75f",
  eggs: "#fff2b8",
  rice: "#ffffff",
  noodles: "#ffd37a",
  milk: "#ffffff",
  bread: "#d99b5f",
  fish: "#86d6ff",
  carrots: "#ff934d",
  water: "#7ed4ff",
  corn: "#ffe16a",
  cake: "#ff9ac2",
  soup: "#ffb25d",
  pears: "#b7d96b",
  grapes: "#9a7cff",
  juice: "#ffa64d"
};

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function normalizeSentence(sentence) {
  return sentence.toLowerCase().replace(/[.?!]/g, "");
}

function findWord(sentence, words) {
  return words.find((word) => sentence.includes(word));
}

function svgShell(body, accent = "#53a8ff") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="840" height="540" viewBox="0 0 840 540" role="img" aria-label="${escapeXml("children picture book scene")}">
  <defs>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#35618a" flood-opacity=".13"/>
    </filter>
  </defs>
  <rect width="840" height="540" rx="34" fill="#fbfdff"/>
  <rect x="0" y="300" width="840" height="240" fill="#edf9ee"/>
  <circle cx="96" cy="78" r="38" fill="#ffd75f"/>
  <ellipse cx="642" cy="86" rx="82" ry="30" fill="#ffffff"/>
  <ellipse cx="708" cy="102" rx="56" ry="22" fill="#ffffff"/>
  <ellipse cx="196" cy="132" rx="66" ry="24" fill="#ffffff"/>
  <path d="M90 430 C184 388 284 452 386 408 C522 350 628 430 752 382" fill="none" stroke="${accent}" stroke-width="11" stroke-linecap="round" opacity=".22"/>
  <g filter="url(#softShadow)">
    ${body}
  </g>
</svg>`;
}

function hero(body, scale = 1.34, centerX = 420, centerY = 300) {
  return `<g transform="translate(${centerX} ${centerY}) scale(${scale}) translate(${-centerX} ${-centerY})">${body}</g>`;
}

function personSvg(subject, action = "smiles", options = {}) {
  const skin = "#ffd1a8";
  const shirt = options.shirt ?? (subject.includes("girl") || subject.includes("sister") || subject.includes("mother") || subject.includes("grandma") ? "#ff9ac2" : "#53a8ff");
  const hair = subject.includes("baby") ? "#9b6a43" : subject.includes("grand") ? "#d8d8d8" : "#6a4328";
  const x = options.x ?? 420;
  const y = options.y ?? 140;
  const pose = {
    runs: [-88, 66, 88, 66, -44, 170, 54, 170],
    jumps: [-74, 54, 74, 54, -64, 170, 64, 170],
    dances: [-100, 44, 100, 44, -60, 170, 58, 166],
    swims: [-90, 82, 90, 82, -36, 156, 48, 158],
    claps: [-42, 70, 42, 70, -38, 164, 38, 164],
    waves: [-72, 72, 100, 34, -40, 164, 40, 164],
    walks: [-72, 76, 72, 74, -30, 166, 58, 170],
    sleeps: [-58, 76, 58, 76, -42, 166, 42, 166]
  }[action] ?? [-72, 76, 72, 76, -42, 166, 42, 166];

  const props = {
    reads: `<path d="M${x - 86} ${y + 112} h72 v58 h-72zM${x - 14} ${y + 112}h72v58h-72z" fill="#fff4b8" stroke="#315c8f" stroke-width="7"/>`,
    draws: `<rect x="${x - 84}" y="${y + 122}" width="168" height="74" rx="10" fill="#fff" stroke="#315c8f" stroke-width="7"/><path d="M${x - 48} ${y + 162} l72 -28" stroke="#ff6f61" stroke-width="8" stroke-linecap="round"/>`,
    sings: `<circle cx="${x + 116}" cy="${y + 40}" r="12" fill="#344050"/><path d="M${x + 128} ${y + 36}v-46h28" stroke="#344050" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    drinks: `<rect x="${x + 44}" y="${y + 86}" width="48" height="72" rx="12" fill="#7ed4ff" stroke="#315c8f" stroke-width="6" opacity=".9"/>`,
    eats: `<circle cx="${x + 76}" cy="${y + 124}" r="28" fill="#ff6f61"/><path d="M${x + 66} ${y + 96}q14-24 32-6" stroke="#65c783" stroke-width="7" fill="none"/>`,
    cooks: `<rect x="${x - 94}" y="${y + 142}" width="188" height="46" rx="18" fill="#d99b5f"/><circle cx="${x}" cy="${y + 138}" r="34" fill="#ffb25d"/>`,
    claps: `<circle cx="${x - 22}" cy="${y + 114}" r="19" fill="${skin}" stroke="#315c8f" stroke-width="5"/><circle cx="${x + 22}" cy="${y + 114}" r="19" fill="${skin}" stroke="#315c8f" stroke-width="5"/><path d="M${x - 70} ${y + 80}q-30 20-44 52M${x + 70} ${y + 80}q30 20 44 52" stroke="#ffd75f" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    waves: `<circle cx="${x + 108}" cy="${y + 26}" r="20" fill="${skin}" stroke="#315c8f" stroke-width="5"/><path d="M${x + 132} ${y - 16}q30-18 48 8M${x + 138} ${y + 20}q34 0 52 24" stroke="#ffd75f" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    jumps: `<path d="M${x - 92} ${y + 236}q92 34 184 0" stroke="#ffb25d" stroke-width="12" fill="none" stroke-linecap="round" opacity=".72"/><path d="M${x - 120} ${y + 264}q120 40 240 0" stroke="#ffb25d" stroke-width="8" fill="none" stroke-linecap="round" opacity=".45"/>`,
    runs: `<path d="M${x - 150} ${y + 170}h74M${x - 172} ${y + 206}h96" stroke="#7ed4ff" stroke-width="12" stroke-linecap="round" opacity=".8"/>`,
    walks: `<path d="M${x - 128} ${y + 238}q48 22 94 0M${x + 42} ${y + 238}q48 22 94 0" stroke="#ffb25d" stroke-width="8" fill="none" stroke-linecap="round" opacity=".62"/>`,
    dances: `<circle cx="${x - 112}" cy="${y + 52}" r="10" fill="#ffd75f"/><circle cx="${x + 124}" cy="${y + 62}" r="10" fill="#ffd75f"/><path d="M${x - 134} ${y + 86}q36 26 72 0M${x + 82} ${y + 96}q36 26 72 0" stroke="#ffd75f" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    sleeps: `<text x="${x + 88}" y="${y + 18}" font-size="54" font-family="Arial" fill="#315c8f" opacity=".7">Z</text>`
  }[action] ?? "";

  return `
    <g>
      <line x1="${x}" y1="${y + 108}" x2="${x + pose[0]}" y2="${y + pose[1]}" stroke="${shirt}" stroke-width="28" stroke-linecap="round"/>
      <line x1="${x}" y1="${y + 108}" x2="${x + pose[2]}" y2="${y + pose[3]}" stroke="${shirt}" stroke-width="28" stroke-linecap="round"/>
      <line x1="${x - 30}" y1="${y + 178}" x2="${x + pose[4]}" y2="${y + pose[5]}" stroke="#315c8f" stroke-width="30" stroke-linecap="round"/>
      <line x1="${x + 30}" y1="${y + 178}" x2="${x + pose[6]}" y2="${y + pose[7]}" stroke="#315c8f" stroke-width="30" stroke-linecap="round"/>
      <rect x="${x - 64}" y="${y + 74}" width="128" height="136" rx="40" fill="${shirt}"/>
      <circle cx="${x}" cy="${y + 34}" r="64" fill="${skin}"/>
      <path d="M${x - 60} ${y + 16}q58-74 122 0v-28q-64-54-124-2z" fill="${hair}"/>
      <circle cx="${x - 22}" cy="${y + 42}" r="8" fill="#273244"/>
      <circle cx="${x + 26}" cy="${y + 42}" r="8" fill="#273244"/>
      <path d="M${x - 24} ${y + 74}q26 22 54 0" stroke="#c56b55" stroke-width="8" fill="none" stroke-linecap="round"/>
      ${props}
    </g>`;
}

function animalSvg(animal, action = "sits", count = 1) {
  const colorMap = {
    cat: "#f3b35b",
    cats: "#f3b35b",
    dog: "#b47a4b",
    dogs: "#b47a4b",
    bird: "#65c783",
    birds: "#65c783",
    duck: "#ffd75f",
    ducks: "#ffd75f",
    rabbit: "#f6f6f6",
    rabbits: "#f6f6f6",
    fish: "#7ed4ff",
    panda: "#ffffff",
    pandas: "#ffffff",
    tiger: "#ff9a4a",
    tigers: "#ff9a4a",
    elephant: "#a8b7c7",
    elephants: "#a8b7c7",
    monkey: "#b47a4b",
    monkeys: "#b47a4b"
  };
  const base = animal.replace(/s$/, "");
  const fill = colorMap[animal] ?? "#f3b35b";
  const items = Array.from({ length: count }, (_, index) => {
    const x = count === 1 ? 420 : 180 + index * Math.min(140, 520 / Math.max(1, count - 1));
    const y = action.includes("fly") ? 210 + (index % 2) * 34 : action.includes("swim") ? 330 : 316 + (index % 2) * 12;
    const ears = base === "rabbit" ? `<ellipse cx="${x - 26}" cy="${y - 80}" rx="16" ry="48" fill="${fill}" stroke="#315c8f" stroke-width="5"/><ellipse cx="${x + 26}" cy="${y - 80}" rx="16" ry="48" fill="${fill}" stroke="#315c8f" stroke-width="5"/>` : "";
    const wings = base === "bird" ? `<path d="M${x - 58} ${y - 14}q-62-38-92 28M${x + 58} ${y - 14}q62-38 92 28" stroke="#315c8f" stroke-width="12" fill="none" stroke-linecap="round"/>` : "";
    const water = action.includes("swim") ? `<path d="M${x - 92} ${y + 50}q42-24 84 0t84 0" stroke="#53a8ff" stroke-width="13" fill="none" stroke-linecap="round"/>` : "";
    return `
      <g>
        ${water}${wings}${ears}
        <ellipse cx="${x}" cy="${y}" rx="88" ry="58" fill="${fill}" stroke="#315c8f" stroke-width="8"/>
        <circle cx="${x + 58}" cy="${y - 40}" r="46" fill="${fill}" stroke="#315c8f" stroke-width="8"/>
        <circle cx="${x + 66}" cy="${y - 48}" r="7" fill="#273244"/>
        <path d="M${x + 66} ${y - 24}q18 8 0 16" stroke="#c56b55" stroke-width="5" fill="none"/>
        <line x1="${x - 42}" y1="${y + 50}" x2="${x - 66}" y2="${y + 86}" stroke="#315c8f" stroke-width="12" stroke-linecap="round"/>
        <line x1="${x + 30}" y1="${y + 50}" x2="${x + 54}" y2="${y + 86}" stroke="#315c8f" stroke-width="12" stroke-linecap="round"/>
      </g>`;
  }).join("");
  return items;
}

function objectSvg(object, colorName) {
  const color = palette[colorName] ?? "#53a8ff";
  const shape = object.includes("ball") || object.includes("apple")
    ? `<circle cx="420" cy="292" r="112" fill="${color}" stroke="#315c8f" stroke-width="10"/>`
    : object.includes("kite")
      ? `<path d="M420 112 560 278 420 444 280 278z" fill="${color}" stroke="#315c8f" stroke-width="10"/><path d="M420 444q-24 64-82 70" stroke="#315c8f" stroke-width="7" fill="none"/>`
      : object.includes("book")
        ? `<path d="M240 188h180v184H240zM420 188h180v184H420z" fill="${color}" stroke="#315c8f" stroke-width="10"/>`
        : object.includes("hat")
          ? `<path d="M270 316h300q-18 74-150 74t-150-74zM334 244q86-96 172 0v84H334z" fill="${color}" stroke="#315c8f" stroke-width="10"/>`
          : `<rect x="282" y="188" width="276" height="206" rx="34" fill="${color}" stroke="#315c8f" stroke-width="10"/>`;
  return shape;
}

function toySvg(toy) {
  if (toy.includes("robot")) return `<rect x="330" y="182" width="180" height="190" rx="22" fill="#d8e7f5" stroke="#315c8f" stroke-width="9"/><circle cx="384" cy="250" r="14" fill="#53a8ff"/><circle cx="456" cy="250" r="14" fill="#53a8ff"/><rect x="372" y="308" width="96" height="28" rx="12" fill="#ff6f61"/>`;
  if (toy.includes("train")) return `<rect x="238" y="284" width="260" height="96" rx="18" fill="#53a8ff" stroke="#315c8f" stroke-width="9"/><rect x="498" y="236" width="92" height="144" rx="18" fill="#ff6f61" stroke="#315c8f" stroke-width="9"/><circle cx="310" cy="396" r="28" fill="#344050"/><circle cx="510" cy="396" r="28" fill="#344050"/>`;
  if (toy.includes("plane")) return `<path d="M210 294h420l-150 62v42l-86-42h-62l-86 42v-42z" fill="#53a8ff" stroke="#315c8f" stroke-width="9"/>`;
  if (toy.includes("doll") || toy.includes("bear")) return personSvg("baby", "smiles", { x: 420, y: 178, shirt: "#ffd75f" });
  if (toy.includes("kite")) return objectSvg("kite", "orange");
  if (toy.includes("ball")) return objectSvg("ball", "red");
  return `<rect x="300" y="220" width="240" height="180" rx="28" fill="#ffd75f" stroke="#315c8f" stroke-width="9"/><circle cx="420" cy="310" r="48" fill="#ff6f61"/>`;
}

function foodSvg(food) {
  const color = foodColors[food] ?? "#ffd75f";
  return `<ellipse cx="420" cy="366" rx="176" ry="54" fill="#ffffff" stroke="#315c8f" stroke-width="9"/>
  <circle cx="380" cy="324" r="44" fill="${color}" stroke="#315c8f" stroke-width="7"/>
  <circle cx="446" cy="312" r="38" fill="${color}" stroke="#315c8f" stroke-width="7"/>
  <circle cx="492" cy="344" r="34" fill="${color}" stroke="#315c8f" stroke-width="7"/>`;
}

function drawScene(sentence) {
  const normalized = normalizeSentence(sentence);
  const color = findWord(normalized, Object.keys(palette));
  const object = findWord(normalized, ["ball", "kite", "cup", "bag", "car", "box", "hat", "book", "pencil", "chair", "table", "door", "window", "bed", "bike", "shoe", "apple", "flower", "umbrella", "plate"]);
  const subject = findWord(normalized, ["boy", "girl", "father", "mother", "teacher", "baby", "brother", "sister", "grandma", "grandpa", "friend", "uncle", "aunt"]);
  const animal = findWord(normalized, ["cats", "dogs", "birds", "ducks", "rabbits", "fish", "monkeys", "pandas", "tigers", "elephants", "cat", "dog", "bird", "duck", "rabbit", "monkey", "panda", "tiger", "elephant"]);
  const action = findWord(normalized, ["runs", "run", "jumps", "jump", "reads", "draws", "sings", "dances", "swims", "swim", "sleeps", "sleep", "smiles", "claps", "waves", "cooks", "walks", "drinks", "eats", "sit", "sits", "fly"]);
  const food = findWord(normalized, Object.keys(foodColors));
  const toy = findWord(normalized, ["robot", "train", "plane", "doll", "car", "kite", "ball", "drum", "boat", "block", "bear", "hoop"]);
  const numberWord = findWord(normalized, ["two", "three", "four", "five"]);
  const count = { two: 2, three: 3, four: 4, five: 5 }[numberWord] ?? 1;

  let body;
  if (normalized.includes(" is ") && color && object) {
    body = hero(objectSvg(object, color), 1.18);
  } else if (animal) {
    body = hero(animalSvg(animal, action ?? "sits", count), count > 2 ? 1 : 1.2);
  } else if (normalized.includes(" has ") && subject && toy) {
    body = hero(`${personSvg(subject, "smiles", { x: 312 })}<g transform="translate(218 22) scale(.74)">${toySvg(toy)}</g>`, 1.08);
  } else if ((normalized.includes(" likes ") || normalized.includes(" eats ")) && food) {
    body = hero(`${personSvg(subject ?? "boy", "eats", { x: 292 })}<g transform="translate(226 34) scale(.84)">${foodSvg(food)}</g>`, 1.06);
  } else if (subject) {
    body = hero(personSvg(subject, action ?? "smiles"), 1.18);
  } else {
    body = hero(objectSvg(object ?? "ball", color ?? "blue"), 1.18);
  }

  return svgShell(body, palette[color] ?? "#53a8ff");
}

async function rasterizeSvg(svgPath, pngPath) {
  await run("sips", ["-s", "format", "png", svgPath, "--out", pngPath]);
}

let imageCount = 0;

for (const level of courseLevels.filter((item) => playableLevels.has(item.level))) {
  for (const question of level.questions) {
    const correctPath = resolve(root, question.correctImage.replace(/\.png$/, ".svg"));
    const wrongPath = resolve(root, question.wrongImage.replace(/\.png$/, ".svg"));
    const correctPngPath = resolve(root, question.correctImage);
    const wrongPngPath = resolve(root, question.wrongImage);
    await mkdir(dirname(correctPath), { recursive: true });

    await writeFile(correctPath, drawScene(question.sentence));
    await writeFile(wrongPath, drawScene(question.wrongSentence));
    await rasterizeSvg(correctPath, correctPngPath);
    await rasterizeSvg(wrongPath, wrongPngPath);
    imageCount += 2;
  }
}

console.log(`Generated ${imageCount} SVG source images and ${imageCount} PNG images for Levels 2-5.`);
