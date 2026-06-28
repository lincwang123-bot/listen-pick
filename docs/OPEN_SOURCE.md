# Public Source Sharing Notes

This project is source-available for non-commercial use. It is not OSI open source because the license restricts commercial use.

## Why This License

The project contains product design, curriculum structure, children's learning flow, generated content workflows, and teaching assets. The intent is to let people inspect, learn from, and contribute to the project without allowing direct commercial reuse.

The repository uses:

- PolyForm Noncommercial License 1.0.0 for source code and project files
- `NOTICE.md` for the required project notice
- Separate written permission for any commercial use

## What To Publish

Good candidates for the public repository:

- `index.html`
- `styles.css`
- `src/`
- `scripts/`
- `tests/`
- `docs/`
- `package.json`
- `README.md`
- `LICENSE`
- `NOTICE.md`

Keep or publish generated runtime assets only when you are comfortable sharing them. Large media folders can also be distributed as releases, Git LFS objects, CDN assets, or a separate private deployment package.

## What Not To Publish

Do not publish:

- `.env` files
- local TTS virtual environments
- temporary folders under `tmp/`
- browser profiles or cache folders
- VPS SSH names, private keys, tokens, API keys, or cookies
- one-off design/video experiment folders unless intentionally cleaned
- raw child data, analytics exports, names, or recordings

## Commercial Permission

The default answer to commercial use is no. If you later want to allow paid licensing, add a separate `COMMERCIAL.md` file describing how to request permission. Keep that separate from the public license.

## Suggested Repository Description

```text
Source-available non-commercial children's English listening game prototype.
```

Avoid describing the project as "open source" without qualification.

## Publishing Checklist

Run these before pushing to a public remote:

```bash
npm test
rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' --glob '!tmp/**' --glob '!.venv*/**' "api[_-]?key|secret|token|password|PRIVATE KEY|/Users/"
git status --short
```

Then inspect the diff manually:

```bash
git diff --stat
git diff -- README.md LICENSE NOTICE.md docs/OPEN_SOURCE.md .gitignore package.json
```

## Future Options

If you later decide to allow broader reuse, you can relicense future versions under a permissive license. Existing users can keep using the version they received under the license that applied at that time, so choose public licensing carefully before a first public release.
