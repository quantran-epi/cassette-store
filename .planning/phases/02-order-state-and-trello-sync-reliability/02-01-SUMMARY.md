---
phase: 02-order-state-and-trello-sync-reliability
plan: 01
subsystem: order-domain
tags: [react, redux, orders, trello, tests]

requires: []
provides:
  - Pure order-domain transition helpers for order status, COD, refund, labels, amounts, and Trello descriptions
  - Focused unit coverage for extracted order behavior
  - useOrder delegation to pure helpers while preserving the current hook API
affects: [order-workflows, trello-sync, phase-02]

tech-stack:
  added: []
  patterns:
    - Plain helper object with pure transition functions returning cloned order/customer results
    - Hook orchestration delegates calculations before Redux dispatch or Trello calls

key-files:
  created:
    - src/Common/Helpers/OrderDomainHelper.ts
    - src/Common/Helpers/OrderDomainHelper.test.ts
  modified:
    - src/Hooks/useOrder.ts

key-decisions:
  - "OrderDomainHelper returns transition result objects instead of mutating input Order or Customer instances."
  - "Trello label logic now produces stable label intent keys that useOrder maps to current Trello label IDs."
  - "useOrder keeps existing public method names and return conventions for this extraction plan."

patterns-established:
  - "Pure transition helper: compute updated order/customer first, then let useOrder dispatch and perform side effects."
  - "Label intent mapping: pure helper returns local keys, hook maps those keys to Trello IDs."

requirements-completed: [ORD-01, ORD-02]

duration: 10 min
completed: 2026-06-16
---

# Phase 02 Plan 01: Order Domain Helper Extraction Summary

**Pure order transition and Trello-description helpers with useOrder delegating existing business rules before side effects.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-06-16T03:21:42Z
- **Completed:** 2026-06-16T03:31:18Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added `OrderDomainHelper` for pure payment amount, COD amount, Trello description, label intent, status eligibility, shipping-code, shipped, return, COD-paid, and refund behavior.
- Added focused unit tests covering shipped/VIP totals, refuse-to-receive blacklist behavior, shipping-code first-time behavior, COD/refund, labels, action eligibility, payment/COD amounts, and Trello card description content.
- Refactored `useOrder` to delegate extracted calculations and transitions while keeping existing hook method names and Trello/Redux orchestration shape.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add pure order-domain helper and transition tests** - `7480558` (feat)
2. **Task 2: Route existing useOrder calculations through pure helpers** - `89ab4b3` (refactor)

**Plan metadata:** committed with this summary.

## Files Created/Modified

- `src/Common/Helpers/OrderDomainHelper.ts` - Pure order-domain helper with cloned transition outputs and label intent keys.
- `src/Common/Helpers/OrderDomainHelper.test.ts` - Unit tests for extracted order-domain behavior without rendering React.
- `src/Hooks/useOrder.ts` - Delegates extracted rules to `OrderDomainHelper` before dispatching Redux changes or calling Trello.

## Decisions Made

- Transition helpers return `{order, customer}` objects so callers can choose which Redux actions to dispatch without mutating original inputs.
- `getOrderTrelloLabelKeys` returns local label keys instead of Trello IDs because Trello IDs remain a hook/adapter concern.
- Existing Trello card description formatting was preserved during extraction to avoid behavior drift in this reliability phase.

## Deviations from Plan

None - plan executed exactly as written.

---

**Total deviations:** 0 auto-fixed.
**Impact on plan:** No scope change.

## Issues Encountered

- The helper test needed the same `nanoid` Jest mock pattern used by existing reducer tests because `OrderHelper` imports `nanoid` through CRA/Jest. Resolved in the test file.
- Test runs still print existing Redux Persist serializability and React `act(...)` warnings from the current test harness, but all required commands exited 0.

## User Setup Required

None - no external service configuration required.

## Verification

- `CI=true yarn test --watchAll=false --runInBand src/Common/Helpers/OrderDomainHelper.test.ts` - passed, 8 tests.
- `CI=true yarn test --watchAll=false --runInBand src/Common/Helpers/OrderDomainHelper.test.ts src/Hooks/useOrder.test.ts` - passed, 11 tests.
- `CI=true yarn test --watchAll=false --runInBand` - passed, 8 suites / 41 tests.

## Next Phase Readiness

Plan `02-02` can build the typed Trello/order adapter on top of a thinner `useOrder` boundary and stable pure order-domain helpers.

---
*Phase: 02-order-state-and-trello-sync-reliability*
*Completed: 2026-06-16*
