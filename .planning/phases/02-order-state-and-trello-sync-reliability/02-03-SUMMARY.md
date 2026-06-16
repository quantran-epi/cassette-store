---
phase: 02-order-state-and-trello-sync-reliability
plan: 03
subsystem: order-sync
tags: [redux, trello, local-first, sync-failures, react]

requires:
  - phase: 02-02
    provides: typed Trello operation result types and order Trello adapter
provides:
  - Persisted order sync failure state with backup/restore defaults
  - Order workflow result helpers that separate local success from Trello sync failures
  - Local-first order workflow orchestration for create, update, shipping, shipped/return, and attachments
affects: [phase-02, phase-03, phase-04, order-workflows, trello-sync]

tech-stack:
  added: []
  patterns:
    - Local Redux order/customer mutations happen before normal Trello side effects
    - Trello operation failures are recorded as durable OrderSyncFailure entries
    - UI call sites show success, warning, or fatal failure through OrderWorkflowResult helpers

key-files:
  created:
    - src/Store/Models/OrderSyncFailure.ts
    - src/Hooks/OrderWorkflowResult.ts
  modified:
    - src/Store/Reducers/OrderReducer.ts
    - src/Store/Reducers/OrderReducer.test.ts
    - src/Common/Helpers/BackupHelper.ts
    - src/Common/Helpers/BackupHelper.test.ts
    - src/Hooks/index.ts
    - src/Hooks/useOrder.ts
    - src/Hooks/useOrder.test.ts
    - src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx
    - src/Modules/Order/Screens/OrderItem/OrderAttachments.widget.tsx
    - src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx
    - src/Modules/Order/Screens/OrderItem/OrderPlacedItems.widget.tsx
    - src/Modules/Order/Screens/OrderItem/OrderPriority.widget.tsx
    - src/Modules/Order/Screens/OrderItem/OrderShippingInfo.widget.tsx

key-decisions:
  - "Kept Redux/IndexedDB as the business source of truth and treated Trello as a mirror for normal order actions."
  - "Stored sync failures under order state instead of a separate slice to reuse Phase 1 backup/restore defaults."
  - "Returned workflow results that can mean local success with Trello warning instead of treating every Trello failure as total action failure."

patterns-established:
  - "OrderWorkflowResult: localUpdated and syncFailures are checked separately by UI call sites."
  - "OrderSyncFailure IDs are stable by order, Trello operation, and retry context."
  - "Successful Trello operations clear matching order sync failures where safe."

requirements-completed: [SYNC-01, SYNC-02, ORD-02, ORD-03]

duration: 17 min
completed: 2026-06-16
---

# Phase 02 Plan 03: Local-First Order Workflow Reliability Summary

**Order workflows now preserve local operator actions while recording retryable Trello sync failures for create, update, shipping, shipped-state, and attachment paths.**

## Performance

- **Duration:** 17 min
- **Started:** 2026-06-16T03:46:15Z
- **Completed:** 2026-06-16T04:03:20Z
- **Tasks:** 3
- **Files modified:** 15

## Accomplishments

- Added persisted `OrderSyncFailure` state, reducer actions, and backup normalization so legacy restore inputs default sync failures to `[]`.
- Added `OrderWorkflowResult` helpers so screens can distinguish fatal local failure from local success with Trello sync warnings.
- Refactored `useOrder` create/update/shipping/shipped/refuse/broken/attachment flows through the Trello adapter and sync failure recording.
- Added regression tests for local success with Trello card creation, comment, move, and attachment failures.
- Updated order create, item action, attachment, placed-items, priority, and shipping-info call sites to show success/warning/error messages from workflow results.

## Task Commits

Each task was committed atomically:

1. **Task 1: Persist order sync failure state with restore-safe defaults** - `8a42a9e` (feat)
2. **Task 2: Add order workflow result helpers** - `b37197e` (feat)
3. **Task 3: Refactor create, update, shipping, transition, and attachment flows to local-first results** - `e9c5721` (refactor)

