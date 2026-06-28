# Listen & Pick

[中文说明](README.zh-CN.md)

Listen & Pick is a source-available, non-commercial prototype for a children's English listening game.

Children hear one short English sentence, see two pictures, and choose the picture that matches the meaning. The learning goal is:

```text
hear English -> form a picture -> understand the sentence
```

It is designed for Chinese children ages 6-10 who are starting English listening.

## License

This project is released under the PolyForm Noncommercial License 1.0.0.

Commercial use is not allowed without prior written permission from the project owner. This means you may not sell, host, bundle, white-label, train a paid product from, or otherwise use this project for a commercial service unless you have separate permission.

Because non-commercial restrictions are not compatible with the Open Source Definition, this repository should be described as source-available for non-commercial use, not OSI open source.

See:

- `LICENSE`
- `NOTICE.md`
- `docs/OPEN_SOURCE.md`

## Features

- 100 playable levels, 15 questions per level
- Two picture choices per sentence
- Local audio files for clearer pronunciation
- Male and female voice selection, defaulting to male voice
- Adjustable speech speed
- English hint toggle and Chinese hint toggle
- Result screen with score-based Chinese encouragement
- Child nickname stored locally in the browser for on-screen encouragement
- Level picker grouped by learning blocks instead of one long list
- Asset preloading for the current level and nearby levels
- Static deployment friendly for a VPS, GitHub Pages, Nginx, or Caddy

## Run Locally

```bash
npm install
npm start
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

The source repository does not include the large generated textbook media folder. A clean clone can start the app shell, but complete local play for Levels 1-100 requires the generated media package to be copied into:

```text
assets/textbook/
```

Without that folder, the browser will show missing question images/audio for the current playable textbook levels, and the asset completeness tests will fail.

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
npm run generate:webp-images
```

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

## Media Assets

The project has two kinds of assets:

- Small runtime assets that can be committed when needed
- Large generated illustration/audio batches that are better kept in release packages, Git LFS, object storage, or on the deployment server

For public source sharing, do not commit local browser profiles, temporary generated images, TTS model folders, or one-off social-card/video experiments.

## Privacy Notes

This prototype does not require WeChat login or a backend account system. A child's nickname is stored in the browser with local storage and is used only for on-screen encouragement.

If analytics are added later, avoid collecting children's real names, voice recordings, or unnecessary personal data.

## Deployment

This is a static site. The project root can be served directly by any static file host.

Example production path:

```text
https://linc.wang/listen-pick/
```

Keep the same file structure on the server so existing asset paths continue to work.

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
