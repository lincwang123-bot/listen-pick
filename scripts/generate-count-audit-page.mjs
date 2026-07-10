import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { PNG } from "pngjs";

import { availableTextbookLevels } from "../src/course/textbook-playable.generated.mjs";
import { toChineseHint } from "../src/hints.mjs";

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

function numericTokens(sentence) {
  return [...sentence.toLowerCase().matchAll(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/g)]
    .map((match) => numberWords.get(match[1]));
}

const records = [];
for (const level of availableTextbookLevels) {
  for (const [questionIndex, question] of level.questions.entries()) {
    const choices = [
      ["correct", question.sentence, question.correctImage],
      ["wrong", question.wrongSentence, question.wrongImage]
    ];
    const correctCounts = numericTokens(question.sentence);
    const wrongCounts = numericTokens(question.wrongSentence);
    if (correctCounts.length === 0 && wrongCounts.length === 0) continue;

    for (const [role, sentence, file] of choices) {
      const bytes = await readFile(file);
      records.push({
        level: level.level,
        question: questionIndex + 1,
        role,
        sentence,
        chinese: toChineseHint(sentence),
        file,
        counts: numericTokens(sentence),
        hash: createHash("sha256").update(bytes).digest("hex")
      });
    }
  }
}

const uniqueRecords = [...new Map(records.map((record) => [record.hash, record])).values()]
  .sort((a, b) => a.level - b.level || a.question - b.question || a.role.localeCompare(b.role));

const excludeArgument = process.argv.find((argument) => argument.startsWith("--exclude="));
const excludedRecords = excludeArgument
  ? JSON.parse(await readFile(excludeArgument.slice("--exclude=".length), "utf8"))
  : [];
const excludedHashes = new Set(excludedRecords.map((record) => record.hash));
const auditRecords = uniqueRecords.filter((record) => !excludedHashes.has(record.hash));
const outputName = excludeArgument ? "count-audit-extra" : "count-audit";

await mkdir("tmp", { recursive: true });
await writeFile(`tmp/${outputName}-records.json`, `${JSON.stringify(auditRecords, null, 2)}\n`);
await writeFile(`tmp/${outputName}.html`, `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Count image audit</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 14px; color: #172554; background: #eef6ff; font: 15px/1.3 Arial, sans-serif; }
  header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
  h1 { margin: 0; font-size: 24px; }
  #grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
  article { min-width: 0; overflow: hidden; border: 2px solid #93c5fd; background: white; }
  .meta { padding: 6px 8px; color: white; background: #1d4ed8; font-weight: 700; }
  img { display: block; width: 100%; height: 190px; object-fit: contain; background: #f8fafc; }
  .text { padding: 6px 8px 8px; }
  .en { min-height: 38px; font-weight: 700; }
  .zh { color: #475569; }
  @media (max-width: 900px) { #grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
</head>
<body>
<header><h1>全关卡数字题图片核验</h1><strong id="pageInfo"></strong></header>
<main id="grid"></main>
<script type="module">
const records = await fetch("./${outputName}-records.json").then((response) => response.json());
const perPage = 16;
const requestedPage = Number.parseInt(new URL(location.href).searchParams.get("page") || "1", 10);
const totalPages = Math.ceil(records.length / perPage);
const page = Math.min(Math.max(requestedPage, 1), totalPages);
document.querySelector("#pageInfo").textContent = \`第 \${page} / \${totalPages} 页，共 \${records.length} 张去重图片\`;
document.querySelector("#grid").innerHTML = records.slice((page - 1) * perPage, page * perPage).map((record) => \`
  <article>
    <div class="meta">L\${String(record.level).padStart(3, "0")} Q\${String(record.question).padStart(2, "0")} · \${record.role === "correct" ? "正确图" : "干扰图"} · \${record.counts.length ? "应有 " + record.counts.join(" / ") : "无数字词"}</div>
    <img src="../\${record.file}" alt="\${record.sentence}">
    <div class="text"><div class="en">\${record.sentence}</div><div class="zh">\${record.chinese}</div></div>
  </article>
\`).join("");
</script>
</body>
</html>\n`);

const columns = 4;
const rows = 4;
const cellWidth = 420;
const cellHeight = 315;
const recordsPerSheet = columns * rows;
for (let start = 0; start < auditRecords.length; start += recordsPerSheet) {
  const sheetRecords = auditRecords.slice(start, start + recordsPerSheet);
  const sheet = new PNG({ width: columns * cellWidth, height: rows * cellHeight });
  sheet.data.fill(255);

  for (const [index, record] of sheetRecords.entries()) {
    const source = PNG.sync.read(await readFile(record.file));
    const column = index % columns;
    const row = Math.floor(index / columns);
    for (let y = 0; y < cellHeight; y += 1) {
      const sourceY = Math.min(source.height - 1, Math.floor((y / cellHeight) * source.height));
      for (let x = 0; x < cellWidth; x += 1) {
        const sourceX = Math.min(source.width - 1, Math.floor((x / cellWidth) * source.width));
        const sourceOffset = (sourceY * source.width + sourceX) * 4;
        const targetOffset = ((row * cellHeight + y) * sheet.width + column * cellWidth + x) * 4;
        source.data.copy(sheet.data, targetOffset, sourceOffset, sourceOffset + 4);
      }
    }
  }

  const sheetNumber = Math.floor(start / recordsPerSheet) + 1;
  await writeFile(`tmp/${outputName}-sheet-${String(sheetNumber).padStart(2, "0")}.png`, PNG.sync.write(sheet));
}

console.log(`Wrote ${auditRecords.length} unique count-image records and ${Math.ceil(auditRecords.length / recordsPerSheet)} audit sheets`);
