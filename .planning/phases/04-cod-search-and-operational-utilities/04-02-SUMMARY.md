---
phase: 04-cod-search-and-operational-utilities
plan: 02
subsystem: cod-import
tags: [react, redux, cod, excel, xlsx, testing]

requires:
  - phase: 04-01
    provides: selector-backed order read models for matching imported COD rows against local orders
provides:
  - staged COD Excel import and review workflow
  - deterministic COD import helper with workbook parsing, row normalization, review bucketing, manual resolution, and apply payload construction
  - COD apply path that upserts payment cycles and marks only confirmed matched COD payment orders paid
  - focused helper, reducer, hook, and widget regression tests
affects: [04-04, cod-payment, order-domain, operational-status]

tech-stack:
  added: ["xlsx via official SheetJS CE CDN tarball"]
  patterns:
    - pure helper isolates spreadsheet parsing and COD review classification from React and Redux
    - imported COD rows remain staged locally until operator confirmation
    - review buckets gate mutation through a typed apply payload

key-files:
  created:
    - src/Common/Helpers/CodPaymentImportHelper.ts
    - src/Common/Helpers/CodPaymentImportHelper.test.ts
    - src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.tsx
    - src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.tsx
    - src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentColumnMap.widget.tsx
    - src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.test.tsx
  modified:
    - package.json
    - yarn.lock
    - src/Store/Reducers/OrderReducer.ts
    - src/Store/Reducers/OrderReducer.test.ts
    - src/Hooks/useOrder.ts
    - src/Hooks/useOrder.test.ts
    - src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentList.screen.tsx

key-decisions:
  - "Use SheetJS CE from the official CDN tarball because current official docs identify that package source for browser workbook parsing."
  - "Keep parse/review state outside Redux until the operator applies confirmed rows."
  - "Preserve the existing manual COD cycle path as a fallback while making spreadsheet import the primary path."
  - "Apply debit shipping fee rows to the COD cycle without marking non-payment rows as paid COD."

patterns-established:
  - "COD import helpers classify rows into matched, unmatched, duplicate, amount-mismatch, and already-paid buckets before any mutation."
  - "Manual column mapping rebuilds the same review model used by known-format parsing."
  - "COD import UI tests mock workbook parsing and assert visible workflow text plus callback payloads."

requirements-completed: [OPS-03]

duration: 24 min
completed: 2026-06-17
---

# Phase 04 Plan 02: COD Excel Import, Review, and Apply Summary

**Staged COD Excel settlement import with manual column fallback, bucketed operator review, and confirmed paid-COD apply path**

## Performance

- **Duration:** 24 min
- **Started:** 2026-06-17T03:20:07Z
- **Completed:** 2026-06-17T03:43:52Z
- **Tasks:** 5
- **Files modified:** 13

## Accomplishments

- Added a pure COD import helper that parses the first Excel workbook sheet, detects known settlement columns, normalizes rows, matches local orders by shipping code, and buckets review rows into `matched`, `unmatched`, `duplicate`, `amount-mismatch`, and `already-paid`.
- Added COD import UI on the COD payment screen with `Import COD Excel`, visible review buckets, staged include/exclude/manual resolve controls, and manual column mapping for changed workbook formats.
- Added `upsertCodPayment` and `applyCodPaymentImportReview` so confirmed matched rows mark COD payment orders paid and create/update the COD payment cycle with debit shipping fee order IDs preserved separately.
- Added focused regression coverage across helper, reducer, hook, and React widget behavior.

## Task Commits

Each task was committed atomically:

1. **Task 1: Cover COD import, review, and apply behavior** - `7d81e32` (test)
2. **Task 2: Add spreadsheet parser dependency and pure COD import helper** - `756b0ed` (feat)
3. **Task 3: Add COD import, review buckets, and manual column mapping UI** - `081291e` (feat)
4. **Task 4: Apply confirmed COD rows through the existing order domain path** - `b330e26` (feat)
5. **Task 5: Add focused COD import UI coverage and final checks** - `fbc0e32` (test)

**Plan metadata:** pending in the docs close-out commit.

## Files Created/Modified

