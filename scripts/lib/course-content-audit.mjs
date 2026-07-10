const fieldNames = ["sentence", "wrongSentence"];

const confirmedSentenceIssues = new Map([
  ["the grandma and grandpa are parents.", "family-role-not-exclusive"],
  ["the grandparents are with their children.", "family-role-not-exclusive"],
  ["the parents are with their grandchildren.", "family-role-not-exclusive"],
  ["the girl is putting toothpaste in the brush.", "unnatural-preposition"],
  ["dinner is under the table.", "implausible-scene"],
  ["the baby is clapping hands.", "missing-body-possessive"],
  ["the baby is raising hands.", "missing-body-possessive"],
  ["the child is touching the head.", "missing-body-possessive"],
  ["the child is touching the feet.", "missing-body-possessive"],
  ["the child is bending the knees.", "missing-body-possessive"],
  ["the child is raising the hands.", "missing-body-possessive"],
  ["the child is smiling with dirty hands.", "nonparallel-contrast"],
  ["the child is opening the mouth for a toothbrush.", "unnatural-body-action"],
  ["the child is closing the mouth.", "missing-body-possessive"],
  ["the baby is waving both feet.", "unnatural-body-action"],
  ["the child is touching a knee on the mat.", "ambiguous-body-scene"],
  ["the child is touching a head on the mat.", "ambiguous-body-scene"],
  ["the baby is playing with toes.", "missing-body-possessive"],
  ["the classroom plant is on the board.", "implausible-scene"],
  ["the boy is dropping books for a classmate.", "unnatural-beneficiary"],
  ["the boy likes playing blocks with a classmate.", "missing-with"],
  ["the child likes playing blocks.", "missing-with"],
  ["the girl is drawing a page.", "unnatural-object"],
  ["the student is drawing with a spoon.", "implausible-tool"],
  ["the boy is writing with a spoon.", "implausible-tool"],
  ["the schoolbag is in the sink.", "implausible-scene"],
  ["there is a book in the bathroom sink.", "implausible-scene"],
  ["the boy is tying shoes on his feet.", "unnatural-collocation"],
  ["the child is putting a jacket in a bowl.", "implausible-container"],
  ["the clothes are ready in the sink.", "implausible-scene"],
  ["the girl is sitting under her friend.", "implausible-position"],
  ["the child is touching a nose in the mirror.", "missing-body-possessive"],
  ["the child is touching an ear in the mirror.", "missing-body-possessive"],
  ["the baby is drinking milk in a cup.", "unnatural-preposition"],
  ["the baby is drinking water in a cup.", "unnatural-preposition"],
  ["the child is hiding goodbye.", "invalid-collocation"],
  ["the boy is eating an apple snack.", "unnatural-collocation"],
  ["the boy is eating a rice lunch.", "unnatural-collocation"]
]);

const reviewSentenceIssues = new Map([
  ["the student is a baby.", "age-role-conflict"],
  ["the baby is a student.", "age-role-conflict"],
  ["the rabbit is dancing.", "unrepresentative-animal-action"],
  ["the turtle is jumping.", "unrepresentative-animal-action"],
  ["the frog is dancing.", "unrepresentative-animal-action"],
  ["the giraffe is climbing.", "unrepresentative-animal-action"],
  ["the pink horse is walking.", "unnatural-animal-color"],
  ["the pink dog is behind the sofa.", "unnatural-animal-color"],
  ["there are two blue apples.", "unnatural-food-color"],
  ["the girl is biting a blue apple.", "unnatural-food-color"],
  ["the girl is holding two blue apples.", "unnatural-food-color"],
  ["the grandpa is walking with a pink dog.", "unnatural-animal-color"],
  ["the girl is jumping to school.", "unnatural-path-action"],
  ["the girl is jumping home after school.", "unnatural-path-action"],
  ["the child is dancing over a puddle.", "unnatural-path-action"],
  ["the child is dancing over a rope.", "unnatural-path-action"],
  ["the children are walking a race.", "unnatural-collocation"],
  ["the brother is pouring a glass of milk.", "ambiguous-pouring-action"],
  ["the girl has sunglasses in the shade.", "ambiguous-has-scene"],
  ["the girl has sunglasses in the sun.", "ambiguous-has-scene"],
  ["the boy has a kite in the wind.", "ambiguous-has-scene"],
  ["the boy has a kite on the ground.", "ambiguous-has-scene"],
  ["the child has an umbrella in the rain.", "ambiguous-has-scene"],
  ["the woman has an umbrella in the rain.", "ambiguous-has-scene"],
  ["the woman has an umbrella in the sunshine.", "ambiguous-has-scene"],
  ["the baby is sitting with shoes.", "incomplete-clothing-phrase"],
  ["the girl is looking at her face.", "missing-mirror"],
  ["the child is clapping clean hands.", "unnatural-body-action"],
  ["the child is clapping dirty hands.", "unnatural-body-action"],
  ["the child is ready after washing.", "vague-state"],
  ["the child is messy before washing.", "vague-state"],
  ["the books are messy on the floor.", "unnatural-state"],
  ["the mother is giving a coat.", "missing-recipient"],
  ["the mother is giving a lunch box.", "missing-recipient"],
  ["the mother is giving a towel.", "missing-recipient"],
  ["the teacher is waving at the door.", "ambiguous-preposition"],
  ["the father is helping with shoes.", "vague-help-action"],
  ["the father is helping with a towel.", "vague-help-action"],
  ["the students are ready for sleep.", "unnatural-collocation"],
  ["the girl is jumping into the classroom.", "unsafe-scene"],
  ["the child is pushing a classmate.", "unsafe-scene"],
  ["the child is throwing blocks.", "unsafe-scene"],
  ["the child is kicking the schoolbag.", "unsafe-scene"],
  ["the children are pushing in a line.", "unsafe-scene"],
  ["the class is standing on desks.", "unsafe-scene"],
  ["the child is running to the bus.", "unsafe-scene"],
  ["the child is eating in the sandbox.", "unsafe-scene"],
  ["the girl is jumping on the bed.", "unsafe-scene"],
  ["the child is kicking a ball indoors.", "unsafe-scene"],
  ["the students are lying down for lunch.", "implausible-scene"],
  ["the father is playing football indoors.", "unsafe-scene"],
  ["the child is playing with chopsticks.", "unsafe-scene"],
  ["the child is sleeping on the playground.", "unsafe-scene"],
  ["the child is kicking a coat with both feet.", "unsafe-scene"]
]);

