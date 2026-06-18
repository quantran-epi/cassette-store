---
quick_id: 260618-hce
status: complete
date: 2026-06-18
commit: c766d08
---

# Quick Task 260618-hce Summary

## Completed

- Redesigned the order list item as a compact operator row with a status rail, summary section, payment block, action area, sync warning area, and metadata chips.
- Removed order-row use of `TruncatedText`, eliminating visible `xem thêm` popover buttons from title, phone, address, and tracking-code snippets.
- Added row-local tooltip clipping through `Tooltip` so short visible snippets reveal full text on hover while copy-to-clipboard behavior remains intact.
- Rebuilt responsive CSS for desktop, tablet, and mobile row layouts.

## Verification

- `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderActionSurface.widget.test.tsx` passed: 3 suites, 15 tests.
- `yarn build` completed successfully with existing repo-wide non-failing warnings.

## Notes

- Existing redux-persist test console warnings and CRA/Babel/Browserslist/build lint warnings remain outside this change.

