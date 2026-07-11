import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { textbookLevels } from "../src/course/textbook-levels-001-300.generated.mjs";
import { COURSE_IMAGE_REPAIR_TARGETS } from "./lib/course-image-repair-targets.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const choices = textbookLevels.flatMap((level) =>
  level.questions.flatMap((question, index) => [
    { level: level.level, question: index + 1, role: "correct", sentence: question.sentence, image: question.correctImage },
    { level: level.level, question: index + 1, role: "wrong", sentence: question.wrongSentence, image: question.wrongImage }
  ])
);
const targetKeys = new Set(COURSE_IMAGE_REPAIR_TARGETS.map(toKey));
const copied = [];

for (const target of COURSE_IMAGE_REPAIR_TARGETS) {
  const choice = choices.find((candidate) => toKey(candidate) === toKey(target));
  const candidate = choices.find((other) =>
    other.sentence === choice.sentence &&
    !targetKeys.has(toKey(other)) &&
    toKey(other) !== toKey(choice)
  );
  if (!candidate) continue;

  for (const extension of [".png", ".webp"]) {
    const source = resolve(root, candidate.image.replace(/\.png$/, extension));
    const destination = resolve(root, choice.image.replace(/\.png$/, extension));
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
  copied.push({ target: choice.image, source: candidate.image, sentence: choice.sentence });
}

const reportPath = resolve(root, "assets/textbook/repair-sheets/reused-candidates.json");
await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify({ copied }, null, 2)}\n`);
console.log(JSON.stringify({ copied: copied.length, report: reportPath.slice(root.length + 1) }));

function toKey(item) {
  return `${item.level}-${item.question}-${item.role}`;
}
