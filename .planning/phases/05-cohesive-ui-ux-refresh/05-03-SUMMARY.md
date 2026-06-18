---
phase: 05-cohesive-ui-ux-refresh
plan: 03
subsystem: ui
tags: [react, cod, vietnamese-copy, operational-tray, order-filters]

# Dependency graph
requires:
  - phase: 05-01
    provides: tokenized UI primitives and Popconfirm pattern
  - phase: 05-02
    provides: mobile order-list layout and URL-backed filter wiring
provides:
  - Vietnamese COD import, review, and column-map workflow states
  - Vietnamese order filter, COD history, MasterPage, and operational tray copy
  - Regression tests and source sweeps for known English workflow-state offenders
affects: [phase-05-verification, cod-import, order-list, operational-status]

# Tech tracking
tech-stack:
  added: []
  patterns: [inline-vietnamese-copy, popconfirm-for-cod-apply, selector-backed-operational-status]

key-files:
  created:
    - src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.test.tsx
  modified:
    - src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.tsx
    - src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.test.tsx
    - src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.tsx
    - src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentColumnMap.widget.tsx
    - src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentList.screen.tsx
    - src/Modules/Order/Screens/OrderList.screen.tsx
    - src/Modules/Order/Screens/OrderList.screen.test.tsx
    - src/Routing/OperationalStatusTray.widget.tsx
    - src/Routing/MasterPage.tsx
    - src/Routing/MasterPage.test.tsx
    - src/Store/Selectors/OperationalStatusSelectors.ts
    - src/Store/Selectors/OperationalStatusSelectors.test.ts
    - src/App.test.tsx

key-decisions:
  - "Kept all COD helper keys, URL values, Redux fields, and Trello/backup handlers unchanged while localizing display copy."
  - "Localized operational status selector titles because the tray renders them as operator-facing text."
  - "Kept strings inline; no i18n framework or package was introduced."

patterns-established:
  - "COD review copy maps helper bucket keys to Vietnamese labels without changing helper enum values."
  - "Operational tray actions stay safe navigation/refresh/backup actions only; destructive COD/local-resolution actions remain absent."
  - "Regression greps protect known English workflow-state strings across COD, order list, tray, and MasterPage surfaces."

requirements-completed: [UX-01, UX-02, UX-03, UX-05]

# Metrics
duration: 25 min
completed: 2026-06-18
---

# Phase 05 Plan 03: Vietnamese Workflow States and COD/Operational Copy Summary

**Vietnamese COD, order-filter, and operational status workflow states with unchanged COD helper keys, URL query values, and safe tray handlers**

## Performance

- **Duration:** 25 min
- **Started:** 2026-06-18T02:50:18Z
- **Completed:** 2026-06-18T03:15:13Z
- **Tasks:** 3 completed
- **Files modified:** 14

## Accomplishments

- Converted COD import/review/column-map states to Vietnamese copy, including bucket labels, empty/error/warning/success states, and Popconfirm confirmation before applying COD rows.
- Swept order-list filters, COD history, operational tray actions, MasterPage navigation, and operational status selector text to Vietnamese while preserving URL/action semantics.
- Added and updated focused RTL tests for COD review, COD import, order filters, MasterPage tray actions, operational selector output, and app-shell navigation labels.

## Task Commits

Each task was committed atomically:

1. **Task 1: Convert COD import/review states to Vietnamese and Popconfirm** - `8bab79b` (feat)
2. **Task 2: Sweep order filters, COD history, and operational tray copy** - `81750d6` (feat)
3. **Task 3: Verify standardized workflow states and English regression sweep** - `9880e9f` (test)

**Plan metadata:** recorded in the `docs(05-03)` close-out commit

## Files Created/Modified

- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.test.tsx` - New render coverage for Vietnamese COD review labels, row labels, include controls, and guarded apply state.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.tsx` - Vietnamese COD import empty/error/status/action copy and app-context issue status wiring preservation.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.tsx` - Vietnamese bucket/row labels, Popconfirm apply confirmation, and Vietnamese imported-row amount labels.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentColumnMap.widget.tsx` - Vietnamese column mapping labels/prompts with unchanged column keys.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentList.screen.tsx` - Vietnamese manual COD cycle button with unchanged COD import/apply props.
- `src/Modules/Order/Screens/OrderList.screen.tsx` and `.test.tsx` - Vietnamese filter labels/tags/aria labels with unchanged URL query values.
- `src/Routing/OperationalStatusTray.widget.tsx`, `src/Routing/MasterPage.tsx`, and `.test.tsx` - Vietnamese safe tray actions and `Tổng quan` nav label with unchanged callbacks.
- `src/Store/Selectors/OperationalStatusSelectors.ts` and `.test.ts` - Vietnamese operational status titles/fallback text used by the tray.
- `src/App.test.tsx` - App shell smoke test updated for the Vietnamese bottom-nav label.

## Decisions Made

- Localized `OperationalStatusSelectors` output because selector titles/text are rendered directly in the operator tray.
- Preserved all data/action contracts: COD buckets, order-list query values, app-context COD issue fields, `buildCodImportApplyPayload(review)`, backup/done refresh handlers, and safe tray callbacks.
- Used source greps as regression gates for the specific English offenders instead of adding an i18n layer.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Localized operational selector text**
- **Found during:** Task 2 (operational tray copy sweep)
- **Issue:** The tray buttons were in the planned file list, but the selector feeding tray line titles/text still emitted English operator-facing copy.
- **Fix:** Localized sync, COD, backup, and done-refresh read-model titles/fallback text and updated selector tests.
- **Files modified:** `src/Store/Selectors/OperationalStatusSelectors.ts`, `src/Store/Selectors/OperationalStatusSelectors.test.ts`
- **Verification:** Task 2 focused tests and Task 3 regression grep passed.
- **Committed in:** `81750d6`

**2. [Rule 2 - Missing Critical] Updated app-shell smoke test after nav localization**
- **Found during:** Task 3 full Jest gate
- **Issue:** `App.test.tsx` still asserted the old `Home` label after MasterPage navigation was localized to `Tổng quan`.
- **Fix:** Updated the smoke test assertion to the Vietnamese label.
- **Files modified:** `src/App.test.tsx`
- **Verification:** `CI=true yarn test --watchAll=false --runTestsByPath src/App.test.tsx` and full Jest passed.
- **Committed in:** `9880e9f`

---

**Total deviations:** 2 auto-fixed (2 missing critical)
**Impact on plan:** Both fixes were required to satisfy the plan's Vietnamese operator-copy and full-regression gates. No state shape, enum key, route key, package, or Trello behavior changed.

## Issues Encountered

- The first full-suite run failed because `App.test.tsx` still expected `Home`; this was corrected and re-run successfully.
- A shell wrapper used `status`, which is read-only in zsh; the full Jest command was re-run with a safe `rc` variable and exited 0.
- Expected non-failing CRA/Babel, Browserslist, Redux Persist, React `act(...)`, and brownfield ESLint warnings remained during tests/build.

## Verification

- `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.test.tsx src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.test.tsx src/Common/Helpers/CodPaymentImportHelper.test.ts` - passed during Task 1.
- `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderList.screen.test.tsx src/Routing/MasterPage.test.tsx src/Store/Selectors/OperationalStatusSelectors.test.ts` - passed, 3 suites / 27 tests.
- `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.test.tsx src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.test.tsx src/Modules/Order/Screens/OrderList.screen.test.tsx src/Routing/MasterPage.test.tsx` - passed, 4 suites / 26 tests.
- English regression grep from Task 3 - clean, no matches.
- `CI=true yarn test --watchAll=false` - passed, 29 suites / 149 tests.
- `yarn build` - passed with existing brownfield warnings.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 5 has all four plan summaries present after this close-out. The phase is ready for phase-level code review, regression/verification, and completion tracking.

---
*Phase: 05-cohesive-ui-ux-refresh*
*Completed: 2026-06-18*
