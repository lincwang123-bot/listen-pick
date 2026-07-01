import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

const run = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const poolPath = resolve(root, "docs/textbook-image-scene-pool-101-300.json");
const svgDir = resolve(root, "assets/textbook/images/stage3-scenes-svg");
const args = process.argv.slice(2);
const force = args.includes("--force");
const allowPlaceholder = args.includes("--placeholder-ok");
const limit = Number(readOption("--limit") ?? 0);
const pool = JSON.parse(await readFile(poolPath, "utf8"));

if (!allowPlaceholder) {
  throw new Error(
    [
      "This script creates simplified semantic placeholder images only.",
      "It must not be used for final production lesson illustrations.",
      "Final assets must match the polished Level 1-100 picture-card quality.",
      "If you intentionally need temporary review placeholders, rerun with --placeholder-ok."
    ].join(" ")
  );
}

const colors = {
  red: "#ff6b62",
  blue: "#4aa8ff",
  yellow: "#ffd75a",
  green: "#64c985",
  black: "#354258",
  white: "#ffffff",
  pink: "#ff9bc2",
  orange: "#ffa24a",
  purple: "#9b7bff"
};

const numberWords = {
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6
};

const shirtColors = {
  boy: "#47a7f5",
  girl: "#ff9bc2",
  child: "#72c889",
  mother: "#ff9bc2",
  father: "#4aa8ff",
  sister: "#ffb05e",
  brother: "#64c985"
};

let generated = 0;
let skipped = 0;
const scenes = limit > 0 ? pool.scenes.slice(0, limit) : pool.scenes;

await mkdir(svgDir, { recursive: true });

for (const scene of scenes) {
  const pngPath = resolve(root, scene.output);
  const svgPath = resolve(svgDir, `${scene.id}.svg`);
  if (!force && existsSync(pngPath)) {
    skipped += 1;
    continue;
  }

  await mkdir(dirname(pngPath), { recursive: true });
  await writeFile(svgPath, drawScene(scene.sentence), "utf8");
  await rasterize(svgPath, pngPath);
  generated += 1;

  if (generated % 50 === 0) {
    console.log(`Generated ${generated}/${scenes.length} scene images...`);
  }
}

console.log(`Stage 3-6 SVG images complete. generated=${generated} skipped=${skipped}`);

function readOption(name) {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);

  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  return null;
}

async function rasterize(svgPath, pngPath) {
  await run("sips", ["-s", "format", "png", svgPath, "--out", pngPath]);
}

function drawScene(sentence) {
  const parsed = parseSentence(sentence);
  const background = drawBackground(parsed.scene);
  let body = "";

  if (parsed.type === "count") {
    body = drawCount(parsed.object, parsed.count);
  } else if (parsed.type === "color") {
    body = drawSingleObject(parsed.object, 420, 330, 2.3, colors[parsed.color] ?? colors.blue, {
      variant: "hero"
    });
  } else if (parsed.type === "position") {
    body = drawPosition(parsed.subjectObject, parsed.position, parsed.place);
  } else if (parsed.type === "action") {
    body = drawPersonAction(parsed.subject, parsed.action, {
      object: parsed.object,
      scene: parsed.scene
    });
  } else {
    body = drawSingleObject("ball", 420, 330, 2.3, colors.blue);
  }

  return svgShell(`${background}${body}`, parsed);
}

