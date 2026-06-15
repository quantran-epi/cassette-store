# Research Summary

**Domain:** Brownfield internal operations React SPA refactor
**Researched:** 2026-06-15
**Confidence:** HIGH

## Executive Summary

This project should not start with a visual-only redesign or a full rewrite. The current app already delivers valuable internal operations workflows, but it has foundation risks around broken tests, partial backup/restore, and order/Trello synchronization.

The best roadmap is staged: first stabilize test/build/data foundations, then extract order-domain logic and integration boundaries, then improve daily operator utilities, and only then apply a broader UI/UX refresh on top of safer workflows.

## Stack Recommendation

**Keep initially:** React 18, TypeScript, Ant Design 5, Redux Toolkit, redux-persist, IndexedDB.

**Add or modernize deliberately:**
- Runtime validation with Zod for restore/config/Trello adapter boundaries.
- MSW-backed tests for Trello integration behavior.
- Vite + Vitest when modernizing CRA/react-scripts becomes part of a controlled build/test phase.
- Playwright smoke tests for critical daily workflows after the app has stable test utilities.

**Avoid:** big-bang rewrite and UI polish before data/test safety nets.

## Table Stakes

- Recoverable Trello operation handling with structured sync status.
- Passing one-shot test command with meaningful reducer/helper/component coverage.
- Complete, versioned, validated backup/restore.
- Reliable order/Trello sync with visible failure states.
- Faster daily utilities for order creation, shipping updates, COD payment cycles, search, filters, and quick actions.
- Mobile-friendly internal-operations UI that is dense, clear, and efficient.

## Watch Out For

- Treating Trello side effects as invisible fire-and-forget calls will keep sync recovery manual and error-prone.
- `useOrder.ts` should not keep absorbing new logic; it needs extraction into testable domain and integration layers.
- Backup restore must not dispatch arbitrary JSON directly into Redux.
- A customer-facing storefront, full multi-user auth system, or total backend rewrite would distract from the internal workflow milestone.
- Generated `docs/` output needs deployment freshness checks if it remains committed.

## Recommended Roadmap Shape

1. **Data Safety and Refactor Baseline:** test/build baseline, backup/restore schema, complete state restore, deploy/build checks.
2. **Order and Sync Reliability:** Trello result handling, sync status foundations, integration ports, and recovery flows.
3. **Daily Order Workflows:** improve order creation, shipping updates, and route clarity.
4. **Operational Utilities:** improve COD, search/filtering, quick actions, and status surfaces.
5. **UI/UX Refresh:** cohesive internal-tool design system, mobile layout, dashboard/action surfaces, visual polish.

## Sources

- `.planning/codebase/STACK.md`
- `.planning/codebase/ARCHITECTURE.md`
- `.planning/codebase/INTEGRATIONS.md`
- `.planning/codebase/TESTING.md`
- `.planning/codebase/CONCERNS.md`
- https://vite.dev/guide/
- https://vitest.dev/guide/
- https://react.dev/learn/start-a-new-react-project
- https://redux-toolkit.js.org/usage/usage-with-typescript
- https://ant.design/components/config-provider/
- https://mswjs.io/docs/
- https://zod.dev/
- https://developer.atlassian.com/cloud/trello/rest/

---
*Research summary for: Brownfield internal operations React SPA refactor*
*Researched: 2026-06-15*
