---
phase: 03-fast-order-and-shipping-workflows
plan: 03
subsystem: order-shipping-ui
tags: [react, shipping-code, clipboard, trello-sync, row-status]

requires:
  - phase: 03-fast-order-and-shipping-workflows
    provides: order route and create flow cleanup for faster operator workflow
  - phase: 02-order-state-and-trello-sync-reliability
    provides: useOrder.changeShippingCode local-first workflow and row-scoped sync recovery controls
provides:
  - Row-level inline shipping-code entry for eligible Trello-pushed placed orders
  - Explicit paste controls for both inline and modal shipping-code entry
  - Tests proving row save uses changeShippingCode and shipping sync failures keep retry/manual-resolved controls visible
affects: [order-row-actions, shipping-code-flow, trello-sync-recovery]

tech-stack:
  added: []
  patterns:
    - Compact row-level action widgets can delegate to existing order workflow handlers and return OrderWorkflowResult for local UI cleanup
    - Clipboard reads must be tied to explicit operator actions, not modal open/render events

key-files:
  created:
    - src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.tsx
    - src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.test.tsx
  modified:
    - src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx
    - src/Modules/Order/Screens/OrderItem/OrderChangeShippingCode.widget.tsx
    - src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx

key-decisions:
  - "Inline shipping-code save reuses OrderItemWidget's existing _onChangeShippingCode path, preserving useOrder.changeShippingCode behavior."
  - "The modal remains available through the existing dropdown, but clipboard access is now explicit via Dán mã."
  - "Persistent Trello sync status remains row-scoped through OrderSyncStatusWidget; no list-wide alert center was added."

patterns-established:
  - "Shipping-code row tests render OrderItemWidget with seeded Redux state and mock only useOrder boundary methods."
  - "Modal and inline clipboard behavior can share the same explicit paste affordance without automatic reads."

requirements-completed: [OPS-02]

duration: 7 min
completed: 2026-06-16
---

# Phase 03 Plan 03: Inline Shipping-Code Flow and Row Status Summary

**Eligible order rows now expose direct shipping-code entry with explicit paste and existing row-scoped Trello sync recovery.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-06-16T13:48:08Z
- **Completed:** 2026-06-16T13:55:08Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Added failing then passing coverage for inline row shipping-code entry, explicit clipboard paste, local-success/Trello-failure warning feedback, and row-scoped retry/manual-resolved controls.
- Added `OrderInlineShippingCodeWidget` and rendered it on Trello-pushed placed orders that do not yet have a shipping code.
- Removed automatic clipboard reads from `OrderChangeShippingCodeWidget` and added explicit modal paste behavior while keeping the modal as a secondary path.
- Preserved `useOrder.changeShippingCode` as the only save workflow for inline and modal shipping-code updates.

## Task Commits

Each task was committed atomically:

1. **Task 1: Cover row-level shipping-code save behavior** - `621db48` (test)
2. **Task 2: Add primary inline shipping-code widget** - `3a6a0ba` (feat)
3. **Task 3: Replace automatic clipboard read with explicit paste and verify row-scoped feedback** - `24d40c6` (feat)

**Plan metadata:** pending in this summary commit

## Files Created/Modified

- `src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.tsx` - Compact row-level shipping-code input with explicit paste and save controls.
- `src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.test.tsx` - Covers row entry, explicit inline/modal paste, save through changeShippingCode, and Trello warning feedback.
- `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` - Renders inline shipping-code entry for eligible rows and returns workflow results from the existing handler.
- `src/Modules/Order/Screens/OrderItem/OrderChangeShippingCode.widget.tsx` - Removes modal-open clipboard read and adds explicit paste.
- `src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx` - Confirms shipping-code sync failures expose `Thử lại` and `Đã xử lý`.

## Decisions Made

- The inline widget is intentionally small and row-local: it does not introduce a new list-wide sync surface or persistent success indicator.
- The modal stays reachable from the existing dropdown because it remains useful for focused editing, but its clipboard behavior now matches the inline explicit-paste rule.
- `OrderItemWidget._onChangeShippingCode` returns `OrderWorkflowResult` so the inline widget can clear local input only after local state was saved.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Tightened inline save result typing after build failure**
- **Found during:** Task 3 (production build verification)
- **Issue:** `OrderInlineShippingCodeWidget` allowed `onSave` to return `void`, then read `result.localUpdated`, which failed TypeScript in production build.
- **Fix:** Required `onSave` to return `Promise<OrderWorkflowResult<unknown>>`, matching the actual `OrderItemWidget` handler.
- **Files modified:** `src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.tsx`
- **Verification:** `yarn build` passed after the type fix.
- **Committed in:** `24d40c6`

---

**Total deviations:** 1 auto-fixed blocking issue.
**Impact on plan:** Build-only type correction; no functional scope expansion.

## Issues Encountered

- The initial shipping-code test failed as expected because no row-level input or paste/save controls existed.
- The combined test run exposed a redux-persist timer issue when Jest cleared mocked IndexedDB implementations. The inline test now reapplies `idb-keyval` promise-returning mocks in `beforeEach`.
- `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx src/Hooks/useOrder.test.ts --silent` passed.
- `yarn build` passed with existing non-failing CRA/Babel, Browserslist, and brownfield ESLint warnings.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

All Phase 3 planned implementation work is complete. Phase-level verification can now check route cleanup, faster order creation, inline shipping-code entry, explicit paste, and row-scoped sync recovery together.

## Self-Check: PASSED

- Eligible placed, Trello-pushed rows render inline shipping-code input, `Dán mã`, and `Lưu mã` controls.
- Clipboard reads occur only after explicit paste in both inline and modal shipping-code surfaces.
- Inline save calls `changeShippingCode(order.id, code)` through the existing order item handler.
- Shipping-code sync failures remain visible through `OrderSyncStatusWidget` with `Thử lại` and `Đã xử lý`.
- No order-list-wide sync alert/status center was introduced.
- Targeted shipping/useOrder tests and production build passed.

---
*Phase: 03-fast-order-and-shipping-workflows*
*Completed: 2026-06-16*