- `src/Common/Helpers/CodPaymentImportHelper.ts` - COD workbook parsing, column detection, row normalization, review bucketing, row updates, apply payload creation, and apply gating.
- `src/Common/Helpers/CodPaymentImportHelper.test.ts` - Contract tests for parsing/review buckets, duplicate detection, manual resolution, included/excluded rows, and apply payloads.
- `src/Store/Reducers/OrderReducer.ts` - Added COD cycle upsert behavior for import apply.
- `src/Store/Reducers/OrderReducer.test.ts` - Covered COD cycle replacement semantics.
- `src/Hooks/useOrder.ts` - Added import apply method that reuses the paid-COD transition path and keeps debit fee rows separate.
- `src/Hooks/useOrder.test.ts` - Covered confirmed import apply and unchanged unresolved rows.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentList.screen.tsx` - Wired the import review entry point into the COD payment screen.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.tsx` - Local file import, staged review state, apply confirmation, and apply success reset.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.tsx` - Bucketed row review with visible bucket counts and include/exclude/manual resolve affordances.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentColumnMap.widget.tsx` - Manual mapping controls for changed Excel formats.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.test.tsx` - UI coverage for empty state, bucket counts, mapping fallback, disabled/enabled apply, confirmation, and payload callback.
- `package.json` and `yarn.lock` - Added the official SheetJS CE workbook parser package source.

## Decisions Made

- SheetJS CE was added from the official CDN tarball after checking official SheetJS installation guidance, avoiding an unverified npm package assumption.
- Short generic aliases such as `cod` are not allowed to fuzzy-match unrelated columns such as `Shipping code`; contain-matching now requires a longer multi-word alias to reduce changed-format misclassification risk.
- Bucket count tags were added above the Ant Design tabs because they are useful for operators and make the bucket totals reliable in jsdom tests.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Tightened COD column alias matching**
- **Found during:** Task 5 (focused UI coverage)
- **Issue:** The column matcher could let short aliases such as `cod` match broader columns such as `Shipping code`, which could reduce confidence in changed-format fallback behavior.
- **Fix:** Restricted contains-based alias matching to longer multi-word aliases while preserving exact and compact equality matches.
- **Files modified:** `src/Common/Helpers/CodPaymentImportHelper.ts`
- **Verification:** `CI=true yarn test --watchAll=false --runTestsByPath src/Common/Helpers/CodPaymentImportHelper.test.ts src/Store/Reducers/OrderReducer.test.ts src/Hooks/useOrder.test.ts src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.test.tsx`
- **Committed in:** `fbc0e32`

**2. [Rule 2 - Missing Critical] Added visible bucket count tags**
- **Found during:** Task 5 (focused UI coverage)
- **Issue:** Relying only on Ant Design tab labels made bucket-count assertions brittle and less immediately scannable for operators.
- **Fix:** Rendered visible bucket count tags above the review tabs.
- **Files modified:** `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.tsx`
- **Verification:** COD import widget tests assert all five bucket labels and counts render.
- **Committed in:** `fbc0e32`

---

**Total deviations:** 2 auto-fixed (2 missing critical)
**Impact on plan:** Both changes strengthened the planned import review workflow and testing surface without expanding scope beyond COD settlement import.

## Issues Encountered

- Existing brownfield warnings remain during tests/build: Redux Persist non-serializable action warnings, React `act(...)` warnings in older routing/order tests, CRA Babel dependency warning, Browserslist freshness warnings, bundle-size warning, and pre-existing ESLint warnings.

## Verification

- `CI=true yarn test --watchAll=false --runTestsByPath src/Common/Helpers/CodPaymentImportHelper.test.ts src/Store/Reducers/OrderReducer.test.ts src/Hooks/useOrder.test.ts src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.test.tsx` - passed, 4 suites and 32 tests.
- `CI=true yarn test --watchAll=false` - passed, 19 suites and 106 tests.
- `yarn build` - passed with warnings.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 04-03 can build URL-backed order list filters on the selector/read-model foundation from 04-01 without depending on COD import internals.
- 04-04 can surface COD import/apply issue counts in the operational tray using this review/apply model while keeping apply actions in the COD import screen.
- Manual UAT remains: import a sanitized real COD Excel file, validate bucket counts, apply confirmed rows, then test a changed-header workbook with manual mapping.

---
*Phase: 04-cod-search-and-operational-utilities*
*Completed: 2026-06-17*
