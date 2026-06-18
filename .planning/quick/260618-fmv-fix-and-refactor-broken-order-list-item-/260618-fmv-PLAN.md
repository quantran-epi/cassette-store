---
quick_id: 260618-fmv
status: planned
date: 2026-06-18
---

# Quick Task 260618-fmv: Fix and refactor broken order list item UI

## Goal

Make the order list item layout clean and responsive so order details, status tags, shipping/customer metadata, and actions no longer break awkwardly across lines.

## Tasks

1. Refactor `OrderItem.widget.tsx` to use a controlled row layout instead of Ant Design `List.Item` action layout.
2. Add scoped CSS for the order row header, body, metadata groups, and mobile breakpoints.
3. Run a production build or focused tests to confirm TypeScript and JSX remain valid.

## Verification

- `yarn build`