function parseSentence(sentence) {
  const cleaned = sentence.trim().replace(/\.$/, "");

  let match = cleaned.match(/^There are (two|three|four|five|six) ([a-z]+)$/i);
  if (match) {
    return {
      type: "count",
      count: numberWords[match[1].toLowerCase()],
      object: singularize(match[2])
    };
  }

  match = cleaned.match(/^The (ball|book|toy|apple|bag|hat) is (red|blue|yellow|green|black|white|pink|orange)$/i);
  if (match) {
    return {
      type: "color",
      object: match[1].toLowerCase(),
      color: match[2].toLowerCase()
    };
  }

  match = cleaned.match(/^The (ball|book|toy|apple|bag|hat) is (in|on|under|behind|next to) the (box|bag)$/i);
  if (match) {
    return {
      type: "position",
      subjectObject: match[1].toLowerCase(),
      position: match[2].toLowerCase(),
      place: match[3].toLowerCase()
    };
  }

  match = cleaned.match(/^My (mother|father|sister|brother) is ([a-z]+ing)$/i);
  if (match) {
    return {
      type: "action",
      subject: match[1].toLowerCase(),
      action: match[2].toLowerCase()
    };
  }

  match = cleaned.match(/^The (boy|girl|child) is ([a-z]+ing)(?: (.+))?$/i);
  if (match) {
    const tail = match[3]?.toLowerCase() ?? "";
    const scene = ["at school", "at home", "in the park"].includes(tail) ? tail : "";
    const object = scene ? "" : normalizeObject(tail);
    return {
      type: "action",
      subject: match[1].toLowerCase(),
      action: match[2].toLowerCase(),
      object,
      scene
    };
  }

  return { type: "fallback" };
}

function normalizeObject(value) {
  return value
    .replace(/^with /, "")
    .replace(/^an /, "")
    .replace(/^a /, "")
    .trim();
}

function singularize(value) {
  if (value.endsWith("ies")) return `${value.slice(0, -3)}y`;
  if (value.endsWith("s")) return value.slice(0, -1);
  return value;
}

