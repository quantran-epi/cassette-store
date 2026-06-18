---
phase: 05-cohesive-ui-ux-refresh
plan: 04
subsystem: ui
tags: [react, redux-selector, dashboard, mobile-layout, antd]
requires:
  - phase: 05-cohesive-ui-ux-refresh
    provides: token-driven app theme, appTokens, Card tokenization, and TruncatedText tap reveal from Plan 05-01
  - phase: 04-cod-search-and-operational-utilities
    provides: selector-backed dashboard formulas and COD/order operational data to preserve
provides:
  - Selector-backed dashboard decision group read model
  - Mobile decision dashboard cards for COD, shipping, cash, customer follow-up, and returns
  - Dashboard render coverage proving Vietnamese decision labels and selector-derived values
affects: [phase-05, dashboard, app-shell, selectors]
tech-stack:
  added: []
  patterns: [selector-backed decision groups, tokenized dashboard cards, local matchMedia shim for AntD shell tests]
key-files:
  created:
    - src/Modules/Home/Screens/Dashboard.screen.test.tsx
  modified:
    - src/Store/Selectors/DashboardSelectors.ts
    - src/Store/Selectors/DashboardSelectors.test.ts
    - src/Modules/Home/Screens/Dashboard.screen.tsx
    - src/App.test.tsx
key-decisions:
  - "DashboardScreen renders from selectDashboardReadModel decisionGroups and customer summaries instead of reading raw orders or doing render-time reductions."
  - "Dashboard top-customer rows use TruncatedText and responsive flex rows rather than fixed-width Typography.Paragraph ellipsis."
  - "The app-shell smoke test keeps a local matchMedia shim because the refreshed dashboard now renders Ant Design List inside the default route."
patterns-established:
  - "Dashboard operational metrics are grouped as selector read-model data before entering React presentation code."
  - "Dashboard cards use appTokens spacing, 44px metric rows, Vietnamese decision labels, and TruncatedText for long customer rows."
requirements-completed: [UX-01, UX-02, UX-04, UX-05]
duration: 13 min
completed: 2026-06-18
---

# Phase 05 Plan 04: Decision-Oriented Mobile Dashboard Summary

**Dashboard metrics now render as selector-backed mobile decision cards for COD reconciliation, shipping attention, cash health, customer follow-up, and returns.**

## Performance

- **Duration:** 13 min
- **Started:** 2026-06-18T09:36:23+07:00
- **Completed:** 2026-06-18T09:49:24+07:00
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Added `dashboard.decisionGroups` with stable keys for COD reconciliation, shipping attention, cash health, customer follow-up, and return/refuse-to-receive attention.
- Replaced the old tab-only raw totals dashboard with mobile decision cards that read only `selectDashboardReadModel` output.
- Reworked top-customer rows to use responsive tokenized list rows and `TruncatedText`, removing fixed `width: 220` / `width: 280` paragraph styles.
- Added dashboard screen coverage for Vietnamese decision labels and representative selector-derived metric values.
- Stabilized the app shell smoke test with the same `matchMedia` shim pattern used by other Ant Design render tests.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add selector-backed dashboard decision groups** - `69a020d` (feat)
2. **Task 2: Render mobile decision dashboard from selector data** - `be18854` (feat)
3. **Task 3: Verify dashboard behavior with phase-wide checks** - `e13c1b4` (test)

## Files Created/Modified

- `src/Store/Selectors/DashboardSelectors.ts` - Adds `orderCount`, decision group types, and selector-backed dashboard groups.
- `src/Store/Selectors/DashboardSelectors.test.ts` - Covers existing formulas plus new decision group keys and representative values.
- `src/Modules/Home/Screens/Dashboard.screen.tsx` - Renders tokenized mobile decision cards and top-customer lists from selector data.
- `src/Modules/Home/Screens/Dashboard.screen.test.tsx` - Verifies Vietnamese decision labels and selector-backed dashboard values render in the correct groups.
- `src/App.test.tsx` - Adds the local `window.matchMedia` test shim needed for the refreshed dashboard inside the app shell.

## Decisions Made

- Kept all dashboard calculations in `buildDashboardReadModel` / `selectDashboardReadModel`; `Dashboard.screen.tsx` does not select raw orders or call `.filter()` / `.reduce()` on order or customer data.
- Kept decision group values as lightweight grouping metadata around existing totals/customer summaries, preserving persisted order/customer state and Phase 4 formulas.
- Kept dashboard copy Vietnamese and operationally phrased instead of introducing a generic analytics layout.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added app-shell matchMedia shim for refreshed dashboard render**
- **Found during:** Task 3 (Verify dashboard behavior with phase-wide checks)
- **Issue:** `CI=true yarn test --watchAll=false` failed only in `src/App.test.tsx` because the app shell now renders the refreshed dashboard List surface and Ant Design's responsive observer requires `window.matchMedia` in jsdom.
- **Fix:** Added the local `matchMedia` shim to `src/App.test.tsx`, matching existing Ant Design render-test patterns in the repo.
- **Files modified:** `src/App.test.tsx`
- **Verification:** `CI=true yarn test --watchAll=false --runTestsByPath src/App.test.tsx` passed, then the full suite passed.
- **Committed in:** `e13c1b4`

---

**Total deviations:** 1 auto-fixed (1 blocking). **Impact:** Test-environment support only; no production behavior, state shape, Trello behavior, or routing contract changed.

## Issues Encountered

- The RED screen test failed as expected while `Dashboard.screen.tsx` still rendered the old Ant Design Tabs layout.
- Full verification still emits known non-failing Redux Persist, React `act(...)`, Ant Design Form.Item, CRA/Babel, Browserslist, and brownfield ESLint warnings.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan `05-03` can proceed with copy/workflow-state polish. The dashboard now satisfies UX-04/UX-05 with selector-backed decision groups and shares the Phase 5 mobile visual system established by Plans `05-01` and `05-02`.

## Self-Check: PASSED

- `CI=true yarn test --watchAll=false --runTestsByPath src/Store/Selectors/DashboardSelectors.test.ts` passed after Task 1.
- `CI=true yarn test --watchAll=false --runTestsByPath src/Store/Selectors/DashboardSelectors.test.ts src/Modules/Home/Screens/Dashboard.screen.test.tsx` passed.
- `CI=true yarn test --watchAll=false --runTestsByPath src/App.test.tsx` passed after the app-shell shim.
- `CI=true yarn test --watchAll=false` passed: 28 suites, 148 tests.
- `yarn build` passed with warnings only.
- Source greps confirmed `Dashboard.screen.tsx` has no `.filter(`, `.reduce(`, direct `state.order.orders`, or fixed `width: 220` / `width: 280` top-customer paragraph styles.

---
*Phase: 05-cohesive-ui-ux-refresh*
*Completed: 2026-06-18*
