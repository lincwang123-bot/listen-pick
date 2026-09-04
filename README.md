# Listen & Pick

> Contact: X [@superwang](https://x.com/superwang) · Telegram [@lincwang](https://t.me/lincwang)

[中文说明](README.zh-CN.md)

Listen & Pick is a source-available, non-commercial prototype for a children's English listening and picture-selection learning system.

Children hear one short English sentence, see two pictures, and choose the picture that matches the meaning. The learning goal is:

```text
hear English -> form a picture -> understand the sentence
```

It is designed for Chinese children ages 6-10 who are starting English listening. The current product is a static web demo, with a future migration path toward a WeChat Mini Program.

Live demo:

```text
https://linc.wang/listen-pick/
```

## License

This project is released under the PolyForm Noncommercial License 1.0.0.

Commercial use is not allowed without prior written permission from the project owner. This means you may not sell, host, bundle, white-label, train a paid product from, or otherwise use this project for a commercial service unless you have separate permission.

Because non-commercial restrictions are not compatible with the Open Source Definition, this repository should be described as source-available for non-commercial use, not OSI open source.

See:

- `LICENSE`
- `NOTICE.md`
- `docs/OPEN_SOURCE.md`

## Current Status

- 300 playable textbook-style levels, 15 questions per level
- Level picker grouped into 25-level learning blocks
- Two picture choices per sentence
- Randomized left/right picture order for each question session
- Local audio files for clearer pronunciation
- Male and female voice selection, defaulting to male voice
- Adjustable speech speed
- English hint toggle and Chinese hint toggle
- Chinese hint text shown under the English hint when enabled
- Wrong-answer review scheduling with `+3 / +10 / +25` review positions
- Score based on first-attempt correctness, so repeated retries do not inflate the result
- Result screen with score-based Chinese encouragement
- Child nickname stored locally in the browser for on-screen encouragement
- Asset preloading for the current level and upcoming levels
- Privacy-preserving anonymous usage beacons for unique visitor and active-user counts
- Static deployment friendly for a VPS, GitHub Pages, Nginx, or Caddy

Recent maintenance:

- Fixed learning mode so it always opens the selected course content instead of scheduled review content
- Fixed review audio so it follows the review question currently shown on screen
- Disabled native mobile image drag/preview gestures so tapping a picture selects the answer
- Fixed missing Chinese action hints for `watering`, `painting`, `building`, and `lowering`; Level 151 now shows natural Chinese hints for plant/flower watering
- Clarified 21 putting-on/taking-off and putting-in/taking-out image pairs with motion arrows so static pictures show action direction more clearly
- Added anonymous visitor beacons at `/listen-pick/__analytics/visit`; the Nginx access log can be deduplicated by `vid`
- Added executable whole-course audits for English/semantic risks, all three audio variants, and visually similar picture pairs
- Expanded Chinese hint handling for family relationships, measure words, phrasal verbs, locations, body parts, and missing vocabulary
- Verified all 13,500 audio files are present and decodable, with no different sentences sharing identical media
- Manually recounted all 150 picture choices in Levels 11-15; Level 13 now matches every English quantity
- Repaired every confirmed/high-risk item from the 300-level content review with 163 targeted image replacements, sentence/audio regeneration, and style-matched illustrations
- Revalidated 4,500 questions: content findings `0`, image findings `0`, and audio findings `0`; the remediation record is in `docs/course-quality-audit-2026-07-10.md`
- Unified all course audio to Andrew for the male/default voice and Jenny for the female voice, while preserving the existing speed controls

## Run Locally

```bash
npm install
npm start
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

The source repository does not include the large generated textbook media folder. A clean clone can start the app shell, but complete local play for Levels 1-300 requires the generated media package to be copied into:

```text
assets/textbook/
```

Without that folder, the browser will show missing question images/audio for the playable textbook levels, and asset-completeness checks that depend on local media will fail.

## Test

```bash
npm test
```

## Course Data

The current browser build uses generated curriculum modules in `src/course/`.

Helpful commands:

```bash
npm run validate:course
npm run generate:textbook-playable
npm run audit:course-content
npm run audit:course-audio -- --probe
npm run audit:textbook-images
npm run optimize:textbook-images
```

Educational content is not release-ready merely because files exist. Every question must keep its English sentence, spoken audio, Chinese hint, correct picture, and distractor picture aligned to the same child-facing concept. Confirmed or high-suspicion findings in the course quality audit are release blockers.

Audio generation commands are kept in `package.json`. Large local TTS environments and temporary generation output are intentionally ignored by Git.

For a fully playable local build, provide these generated assets:

```text
assets/textbook/images/
assets/textbook/audio/
assets/textbook/audio-male/
assets/textbook/audio-female/
assets/textbook/contact-sheets/
```

These assets can be distributed separately as a release asset, Git LFS package, CDN folder, or private deployment bundle.

Runtime WebP images are expected to use paths like:

```text
assets/textbook/images/level-XXX/qYYY-correct.webp
assets/textbook/images/level-XXX/qYYY-wrong.webp
```

Recent image optimization targets `640x480` WebP output to keep the web demo and future Mini Program package lighter.

## Media Assets

The project has two kinds of assets:

- Small runtime assets that can be committed when needed
- Large generated illustration/audio batches that are better kept in release packages, Git LFS, object storage, or on the deployment server

For public source sharing, do not commit local browser profiles, temporary generated images, TTS model folders, or one-off social-card/video experiments.

## Privacy Notes

This prototype does not require WeChat login or a backend account system. A child's nickname is stored in the browser with local storage and is used only for on-screen encouragement.

The deployed demo sends an anonymous random visitor id, a random session id, event type, and page path to `/listen-pick/__analytics/visit`. It does not send a child's nickname, voice recordings, answers, scores, or account data. The VPS writes those beacons to `/var/log/nginx/listen-pick-analytics.access.log`; unique users are counted by deduplicating `vid`, and active users are estimated from recent heartbeat events.

## Deployment

This is a static site. The project root can be served directly by any static file host.

Example production path:

```text
https://linc.wang/listen-pick/
```

Keep the same file structure on the server so existing asset paths continue to work.

For the current VPS deployment, code/data and generated media are usually synced separately:

```bash
rsync -az index.html src linc-vps:/opt/linc/sites/localpilot/listen-pick/
rsync -az --include='*/' --include='*.webp' --exclude='*' assets/textbook/images/ linc-vps:/opt/linc/sites/localpilot/listen-pick/assets/textbook/images/
```

Avoid syncing the entire `assets/textbook/images/` directory blindly because local PNG masters are intentionally large.

## Mini Program Migration Path

The current data and assets can later be moved into a WeChat Mini Program:

- `src/course/` -> Mini Program data modules
- `assets/audio/` and generated course audio -> Mini Program or CDN assets
- `assets/course/` and generated images -> Mini Program or CDN assets
- `index.html`, `styles.css`, `src/app.mjs` -> pages, components, and WXSS/WXML logic

## Public Repository Checklist

Before publishing, run:

```bash
npm test
rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' --glob '!tmp/**' --glob '!.venv*/**' "api[_-]?key|secret|token|password|PRIVATE KEY|/Users/"
git status --short
```

Review `docs/OPEN_SOURCE.md` for the recommended public package shape.