function svgShell(body, parsed) {
  const accent = parsed.type === "color" ? colors[parsed.color] : "#4aa8ff";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="840" height="630" viewBox="0 0 840 630">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#23405d" flood-opacity=".14"/>
    </filter>
    <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#f9fdff"/>
      <stop offset="1" stop-color="#f0f8ff"/>
    </linearGradient>
  </defs>
  <rect width="840" height="630" rx="34" fill="url(#sky)"/>
  <rect x="0" y="420" width="840" height="210" fill="#eef9ef"/>
  <circle cx="110" cy="96" r="42" fill="#ffd75a"/>
  <ellipse cx="640" cy="96" rx="78" ry="28" fill="#fff"/>
  <ellipse cx="700" cy="112" rx="54" ry="22" fill="#fff"/>
  <path d="M92 524 C190 478 292 548 400 500 C538 440 642 526 754 474" fill="none" stroke="${accent}" stroke-width="12" stroke-linecap="round" opacity=".2"/>
  <g filter="url(#shadow)">
    ${body}
  </g>
</svg>`;
}

function drawBackground(scene = "") {
  if (scene === "at school") {
    return `
      <rect x="84" y="108" width="270" height="150" rx="20" fill="#dff1ff" stroke="#9bcff4" stroke-width="6"/>
      <rect x="112" y="138" width="214" height="82" rx="10" fill="#7fcf9a" opacity=".85"/>
      <rect x="512" y="126" width="160" height="160" rx="18" fill="#fff3d7" stroke="#e4bd7b" stroke-width="6"/>
      <circle cx="552" cy="176" r="22" fill="#ffd75a"/>
      <rect x="594" y="170" width="42" height="78" rx="10" fill="#ffb05e"/>
    `;
  }

  if (scene === "at home") {
    return `
      <rect x="92" y="286" width="218" height="112" rx="28" fill="#ffd1dc" stroke="#e8aabb" stroke-width="6"/>
      <rect x="552" y="112" width="160" height="142" rx="16" fill="#dff1ff" stroke="#9bcff4" stroke-width="6"/>
      <rect x="604" y="252" width="58" height="96" rx="18" fill="#d59b5f"/>
      <path d="M634 252q-62 20-68-48q56 4 68 48zM636 252q62 20 68-48q-56 4-68 48z" fill="#72c889"/>
    `;
  }

  if (scene === "in the park") {
    return `
      <rect x="0" y="378" width="840" height="252" fill="#dff4df"/>
      <rect x="144" y="276" width="36" height="154" rx="14" fill="#b57a4d"/>
      <circle cx="116" cy="252" r="58" fill="#79c879"/>
      <circle cx="176" cy="218" r="72" fill="#64bd73"/>
      <circle cx="236" cy="260" r="58" fill="#84d18a"/>
      <path d="M590 420q64-56 126 0" stroke="#d59b5f" stroke-width="18" fill="none" stroke-linecap="round"/>
    `;
  }

  return "";
}

function drawPersonAction(subject, action, options = {}) {
  const x = options.scene ? 406 : 420;
  const y = action === "swimming" ? 232 : action === "sleeping" ? 270 : 250;
  const base = drawPerson(subject, action, x, y, 1.35);
  const prop = drawActionProp(action, options.object, x, y);
  return `${base}${prop}`;
}

function drawPerson(subject, action, x, y, scale = 1) {
  const isAdult = ["mother", "father"].includes(subject);
  const isOlderChild = ["sister", "brother"].includes(subject);
  const shirt = shirtColors[subject] ?? shirtColors.child;
  const pants = isAdult ? "#5a6f8f" : "#315c8f";
  const skin = "#ffd0a8";
  const hair = subject === "father" || subject === "brother" || subject === "boy" ? "#5b351f" : "#7b4328";
  const skirt = subject === "girl" || subject === "sister" || subject === "mother";
  const h = isAdult ? 1.18 : isOlderChild ? 1.08 : 1;
  const pose = poseForAction(action);

  return `
    <g transform="translate(${x} ${y}) scale(${scale * h})">
      ${action === "swimming" ? `<path d="M-170 170q80-46 160 0t160 0" stroke="#63c6ff" stroke-width="28" fill="none" stroke-linecap="round" opacity=".82"/>` : ""}
      ${action === "sleeping" ? `<rect x="-180" y="124" width="360" height="84" rx="30" fill="#dff1ff" stroke="#9bcff4" stroke-width="7"/><text x="118" y="-70" font-family="Arial" font-size="60" fill="#315c8f" opacity=".55">Z</text>` : ""}
      <line x1="-34" y1="98" x2="${pose.legL[0]}" y2="${pose.legL[1]}" stroke="${pants}" stroke-width="28" stroke-linecap="round"/>
      <line x1="34" y1="98" x2="${pose.legR[0]}" y2="${pose.legR[1]}" stroke="${pants}" stroke-width="28" stroke-linecap="round"/>
      <line x1="-48" y1="10" x2="${pose.armL[0]}" y2="${pose.armL[1]}" stroke="${shirt}" stroke-width="24" stroke-linecap="round"/>
      <line x1="48" y1="10" x2="${pose.armR[0]}" y2="${pose.armR[1]}" stroke="${shirt}" stroke-width="24" stroke-linecap="round"/>
      <circle cx="${pose.armL[0]}" cy="${pose.armL[1]}" r="13" fill="${skin}"/>
      <circle cx="${pose.armR[0]}" cy="${pose.armR[1]}" r="13" fill="${skin}"/>
      <rect x="-62" y="-4" width="124" height="126" rx="36" fill="${shirt}"/>
      ${skirt ? `<path d="M-58 100h116l42 86h-200z" fill="${shirt}"/>` : ""}
      <circle cx="0" cy="-64" r="62" fill="${skin}"/>
      <path d="M-58-76q58-74 120 4v-28q-62-54-126-2z" fill="${hair}"/>
      ${subject === "girl" || subject === "sister" ? `<circle cx="48" cy="-118" r="18" fill="#ff6b8b"/><circle cx="72" cy="-118" r="18" fill="#ff6b8b"/>` : ""}
      <circle cx="-22" cy="-56" r="8" fill="#263244"/>
      <circle cx="24" cy="-56" r="8" fill="#263244"/>
      ${mouthForAction(action)}
      ${action === "running" ? `<path d="M-190 72h74M-210 108h100" stroke="#82d5ff" stroke-width="12" stroke-linecap="round" opacity=".75"/>` : ""}
      ${action === "jumping" ? `<path d="M-120 214q120 38 240 0" stroke="#ffb05e" stroke-width="12" fill="none" stroke-linecap="round" opacity=".65"/>` : ""}
      ${action === "dancing" ? `<circle cx="-122" cy="-24" r="11" fill="#ffd75a"/><circle cx="134" cy="-14" r="11" fill="#ffd75a"/><path d="M-152 18q38 24 74 0M92 28q38 24 74 0" stroke="#ffd75a" stroke-width="8" fill="none" stroke-linecap="round"/>` : ""}
      ${action === "singing" ? `<path d="M122-106v-42h28M150-148v48" stroke="#315c8f" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="122" cy="-104" r="11" fill="#315c8f"/><circle cx="150" cy="-100" r="11" fill="#315c8f"/>` : ""}
      ${action === "clapping" ? `<circle cx="-24" cy="38" r="18" fill="${skin}" stroke="#315c8f" stroke-width="5"/><circle cx="24" cy="38" r="18" fill="${skin}" stroke="#315c8f" stroke-width="5"/>` : ""}
    </g>`;
}

function poseForAction(action) {
  const base = {
    armL: [-90, 54],
    armR: [90, 54],
    legL: [-50, 190],
    legR: [50, 190]
  };
  return {
    running: { armL: [-104, 18], armR: [92, 72], legL: [-112, 166], legR: [108, 184] },
    walking: { armL: [-96, 56], armR: [96, 58], legL: [-62, 190], legR: [86, 184] },
    jumping: { armL: [-104, -44], armR: [104, -44], legL: [-82, 174], legR: [82, 174] },
    dancing: { armL: [-110, -18], armR: [118, 12], legL: [-78, 184], legR: [74, 172] },
    reading: { armL: [-74, 78], armR: [74, 78], legL: [-58, 188], legR: [58, 188] },
    writing: { armL: [-78, 82], armR: [80, 86], legL: [-58, 188], legR: [58, 188] },
    drawing: { armL: [-78, 82], armR: [80, 86], legL: [-58, 188], legR: [58, 188] },
    painting: { armL: [-80, 78], armR: [94, 58], legL: [-58, 188], legR: [58, 188] },
    eating: { armL: [-82, 70], armR: [74, 36], legL: [-58, 188], legR: [58, 188] },
    drinking: { armL: [-82, 70], armR: [60, 22], legL: [-58, 188], legR: [58, 188] },
    sleeping: { armL: [-92, 44], armR: [92, 44], legL: [-74, 168], legR: [74, 168] },
    sitting: { armL: [-78, 62], armR: [78, 62], legL: [-92, 154], legR: [92, 154] },
    standing: base,
    smiling: base,
    laughing: base,
    singing: { armL: [-88, 44], armR: [100, 28], legL: [-50, 190], legR: [50, 190] },
    clapping: { armL: [-42, 36], armR: [42, 36], legL: [-50, 190], legR: [50, 190] },
    waving: { armL: [-88, 50], armR: [108, -56], legL: [-50, 190], legR: [50, 190] },
    swimming: { armL: [-108, 46], armR: [108, 46], legL: [-74, 150], legR: [74, 150] },
    holding: { armL: [-78, 72], armR: [78, 72], legL: [-50, 190], legR: [50, 190] },
    opening: { armL: [-92, 80], armR: [96, 82], legL: [-52, 190], legR: [52, 190] },
    closing: { armL: [-92, 80], armR: [96, 82], legL: [-52, 190], legR: [52, 190] },
    kicking: { armL: [-94, 42], armR: [88, 48], legL: [-62, 188], legR: [128, 152] },
    carrying: { armL: [-96, 70], armR: [96, 70], legL: [-64, 190], legR: [70, 190] },
    flying: { armL: [-92, 42], armR: [112, 6], legL: [-52, 190], legR: [52, 190] },
    folding: { armL: [-82, 88], armR: [82, 88], legL: [-58, 188], legR: [58, 188] },
    using: { armL: [-82, 72], armR: [86, 54], legL: [-58, 188], legR: [58, 188] },
    cleaning: { armL: [-92, 82], armR: [102, 80], legL: [-58, 188], legR: [58, 188] },
    watering: { armL: [-82, 72], armR: [102, 44], legL: [-58, 188], legR: [58, 188] },
    playing: { armL: [-92, 44], armR: [92, 44], legL: [-52, 190], legR: [52, 190] },
    cooking: { armL: [-86, 74], armR: [86, 74], legL: [-52, 190], legR: [52, 190] }
  }[action] ?? base;
}

function mouthForAction(action) {
  if (action === "laughing" || action === "singing") {
    return `<ellipse cx="2" cy="-22" rx="22" ry="16" fill="#c55a4a"/>`;
  }

  if (action === "sleeping") {
    return `<path d="M-16-24q18 12 36 0" stroke="#c55a4a" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  }

  return `<path d="M-24-24q26 24 54 0" stroke="#c55a4a" stroke-width="8" fill="none" stroke-linecap="round"/>`;
}

