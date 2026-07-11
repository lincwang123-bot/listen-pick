import { textbookLevels } from "../src/course/textbook-levels-001-300.generated.mjs";
import { COURSE_IMAGE_REPAIR_TARGETS } from "./lib/course-image-repair-targets.mjs";

const choices = textbookLevels.flatMap((level) =>
  level.questions.flatMap((question, index) => [
    {
      level: level.level,
      question: index + 1,
      role: "correct",
      sentence: question.sentence,
      image: question.correctImage
    },
    {
      level: level.level,
      question: index + 1,
      role: "wrong",
      sentence: question.wrongSentence,
      image: question.wrongImage
    }
  ])
);
const targetKeys = new Set(COURSE_IMAGE_REPAIR_TARGETS.map(toKey));
const rows = COURSE_IMAGE_REPAIR_TARGETS.map((target) => {
  const choice = choices.find((candidate) => toKey(candidate) === toKey(target));
  if (!choice) throw new Error(`Missing course image target ${toKey(target)}`);
  const candidates = choices.filter((candidate) =>
    candidate.sentence === choice.sentence &&
    !targetKeys.has(toKey(candidate)) &&
    toKey(candidate) !== toKey(choice)
  );
  return { ...choice, groups: target.groups, candidates: candidates.map((candidate) => candidate.image) };
});

const reusable = rows.filter((row) => row.candidates.length > 0);
const generated = rows.filter((row) => row.candidates.length === 0);
console.log(JSON.stringify({
  summary: {
    targets: rows.length,
    reusableCandidates: reusable.length,
    generationRequired: generated.length
  },
  reusable,
  generationRequired: generated
}, null, 2));

function toKey(item) {
  return `${item.level}-${item.question}-${item.role}`;
}
