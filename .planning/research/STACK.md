# Stack Research

**Domain:** Brownfield internal operations React SPA refactor
**Researched:** 2026-06-15
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | Keep 18.2 initially | UI runtime | The app is already React 18; keeping it avoids a risky framework upgrade while data/test foundations are fixed. |
| TypeScript | Keep 4.9 short-term, plan upgrade later | Type safety | Existing CRA stack uses TS 4.9. Stabilize tests/build first, then upgrade with a controlled type pass. |
| Ant Design | Keep 5.x | UI component system | Existing components already wrap AntD. AntD v5 tokens and ConfigProvider can support a visual refresh without replacing the UI system. |
| Redux Toolkit + redux-persist | Keep, refactor selectors/services | Client state | Existing state is Redux persisted to IndexedDB. Keep it while adding tests and safer rehydrate semantics. |
| Vite | Introduce during build modernization phase | Dev/build tooling | Vite is the pragmatic successor path for CRA-style React apps and works well with Vitest. Do after baseline tests/build are understood. |
| Trello integration adapter | Extract during order sync refactor | Side-effect boundary for Trello | A typed adapter makes Trello calls mockable, status-aware, and recoverable while the app remains client-heavy. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | Current stable with Vite | Unit/component tests | Use when migrating test runner from CRA/Jest, especially for helpers, reducers, hooks, and components. |
| React Testing Library | Current compatible version | Component tests | Keep the current testing style but replace stale CRA sample tests with app-specific assertions. |
| MSW | Current stable | Mock browser/API requests | Use for Trello integration tests without hitting Trello. |
| Zod | Current stable | Runtime validation | Validate backup restore payloads, configuration, and Trello adapter input/output. |
| Playwright | Current stable | End-to-end smoke tests | Add a small set of critical operator-flow tests after test/build baseline is fixed. |
| dayjs or date-fns | One date library only | Date formatting/calculation | Standardize away from mixed `moment` + `dayjs`; pick one during refactor. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Catch React/TypeScript issues | Current CRA config exists; modernize when moving to Vite. |
| Prettier | Formatting consistency | Add explicit config before broad UI refactor to avoid noisy diffs. |
| GitHub Actions or local release script | Test/build/deploy confidence | At minimum run typecheck, tests, build, and docs freshness check. |
| GSD codebase docs | Planning context | Keep `.planning/codebase/` updated after structural refactors. |

## Installation

```bash
# Do not install everything at once. Phase the stack changes.

# Testing baseline candidates
yarn add -D @testing-library/react @testing-library/jest-dom

# Vite/Vitest modernization candidates
yarn add -D vite @vitejs/plugin-react vitest jsdom

# Integration/runtime validation candidates
yarn add zod
yarn add -D msw playwright
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Keep React + AntD | Replace with a new frontend framework/design system | Only if the refactor becomes a full product rebuild, which is out of scope for this milestone. |
| Typed Trello adapter | Full backend/database rewrite | Use a backend rewrite only if local IndexedDB + Trello backup cannot meet data integrity needs. |
| Vite + Vitest | Stay on CRA/react-scripts | Stay temporarily while stabilizing, but avoid long-term investment in CRA-specific tooling. |
| Zod restore validation | TypeScript-only trust | Runtime validation is needed because backup restore parses external JSON. |
| MSW for Trello tests | Manual Trello sandbox testing only | Manual testing is still useful, but should not be the only guard for order/Trello sync. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Unstructured Trello calls | Partial failures stay hard to detect and recover | Typed adapter with operation results and retry state |
| Big-bang rewrite | High risk of breaking current order operations and data restore | Vertical phases that preserve current workflows |
| Adding more logic to `useOrder.ts` | It already mixes calculations, Redux, Trello, and statistics | Extract services/selectors/adapters first |
| More generated `docs/` churn without deploy checks | Source and deployed build can drift silently | Add build freshness/release verification |
| Two date libraries long-term | Increases bundle size and inconsistent behavior | Standardize on one date library |

## Stack Patterns by Variant

**If staying static-hosted:**
- Keep the React SPA static, but structure Trello operations behind a typed adapter with visible sync status.
- Because trusted internal use prioritizes recoverability, data confidence, and operational clarity.

**If moving to a backend-backed app later:**
- Introduce a real database only after the first milestone proves backup/restore and sync requirements need it.
- Because a backend rewrite before stabilization would slow down daily-operator UX improvements.

**If prioritizing mobile operator UX:**
- Keep AntD but build app-specific compact components and responsive layouts.
- Because replacing the UI library is less valuable than reducing clicks and improving workflow clarity.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| React 18 | Ant Design 5, Redux Toolkit 2 | Current app stack is coherent enough to retain during stabilization. |
| Vite + Vitest | React 18/TypeScript | Introduce together during build/test modernization. |
| CRA/react-scripts 5 | Current Jest setup | Existing test command does not resolve aliases; fix or migrate. |
| Browser IndexedDB | redux-persist/idb-keyval | Keep while adding validation and backup/restore tests. |

## Sources

- https://vite.dev/guide/ — Vite React app and build tooling direction.
- https://vitest.dev/guide/ — Vitest usage with Vite-based projects.
- https://react.dev/learn/start-a-new-react-project — React ecosystem guidance for app setup.
- https://redux-toolkit.js.org/usage/usage-with-typescript — Redux Toolkit TypeScript patterns.
- https://ant.design/components/config-provider/ — Ant Design v5 ConfigProvider/theme customization.
- https://mswjs.io/docs/ — Mock Service Worker for API mocking in tests.
- https://zod.dev/ — Runtime schema validation.
- https://developer.atlassian.com/cloud/trello/rest/ — Trello REST API integration surface.

---
*Stack research for: Brownfield internal operations React SPA refactor*
*Researched: 2026-06-15*
