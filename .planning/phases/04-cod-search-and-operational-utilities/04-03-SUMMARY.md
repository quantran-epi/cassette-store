---
phase: 04-cod-search-and-operational-utilities
plan: 03
subsystem: order-list
tags: [react, redux, router, url-query, selectors, testing]

requires:
  - phase: 04-01
    provides: selector-backed order list read model foundation
provides:
  - URL-backed order list search, filters, sort, and page state
  - query helper for parsing, serializing, default elision, sanitization, merge/reset semantics, and active-filter detection
  - selector paging fields consumed by the order list screen
  - focused helper, selector, and screen regression tests
affects: [04-04, order-list, operational-status, routing]

tech-stack:
  added: []
  patterns:
    - URLSearchParams as the source of truth for order list view state
    - pure query helper owns query defaults and stable route serialization
    - screen controls derive from query params and feed selector-backed page rows

key-files:
  created:
    - src/Common/Helpers/OrderListQueryHelper.ts
    - src/Common/Helpers/OrderListQueryHelper.test.ts
    - src/Modules/Order/Screens/OrderList.screen.test.tsx
  modified:
    - src/Store/Selectors/OrderSelectors.ts
    - src/Store/Selectors/OrderSelectors.test.ts
    - src/Modules/Order/Screens/OrderList.screen.tsx

key-decisions:
  - "Use stable ASCII status keys such as SHIPPED in URLs while converting them to existing ORDER_STATUS values for selectors and checkboxes."
  - "Keep pagination out of active-filter detection so page-only URLs do not show clear-filter affordances."
  - "Keep the existing Vietnamese status labels in the list while using English Phase 4 copy for new active filter and empty-state controls."

patterns-established:
  - "Order list query helpers serialize defaults to an empty query and sanitize invalid option/page params before selectors see them."
  - "List pagination writes page state through the same query helper as search/filter/sort controls."
  - "RTL screen tests use a MemoryRouter location probe to assert query updates without depending on browser globals."

requirements-completed: [OPS-04]

duration: 7 min
completed: 2026-06-17
---

# Phase 04 Plan 03: URL-Backed Order Search, Filters, and Sort Summary

**URL-backed order list controls with selector-driven filtering, sorting, summaries, and pagination**

## Performance

- **Duration:** 7 min
- **Started:** 2026-06-17T03:50:44Z
- **Completed:** 2026-06-17T03:57:43Z
- **Tasks:** 4
- **Files modified:** 6

## Accomplishments

- Added `OrderListQueryHelper` to parse and serialize `q`, `status`, `cod`, `ship`, `from`, `to`, `sort`, and `page` query params with default elision and invalid-param sanitization.
- Moved order-list query types/defaults out of `OrderSelectors.ts` while preserving selector read-model behavior and paging fields.
- Replaced local order-list search/status/COD/page state with React Router `useSearchParams`.
- Added first-class controls for search, status, COD state, shipping state, date range, sort, active filters, clear filters, and URL-backed pagination.
- Added RTL coverage for URL initialization, search URL updates, clear filters, filtered empty state, no-orders empty state, invalid query defaults, and pagination URL writes.

## Task Commits

Each task was committed atomically:

1. **Task 1: Cover order list query round trips and URL-driven filtering** - `d687a5c` (test)
2. **Task 2: Implement order list query helper and selector pagination support** - `9a74c4f` (feat)
3. **Task 3: Wire OrderListScreen controls to useSearchParams** - `5677c60` (feat)
4. **Task 4: Add empty states, active filter affordances, and RTL coverage** - `ae59d4c` (test)

**Plan metadata:** pending in the docs close-out commit.

## Files Created/Modified

- `src/Common/Helpers/OrderListQueryHelper.ts` - Stable query param names, defaults, parse/serialize/merge/default/active-filter helpers, and status key/value mapping.
- `src/Common/Helpers/OrderListQueryHelper.test.ts` - Round-trip, default elision, invalid-param sanitization, page reset, and active-filter tests.
- `src/Store/Selectors/OrderSelectors.ts` - Imports query contract from the helper while preserving read-model filtering, sorting, summary, and pagination output.
- `src/Store/Selectors/OrderSelectors.test.ts` - Adds selector paging field coverage.
- `src/Modules/Order/Screens/OrderList.screen.tsx` - URL-backed filter band, active chips, clear filters, filtered empty state, and selector-backed page rows/pagination.
- `src/Modules/Order/Screens/OrderList.screen.test.tsx` - Screen-level URL and list behavior coverage.

## Decisions Made

- URLs use status keys like `SHIPPED` instead of localized labels, but helper parsing also accepts existing status values for resilience.
- Filter changes reset page to `1`; pagination writes only `page` and does not mark the list as actively filtered.
- Invalid `cod`, `ship`, `sort`, and page params sanitize to default control state without breaking render.

## Deviations from Plan

None - plan executed exactly as written.

---

**Total deviations:** 0 auto-fixed
**Impact on plan:** None.

## Issues Encountered

- Existing brownfield warnings remain during tests: Redux Persist non-serializable action warnings, React `act(...)` warnings in older app/routing tests, CRA Babel dependency warning, Ant Design form-item warnings, and known test-suite timer/leak messages from the baseline.

## Verification

- `CI=true yarn test --watchAll=false --runTestsByPath src/Common/Helpers/OrderListQueryHelper.test.ts src/Store/Selectors/OrderSelectors.test.ts src/Modules/Order/Screens/OrderList.screen.test.tsx` - passed, 3 suites and 16 tests.
- `CI=true yarn test --watchAll=false` - passed, 21 suites and 118 tests.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 04-04 can navigate operators into filtered order-list views using `OrderListQueryHelper` route serialization.
- Operational status tray work can rely on selector-backed page/list behavior instead of rebuilding order-list filter state.
- Manual UAT remains: set search, status, COD, shipping, date, sort, and page; refresh or return from an order detail and confirm the same view is preserved.

---
*Phase: 04-cod-search-and-operational-utilities*
*Completed: 2026-06-17*
