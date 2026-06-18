---
quick_id: 260618-hce
status: planned
date: 2026-06-18
---

# Quick Task 260618-hce: Redesign order list item layout with tooltip truncation

## Goal

Replace the current order row with a cleaner internal-operator layout and remove visible `xem thêm` popover buttons from row metadata.

## Tasks

1. Refactor `OrderItem.widget.tsx` so order title, customer, shipping, and address snippets use clipped text with hover tooltips.
2. Redesign `OrderItem.widget.css` around a compact status marker, summary area, metadata strips, and responsive action placement.
3. Run focused order-item tests and a production build.

## Verification

- Focused order item Jest tests pass.
- `yarn build` completes successfully.

