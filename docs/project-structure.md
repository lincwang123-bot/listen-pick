# Project Structure

This project is a static prototype for an English listening picture-choice game.

## Core Files

- `index.html`: App screens and static DOM shell.
- `styles.css`: Visual system, responsive layout, and iPad mini adaptation.
- `src/game.mjs`: Question data, image/audio paths, scoring, and star rules.
- `src/app.mjs`: Screen rendering, answer handling, hint toggle, audio playback, and result flow.
- `src/course/levels-002-030.generated.mjs`: Generated curriculum data for Levels 2-30.

## Assets

- `assets/audio/*.m4a`: Local sentence audio files.
- `assets/scenes/*.png`: Scene illustrations used by answer cards.
- `assets/scene-sprite.png`: Source sprite sheet used to create the current scene set.

## Scripts

- `scripts/generate-audio-assets.mjs`: Regenerates local sentence audio from the question text using macOS `say`.
- `scripts/generate-course-levels.mjs`: Generates the first curriculum data batch.
- `scripts/validate-course.mjs`: Checks curriculum structure, age fit, banned terms, sentence length, and duplicates.

## Tests

- `tests/game.test.mjs`: Validates question count, asset paths, audio paths, scoring, and star mapping.

## Deployment Notes

The app does not require a backend or build step. Serve the project root as static files.
