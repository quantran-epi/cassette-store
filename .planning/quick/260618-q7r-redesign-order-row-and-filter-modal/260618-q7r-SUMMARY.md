---
quick_id: 260618-q7r
status: complete
date: 2026-06-18
source_commit: dd2b83a
completed_at: 2026-06-18T09:48:56Z
---

# Quick Task 260618-q7r Summary

## Outcome

Replaced the noisy order-list layout with a cleaner ledger-style order row and moved secondary filters into a separate modal, leaving the list page focused on search, create, and one filter action.

## Changes

- Added `OrderListFilterModal.widget.tsx` for status, COD, shipping, date, and sort controls.
- Reduced the order-list toolbar to search, `Bộ lọc`, `Tạo đơn`, and a short active-filter summary.
- Changed the order card from a stacked quick-strip layout to a tighter row: status rail, name/date/status tags, one slim metadata line, amount, and compact actions.
- Updated the order-list tests to open the filter modal before asserting modal-only controls.

## Verification

- `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderList.screen.test.tsx src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderActionSurface.widget.test.tsx` passed.
- `yarn build` passed with existing non-failing CRA/Browserslist/ESLint warnings.

## Commits

- Source: `dd2b83a` (`fix: redesign order rows and move filters to modal`)
