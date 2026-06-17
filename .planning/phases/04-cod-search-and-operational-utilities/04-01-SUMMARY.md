---
phase: 04-cod-search-and-operational-utilities
plan: 01
subsystem: selectors
tags: [redux, selectors, dashboard, order-list, read-models]
requires: []
provides:
  - Selector-backed dashboard totals
  - Selector-backed order list filtering, sorting, and summaries
  - Broad order/customer search read model foundation
affects: [order-list, dashboard, cod-import, operational-status]
tech-stack:
  added: []
  patterns: [pure read model builders, RTK createSelector wrappers]
key-files:
  created:
    - src/Store/Selectors/OrderSelectors.ts
    - src/Store/Selectors/DashboardSelectors.ts
    - src/Store/Selectors/OrderSelectors.test.ts
    - src/Store/Selectors/DashboardSelectors.test.ts
  modified:
    - src/Modules/Home/Screens/Dashboard.screen.tsx
    - src/Modules/Order/Screens/OrderList.screen.tsx
    - src/Hooks/useOrder.ts
key-decisions:
  - "Use pure builder functions plus createSelector wrappers so Phase 4 UI and import flows can test read models without React."
  - "Remove unused useOrder dashboard helpers instead of retaining compatibility wrappers because no active callers remain."
patterns-established:
  - "Selector read models expose both pure builders and Redux selectors."
  - "Dashboard and order list screens consume derived summaries instead of repeating render-time reductions."
requirements-completed: [ORD-04, OPS-04]
duration: 18 min
completed: 2026-06-17
---

# Phase 04 Plan 01: Selector-Backed Operational Read Models Summary

**Redux selector read models now drive dashboard totals and order-list filtered rows, summaries, and broad search behavior.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-06-17T02:53:45Z
- **Completed:** 2026-06-17T03:11:45Z
- **Tasks:** 4
- **Files modified:** 7

## Accomplishments

- Added tested pure order list read models for broad order/customer search, status/COD/shipping/date filters, sort modes, and summary totals.
- Added tested dashboard read models for bank transfer, COD, shipping, returned/refused, and customer repeat/VIP/blacklist metrics.
- Wired `DashboardScreen` and `OrderListScreen` to consume selector-backed summaries while preserving the current visible controls.
- Removed unused dashboard total helpers from `useOrder`, keeping Trello/order mutation methods untouched.

## Task Commits

1. **Task 1: Cover order list and dashboard read models** - `dd881c7` (test)
2. **Task 2: Implement selector/read-model helpers** - `5e1ce5f` (feat)
3. **Task 3: Wire dashboard and order list summaries to selectors** - `b08be43` (feat)
4. **Task 4: Retire duplicated useOrder dashboard helpers where safe** - `bc86b9c` (refactor)
5. **Cleanup: touched-screen warning cleanup** - `cc295ce` (refactor)

## Files Created/Modified

- `src/Store/Selectors/OrderSelectors.ts` - Order/customer joined query, filter, sort, pagination-ready rows, and summary read models.
- `src/Store/Selectors/OrderSelectors.test.ts` - Regression coverage for broad search, D-04 filters, sort modes, and summary formulas.
- `src/Store/Selectors/DashboardSelectors.ts` - Dashboard totals and customer summary read models.
- `src/Store/Selectors/DashboardSelectors.test.ts` - Regression coverage for dashboard totals and top customer ordering.
- `src/Modules/Home/Screens/Dashboard.screen.tsx` - Uses `selectDashboardReadModel` for dashboard statistics.
- `src/Modules/Order/Screens/OrderList.screen.tsx` - Uses `selectOrderListReadModel` for filtered rows and summary tags.
- `src/Hooks/useOrder.ts` - Removed unused dashboard statistic helper exports/functions.

## Decisions Made

- Used pure builder functions behind Redux selectors so tests can exercise business logic without rendering React.
- Kept `OrderListScreen` controls local for this plan; URL query wiring is intentionally deferred to Plan 04-03.
- Removed obsolete `useOrder.getTotal*` helpers because no active callers remained after dashboard selector wiring.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Cleaned warnings introduced in touched screens**
- **Found during:** Build verification after Task 4
- **Issue:** The touched dashboard/order-list screens still used empty destructuring from `useScreenTitle`, and `OrderListScreen` retained an unused import after selector wiring.
- **Fix:** Called `useScreenTitle` directly and removed the stale import.
- **Files modified:** `src/Modules/Home/Screens/Dashboard.screen.tsx`, `src/Modules/Order/Screens/OrderList.screen.tsx`
- **Verification:** Targeted selector/useOrder tests passed after cleanup.
- **Committed in:** `cc295ce`

---

**Total deviations:** 1 auto-fixed (1 missing critical). **Impact:** Cleanup only; no scope expansion or behavior change.

## Issues Encountered

- `yarn build` passed with existing CRA/Browserslist/Babel and brownfield ESLint warnings. No Phase 4 selector build blocker remained after touched-screen cleanup.
- `useOrder.test.ts` still logs the existing Redux Persist non-serializable action warning from store initialization; tests pass.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 04-02 can use the selector foundation for COD-eligible order matching and summaries. Plan 04-03 can move the order list query into URL params on top of the read model introduced here.

## Self-Check: PASSED

- Targeted selector tests pass.
- Existing `useOrder.test.ts` passes after removing unused helper exports.
- `yarn build` passes with warnings only.

---
*Phase: 04-cod-search-and-operational-utilities*
*Completed: 2026-06-17*
