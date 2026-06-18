---
quick_id: 260618-zlk
status: complete
date: 2026-06-18
---

# Quick Task 260618-zlk: Compact order list row and filters

## Goal

Reduce order-list visual noise by making each order row shorter and more focused, using the status rail as the main card color signal, and refactor the order filters so controls do not wrap into an untidy multi-line block.

## Tasks

1. Tighten the order row: fewer always-visible detail blocks, compact payment/action layout, rail-accent card styling, and preserved copy/tooltip affordances.
2. Refactor `OrderList.screen.tsx` filters into a compact responsive panel with status pills and a stable controls grid.
3. Add/adjust focused tests for filter behavior if markup changes affect queries.
4. Run targeted order-list/order-item tests and `yarn build`, then commit source and GSD artifacts.

## Result

- Source commit: `2a116a6` (`fix: compact order list rows and filters`)

## Relevant Conventions

- C2/C4/C5: keep item actions compact with overflow.
- C7/C13: tags stay pill-shaped and under the item name when actions occupy the corner.
- C8: filters and list should sit on consistent card/background surfaces.
- C14: labels stay specific and natural Vietnamese.
