# Research Summary

**Domain:** Brownfield internal operations React SPA refactor
**Researched:** 2026-06-15
**Confidence:** HIGH

## Executive Summary

This project should not start with a visual-only redesign or a full rewrite. The current app already delivers valuable internal operations workflows, but it has foundation risks around client-exposed Trello credentials, broken tests, partial backup/restore, and order/Trello synchronization.

The best roadmap is staged: first stabilize security/test/build/data foundations, then extract order-domain logic and integration boundaries, then improve daily operator utilities, and only then apply a broader UI/UX refresh on top of safer workflows.

## Stack Recommendation

**Keep initially:** React 18, TypeScript, Ant Design 5, Redux Toolkit, redux-persist, IndexedDB.

**Add or modernize deliberately:**
- Minimal Trello proxy/serverless boundary for secret-bearing calls.
- Runtime validation with Zod for restore/config/API boundaries.
- MSW-backed tests for Trello integration behavior.
- Vite + Vitest when modernizing CRA/react-scripts becomes part of a controlled build/test phase.
- Playwright smoke tests for critical daily workflows after the app has stable test utilities.

**Avoid:** client-visible Trello secrets, big-bang rewrite, and UI polish before safety nets.

## Table Stakes

- Safe Trello credential handling.
- Passing one-shot test command with meaningful reducer/helper/component coverage.
- Complete, versioned, validated backup/restore.
- Reliable order/Trello sync with visible failure states.
- Faster daily utilities for order creation, shipping updates, COD payment cycles, search, filters, and quick actions.
- Mobile-friendly internal-operations UI that is dense, clear, and efficient.

## Watch Out For

- Moving credentials from source into client env vars does not solve the security issue.
- `useOrder.ts` should not keep absorbing new logic; it needs extraction into testable domain and integration layers.
- Backup restore must not dispatch arbitrary JSON directly into Redux.
- A public storefront, full multi-user auth system, or total backend rewrite would distract from the first milestone unless required for credential safety.
- Generated `docs/` output needs deployment freshness checks if it remains committed.

## Recommended Roadmap Shape

1. **Foundation Stabilization:** test/build baseline, secret handling, `.env` hygiene, deploy/build checks.
2. **Data and Sync Safety:** backup/restore schema, full state restore, Trello result handling, sync status foundations.
3. **Order Domain Refactor:** extract pure calculations, reducers/selectors, integration ports, and tests.
4. **Daily Operator Utilities:** improve order creation, shipping, COD, search/filtering, quick actions, and recovery flows.
5. **UI/UX Refresh:** cohesive internal-tool design system, mobile layout, dashboard/action surfaces, visual polish.

## Sources

- `.planning/codebase/STACK.md`
- `.planning/codebase/ARCHITECTURE.md`
- `.planning/codebase/INTEGRATIONS.md`
- `.planning/codebase/TESTING.md`
- `.planning/codebase/CONCERNS.md`
- https://vite.dev/guide/
- https://vite.dev/guide/env-and-mode
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
