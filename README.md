# Listen & Pick English Demo

A static browser prototype for a children's English listening game. Each level plays a short English sentence and asks the child to pick the matching picture from two choices.

## Current Features

- One playable level with 15 questions
- Two picture choices per question
- Local sentence audio files for clearer pronunciation
- Correct answers auto-advance to the next question
- Incorrect answers show feedback and require Continue
- Toggle to show or hide English hints under pictures
- Result screen with score and star rating
- iPad mini friendly layout

## Run Locally

```bash
npm start
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

## Test

```bash
npm test
```

## Project Structure

```text
.
├── assets/
│   ├── audio/          # Local m4a sentence audio
│   ├── scenes/         # Scene illustrations used by questions
│   └── scene-sprite.png
├── docs/
│   ├── screenshots/    # QA screenshots
│   └── superpowers/    # Design and implementation notes
├── scripts/
│   └── generate-audio-assets.mjs
├── src/
│   ├── app.mjs         # Browser UI and interaction flow
│   └── game.mjs        # Question data and scoring logic
├── tests/
│   └── game.test.mjs
├── index.html
├── styles.css
└── package.json
```

## Deployment

This is a static site. It can be deployed to GitHub Pages, Nginx, Caddy, or any VPS static file host by serving the project root.

## Mini Program Migration Path

The current data and assets can be moved into a WeChat Mini Program structure later:

- `src/game.mjs` -> `data/questions.js`
- `assets/audio` -> `miniprogram/assets/audio`
- `assets/scenes` -> `miniprogram/assets/scenes`
- `index.html` / `styles.css` / `src/app.mjs` -> Mini Program pages and components
