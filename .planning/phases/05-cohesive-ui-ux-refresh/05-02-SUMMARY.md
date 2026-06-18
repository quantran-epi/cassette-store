---
phase: 05-cohesive-ui-ux-refresh
plan: 02
subsystem: ui
tags: [react, antd, mobile-layout, order-list, customer-list, order-create]
requires:
  - phase: 05-cohesive-ui-ux-refresh
    provides: token-driven app theme, appTokens, Card tokenization, and TruncatedText tap reveal from Plan 05-01
provides:
  - Mobile-native order list filters and order row metadata using token spacing and tap reveal
  - Mobile-native customer list rows with search, add, edit, delete, and create-order actions preserved
  - Tokenized order-create form spacing, compact section actions, attachment previews, and full-width save CTA
affects: [phase-05, order-list, order-item, customer-list, order-create]
tech-stack:
  added: []
  patterns: [tokenized mobile list headers, TruncatedText row fields, behavior-preserving RTL store setup]
key-files:
  created:
    - src/Modules/Customer/Screens/CustomerList.screen.test.tsx
  modified:
    - src/Modules/Order/Screens/OrderList.screen.tsx
    - src/Modules/Order/Screens/OrderList.screen.test.tsx
    - src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx
    - src/Modules/Customer/Screens/CustomerList.screen.tsx
    - src/Modules/Customer/Screens/CustomerItem.widget.tsx
    - src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx
key-decisions:
  - "Preserve order list query values, selectors, reducers, and action widgets while changing only presentation labels, spacing, and reveal behavior."
  - "Mock only the broad @hooks barrel in CustomerListScreen tests so customer UI coverage does not load unrelated order helpers and nanoid ESM."
patterns-established:
  - "Dense mobile list headers use full-width Stack.Compact search plus a labeled action button with token spacing."
  - "Order and customer row long fields use TruncatedText instead of hover Tooltip plus fixed-width Paragraph ellipsis."
  - "OrderCreateScreen can tighten section spacing and compact actions without changing useSmartForm field definitions, watchers, or createOrder arguments."
requirements-completed: [UX-02, UX-05]
duration: 19 min
completed: 2026-06-18
---

# Phase 05 Plan 02: Mobile-Native Daily Workflow Layouts Summary

**Order, customer, and order-create daily workflow screens now use tokenized mobile list/form layouts while preserving URL filters, Redux actions, and order creation calculations.**

## Performance

- **Duration:** 19 min
- **Started:** 2026-06-18T02:12:03Z
- **Completed:** 2026-06-18T02:31:31Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Refreshed `OrderListScreen` with Vietnamese filter labels, active tags, compact mobile filter bands, and preserved URL query/selectors.
- Replaced order and customer row fixed-width hover-only text fields with `TruncatedText` tap reveal while keeping existing action widgets and handlers.
- Added `CustomerListScreen` coverage for name/mobile/address search, empty state, add modal, and delete confirmation through the real row widget.
- Tightened `OrderCreateScreen` section spacing, attachment action, preview sizing, and save CTA using `appTokens` without changing pricing, COD, upload, or submit behavior.

## Task Commits

Each task was committed atomically:

1. **Task 1: Refresh order list and order row mobile layout** - `59ea683` (feat)
2. **Task 2: Refresh customer list/card rows with tap reveal** - `723a191` (feat)
3. **Task 3: Tighten order create form for mobile without changing calculations** - `fb63789` (feat)

## Files Created/Modified

- `src/Modules/Order/Screens/OrderList.screen.tsx` - Tokenized mobile filter/header layout and Vietnamese order-list labels.
- `src/Modules/Order/Screens/OrderList.screen.test.tsx` - Updated behavior assertions for Vietnamese labels and filtered states.
- `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` - Long order metadata fields now use `TruncatedText` tap reveal.
- `src/Modules/Customer/Screens/CustomerList.screen.tsx` - Tokenized mobile search/add header while preserving Redux-backed filtering.
- `src/Modules/Customer/Screens/CustomerItem.widget.tsx` - Long customer name, phone, buy-count, and address fields now use `TruncatedText`.
- `src/Modules/Customer/Screens/CustomerList.screen.test.tsx` - New RTL coverage for customer search, empty state, add modal, and delete dispatch path.
- `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx` - Tokenized order-create spacing, compact attachment/action controls, previews, and full-width save CTA.

## Decisions Made

- Kept all order-list URL query values and helper/selector contracts unchanged; only display labels and layout changed.
- Kept customer list state access on `state.customer.customers`; no selector or persisted state shape was introduced.
- Kept order-create form behavior in the existing `useSmartForm` path and retained `orderUtils.createOrder(values.transformValues, orderCustomer, files)` exactly.

## Deviations from Plan

None - plan executed exactly as written.

---

**Total deviations:** 0 auto-fixed. **Impact:** No scope changes.

## Issues Encountered

- The new customer-list test initially loaded the broad `@hooks` barrel and hit the existing Jest/nanoid ESM issue. The test now mocks only `useScreenTitle` and `useToggle`, matching the plan's behavior boundary without changing production code.
- Verification still emits known non-failing Redux Persist, Ant Design Form.Item, React `act(...)`, and CRA/Babel warnings.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Wave 2 can continue with `05-04` dashboard reorganization. The shared mobile list/reveal patterns are now present in order and customer daily workflow screens, and Plan `05-03` can later sweep remaining workflow copy/state surfaces without reworking these handlers.

## Self-Check: PASSED

- `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderList.screen.test.tsx src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderActionSurface.widget.test.tsx src/Modules/Customer/Screens/CustomerList.screen.test.tsx src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.test.tsx` passed: 6 suites, 32 tests.
- `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Customer/Screens/CustomerList.screen.test.tsx src/Store/Reducers/CustomerReducer.test.ts` passed.
- `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.test.tsx src/Common/Helpers/OrderDomainHelper.test.ts src/Hooks/useOrder.test.ts` passed: 3 suites, 30 tests.
- Source checks confirmed `CustomerItem.widget.tsx` has no fixed `width: 300/320` long-field paragraphs and uses `TruncatedText`.
- No packages, Redux reducers, persisted models, Trello handlers, route basename, or URL query value contracts were changed.

---
*Phase: 05-cohesive-ui-ux-refresh*
*Completed: 2026-06-18*
