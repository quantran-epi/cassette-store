---
quick_id: 260618-hnz
status: planned
date: 2026-06-18
---

# Quick Task 260618-hnz: Deploy redesigned order list item

## Goal

Deploy the committed redesigned order list item through the static `docs/` deployment flow.

## Tasks

1. Run `yarn build`.
2. Copy all files from `build/` into `docs/` except `build/manifest.json`.
3. Run `git add ./src/*`, `git add ./docs/*`, commit changed deployment output, and push.

## Verification

- Production build completes successfully.
- Push to `origin/main` completes successfully.

