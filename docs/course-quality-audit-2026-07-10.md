# Course Quality Audit - 2026-07-10

## Scope

- Runtime course: 300 levels, 4,500 questions, 9,000 picture choices.
- Text fields reviewed: 9,000 English choices and their generated Chinese hints.
- Audio files checked: default, male, and female voices, 13,500 files total.
- Picture files checked structurally: 9,000 PNG masters and their runtime WebP counterparts.

## English And Semantics

The full English review found 92 problematic fields in 77 questions. All are in Levels 1-100; Levels 101-300 passed the current fixed-template checks.

The executable audit currently records:

- 39 confirmed errors, including invalid collocations, ambiguous family relations, missing body-part possessives, impossible positions, and implausible object/container combinations.
- 45 review items, including unsafe distractor actions, unnatural animal colors/actions, and scenes that are grammatically possible but unsuitable for a children's model lesson.
- Full machine-readable output: `docs/course-content-audit.json`.

One confirmed wording issue has already been corrected in source and generated data:

- Level 22 Q14: `We are brother and brother.` -> `We are two brothers.`

The remaining English findings must be repaired together with their paired pictures. Changing labels alone would create new picture-text mismatches.

## Chinese Hints

The review found systematic translation defects rather than isolated typos. Confirmed categories included:

- Wrong or missing measure words: notes, houses, boxes, clothing, body parts, and counted socks/shoes.
- Lost subjects or copulas in family sentences.
- Incorrect kinship age terms such as older/younger brother or sister.
- Broken phrasal verbs such as `putting on`, `taking off`, `getting out of bed`, and `taking a shower`.
- Lost objects or locations in `has`, `give`, `take`, `with`, `ready for`, and `after school` constructions.
- Missing vocabulary including `blanket`, `card`, `beanbag`, `road`, `sky`, and `hand cream`.
- Context errors such as translating an animal or plane `flying` as flying a kite.

The hint translator now has dedicated child-facing handling for these categories. The new regression suite covers 125 representative sentence pairs in addition to the existing all-course checks for English leakage, duplicate choice meanings, missing actions, and known translation artifacts.

## Audio

Full file and binding audit result:

- Expected/readable files: 13,500 / 13,500.
- Missing or zero-byte files: 0.
- `ffprobe` decode or duration failures: 0.
- Source/runtime path binding mismatches: 0.
- Different English sentences sharing identical media: 0.
- Male/female files collapsing to the same media: 0.
- Detailed output: `docs/course-audio-audit.json`.

For Levels 101-300, all 6,000 male/female files also match the cache files addressed by the current sentence, voice, rate, pitch, and volume configuration. This gives direct generation provenance for those levels.

Limitation: Levels 1-100 do not have equivalent sentence-keyed provenance files. File hashes and decoding cannot prove the spoken words by themselves. A future full ASR transcript comparison is still required to make that stronger claim.

## Pictures

Structural checks found no missing PNG or runtime WebP files.

The correct/wrong similarity audit checked all 4,500 pairs. After visually reviewing and approving the expected near-identical count/color/object contrasts, one pair remains confirmed by this audit:

| Level/Q | Problem |
| --- | --- |
| L59 Q15 | Both choices contain white and orange caps, and the pointing gesture does not unambiguously match `choosing a white cap` versus `choosing an orange cap`. |

Family-role visual review covered 673 questions, 1,346 image references, and 481 unique images. It found 9 confirmed and 6 high-suspicion problems:

