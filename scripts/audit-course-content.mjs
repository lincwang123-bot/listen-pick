import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { availableTextbookLevels } from "../src/course/textbook-playable.generated.mjs";
import { toChineseHint } from "../src/hints.mjs";
import { auditCourseContent } from "./lib/course-content-audit.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = resolve(root, "docs/course-content-audit.json");
const findings = auditCourseContent(availableTextbookLevels, { toChineseHint });
const questions = availableTextbookLevels.reduce((total, level) => total + level.questions.length, 0);
const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    levels: availableTextbookLevels.length,
    questions,
    choices: questions * 2,
    findings: findings.length,
    errors: findings.filter((finding) => finding.severity === "error").length
  },
  findings
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary));

if (process.argv.includes("--strict") && report.summary.errors > 0) process.exitCode = 1;
