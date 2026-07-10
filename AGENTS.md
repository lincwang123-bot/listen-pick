# AGENTS.md

## Project Doctrine

This project is a children's English enlightenment education product: 儿童启蒙 is the purpose, not a decoration. The core duty is to help children hear English, form the right picture in their mind, and understand the sentence accurately.

For every lesson, 图片、音频、中英文必须严谨，不能出错. Image meaning, audio content, English sentence, Chinese hint, and answer mapping must all point to the same concept. Any mismatch is a teaching error, not a cosmetic issue.

## Maintenance Rules

- Treat content correctness as higher priority than speed, visual polish, or convenience.
- Before fixing a reported lesson issue, inspect the level data, runtime playable data, image assets, audio paths, and deployed cache version.
- When changing a sentence, image, or audio file, check the paired correct and wrong choices together.
- If a picture is ambiguous for a child, replace or redraw it. Do not leave unclear animal, number, color, position, or action cues in production.
- If audio may be stale or mismatched, regenerate it from the current sentence and bump the cache version.
- Add or update automated tests whenever the issue can be guarded by data, rules, or project policy.
- Do not deploy educational content until local tests pass and the live URL has been spot-checked.
