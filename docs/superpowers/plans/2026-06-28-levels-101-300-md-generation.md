# Level 101-300 Markdown Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate `docs/child-english-listening-levels-101-300.md` from deterministic sentence templates and vocabulary pools.

**Architecture:** Add one focused generator script that owns the 101-300 segment rules, produces Markdown, and validates the generated levels before writing. Add one test file that parses the Markdown and verifies level count, question count, stage sentence patterns, and banned content constraints.

**Tech Stack:** Node.js ESM scripts, Node test runner, Markdown output under `docs/`.

## Global Constraints

- Generate Level 101-300 only.
- Every level must contain exactly 15 English sentences.
- Sentences must be produced from templates and vocabulary pools, not hand-randomized.
- Do not generate images, audio, or app integration in this task.
- Do not introduce abstract, adult, unsafe, or non-drawable content.

---

### Task 1: Add Markdown Contract Test

**Files:**
- Create: `tests/textbook-stage3-6-md.test.mjs`

**Interfaces:**
- Consumes: `docs/child-english-listening-levels-101-300.md`
- Produces: failing tests that define the required Markdown contract.

- [ ] **Step 1: Write the failing test**

Create a test that:
- Reads `docs/child-english-listening-levels-101-300.md`.
- Parses headings `## Level NNN`.
- Parses sentence lines `NNN-QQ. Sentence.`
- Verifies 200 levels, 15 sentences per level, and 3,000 total sentences.
- Verifies segment-specific sentence patterns for 101-130, 131-160, 161-190, 191-220, 221-250, 251-280, and 281-300.
- Verifies banned content does not appear.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/textbook-stage3-6-md.test.mjs`

Expected: FAIL because the Markdown file does not exist yet.

### Task 2: Add Deterministic Generator

**Files:**
- Create: `scripts/generate-textbook-stage3-6-md.mjs`
- Modify: `package.json`
- Create: `docs/child-english-listening-levels-101-300.md`

**Interfaces:**
- Produces: `generateLevelSentences(level): string[]`
- Produces: `docs/child-english-listening-levels-101-300.md`

- [ ] **Step 1: Implement the generator**

Implement fixed stage configs:
- 101-130: `The X is V-ing.`
- 131-160: `The X is V-ing object.`
- 161-190: `The X is prep Y.`
- 191-220: `There are number objects.`
- 221-250: `The X is color.`
- 251-280: `My familyMember is V-ing.`
- 281-300: `The X is V-ing object in/at scene.`

- [ ] **Step 2: Add package script**

Add `generate:textbook-stage3-6-md`.

- [ ] **Step 3: Run generator**

Run: `npm run generate:textbook-stage3-6-md`

Expected: writes the Markdown file with 200 levels and 3,000 sentences.

### Task 3: Verify And Refine

**Files:**
- Modify only files from Tasks 1-2.

**Interfaces:**
- Consumes: generator and Markdown.
- Produces: green tests.

- [ ] **Step 1: Run targeted tests**

Run: `node --test tests/textbook-stage3-6-md.test.mjs`

Expected: PASS.

- [ ] **Step 2: Run full tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Spot-check Markdown**

Run: `sed -n '1,80p' docs/child-english-listening-levels-101-300.md`

Expected: readable course Markdown with Level 101 onward.
