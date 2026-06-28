# Curriculum Blueprint

This document describes the listening curriculum data layer for the children's Listen & Pick prototype.

## Current Scope

- Playable UI: Level 1
- Generated curriculum data: Levels 2-30
- Target learner: Chinese children ages 6-10
- Main goal: hear English, form a clear picture, understand sentence meaning
- Excluded goals: spelling drills, grammar explanation, test-prep style questions

## Level Data Shape

The generated data keeps the playable Level 1 idea of a sentence with two picture choices, then adds fields needed for course production:

- `level`
- `title`
- `learningFocus`
- `reviewFocus`
- `cycleRole`
- `newWords`
- `questions`
- `id`
- `sentence`
- `chineseMeaning`
- `hintText`
- `audioFile`
- `correctImage`
- `wrongImage`
- `theme`
- `difficulty`
- `knowledgeType`
- `sourceLevels`
- `imagePromptCorrect`
- `imagePromptWrong`

## Stage Plan

### Stage 1: Levels 1-50

Build basic English semantic feeling through colors, animals, family, numbers, food, toys, and simple actions. Sentences are short and highly drawable.

### Stage 2: Levels 51-100

Move into complete simple sentences about body, clothes, school, classroom, friends, daily objects, and simple likes.

### Stage 3: Levels 101-150

Focus on position words and visual relations: on, in, under, behind, next to, and between.

### Stage 4: Levels 151-200

Practice daily routines, sports, hobbies, and transport with slightly longer everyday scenes.

### Stage 5: Levels 201-250

Introduce simple logic: comparisons, abilities, time concepts, and days of the week.

### Stage 6: Levels 251-300

Reach upper primary listening readiness through yesterday, tomorrow, simple future plans, simple past events, because, simple rules, and mixed review.

## Five-Level Learning Cycle

Every five levels follow one cycle:

- A: new knowledge
- B: reinforcement
- C: mixed practice
- D: scene practice
- E: challenge review

Because Level 1 already acts as the first A level in the prototype, Level 2 starts with B reinforcement.

## Review Model

Each generated level contains a mix of:

- long review
- recent review
- challenge review
- a small number of new items

The `sourceLevels` field marks which earlier level a question is reviewing. This supports the planned review rhythm where new knowledge reappears after about +3, +10, and +25 levels.

## Picture Rule

Every question includes a correct image prompt and a wrong image prompt. The wrong image changes one key semantic point only, such as:

- action: running vs walking
- color: red vs blue
- number: two vs three
- object: kite vs ball
- animal: cat vs dog

All prompts require a warm children's picture book style, bright soft colors, a light background, a clear subject, no text, and no watermark.

## Validation

Run:

```bash
npm run generate:course
npm run validate:course
npm test
```

The validator checks:

- Levels 2-30 exist
- every level has 15 questions
- required fields exist
- Stage 1 sentence length is 3-5 words
- banned adult or abstract topics are absent
- sentences are unique
- image prompts exist and differ
- each level adds at most 3 new words
