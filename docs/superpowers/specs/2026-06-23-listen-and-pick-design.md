# Listen And Pick Demo Design

## Goal

Build a browser demo for a kindergarten-to-grade-2 English learning game where a child hears one short English sentence and chooses which of two pictures matches it.

## Scope

The first version is a standalone static web demo. It includes one level with 15 questions, two answer pictures per question, speech playback, immediate feedback, progress, scoring, and a result screen.

This version does not include user login, persistence, payments, a real backend, ranking, or WeChat mini program packaging. Those are reserved for the later mini program conversion.

## User Flow

1. The child opens the page and sees Level 1 with a large start button.
2. The child starts the challenge.
3. Each question shows progress, a replay button, and two large illustrated answer cards.
4. The browser reads the English sentence aloud through the Web Speech API.
5. The child picks one picture.
6. The screen shows whether the answer is correct and then moves to the next question.
7. After 15 questions, the child sees the score, star rating, and retry/start-over actions.

## Interaction Rules

- Each question has exactly two choices.
- The correct sentence is short and concrete, such as "The girl is reading."
- The answer cards use child-friendly illustrations made with CSS and emoji-like visual elements, so the demo has no external asset dependency.
- The selected answer locks the current question until feedback is shown.
- Correct answers add one point.
- Star rating is based on final score: 13-15 is three stars, 10-12 is two stars, 6-9 is one star, and 0-5 is no star.

## Architecture

The demo is a static app:

- `index.html` holds the application shell.
- `styles.css` defines the responsive child-friendly interface.
- `app.js` holds the question data, state machine, speech playback, answer handling, and result rendering.

## Verification

Open `index.html` in a browser and verify:

- The start screen appears.
- A 15-question level can be completed.
- The replay button speaks the current sentence when speech synthesis is available.
- Selecting answers advances through the level.
- The result screen shows the correct score and star count.
