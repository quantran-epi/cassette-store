---
phase: 04-cod-search-and-operational-utilities
plan: 04
subsystem: operational-actions-status
tags: [react, redux, selectors, order-actions, operational-status, cod, trello, testing]

requires:
  - phase: 04-01
    provides: selector-backed order list and dashboard read models
  - phase: 04-02
    provides: COD Excel import review and apply workflow
  - phase: 04-03
    provides: URL-backed order list query helper and sync filter navigation surface
provides:
  - state-aware order row action model with promoted next action and grouped secondary/danger actions
  - compact operational status read model for Trello sync, COD import review, backup, and done-order refresh issues
  - MasterPage operational status tray limited to safe navigation, backup, and done-refresh actions
  - COD import issue count/text surfaced globally without storing imported row payloads in app context
  - focused helper, selector, reducer, widget, MasterPage, full Jest, and production build verification
affects: [order-item, order-list, cod-import, master-page, backup, trello-sync]

tech-stack:
  added: []
  patterns:
    - pure helper builds row action models from order state and local capability flags
    - pure operational status read model aggregates persisted issue state and local runtime statuses
    - global tray routes operators to local resolution screens instead of applying or clearing issues globally

key-files:
  created:
    - src/Common/Helpers/OrderActionHelper.ts
    - src/Common/Helpers/OrderActionHelper.test.ts
    - src/Store/Selectors/OperationalStatusSelectors.ts
    - src/Store/Selectors/OperationalStatusSelectors.test.ts
    - src/Modules/Order/Screens/OrderItem/OrderActionSurface.widget.tsx
    - src/Modules/Order/Screens/OrderItem/OrderActionSurface.widget.test.tsx
    - src/Routing/OperationalStatusTray.widget.tsx
  modified:
    - src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx
    - src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.tsx
    - src/Common/Helpers/OrderListQueryHelper.ts
    - src/Store/Selectors/OrderSelectors.ts
    - src/Store/Reducers/AppContextReducer.ts
    - src/Common/Helpers/BackupHelper.ts
    - src/Routing/MasterPage.tsx
    - src/Routing/MasterPage.test.tsx

key-decisions:
  - "Keep destructive and context-heavy resolution local: the operational tray can navigate or trigger safe checks, but cannot clear sync failures or apply COD rows."
  - "Store only COD import issue count and short text globally; imported row data remains in the COD review screen."
  - "Preserve existing order action keys and route them through a new state-aware surface so current handlers and confirmations stay intact."

patterns-established:
  - "Order action surfaces are driven by `buildOrderActionModel(order, flags)` rather than inline dropdown arrays."
  - "Operational status lines are derived by `buildOperationalStatusReadModel` before rendering, keeping aggregation outside React UI."
  - "App-wide issue actions are safe by construction: navigation, backup now, and done-order refresh only."

requirements-completed: [OPS-05, OPS-06]

duration: 29 min
completed: 2026-06-17
---

# Phase 04 Plan 04: State-Aware Actions and Operational Status Tray Summary

**State-aware order row actions and a safe operational status tray for Trello sync, COD import, backup, and done-order attention states**

## Performance

- **Duration:** 29 min
- **Started:** 2026-06-17T04:07:41Z
- **Completed:** 2026-06-17T04:36:48Z
- **Tasks:** 5
- **Files modified:** 20

## Accomplishments

- Added `OrderActionHelper` and `OrderActionSurfaceWidget` so order rows promote one useful next action and group delivery, detail, customer, and danger actions.
- Preserved existing order action keys and mutation handlers while requiring confirmation metadata for dangerous or irreversible actions.
- Added `OperationalStatusSelectors` and app-context COD import issue state for compact sync, COD, backup, and done-refresh status lines.
- Wired COD import review to report only unresolved issue count/text globally and clear that status after successful apply or review clear.
- Replaced the old inline backup/done fixed box in `MasterPage.AppNoti` with `OperationalStatusTrayWidget` using safe actions only.
- Added sync-failure order list routing through `sync=failed` without changing default list behavior.

## Task Commits

Each task was committed atomically:

1. **Task 1: Cover row action and operational status read models** - `28555fc` (test)
2. **Task 2: Extract state-aware row action surface** - `cf0913b` (feat)
3. **Task 3: Build operational status read model and COD issue state** - `043a87b` (feat)
4. **Task 4: Wire compact OperationalStatusTray into MasterPage** - `665613e` (feat)
5. **Task 5: Verify action surface and tray integration** - `3c3a0e3` (test)

**Plan metadata:** pending in the docs close-out commit.

## Files Created/Modified