**Plan metadata:** summary, roadmap, state, and requirement traceability committed separately.

## Files Created/Modified

- `src/Store/Models/OrderSyncFailure.ts` - Persisted sync failure model and operation/status aliases.
- `src/Store/Reducers/OrderReducer.ts` - Added `syncFailures` defaults and upsert/retrying/clear actions.
- `src/Common/Helpers/BackupHelper.ts` - Normalizes legacy backups without sync failure state.
- `src/Hooks/OrderWorkflowResult.ts` - Local-first workflow result type and message helpers.
- `src/Hooks/useOrder.ts` - Orchestrates local transitions, adapter calls, sync failure recording, and workflow result returns.
- `src/Hooks/useOrder.test.ts` - Covers workflow helpers and partial Trello failure paths.
- `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx` - Treats local order creation with Trello failure as warning success.
- `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` - Shows workflow result messages for shipped/refuse/broken/shipping-code actions.
- `src/Modules/Order/Screens/OrderItem/OrderAttachments.widget.tsx` - Shows attachment sync warnings and preserves local order state.
- `src/Modules/Order/Screens/OrderItem/OrderPlacedItems.widget.tsx` - Handles update-order workflow results.
- `src/Modules/Order/Screens/OrderItem/OrderPriority.widget.tsx` - Handles update-order workflow results.
- `src/Modules/Order/Screens/OrderItem/OrderShippingInfo.widget.tsx` - Handles update-order workflow results.

## Decisions Made

- Local mutations remain authoritative for normal operator actions; Trello failures are recorded for retry rather than rolling back local order/customer state.
- Attachment retry payloads record metadata and `requiresFileReselect` because browser file blobs are not safely durable in Redux.
- `changeShippingCode` records a comment failure and avoids compounding that same action with a move attempt when the first Trello side effect fails.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Updated all `updateOrder` UI callers**
- **Found during:** Task 3 (call-site compatibility scan)
- **Issue:** The plan named the primary create/item/attachment screens, but `OrderPriorityWidget`, `OrderShippingInfoWidget`, and `OrderPlacedItemsWidget` also called `updateOrder` and would have treated any workflow result object as a plain Trello card success.
- **Fix:** Updated those widgets to check `localUpdated`, `hasOrderWorkflowSyncFailures`, and `getOrderWorkflowMessage`.
- **Files modified:** `OrderPriority.widget.tsx`, `OrderShippingInfo.widget.tsx`, `OrderPlacedItems.widget.tsx`
- **Verification:** `rg` found no stale `let card = await orderUtils.updateOrder` or `if (card)` workflow handling, and full tests passed.
- **Committed in:** `e9c5721`

---

**Total deviations:** 1 auto-fixed missing-critical issue.
**Impact on plan:** Required for compile/runtime compatibility with the changed `updateOrder` contract; no scope expansion beyond existing order edit call sites.

## Issues Encountered

- Jest continues to print pre-existing Redux Persist serializable-action warnings and CRA/Babel maintenance warnings, but all assertions pass.

## User Setup Required

None - no external service configuration required.

## Verification

- `CI=true yarn test --watchAll=false --runInBand src/Hooks/useOrder.test.ts src/Store/Reducers/OrderReducer.test.ts` - passed, 16 tests.
- `CI=true yarn test --watchAll=false --runInBand src/Hooks/useOrder.test.ts src/Store/Reducers/OrderReducer.test.ts src/Common/Helpers/BackupHelper.test.ts` - passed, 25 tests.
- `CI=true yarn test --watchAll=false --runInBand` - passed, 11 suites / 63 tests.

## Next Phase Readiness

Plan 02-04 can now build retry/recovery controls on persisted `syncFailures` and replay failed Trello operations through the adapter without changing the local-first workflow ordering.

## Self-Check: PASSED

- All three plan tasks have commits.
- Summary created for `02-03`.
- Required local-success/Trello-failure regression cases are covered.
- Plan-level and full-suite test commands pass.

---
*Phase: 02-order-state-and-trello-sync-reliability*
*Completed: 2026-06-16*
