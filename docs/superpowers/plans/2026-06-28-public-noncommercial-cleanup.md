# Public Noncommercial Cleanup Plan

## Goal

Prepare Listen & Pick for public source sharing without changing the current child-facing runtime behavior.

## Scope

- Add a non-commercial source-available license.
- Add a required notice and public sharing guidance.
- Update README to describe the current product shape.
- Ignore large local/generated/private folders that should not enter Git.
- Remove hardcoded local paths from public-facing files.
- Verify tests and scan for obvious secrets or machine-specific paths.

## Non-Goals

- Do not change gameplay.
- Do not change deployed file paths.
- Do not delete local generated assets.
- Do not switch to a backend, login system, or analytics system.

## Implementation Steps

1. Add `LICENSE`, `NOTICE.md`, and `docs/OPEN_SOURCE.md`.
2. Rewrite `README.md` around the current 100-level static prototype.
3. Add `CONTRIBUTING.md` and `.gitattributes`.
4. Expand `.gitignore` for local toolchains, generated media, temporary folders, and experiment folders.
5. Replace absolute local paths in helper scripts and generated comments.
6. Run tests and a public-release scan.

## Verification

Run:

```bash
npm test
rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' --glob '!tmp/**' --glob '!.venv*/**' "api[_-]?key|secret|token|password|PRIVATE KEY|/Users/"
```

Expected result:

- Tests pass.
- Any remaining scan hits are reviewed and either removed or documented as harmless.