function drawActionProp(action, object, x, y) {
  const item = object || defaultObjectForAction(action);
  if (!item && !["cooking", "sleeping", "swimming"].includes(action)) return "";

  if (action === "reading") {
    return `<g transform="translate(${x} ${y + 98}) scale(1.32)">${drawBook(0, 0, "#fff3b0", true)}</g>`;
  }

  if (action === "writing" || action === "drawing" || action === "painting") {
    const drawn = item === "flower" ? drawSingleObject("flower", 58, -4, .62, colors.pink) : item === "house" ? drawSingleObject("house", 58, -4, .5, colors.orange) : "";
    const brush = action === "painting" ? "#ff6b62" : "#315c8f";
    return `
      <g transform="translate(${x - 104} ${y + 116})">
        <rect x="0" y="0" width="214" height="86" rx="14" fill="#fff" stroke="#315c8f" stroke-width="7"/>
        <path d="M118 54l58-26" stroke="${brush}" stroke-width="8" stroke-linecap="round"/>
        ${drawn}
      </g>`;
  }

  if (action === "eating") {
    return `<g transform="translate(${x + 112} ${y + 52})">${drawSingleObject(item || "apple", 0, 0, .72, objectColor(item || "apple"))}</g>`;
  }

  if (action === "drinking") {
    return `<g transform="translate(${x + 98} ${y + 30})">${drawSingleObject(item || "water", 0, 0, .74, item === "milk" ? colors.white : "#7ed7ff")}</g>`;
  }

  if (action === "holding" || action === "playing") {
    return `<g transform="translate(${x} ${y + 84})">${drawSingleObject(item || "ball", 0, 0, 1.02, objectColor(item || "ball"))}</g>`;
  }

  if (action === "opening" || action === "closing") {
    return `<g transform="translate(${x} ${y + 168})">${drawSingleObject(item || "box", 0, 0, 1.08, objectColor(item || "box"), { open: action === "opening" })}</g>`;
  }

  if (action === "kicking") {
    return `<g transform="translate(${x + 170} ${y + 190})">${drawSingleObject(item || "ball", 0, 0, .9, objectColor(item || "ball"))}</g>`;
  }

  if (action === "carrying") {
    return `<g transform="translate(${x + 116} ${y + 112})">${drawSingleObject(item || "bag", 0, 0, .82, objectColor(item || "bag"))}</g>`;
  }

  if (action === "flying") {
    return `<g transform="translate(${x + 160} ${y - 96})">${drawSingleObject(item || "kite", 0, 0, .82, objectColor(item || "kite"))}</g><path d="M${x + 78} ${y + 8}q70-76 118-100" stroke="#315c8f" stroke-width="5" fill="none" opacity=".64"/>`;
  }

  if (action === "folding") {
    return `<g transform="translate(${x} ${y + 130})">${drawSingleObject(item || "towel", 0, 0, .95, objectColor(item || "towel"), { folded: true })}</g>`;
  }

  if (action === "using") {
    return `<g transform="translate(${x + 112} ${y + 62})">${drawSingleObject(item || "spoon", 0, 0, .82, objectColor(item || "spoon"))}</g>`;
  }

  if (action === "cleaning") {
    const furniture = item === "desk" ? "desk" : "table";
    return `<g transform="translate(${x} ${y + 178})">${drawSingleObject(furniture, 0, 0, 1.12, objectColor(furniture))}</g><rect x="${x + 44}" y="${y + 132}" width="70" height="34" rx="12" fill="#ff9bc2" stroke="#315c8f" stroke-width="5" transform="rotate(-10 ${x + 78} ${y + 149})"/>`;
  }

  if (action === "watering") {
    const plant = item === "flower" ? "flower" : "plant";
    return `<g transform="translate(${x + 170} ${y + 150})">${drawSingleObject(plant, 0, 0, 1, objectColor(plant))}</g><path d="M${x + 96} ${y + 82}q62 10 96 54" stroke="#7ed7ff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/><path d="M${x + 70} ${y + 72}h58q8 42-30 60q-36-18-28-60z" fill="#8fd6ff" stroke="#315c8f" stroke-width="6"/>`;
  }

  if (action === "cooking") {
    return `<g transform="translate(${x} ${y + 166})">${drawSingleObject("table", 0, 0, 1.05, objectColor("table"))}<ellipse cx="0" cy="-48" rx="78" ry="30" fill="#ffb05e" stroke="#315c8f" stroke-width="6"/><path d="M-42-76q42-24 84 0" stroke="#fff" stroke-width="8" fill="none" opacity=".8"/></g>`;
  }

  return "";
}

