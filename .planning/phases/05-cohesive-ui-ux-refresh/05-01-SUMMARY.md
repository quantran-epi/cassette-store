---
phase: 05-cohesive-ui-ux-refresh
plan: 01
subsystem: ui
tags: [react, antd, theme, tokens, typography]
requires:
  - phase: 04-cod-search-and-operational-utilities
    provides: selector-backed operational surfaces that Phase 5 must preserve while re-skinning
provides:
  - Token-driven Ant Design theme foundation
  - Shared app token constants for spacing, typography, colors, radius, controls, and shadows
  - Mobile tap-reveal Typography primitive for long fields
  - Tokenized shared Card primitive
affects: [phase-05, dashboard, order-list, customer-list, order-create, cod-payment]
tech-stack:
  added: []
  patterns: [Ant Design ThemeConfig builder, appTokens source of truth, click Popover reveal]
key-files:
  created:
    - src/theme/tokens.ts
    - src/theme/buildAppTheme.ts
    - src/theme/buildAppTheme.test.ts
    - src/Components/Typography/TruncatedText.tsx
    - src/Components/Typography/TruncatedText.test.tsx
  modified:
    - src/App.tsx
    - src/Hooks/useTheme.ts
    - src/Components/Card/Card.tsx
    - src/Components/Typography/index.ts
    - craco.config.js
key-decisions:
  - "Use src/theme/tokens.ts as the JS source of truth and keep CRACO Less literals in parity because the config cannot safely import TypeScript tokens."
  - "Shared primitives import theme tokens directly instead of through @hooks to avoid pulling domain hooks into isolated UI tests."
patterns-established:
  - "Root ConfigProvider theme is built by buildAppTheme(), which maps appTokens into Ant Design default and compact algorithms."
  - "Long inline fields reveal full text through a click/tap Popover using Vietnamese reveal copy."
  - "Card style defaults use theme/app tokens and keep caller style spread last."
requirements-completed: [UX-01, UX-02, UX-03, UX-05]
duration: 8 min
completed: 2026-06-18
---

# Phase 05 Plan 01: Token-Driven Visual System Foundation Summary

**Ant Design theme tokens now drive the app root, shared Card styling, and a mobile tap-reveal Typography primitive for long fields.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-06-18T02:03:08Z
- **Completed:** 2026-06-18T02:11:06Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- Added `appTokens` for spacing, typography, colors, radius, 44px controls, and migrated shadow values.
- Replaced the old inline root `fontSize: 18` theme with `buildAppTheme()` using Ant Design default and compact algorithms.
- Added `TruncatedText` for click/tap reveal of long inline values and expandable note text with default `xem thêm` copy.
- Tokenized the shared `Card` primitive while preserving `noShadow` and caller style override behavior.

## Task Commits

Each task was committed atomically:

1. **Task 1: Cover theme config and tap-reveal contracts** - `bad7340` (test)
2. **Task 2: Add token source and root ConfigProvider theme** - `06b1405` (feat)
3. **Task 3: Tokenize shared card and expose mobile tap reveal** - `b3146a3` (feat)

## Files Created/Modified

- `src/theme/tokens.ts` - Central `appTokens` object for visual-system constants.
- `src/theme/buildAppTheme.ts` - Maps `appTokens` into Ant Design `ThemeConfig`.
- `src/theme/buildAppTheme.test.ts` - Verifies seed tokens and algorithm configuration.
- `src/App.tsx` - Uses `buildAppTheme()` in the root `ConfigProvider` without changing provider order.
- `src/Hooks/useTheme.ts` - Preserves `useTheme()` and exports `appTokens`.
- `craco.config.js` - Documents Less variable parity with JS tokens.
- `src/Components/Card/Card.tsx` - Uses tokenized radius, spacing, and card shadow.
- `src/Components/Typography/TruncatedText.tsx` - Adds reusable mobile reveal text primitive.
- `src/Components/Typography/TruncatedText.test.tsx` - Covers short text and click reveal behavior.
- `src/Components/Typography/index.ts` - Exports `TruncatedText` beside `Typography`.

## Decisions Made

- Kept CRACO color values as literals with an explicit parity comment because `craco.config.js` runs in Node and should not import TypeScript source directly.
- Imported `appTokens` directly from `src/theme/tokens.ts` inside shared primitives to avoid coupling low-level UI components to the broad `@hooks` barrel.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Avoided broad hook barrel import in shared primitives**
- **Found during:** Task 3 (Tokenize shared card and expose mobile tap reveal)
- **Issue:** Importing `appTokens` from `@hooks` caused the isolated `TruncatedText` test to load unrelated order hooks and the ESM `nanoid` package.
- **Fix:** Imported `appTokens` directly from `src/theme/tokens.ts` and `useTheme` directly from `src/Hooks/useTheme.ts`.
- **Files modified:** `src/Components/Card/Card.tsx`, `src/Components/Typography/TruncatedText.tsx`
- **Verification:** `CI=true yarn test --watchAll=false --runTestsByPath src/Components/Typography/TruncatedText.test.tsx src/App.test.tsx` passed.
- **Committed in:** `b3146a3`

---

**Total deviations:** 1 auto-fixed (1 blocking). **Impact:** Import-boundary cleanup only; no product behavior or visual scope expansion.

## Issues Encountered

- The RED test run failed as expected before `buildAppTheme` and `TruncatedText` existed.
- `yarn build` and app smoke tests still emit existing non-failing CRA/Babel, Browserslist, Redux Persist, React `act(...)`, and brownfield ESLint warnings.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Wave 2 plans can consume `appTokens`, the root Ant Design theme, tokenized `Card`, and `TruncatedText` for mobile list, form, and dashboard surfaces.

## Self-Check: PASSED

- `CI=true yarn test --watchAll=false --runTestsByPath src/theme/buildAppTheme.test.ts src/Components/Typography/TruncatedText.test.tsx src/App.test.tsx src/Routing/RootRouter.test.tsx` passed.
- `yarn build` passed with warnings only.
- `src/App.tsx` no longer contains the old inline `fontSize: 18` or color token object.
- No packages, Redux reducers, store models, route basename, Trello logic, or domain state shapes were changed.

---
*Phase: 05-cohesive-ui-ux-refresh*
*Completed: 2026-06-18*
