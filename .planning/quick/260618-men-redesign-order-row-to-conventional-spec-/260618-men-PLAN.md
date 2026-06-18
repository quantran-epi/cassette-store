---
quick_id: 260618-men
status: complete
date: 2026-06-18
---

# Quick Task 260618-men: Redesign order row to conventional spec and deploy

## Goal

Make the order list item intuitive, simple, hands-on, and polished while following `docs/specs/conventional-specs.md`, then deploy the static app.

## Tasks

1. Apply relevant shared primitive conventions: compact in-item actions and pill tags.
2. Redesign the order row around scan-first information, natural Vietnamese labels, top-right overflow, visible primary action, and compact operational details.
3. Run focused order-item tests plus `yarn build`.
4. Commit source and GSD artifacts, then run the static `docs/` deployment flow and push.

## Result

- Source commit: `831d4b7` (`fix: redesign order row to conventional spec`)
- Deployment commit: `e085640` (`docs: deploy order row redesign`)

## Targeted Conventions

- C2: per-item overflow trigger at top-right with at most focused visible actions.
- C4/C5: in-item actions use compact `ActionButton`, not normal `Button`.
- C7: tags render as rounded pills.
- C13: row tags stay under the order name because the top-right is occupied by actions.
- C14: row labels use clear Vietnamese copy.
