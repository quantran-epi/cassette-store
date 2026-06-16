---
phase: 02-order-state-and-trello-sync-reliability
plan: 04
subsystem: order-sync
tags: [redux, trello, retry, recovery, tests, react]

requires:
  - phase: 02-03
    provides: persisted order sync failures and local-first workflow result handling
provides:
  - Per-order Trello sync retry orchestration for persisted failures
  - Compact order-level sync recovery controls with retry and manual resolved actions
  - Regression coverage for partial sync failures and retry preserving local order data
affects: [phase-02, phase-03, order-workflows, trello-sync, operator-recovery]

tech-stack:
  added: []
  patterns:
    - Retry operations replay through OrderTrelloAdapter from current local order/customer state
    - Failed sync recovery is shown at the affected order surface instead of a separate dashboard
    - Manual resolved clears are secondary escape hatches after retryable recovery

key-files:
  created:
    - src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.tsx
    - src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx
  modified:
    - src/Hooks/OrderWorkflowResult.ts
    - src/Hooks/useOrder.ts
    - src/Hooks/useOrder.test.ts
    - src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx
    - src/Routing/MasterPage.test.tsx
    - src/Store/Models/OrderSyncFailure.ts

key-decisions:
  - "Retry uses the persisted failure ID and current local order/customer state, so successful retries preserve local edits made after the original failure."
  - "Persisted attachment failures return a manual reselect message because browser file blobs are not durable enough to replay safely."
  - "The recovery UI stays compact on the affected order item and does not introduce a Phase 4-style operations dashboard."

patterns-established:
  - "retryOrderSyncFailure marks a failure retrying, replays the specific Trello operation, clears only the matching failure on success, and restores failed status on retry failure."
  - "OrderSyncStatusWidget filters failures by order and exposes Vietnamese retry/clear actions near the order details."
  - "Build verification is part of sync recovery coverage because TypeScript catches stale persisted-state fixture shapes."

requirements-completed: [SYNC-01, SYNC-02, SYNC-03]

duration: 28 min
completed: 2026-06-16
---

# Phase 02 Plan 04: Sync Recovery Controls Summary

**Operators can see failed Trello sync on the affected order and retry or manually clear the specific failed action without editing app state.**

## Performance

- **Duration:** 28 min
- **Started:** 2026-06-16T04:06:00Z
- **Completed:** 2026-06-16T04:33:51Z
- **Tasks:** 4
- **Files modified:** 8

## Accomplishments

- Added `retryOrderSyncFailure` and `clearOrderSyncFailure` to `useOrder` for persisted sync failure recovery.
- Implemented retry support for create-card, update-card, move-card, and shipping-code comment operations.
- Preserved local order data when create-card retry succeeds and writes back the new Trello card ID.
- Kept persisted attachment failures honest by returning a manual reselect message instead of pretending browser file blobs can be replayed.
- Added `OrderSyncStatusWidget` and wired it into order items so affected orders show compact Vietnamese Trello sync status, retry, and secondary manual resolved controls.
- Expanded regression coverage around partial sync failures, retry success/failure, attachment retry limits, and order-item failure filtering.
- Completed the manual operator sanity checkpoint with approval.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add retry orchestration for persisted sync failures** - `0eff917` (feat)
2. **Task 2: Render compact per-order sync status and retry controls** - `1556324` (feat)
3. **Task 3: Close partial-failure regression coverage and build verification** - `e936c98` (test)
4. **Task 4: Operator sanity check for hands-on recovery** - approved manually, no source commit

**Plan metadata:** summary, roadmap, state, and requirement traceability committed separately.

## Files Created/Modified

- `src/Hooks/OrderWorkflowResult.ts` - Added `retry-sync` as an order workflow operation.
- `src/Hooks/useOrder.ts` - Added retry and clear APIs for persisted sync failures.
- `src/Hooks/useOrder.test.ts` - Covers create-card retry, move-card retry, retry failure status, attachment manual reselect, and local order field preservation.
- `src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.tsx` - Displays compact Trello sync failure status, retry, and manual resolved actions.
- `src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx` - Covers empty state, warning rendering, retry/clear callbacks, and order-level failure filtering.
- `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` - Passes only failures for the current order into the sync status widget.
- `src/Routing/MasterPage.test.tsx` - Updates test fixture order state to include `syncFailures`.
- `src/Store/Models/OrderSyncFailure.ts` - Uses a build-valid relative type import for Trello operation names.

## Decisions Made

- Retry success clears only the selected failure so independent failures on the same order remain visible.
- Attachment retries require user reselect because the original `RcFile` is not persisted safely across browser sessions.
- The recovery surface belongs near the affected order item for Phase 2; broader operational dashboards remain Phase 4 scope.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed production-build retry result typing**
- **Found during:** Task 3 (full test/build gate)
- **Issue:** Shipping-code comment retry returns a `TrelloAction`, but `retryOrderSyncFailure` only declared card/attachment/void result data.
- **Fix:** Added `TrelloAction` to the retry workflow result union and narrowed create-card retry through a local typed result before reading the returned card ID.
- **Files modified:** `src/Hooks/useOrder.ts`
- **Verification:** `CI=true yarn test --watchAll=false && yarn build` exited 0.
- **Committed in:** `e936c98`

**2. [Rule 3 - Blocking] Fixed stale TypeScript build fixtures and model import**
- **Found during:** Task 3 (production build)
- **Issue:** `MasterPage.test.tsx` fixtures omitted the now-required `syncFailures` order-state field, and `OrderSyncFailure.ts` used `@hooks/Trello/...` even though `@hooks` is only configured as a barrel alias.
- **Fix:** Added `syncFailures: []` to the affected fixtures and replaced the alias with a valid relative type import.
- **Files modified:** `src/Routing/MasterPage.test.tsx`, `src/Store/Models/OrderSyncFailure.ts`
- **Verification:** `CI=true yarn test --watchAll=false && yarn build` exited 0.
- **Committed in:** `e936c98`

---

**Total deviations:** 2 auto-fixed blocking build issues.
**Impact on plan:** Both fixes were necessary to satisfy the planned production build gate; no functional scope expansion.

## Issues Encountered

- Full-suite runs continue to print existing Redux Persist serializability warnings, React `act(...)` warnings in app/master-page tests, CRA/Babel maintenance warnings, and existing lint warnings during build. These warnings did not block tests or build.
- `OrderAttachmentsWidget` already awaited delete promises and surfaced structured attachment sync warnings from Plan 02-03, so no additional source change was required in this plan.

## User Setup Required

None - no external service configuration required.

## Verification

- `CI=true yarn test --watchAll=false --runInBand src/Hooks/useOrder.test.ts src/Store/Reducers/OrderReducer.test.ts` - passed, 20 tests.
- `CI=true yarn test --watchAll=false --runInBand src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx` - passed, 5 tests.
- `CI=true yarn test --watchAll=false && yarn build` - passed, 12 suites / 72 tests and production build completed with warnings.
- Manual checkpoint - approved by user after reviewing the local app recovery flow at `http://localhost:3000/cassette-store`.

## Next Phase Readiness

Phase 2 now satisfies the sync recovery requirement. Phase 3 can improve fast order and shipping workflows while relying on structured Trello results, durable sync failures, and order-level retry controls.

## Self-Check: PASSED

- All four plan tasks are complete.
- Summary created for `02-04`.
- `SYNC-03` is covered by retry orchestration, order-surface controls, and manual recovery fallback.
- Full tests and production build pass.
- Manual operator sanity checkpoint was approved.

---
*Phase: 02-order-state-and-trello-sync-reliability*
*Completed: 2026-06-16*