export function auditCourseContent(levels, { toChineseHint }) {
  const findings = [];

  for (const level of levels) {
    for (const [questionIndex, question] of level.questions.entries()) {
      const context = {
        level: level.level,
        question: questionIndex + 1,
        id: question.id
      };

      for (const field of fieldNames) {
        const text = question[field];
        if (typeof text !== "string" || text.trim() === "") {
          findings.push({ ...context, field, rule: "missing-sentence", severity: "error", text });
          continue;
        }

        findings.push(...auditSentence(text, { ...context, field }));
      }

      if (typeof question.sentence === "string" && typeof question.wrongSentence === "string") {
        const correctHint = toChineseHint(question.sentence);
        const wrongHint = toChineseHint(question.wrongSentence);
        if (correctHint === wrongHint) {
          findings.push({
            ...context,
            field: "choices",
            rule: "duplicate-chinese-choice",
            severity: "error",
            text: `${question.sentence} || ${question.wrongSentence}`,
            details: correctHint
          });
        }
      }
    }
  }

  return findings;
}

function auditSentence(text, context) {
  const findings = [];
  const normalized = text.trim();
  const normalizedKey = normalized.toLowerCase();

  if (confirmedSentenceIssues.has(normalizedKey)) {
    findings.push(finding(context, confirmedSentenceIssues.get(normalizedKey), normalized));
  } else if (reviewSentenceIssues.has(normalizedKey)) {
    findings.push({ ...finding(context, reviewSentenceIssues.get(normalizedKey), normalized), severity: "review" });
  }

  if (/\bThere are one\b/i.test(normalized) || /\bThere is (?:two|three|four|five|six|seven|eight|nine|ten)\b/i.test(normalized)) {
    findings.push(finding(context, "number-agreement", normalized));
  }

  if (
    /\b(?:the )?(?:girl|woman) is (?:my |the )?(?:brother|father|grandfather|son)\b/i.test(normalized) ||
    /\b(?:the )?(?:boy|man) is (?:my |the )?(?:sister|mother|grandmother|daughter)\b/i.test(normalized) ||
    /\bShe is (?:my |the )?(?:brother|father|grandfather|son)\b/i.test(normalized) ||
    /\bHe is (?:my |the )?(?:sister|mother|grandmother|daughter)\b/i.test(normalized)
  ) {
    findings.push(finding(context, "family-gender-conflict", normalized));
  }

  if (/\bWe are (?:brother and brother|sister and sister)\b/i.test(normalized)) {
    findings.push(finding(context, "unnatural-family-coordination", normalized));
  }

  if (/\b(?:one|three|four|five|six|seven|eight|nine|ten)\s+(?:\w+\s+){0,2}(?:are\s+)?twins\b/i.test(normalized)) {
    findings.push(finding(context, "twins-count-conflict", normalized));
  }

  return findings;
}

function finding(context, rule, text) {
  return { ...context, rule, severity: "error", text };
}
