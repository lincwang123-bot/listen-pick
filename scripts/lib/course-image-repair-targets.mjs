const TARGET_GROUPS = {
  family: `
    L21Q14w L22Q7w L22Q14w L22Q15c/w L23Q10w L23Q11w L23Q12w
    L23Q14w L23Q15w L24Q9w L24Q14w L24Q15c/w L30Q10w
  `,
  animalsAndCounts: `
    L18Q12c/w L18Q13c/w L20Q1w L20Q2c L20Q4w L20Q5c/w L29Q9w
    L49Q4c L85Q1c/w L87Q9w
  `,
  peopleAndBasicActions: `
    L1Q8w L1Q12w L3Q10w L51Q8w L55Q11c
  `,
  positionsAndContainers: `
    L27Q4w L27Q13w L28Q9w L28Q14c/w L30Q6c/w L50Q8w L61Q11w
    L62Q11w L62Q12w L64Q4w L64Q10w L64Q11w L66Q15w L71Q12w
    L75Q3w L78Q7w L82Q6w L85Q11w L92Q3w L97Q7w
  `,
  clothingAndObjectMotion: `
    L33Q4c/w L33Q5c/w L34Q12c/w L58Q4c/w L58Q8c/w L58Q9c/w
    L58Q11c/w L74Q2c/w L76Q13c/w L79Q8c/w L91Q8c/w L91Q9c/w
    L92Q8c/w L93Q7c/w L96Q6c/w L97Q4c/w
  `,
  scenesAndMovement: `
    L37Q15c/w L40Q14w L45Q10w L48Q10c/w L70Q11c L78Q13c/w
    L79Q5c/w L91Q15c L98Q4w L98Q5c/w L98Q8c/w L98Q9c/w
    L98Q13c L98Q15c L99Q3w L99Q4w L100Q7w
  `,
  bodyAndEverydayObjects: `
    L63Q4w L75Q13w L75Q14w L76Q9w L77Q5w L93Q3w
    L99Q14w
  `,
  level83: `
    L83Q1w L83Q2w L83Q7w L83Q8w L83Q9w L83Q10w L83Q12w
    L83Q13w L83Q14w L83Q15w
  `,
  colorAndFlavor: `
    L59Q15w L69Q8c/w
  `,
  correctedTextChoices: `
    L16Q8w L16Q9w L17Q9w L19Q8w L20Q6w L24Q12c/w L30Q5w
    L34Q7w L36Q11w L38Q1w L39Q15w L45Q10w L50Q1w L50Q9w
    L54Q15c/w L55Q6c L64Q15w L76Q2w L80Q5w L80Q11w
    L91Q10w L93Q10w L93Q14w L93Q15w L94Q12w
    L97Q3w L97Q5w L97Q12w L99Q10c/w
  `
};

export const COURSE_IMAGE_REPAIR_TARGETS = deduplicateTargets(TARGET_GROUPS);

function deduplicateTargets(groups) {
  const byKey = new Map();

  for (const [group, value] of Object.entries(groups)) {
    for (const token of value.trim().split(/\s+/)) {
      const match = token.match(/^L(\d+)Q(\d+)(c|w|c\/w)$/);
      if (!match) throw new Error(`Invalid course image repair target: ${token}`);
      const roles = match[3] === "c/w" ? ["correct", "wrong"] : [match[3] === "c" ? "correct" : "wrong"];

      for (const role of roles) {
        const level = Number(match[1]);
        const question = Number(match[2]);
        const key = `${level}-${question}-${role}`;
        const current = byKey.get(key) ?? { level, question, role, groups: [] };
        if (!current.groups.includes(group)) current.groups.push(group);
        byKey.set(key, current);
      }
    }
  }

  return [...byKey.values()].sort((a, b) =>
    a.level - b.level || a.question - b.question || a.role.localeCompare(b.role)
  );
}
