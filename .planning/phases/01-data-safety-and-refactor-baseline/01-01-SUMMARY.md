---
phase: 01-data-safety-and-refactor-baseline
plan: 01
subsystem: testing
tags: [jest, cra, craco, aliases, smoke-test]
requires: []
provides:
  - CRA Jest alias resolution for the app's TypeScript path aliases
  - App-specific cassette-store shell smoke test
  - Passing one-shot Jest and production build checks
affects: [phase-01, testing-baseline, backup-restore-refactor]
tech-stack:
  added: []
  patterns:
    - Package-level Jest moduleNameMapper mirrors CRACO/tsconfig aliases
    - App smoke tests mock browser persistence and Trello fetch side effects
key-files:
  created: []
  modified:
    - package.json
    - src/App.test.tsx
key-decisions:
  - "Used package-level CRA Jest moduleNameMapper instead of changing the test runner script."
  - "Mapped Ant Design es subpaths to lib subpaths for Jest only, preserving production imports."
  - "Rendered the real App shell in the smoke test with IndexedDB and Trello fetch mocked."
patterns-established:
  - "Jest alias mappings should stay aligned with tsconfig.json and craco.config.js."
  - "Smoke tests that render App should set the /cassette-store pathname and mock idb-keyval/fetch side effects."
requirements-completed:
  - SAFE-01
  - SAFE-02
  - SAFE-03
duration: 8min
completed: 2026-06-15
---

# Phase 01 Plan 01: Test and Build Baseline Summary

**CRA Jest alias resolution and cassette-store app-shell smoke coverage with green one-shot test and production build gates**

## Performance

- **Duration:** 8 min
- **Started:** 2026-06-15T14:03:00Z
- **Completed:** 2026-06-15T14:10:56Z
- **Tasks:** 3 completed
- **Files modified:** 2

## Accomplishments

- Added Jest module mappings for `@components`, `@routing`, `@modules`, `@store`, `@common`, `@hooks`, and the Ant Design `es` subpath used by the local Stack wrapper.
- Replaced the stale CRA `learn react` test with a cassette-store app shell smoke test that renders `<App />` under `/cassette-store/`.
- Verified `CI=true yarn test --watchAll=false` and `yarn build` both exit 0.

## Task Commits

1. **Task 1: Repair Jest alias resolution without changing the build stack** - `7bca703` (`fix`)
2. **Task 2: Replace stale CRA sample test with cassette-store smoke coverage** - `a8bc8d0` (`test`)
3. **Task 3: Verify the production build remains green** - no code commit; verification-only task completed after the first two commits

**Plan metadata:** committed separately with this summary.

## Files Created/Modified

- `package.json` - Added CRA-supported Jest `moduleNameMapper` entries for app aliases and test-only Ant Design CommonJS mapping.
- `src/App.test.tsx` - Mocks `idb-keyval`, `nanoid`, and `fetch`, sets `/cassette-store/` browser history, and asserts the cassette-store navigation shell renders.

## Decisions Made

- Used package-level Jest configuration rather than switching `test` to CRACO, because the current one-shot command can keep using `react-scripts test`.
- Mocked browser persistence and Trello fetch side effects in the smoke test so rendering the real app shell does not perform network or IndexedDB work.
- Left existing build and lint warnings alone because they pre-date this plan and are outside the Wave 1 baseline fix.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Mapped Ant Design ES subpath for Jest**
- **Found during:** Task 2 verification
- **Issue:** After alias resolution was fixed, Jest failed to parse `antd/es/space/Compact` from `src/Components/Layout/Stack/Stack.tsx` because CRA Jest ignores ESM in `node_modules`.
- **Fix:** Added `^antd/es/(.*)$` to Jest `moduleNameMapper`, targeting `antd/lib/$1` for tests only.
- **Files modified:** `package.json`
- **Verification:** `CI=true yarn test --watchAll=false --runTestsByPath src/App.test.tsx` exits 0.
- **Committed in:** `7bca703`

**2. [Rule 3 - Blocking] Mocked nanoid ESM for the app smoke test**
- **Found during:** Task 2 verification
- **Issue:** Jest failed to parse `nanoid` ESM when rendering `<App />` through `OrderHelper`.
- **Fix:** Added a local `jest.mock('nanoid')` in `src/App.test.tsx`.
- **Files modified:** `src/App.test.tsx`
- **Verification:** `CI=true yarn test --watchAll=false --runTestsByPath src/App.test.tsx` exits 0.
- **Committed in:** `a8bc8d0`

---

**Total deviations:** 2 auto-fixed (blocking test-runtime issues).  
**Impact on plan:** No production behavior changed. The deviations keep Jest compatible with existing dependencies while preserving the app runtime build path.

## Issues Encountered

- `CI=true yarn test --watchAll=false` passes but logs existing Redux Persist serializable-action and Ant Design `act(...)` warnings from app startup side effects.
- `yarn build` passes but logs existing Browserslist and ESLint warnings across the brownfield app.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Wave 2 can rely on `CI=true yarn test --watchAll=false` and focused `--runTestsByPath` commands for backup helper and reducer coverage.

## Self-Check: PASSED

- `CI=true yarn test --watchAll=false --runTestsByPath src/App.test.tsx` exits 0.
- `CI=true yarn test --watchAll=false` exits 0.
- `yarn build` exits 0 and does not modify `docs/` deployment output.
- `src/App.test.tsx` no longer contains `learn react`.
- No new dependency was added.

---
*Phase: 01-data-safety-and-refactor-baseline*
*Completed: 2026-06-15*
