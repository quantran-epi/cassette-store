---
quick_id: 260618-zlk
status: complete
date: 2026-06-18
source_commit: 2a116a6
completed_at: 2026-06-18T09:31:41Z
---

# Quick Task 260618-zlk Summary

## Outcome

Made the order list denser and more focused without removing the operator actions that matter. The order card now relies on the status rail as the main color cue, and the filter controls are contained in one compact responsive panel instead of wrapping across several loose rows.

## Changes

- Shortened order cards by removing the always-visible customer-history line and the extra payment/free-ship info cards.
- Kept shipping code, phone, and address as one-tap copy controls, but compressed them into a single-line metadata strip on desktop.
- Reduced card padding, shadow, gaps, and payment chrome so the rail color is the strongest visual anchor.
- Rebuilt the order-list filter area as a single panel: search/add row, horizontally scrolling status pills, fixed grid for COD/shipping/date/sort controls, and a compact active-filter strip.
- Added `OrderList.screen.css` to keep the filter layout responsive and scoped.

## Verification

- `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderList.screen.test.tsx src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderActionSurface.widget.test.tsx` passed.
- `yarn build` passed with existing non-failing CRA/Browserslist/ESLint warnings.

## Commits

- Source: `2a116a6` (`fix: compact order list rows and filters`)