function defaultObjectForAction(action) {
  return {
    reading: "book",
    drawing: "flower",
    eating: "apple",
    drinking: "water",
    holding: "ball",
    opening: "box",
    closing: "book",
    kicking: "ball",
    carrying: "bag",
    flying: "kite",
    folding: "towel",
    using: "spoon",
    cleaning: "table",
    watering: "plant",
    playing: "toy"
  }[action] ?? "";
}

function drawPosition(subjectObject, position, place) {
  const placeColor = place === "bag" ? "#ffb05e" : "#ffd75a";
  const objectColorValue = subjectObject === place ? "#4aa8ff" : objectColor(subjectObject);
  const placeLarge = (x, y, scale = 1.35) => drawSingleObject(place, x, y, scale, placeColor, { open: true, variant: "place" });
  const item = (x, y, scale = 1) => drawSingleObject(subjectObject, x, y, scale, objectColorValue);

  if (position === "in") {
    return `${placeLarge(420, 350, 1.82)}${item(420, 322, .92)}`;
  }

  if (position === "on") {
    return `${placeLarge(420, 390, 1.65)}${item(420, 224, .92)}`;
  }

  if (position === "under") {
    return `${placeLarge(420, 284, 1.58)}${item(420, 500, .92)}`;
  }

  if (position === "behind") {
    return `${item(420, 306, 1.02)}${placeLarge(420, 372, 1.72)}`;
  }

  return `${item(300, 362, 1.05)}${placeLarge(528, 362, 1.48)}`;
}

