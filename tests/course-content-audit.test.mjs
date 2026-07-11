import test from "node:test";
import assert from "node:assert/strict";

import { auditCourseContent } from "../scripts/lib/course-content-audit.mjs";
import { textbookLevels } from "../src/course/textbook-levels-001-300.generated.mjs";
import { toChineseHint } from "../src/hints.mjs";

function levelWith(...pairs) {
  return [{
    level: 1,
    questions: pairs.map(([sentence, wrongSentence], index) => ({
      id: `L001-Q${String(index + 1).padStart(3, "0")}`,
      sentence,
      wrongSentence
    }))
  }];
}

test("course content audit catches grammar and family-logic errors", () => {
  const levels = levelWith(
    ["There are one apple.", "There are two apples."],
    ["The girl is my brother.", "The boy is my sister."],
    ["We are brother and brother.", "We are brother and sister."],
    ["The three babies are twins.", "The two babies are twins."]
  );

  const findings = auditCourseContent(levels, { toChineseHint: (sentence) => sentence });
  const rules = new Set(findings.map((finding) => finding.rule));

  assert.ok(rules.has("number-agreement"));
  assert.ok(rules.has("family-gender-conflict"));
  assert.ok(rules.has("unnatural-family-coordination"));
  assert.ok(rules.has("twins-count-conflict"));
});

test("course content audit accepts natural child-facing family sentences", () => {
  const levels = levelWith(
    ["The girl is my sister.", "The boy is my brother."],
    ["We are two brothers.", "We are brother and sister."],
    ["The three babies are triplets.", "The two babies are twins."]
  );

  assert.deepEqual(auditCourseContent(levels, { toChineseHint: (sentence) => sentence }), []);
});

test("course content audit catches choices that collapse to one Chinese meaning", () => {
  const levels = levelWith(["The cat is on the chair.", "The cat is under the chair."]);

  const findings = auditCourseContent(levels, { toChineseHint: () => "猫在椅子旁边。" });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].rule, "duplicate-chinese-choice");
});

test("course content audit flags reviewed semantic and child-safety problems", () => {
  const levels = levelWith(
    ["The child is hiding goodbye.", "The schoolbag is in the sink."],
    ["The girl is walking to school.", "The girl is jumping to school."],
    ["The child is playing with blocks.", "The child is playing with chopsticks."]
  );

  const findings = auditCourseContent(levels, { toChineseHint: (sentence) => sentence });
  const byRule = new Map(findings.map((finding) => [finding.rule, finding]));

  assert.equal(byRule.get("invalid-collocation")?.severity, "error");
  assert.equal(byRule.get("implausible-scene")?.severity, "error");
  assert.equal(byRule.get("unnatural-path-action")?.severity, "review");
  assert.equal(byRule.get("unsafe-scene")?.severity, "review");
});

test("all playable course choices pass the strict child-facing content audit", () => {
  const findings = auditCourseContent(textbookLevels, { toChineseHint });

  assert.deepEqual(findings, []);
});