- `src/Common/Helpers/OrderActionHelper.ts` - Row action model types, stable action definitions, primary action selection, grouped secondary actions, and confirmation metadata.
- `src/Common/Helpers/OrderActionHelper.test.ts` - State coverage for next action selection, action grouping, and confirmation requirements.
- `src/Modules/Order/Screens/OrderItem/OrderActionSurface.widget.tsx` - Promoted primary action button and grouped action menus for delivery, details, customer, and danger actions.
- `src/Modules/Order/Screens/OrderItem/OrderActionSurface.widget.test.tsx` - RTL coverage for primary action, grouped menus, disabled reasons, and action callback routing.
- `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` - Replaced inline dropdown arrays with state-aware action model wiring into existing handlers and confirmations.
- `src/Store/Selectors/OperationalStatusSelectors.ts` - Pure operational status read model and Redux selector base for tray inputs.
- `src/Store/Selectors/OperationalStatusSelectors.test.ts` - Issue-count and quiet-state coverage for sync, COD, backup, and done-refresh lines.
- `src/Store/Reducers/AppContextReducer.ts` - Backward-compatible COD import issue count/text state and clear/set actions.
- `src/Common/Helpers/BackupHelper.ts` - Backup normalization preserves defaults for new COD import issue fields.
- `src/Common/Helpers/BackupHelper.test.ts` - Backup expectations updated for new app-context defaults.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.tsx` - Records unresolved COD import review/apply issues globally without storing row payloads.
- `src/Common/Helpers/OrderListQueryHelper.ts` - Adds `sync=failed` route serialization for safe tray navigation.
- `src/Store/Selectors/OrderSelectors.ts` - Filters order list read model by failed sync state when requested.
- `src/Routing/OperationalStatusTray.widget.tsx` - Compact tray UI with safe actions for failed sync, COD review, backup now, and done refresh.
- `src/Routing/MasterPage.tsx` - Uses the operational tray beside existing floating controls.
- `src/Routing/MasterPage.test.tsx` - Verifies safe tray actions and absence of clear/manual/apply controls.
- `src/Modules/Order/Screens/OrderList.screen.test.tsx` - Test-store wiring updated for app-context dependent selectors.

## Decisions Made

- The operational tray is intentionally not a resolution surface. It routes to failed-sync orders or COD review and can trigger backup/done refresh, but row-level and screen-level flows still own clearing, manual resolution, and COD apply.
- COD import issue state in Redux is intentionally small: count and display text only. Imported rows and apply payloads remain screen-local.
- Existing order action keys are the compatibility contract for `OrderItemWidget`; the new action surface changes presentation, not domain command names.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated cross-cutting tests for new app-context shape**
- **Found during:** Task 5 (Verify action surface and tray integration)
- **Issue:** Full Jest and build surfaced test expectations and test-store setup that did not include the new COD import issue fields on `appContext`.
- **Fix:** Updated backup normalization expectations and added `appContext` reducer/preloaded state to the order-list test store using `combineReducers` to satisfy RTK/TypeScript build overloads.
- **Files modified:** `src/Common/Helpers/BackupHelper.test.ts`, `src/Modules/Order/Screens/OrderList.screen.test.tsx`
- **Verification:** Focused tests, full Jest, and production build passed.
- **Committed in:** `3c3a0e3`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Test-only compatibility fix required by the planned app-context state extension. No product scope change.

## Issues Encountered

- `yarn build` initially failed because `OrderList.screen.test.tsx` configured a test store without the new `appContext` reducer while selectors now depend on app-context state. Fixed in `3c3a0e3`.
- GSD plan inventory reports a metadata warning: `04-04-PLAN.md` declares `wave: 4`, while dependency analysis places it in wave 3 after 04-01, 04-02, and 04-03. Execution dependencies were already satisfied; no code change was required.
- Existing brownfield warnings remain during tests/build: Redux Persist non-serializable action warnings, React `act(...)` warnings in legacy tests, CRA Babel dependency warning, Browserslist warning, Ant Design Form.Item warnings, and baseline ESLint warnings during production build.

## Verification

- `CI=true yarn test --watchAll=false --runTestsByPath src/Common/Helpers/OrderActionHelper.test.ts src/Modules/Order/Screens/OrderItem/OrderActionSurface.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.test.tsx` - passed, 4 suites and 22 tests.
- `CI=true yarn test --watchAll=false --runTestsByPath src/Store/Selectors/OperationalStatusSelectors.test.ts src/Common/Helpers/OrderListQueryHelper.test.ts src/Store/Reducers/AppContextReducer.test.ts src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.test.tsx` - passed, 4 suites and 21 tests.
- `CI=true yarn test --watchAll=false --runTestsByPath src/Store/Selectors/OperationalStatusSelectors.test.ts src/Routing/MasterPage.test.tsx` - passed, 2 suites and 21 tests.
- `CI=true yarn test --watchAll=false --runTestsByPath src/Common/Helpers/OrderActionHelper.test.ts src/Store/Selectors/OperationalStatusSelectors.test.ts src/Modules/Order/Screens/OrderItem/OrderActionSurface.widget.test.tsx src/Routing/MasterPage.test.tsx` - passed, 4 suites and 32 tests.
- `CI=true yarn test --watchAll=false --runTestsByPath src/Common/Helpers/BackupHelper.test.ts src/Modules/Order/Screens/OrderList.screen.test.tsx` - passed, 2 suites and 15 tests.
- `CI=true yarn test --watchAll=false` - passed, 24 suites and 138 tests.
- `yarn build` - passed with baseline ESLint/Browserslist warnings.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 04 now has COD import, URL-backed order list filters, state-aware row actions, and a compact operational tray wired together.
- Safe tray navigation is ready for manual UAT with seeded sync failures, COD import issues, backup errors, and done-order refresh states.
- Remaining phase-level gates are code review and verifier/verification artifacts before marking Phase 04 complete.

---
*Phase: 04-cod-search-and-operational-utilities*
*Completed: 2026-06-17*