| Level/Q | Role | Result |
| --- | --- | --- |
| L21 Q14 | wrong | Child is between/in front of the parents, not beside them. |
| L22 Q14 | wrong | Two boys are present, but a cropped third-character fragment remains. |
| L22 Q15 | correct | Two babies are present, but a cropped third-baby fragment remains. |
| L23 Q10 | wrong | Grandma is shown, but the mother needed for the above/below relation is missing. |
| L23 Q11 | wrong | Grandpa is shown, but the father needed for the above/below relation is missing. |
| L23 Q14 | wrong | The granddaughter is missing. |
| L24 Q9 | wrong | The picture shows two boys and cannot support `She is the boy's sister.` |
| L24 Q15 | correct | Only one grandchild is visible although the sentence is plural. |
| L30 Q10 | wrong | The baby is between the parents, not beside them. |
| L22 Q7 | wrong, high suspicion | The second sister is heavily cropped and unrelated fragments remain. |
| L22 Q15 | wrong, high suspicion | Three babies are present, but the left baby is heavily cropped. |
| L23 Q12 | wrong, high suspicion | Three grandmothers are shown, but the baby subject is missing. |
| L23 Q15 | wrong, high suspicion | The scene reads as parents with their son; the grandson relation is not visually decidable. |
| L24 Q14 | wrong, high suspicion | The elderly adults are shown with young children, so the image reads as grandchildren rather than children. |
| L24 Q15 | wrong, high suspicion | The young adults with children read as parents and their own children, not parents with grandchildren. |

The action, position, and everyday-object visual review has completed Levels 1-5, 26-43, and 45-96: 75 levels, 1,125 questions, and 2,250 independent pictures. It confirmed 35 additional mismatches:

| Level/Q | Role | Confirmed mismatch |
| --- | --- | --- |
| L1 Q8 | wrong | The baby is standing, not sleeping. |
| L1 Q12 | wrong | The long-haired subject is a woman/girl, not a boy. |
| L28 Q9 | wrong | A cat, not a rabbit, is under the box. |
| L30 Q10 | wrong | The baby is between the parents, not beside them. |
| L34 Q7 | wrong | The picture still shows toothpaste on a toothbrush and does not contrast with the correct image. |
| L37 Q9 | wrong | Soup is below/around an upside-down bowl, not on the bowl. |
| L39 Q9 | wrong | Soup is below/around an upside-down bowl, not on the bowl. |
| L40 Q14 | wrong | Some family members remain seated instead of all standing. |
| L50 Q8 | wrong | Grandma is in front of the window, not behind it. |
| L51 Q8 | wrong | The long-haired subject is a girl, not a boy. |
| L55 Q10 | wrong | The hands are apart, so the child is not clapping. |
| L55 Q11 | correct | The girl is missing; only the mirror is visible. |
| L61 Q11 | wrong | The ruler is missing from the pencil case. |
| L62 Q12 | wrong | The chair is missing from the board scene. |
| L63 Q4 | wrong | The child covers their eyes; the hand itself is not hidden. |
| L64 Q10 | wrong | The chair remains between the desks, not behind them. |
| L75 Q3 | wrong | The spoon is beside the lunch box, not under it. |
| L75 Q13 | wrong | The lunch box contains socks, not fruit. |
| L75 Q14 | wrong | The toy box contains noodles/food, not balls. |
| L76 Q9 | wrong | The picture still shows a bottle being put in a schoolbag, not a spoon in a bowl. |
| L77 Q5 | wrong | The child covers their eyes; the hand itself is not hidden. |
| L83 Q1 | wrong | The scene shows a slide in a classroom, not a playground swing. |
| L83 Q2 | wrong | The swing is under a table, not beside a bench. |
| L83 Q7 | wrong | The book is on a playground slide, not a classroom table. |
| L83 Q8 | wrong | Shoes are on a shelf; the library table and books are missing. |
| L83 Q9 | wrong | The bottle is under a table, not a bench. |
| L83 Q10 | wrong | The children sit on a tree branch, not beside the tree. |
| L83 Q12 | wrong | Clouds appear inside a classroom, not above a park. |
| L83 Q13 | wrong | A garden is drawn on a board, not beside the school gate. |
| L83 Q14 | wrong | Children appear as figures inside a lunch box, not near a slide. |
| L83 Q15 | wrong | A toy bus is on a classroom table, not outside a park. |
| L85 Q11 | wrong | The pillow is on a board, not a sofa. |
| L91 Q15 | correct | The schoolbag is missing from the door scene. |
| L92 Q3 | wrong | The teacher is still in front of the class, not behind it. |
| L93 Q3 | wrong | The child is handling feet, not drying hands. |

Twenty-three additional groups remain high suspicion, mainly static `putting on/taking off`, `putting in/taking out`, in/on/under placement, movement state, and before/after contrasts whose direction or final state is not visually decidable. They must be enlarged and rechecked before approval.