function drawCount(object, count) {
  const positions = countPositions(count);
  return positions.map(([x, y], index) => {
    const color = cycleColor(index, object);
    return drawSingleObject(object, x, y, count <= 3 ? 1.12 : .94, color);
  }).join("");
}

function countPositions(count) {
  if (count === 2) return [[340, 338], [500, 338]];
  if (count === 3) return [[276, 338], [420, 300], [564, 338]];
  if (count === 4) return [[314, 276], [526, 276], [314, 428], [526, 428]];
  if (count === 5) return [[250, 278], [420, 278], [590, 278], [334, 432], [506, 432]];
  return [[240, 278], [420, 278], [600, 278], [240, 432], [420, 432], [600, 432]];
}

function cycleColor(index, object) {
  if (object === "apple") return colors.red;
  const sequence = [colors.blue, colors.green, colors.yellow, colors.orange, colors.pink, colors.purple];
  return sequence[index % sequence.length];
}

function objectColor(object) {
  return {
    ball: colors.red,
    book: colors.blue,
    card: "#fff2b8",
    toy: colors.yellow,
    apple: colors.red,
    banana: colors.yellow,
    bag: colors.orange,
    basket: "#d19a5d",
    hat: colors.green,
    box: colors.yellow,
    flower: colors.pink,
    plant: colors.green,
    house: colors.orange,
    water: "#7ed7ff",
    milk: colors.white,
    cup: colors.blue,
    spoon: "#c7d1dc",
    table: "#d59b5f",
    desk: "#cf8f55",
    towel: colors.blue,
    shirt: colors.green,
    beanbag: colors.purple,
    kite: colors.orange,
    "paper plane": colors.white
  }[object] ?? colors.blue;
}

function drawSingleObject(object, x, y, scale = 1, color = colors.blue, options = {}) {
  const name = normalizeObject(object);
  const shape = drawObjectShape(name, color, options);
  return `<g transform="translate(${x} ${y}) scale(${scale})">${shape}</g>`;
}

