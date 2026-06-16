---
phase: 03-fast-order-and-shipping-workflows
plan: 01
subsystem: routing
tags: [react-router, order-routes, smoke-tests]

requires:
  - phase: 02-order-state-and-trello-sync-reliability
    provides: local-first workflow behavior preserved for later Phase 3 order changes
provides:
  - Order route config uses order-specific local/default symbols while preserving existing /order paths
  - RootRouter mounts order routes through OrderRouter instead of CustomerRouter
  - Route smoke coverage for the GitHub Pages basename order paths
affects: [order-routing, phase-03-create-flow, phase-03-shipping-flow]

tech-stack:
  added: []
  patterns:
    - Isolated RootRouter smoke tests with mocked route layouts and child screens

key-files:
  created:
    - src/Routing/RootRouter.test.tsx
  modified:
    - src/Modules/Order/Routing/OrderRouteConfig.ts
    - src/Routing/RootRouter.tsx

key-decisions:
  - "Route tests render RootRouter directly with mocked route wrappers/screens so routing behavior is covered without persisted app-state timers."
  - "Order path strings remain unchanged; only the order route config symbol and order branch layout component changed."

patterns-established:
  - "Root route smoke tests can assert basename-aware routes with distinct layout markers and mocked child route screens."

requirements-completed: [ORD-05]

duration: 7 min
completed: 2026-06-16
---

# Phase 03 Plan 01: Correct Order Routes and Smoke Coverage Summary

**Order route wiring now uses order-specific route symbols and the existing OrderRouter layout while preserving all /order paths.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-06-16T13:18:00Z
- **Completed:** 2026-06-16T13:24:14Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Added route smoke coverage for `/cassette-store/order/list`, `/cassette-store/order/create`, and `/cassette-store/order/cod-payment-list`.
- Renamed the order route config local/default symbol from `CustomerRoutes` to `OrderRoutes` without changing `/order/*` path strings.
- Updated `RootRouter` so the order branch renders `OrderRouter`, while the customer branch remains on `CustomerRouter`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add route smoke coverage for stable order paths** - `461843d` (test)
2. **Task 2: Rename order route config symbols without changing paths** - `807bf39` (feat)
3. **Task 3: Mount order routes through OrderRouter** - `6bae34e` (feat)

**Plan metadata:** pending in this summary commit

## Files Created/Modified

- `src/Routing/RootRouter.test.tsx` - Adds basename-aware order route smoke tests and static route-config symbol assertions.
- `src/Modules/Order/Routing/OrderRouteConfig.ts` - Uses the `OrderRoutes` local/default export while preserving `/order/list`, `/order/create`, and `/order/cod-payment-list`.
- `src/Routing/RootRouter.tsx` - Imports `OrderRouter` and mounts it for the order route branch.

## Decisions Made

- Route smoke tests render `RootRouter` directly and mock `MasterPage`, route wrappers, and child screens. This keeps the test focused on route wiring and avoids unrelated persisted-store timers from full app rendering.
- No public route API was renamed; callers still use `RootRoutes.AuthorizedRoutes.OrderRoutes.*()`.

## Deviations from Plan

None - plan executed exactly as written.

---

**Total deviations:** 0 auto-fixed.
**Impact on plan:** No scope changes.

## Issues Encountered

- The initial route test harness rendered the full app and exposed redux-persist async timer noise unrelated to route wiring. The test was narrowed to `RootRouter` with route-level mocks, then the RED failure cleanly showed the planned `CustomerRouter` and `CustomerRoutes` defects.
- `CI=true yarn test --watchAll=false --runTestsByPath src/Routing/RootRouter.test.tsx src/App.test.tsx` passed with existing non-failing Redux Persist and React `act(...)` warnings from the brownfield baseline.
- `yarn build` passed with existing non-failing CRA/Babel, Browserslist, and ESLint warnings.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 3 create-flow and shipping-flow plans can now build on stable, order-specific route layout wiring. No blockers for `03-02` or `03-03`.

## Self-Check: PASSED

- `src/Routing/RootRouter.test.tsx` exists and covers all three `/cassette-store/order/*` paths with distinct order/customer router markers.
- Static route-config assertions pass and confirm `OrderRouteConfig.ts` no longer contains `CustomerRoutes` symbols.
- `RootRouter.tsx` mounts the order branch with `OrderRouter` and leaves the customer branch on `CustomerRouter`.
- `CI=true yarn test --watchAll=false --runTestsByPath src/Routing/RootRouter.test.tsx src/App.test.tsx` passed.
- `yarn build` passed.

---
*Phase: 03-fast-order-and-shipping-workflows*
*Completed: 2026-06-16*