The later-stage action review also completed Levels 146-190 and 281-300: 65 levels, 975 questions, 1,950 runtime images, and 235 unique images. It found 17 confirmed unique-image problems affecting 115 question paths:

| Reused concept | Confirmed problem |
| --- | --- |
| `reading a card` | The card only shows a dog picture, faces the viewer, and contains no readable material; the scene reads as holding/showing a picture card. |
| `opening a book` | The book is already fully open and the child is looking at the pages, so the scene reads as reading. |
| `closing a book` | The book is already fully closed; the still image cannot establish a closing action. |
| `closing a box` | The lid is already closed and the hands rest on it; the closing action is not visible. |
| `folding a towel` | The towel is already fully folded and the hands rest on the finished item. |
| `folding a shirt` | The shirt is already fully folded and the scene reads as arranging/showing it. |

Four more unique images affecting 35 paths are high suspicion: an ambiguous box-closing pose, paper planes still held in the hand instead of flying, and balls placed in a box-bottom cavity that can be read as `in` rather than clearly `under`.

Levels 97-145 were also completed: 49 levels, 735 questions, 1,470 image references, and 264 unique pictures. Nine confirmed problems were found:

| Level/Q | Role | Confirmed mismatch |
| --- | --- | --- |
| L98 Q5 | wrong | Only one boy is shown and the ball is fully visible, so neither plural `friends` nor `hiding` is satisfied. |
| L98 Q8 | correct/wrong | Both ladder pictures are static mid-ladder poses; neither climbing up nor going down is visually decidable. |
| L98 Q9 | correct/wrong | Both sandbox pictures include active sand-play tools, so both satisfy `playing`; the sitting distractor is not distinct. |
| L98 Q13 | correct | Two children swing simultaneously instead of taking turns. |
| L99 Q11 | wrong | The child is normally eating from a lunch box with chopsticks, not playing with them. |
| L99 Q14 | wrong | The lunch box contains food, not toys. |
| L100 Q7 | wrong | The toy is fully visible between two children, not hidden. |

High-suspicion findings include opening/closing notebooks, catching/passing a basketball, walking back to the classroom, dropping a coat, washing shoes, and the same reused fully-open/fully-closed book and box scenes later confirmed in Levels 146-190.

Number lessons 11-15 were manually counted across all 150 choice images and currently match their English quantities. Level 13 specifically passes all 15 correct/wrong count pairs.

The quantity/color/animal keyword scan covers 1,351 questions and 940 unique pictures, and all 940 unique pictures have now been checked. The middle 315 pictures found 13 confirmed role errors: L18 Q12 horse images are sheep; L18 Q13 sheep images are pigs; L20 Q1/Q2/Q4/Q5 contain extra or cropped animals that change the count; L22 Q15 contains an extra baby fragment; L23 Q12 omits the baby subject; and L30 Q6 shows a table rather than a shelf. Four more are high suspicion: cropped sisters/triplets, a cropped third box in L29 Q9, and plural `animals` represented by only one lion in L49 Q4.

The final 310 unique pictures found five confirmed issues: L59 Q15 orange-cap selection, L63 Q4 hidden-hand semantics, L82 Q6 books shown on rather than under the shelf, L93 Q10 only one foot kicking despite `both feet`, and L97 Q7 shoes missing from some desks despite `every desk`. Six more groups are high suspicion, including juice flavors distinguished only by liquid shade, a coiled “short” snake, count-image edge fragments, and an oversized arrow covering the shirt action.

## Gates Added

- `npm run audit:course-content`
- `npm run audit:course-audio -- --probe`
- `npm run audit:textbook-images`
- `tests/course-content-audit.test.mjs`
- `tests/course-audio-audit.test.mjs`
- `tests/hints-quality-audit.test.mjs`

The layered review has covered the family, quantity/color/animal, and remaining action/position/object partitions across all 300 runtime levels. Those partitions overlap, so their question totals must not be added as unique-question counts. The result is intentionally not a declaration that every visual is correct: confirmed and high-suspicion findings remain release blockers until the assets and paired wording are repaired and visually rechecked.
