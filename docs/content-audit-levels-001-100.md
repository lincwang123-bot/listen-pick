# Level 1-100 Content Audit

Audit date: 2026-06-28

Scope:
- Playable levels: 1-100
- Questions: 1,500
- Choice illustrations: 3,000 PNG + 3,000 WebP
- Audio files checked by reference: base, male, female

## Checks Run

- Data structure: every playable level has 15 questions.
- English format: capitalization, punctuation, duplicate spaces.
- Chinese hint format: empty hints, English leakage, identical paired hints.
- Asset references: correct/wrong images, WebP images, base/male/female audio.
- Image technical integrity: 3,000 PNG files checked for 840x630 dimensions, transparency, blank/low-variance image risk.
- Content risk scan: unsafe, impossible, emotionally negative, hygiene-confusing, or world-logic-breaking sentences.
- Manual visual review for high-risk contact sheets: Level 67, 70, 74, 75, 83, 88, 90, 93, 98.

Automated tests:
- `npm test`: 69 passed, 0 failed.

Latest fix verification:
- `node --test tests/hints.test.mjs tests/textbook.test.mjs tests/asset-preloader.test.mjs tests/game.test.mjs`: 25 passed, 0 failed.
- Replaced unsafe / misleading wrong-option sentences listed below.
- Replaced affected high-risk wrong-option illustrations with a new safe 5x4 repair contact sheet.
- Regenerated affected English audio for base, male, and female voice folders where the correct sentence changed.
- Bumped app asset cache version to `content-audit-v2`.

## Passed

- No missing referenced audio files were found.
- No missing referenced image files were found.
- All checked PNG illustrations are 840x630.
- No blank or near-blank PNG illustrations were detected.
- No Chinese hints contained English letters.
- No paired Chinese hints were exactly identical.
- The current app structure and UI tests pass.

## P0: Must Fix Before Child Testing

### Chinese Hint Quality

The current Chinese hint system is not yet教材级. It is rule-generated and produces incorrect or unnatural Chinese for many action + object / action + location sentences.

Representative examples:
- Level 4 Q6: `The girl is drawing a cat.` -> `女孩正在画画猫。`
- Level 4 Q7: `The boy is reading a book.` -> `男孩正在读书书。`
- Level 4 Q15: `The baby is looking at a picture.` -> `宝宝正在看在图片旁边。`
- Level 5 Q1: `The girl is eating an apple.` -> `女孩正在吃东西苹果。`
- Level 5 Q2: `The boy is drinking water.` -> `男孩正在喝水水。`
- Level 49 Q15: `The family is eating in the dining room.` -> `一家人正在吃东西在房间里。`

Detected Chinese hint risk patterns:
- Action/object wording risk: 123 hits.
- Repeated noun/action artifacts such as `读书书` / `喝水水`: 15 hits.
- Location word order risk such as `正在睡觉在床上`: multiple hits.
- Unnatural adjective wording such as `有长的头发`: 27 hits.

Recommendation:
- Do not rely on rule-generated Chinese for production.
- Add curated `chineseMeaning` / `choiceChinese` fields for every sentence and wrong option.
- Add regression tests for banned Chinese patterns: `画画猫`, `读书书`, `喝水水`, `正在.*在`, `看在`.

### Unsafe / Impossible / Misleading Distractors

These items should be rewritten and re-illustrated:

- Level 67 Q2 wrong: `The children are pushing on the slide.`
  Reason: unsafe playground behavior.
- Level 67 Q10 wrong: `The friends are crying on the swing.`
  Reason: negative and difficult to explain as a simple picture contrast.
- Level 70 Q11 wrong: `The children are fighting over a scooter.`
  Reason: conflict/fighting is not suitable as a routine low-age listening distractor.
- Level 74 Q9 wrong: `The girl is brushing teeth with a comb.`
  Reason: teaches wrong object use.
- Level 75 Q13 wrong: `The lunch box has socks inside.`
  Reason: hygiene-confusing and unnatural.
- Level 75 Q14 wrong: `The toy box has noodles inside.`
  Reason: hygiene-confusing and unnatural.
- Level 83 Q1 wrong: `There is a slide in the classroom.`
  Reason: impossible classroom/playground world logic.
- Level 90 Q15 wrong: `The friends like sitting apart.`
  Reason: negative social value framing.
- Level 93 Q3 wrong: `The child is washing feet before putting on a shirt.`
  Reason: unnatural routine sequence.
- Level 93 Q13 wrong: `The boy is raising one foot with a glove.`
  Reason: confusing clothing/object use.
- Level 98 Q6 wrong: `There is a slide beside the classroom board.`
  Reason: impossible scene; this is the blackboard + slide issue.
- Level 98 Q7 wrong: `There are two children under the seesaw.`
  Reason: unsafe playground behavior.
- Level 98 Q9 wrong: `The baby is sleeping in the sandbox.`
  Reason: unsafe/unhygienic and unnatural.
- Level 98 Q13 wrong: `The children are pushing on the swing.`
  Reason: unsafe playground behavior.

### English That Should Be Corrected

- Level 98 Q2 wrong: `The girl is holding rope.`
  Better: `The girl is holding a rope.`
- Level 88 Q15 correct: `The children like lunch together.`
  Better: `The children are eating lunch together.` or `The children like eating lunch together.`
- Level 88 Q15 wrong: `The children like snacks together.`
  Better: `The children are eating snacks together.`
- Repeated pattern: `washing hands`, `drying feet`, `brushing hair`, `brushing teeth` without possessive pronouns.
  Better for教材: `washing his hands`, `drying her feet`, `brushing her hair`, `brushing her teeth`.
- Level 1 Q10: `The woman has glasses.`
  Acceptable, but `The woman wears glasses.` is more natural for children.

## P1: Review For Course Design Quality

- Early levels use some adult subjects such as `man` and `woman`. This is not unsafe, but the course may feel warmer if more examples use child-centered subjects unless the learning target is specifically people recognition.
- Some baby actions are developmentally odd, such as a baby writing or kicking a ball. They are understandable as pictures, but should be reviewed for realism.
- Level 24 Q11 wrong: `The father and father are parents.`
  Not reliable as a wrong option and potentially sensitive.
- Level 24 Q13 wrong: `The boy and boy are siblings.`
  Not reliable as a wrong option.
- Negative emotions such as crying/sad/angry appear as distractors. These should be moved to a deliberate emotions unit, not scattered as casual wrong choices.

## P2: Asset Notes

- Level 98 Q8 individual images were replaced locally with clearer ladder images where both hands are visible.
- The original Level 98 contact sheet still contains the older ladder cells. If contact sheets are used as source again, regenerate or update that contact sheet before re-cropping.

## Conclusion

Resolution status after this audit pass:
- P0 Chinese hint issues: fixed in the rule translator and covered by regression tests.
- P0 unsafe / impossible / misleading distractors: rewritten in source data and covered by regression tests.
- P0 affected illustrations: replaced for the high-risk wrong-option scenes.
- P0 affected audio: regenerated for correct sentences whose English changed.

Recommended next step:
- Continue the same audit process when expanding beyond Level 100.
- For production, still consider adding curated `choiceChinese` fields later so every hint can be hand-authored rather than inferred.