function drawObjectShape(object, color, options = {}) {
  if (object === "ball") {
    return `<circle cx="0" cy="0" r="52" fill="${color}" stroke="#315c8f" stroke-width="7"/><path d="M-36-24q36 24 72 0M-36 24q36-24 72 0" stroke="#ffffff" stroke-width="6" fill="none" opacity=".7"/>`;
  }

  if (object === "book") {
    return drawBook(0, 0, color, options.open);
  }

  if (object === "card") {
    return `<rect x="-58" y="-42" width="116" height="84" rx="10" fill="${color}" stroke="#315c8f" stroke-width="7"/><circle cx="0" cy="0" r="22" fill="#ff9bc2"/>`;
  }

  if (object === "toy") {
    return `<rect x="-62" y="-54" width="124" height="108" rx="20" fill="${color}" stroke="#315c8f" stroke-width="7"/><circle cx="-24" cy="-10" r="16" fill="#ff6b62"/><circle cx="24" cy="-10" r="16" fill="#64c985"/><rect x="-34" y="20" width="68" height="18" rx="8" fill="#4aa8ff"/>`;
  }

  if (object === "apple") {
    return `<circle cx="0" cy="6" r="48" fill="${color}" stroke="#315c8f" stroke-width="7"/><path d="M-6-42q16-34 42-16" stroke="#64c985" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M4-40q-4-22 14-36" stroke="#8b5a32" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  }

  if (object === "banana") {
    return `<path d="M-72-8q62 72 146 16q-76 94-166 18q-14-18 20-34z" fill="${color}" stroke="#315c8f" stroke-width="7"/>`;
  }

  if (object === "bag") {
    return `<path d="M-42-48q0-46 42-46t42 46" fill="none" stroke="#315c8f" stroke-width="10"/><rect x="-72" y="-48" width="144" height="124" rx="26" fill="${color}" stroke="#315c8f" stroke-width="7"/><rect x="-42" y="-2" width="84" height="46" rx="14" fill="#ffffff" opacity=".28"/>`;
  }

  if (object === "basket") {
    return `<path d="M-72-20h144l-20 88h-104z" fill="${color}" stroke="#315c8f" stroke-width="7"/><path d="M-42-22q42-74 84 0" stroke="#315c8f" stroke-width="8" fill="none"/><path d="M-48 14h96M-56 42h112" stroke="#fff" stroke-width="5" opacity=".5"/>`;
  }

  if (object === "hat") {
    return `<path d="M-84 32h168q-12 44-84 44t-84-44zM-48-10q48-70 96 0v50h-96z" fill="${color}" stroke="#315c8f" stroke-width="7"/>`;
  }

  if (object === "box") {
    const lid = options.open
      ? `<path d="M-76-46h152l-34-50h-152z" fill="#ffe899" stroke="#315c8f" stroke-width="7"/>`
      : `<rect x="-84" y="-78" width="168" height="44" rx="12" fill="#ffe899" stroke="#315c8f" stroke-width="7"/>`;
    return `${lid}<rect x="-84" y="-38" width="168" height="122" rx="18" fill="${color}" stroke="#315c8f" stroke-width="7"/><path d="M0-38v122M-84 6h168" stroke="#e2a94e" stroke-width="6" opacity=".65"/>`;
  }

  if (object === "flower") {
    return `<path d="M0 42v-70" stroke="#64c985" stroke-width="9" stroke-linecap="round"/><path d="M0 12q-34-10-50 20M0 22q36-10 52 20" stroke="#64c985" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="0" cy="-44" r="16" fill="#ffd75a"/><circle cx="-26" cy="-48" r="22" fill="${color}"/><circle cx="26" cy="-48" r="22" fill="${color}"/><circle cx="0" cy="-76" r="22" fill="${color}"/><circle cx="0" cy="-20" r="22" fill="${color}"/>`;
  }

  if (object === "plant") {
    return `<rect x="-42" y="28" width="84" height="48" rx="14" fill="#d59b5f" stroke="#315c8f" stroke-width="7"/><path d="M0 28v-84M0-18q-60-22-72 36M0-30q58-36 86 18M0-56q-42-58-84-16M0-66q42-54 84-12" stroke="${color}" stroke-width="13" fill="none" stroke-linecap="round"/>`;
  }

  if (object === "house") {
    return `<path d="M-74-10 0-82 74-10z" fill="${color}" stroke="#315c8f" stroke-width="7"/><rect x="-56" y="-10" width="112" height="86" rx="10" fill="#fff2b8" stroke="#315c8f" stroke-width="7"/><rect x="-14" y="24" width="28" height="52" rx="6" fill="#d59b5f"/>`;
  }

  if (object === "water" || object === "milk" || object === "cup") {
    const fill = object === "milk" ? "#ffffff" : color;
    return `<path d="M-44-70h88l-10 138h-68z" fill="${fill}" stroke="#315c8f" stroke-width="7"/><path d="M-30-28h60" stroke="#ffffff" stroke-width="8" opacity=".7"/><path d="M46-28q44 12 18 58q-18 28-42 10" stroke="#315c8f" stroke-width="7" fill="none"/>`;
  }

  if (object === "spoon") {
    return `<ellipse cx="-16" cy="-50" rx="24" ry="34" fill="${color}" stroke="#315c8f" stroke-width="7"/><rect x="-6" y="-20" width="12" height="114" rx="6" fill="${color}" stroke="#315c8f" stroke-width="5"/>`;
  }

  if (object === "table" || object === "desk") {
    return `<rect x="-130" y="-52" width="260" height="58" rx="12" fill="${color}" stroke="#315c8f" stroke-width="7"/><rect x="-106" y="-2" width="28" height="120" rx="10" fill="#b97845"/><rect x="78" y="-2" width="28" height="120" rx="10" fill="#b97845"/>`;
  }

  if (object === "towel") {
    return `<rect x="-82" y="-44" width="164" height="88" rx="18" fill="${color}" stroke="#315c8f" stroke-width="7"/><path d="M-44-8h88M-44 20h88" stroke="#ffffff" stroke-width="6" opacity=".55"/>`;
  }

  if (object === "shirt") {
    return `<path d="M-58-48-112 0l42 44 30-22v94h80V22l30 22 42-44-54-48z" fill="${color}" stroke="#315c8f" stroke-width="7"/>`;
  }

  if (object === "beanbag") {
    return `<ellipse cx="0" cy="20" rx="72" ry="54" fill="${color}" stroke="#315c8f" stroke-width="7"/><path d="M-44-4q44 28 88 0" stroke="#fff" stroke-width="6" opacity=".48" fill="none"/>`;
  }

  if (object === "kite") {
    return `<path d="M0-96 80 0 0 96-80 0z" fill="${color}" stroke="#315c8f" stroke-width="7"/><path d="M-80 0h160M0-96v192" stroke="#ffffff" stroke-width="5" opacity=".65"/><path d="M0 96q-18 58-72 86" stroke="#315c8f" stroke-width="5" fill="none"/>`;
  }

  if (object === "paper plane") {
    return `<path d="M-100-12 102-72 38 78 4 20-54 58z" fill="${color}" stroke="#315c8f" stroke-width="7"/><path d="M4 20 102-72" stroke="#c6d6e6" stroke-width="5"/>`;
  }

  return `<rect x="-70" y="-54" width="140" height="108" rx="22" fill="${color}" stroke="#315c8f" stroke-width="7"/>`;
}

function drawBook(x, y, color, open = false) {
  if (open) {
    return `<path d="M${x - 76} ${y - 52}h76v112h-76q-16-32 0-112zM${x} ${y - 52}h76q16 80 0 112h-76z" fill="${color}" stroke="#315c8f" stroke-width="7"/><path d="M${x} ${y - 52}v112" stroke="#315c8f" stroke-width="5"/>`;
  }

  return `<rect x="${x - 64}" y="${y - 52}" width="128" height="104" rx="14" fill="${color}" stroke="#315c8f" stroke-width="7"/><rect x="${x - 46}" y="${y - 22}" width="92" height="14" rx="7" fill="#ffffff" opacity=".44"/>`;
}
