# Cassette Store

## What This Is

Cassette Store is an existing browser-based operations app for running a small cassette sales workflow. It helps an internal operator manage customers, create and track orders, coordinate shipping and COD payment, and mirror operational state into Trello.

The next milestone converts the repo into a GSD-managed brownfield project and drives a major app refactor focused on data safety, daily operator workflow, and a more useful, polished UI/UX for an internal app.

## Core Value

An internal operator can manage cassette orders, shipping, COD, and customer follow-up quickly and confidently without losing data or desynchronizing Trello.

## Requirements

### Validated

<!-- Existing capabilities inferred from the brownfield codebase map. -->

- Done: Customer list, add, edit, delete, search, and customer status tracking exist through `src/Modules/Customer/` and `src/Store/Reducers/CustomerReducer.ts`.
- Done: Order creation, order listing, order status transitions, shipping code updates, refunds, attachments, and priority markers exist through `src/Modules/Order/` and `src/Hooks/useOrder.ts`.
- Done: Dashboard statistics for sales, COD, shipping costs, returns, and customer activity exist in `src/Modules/Home/Screens/Dashboard.screen.tsx`.
- Done: Trello card creation, card movement, comments, attachments, list checks, and backup upload exist through `src/Hooks/Trello/useTrello.ts`, `src/Hooks/useAPI.ts`, and `src/Routing/MasterPage.tsx`.
- Done: Browser-local persistence exists through Redux Toolkit, redux-persist, IndexedDB, and `src/Store/idbStorage.ts`.
- Done: Static deployment output exists under `docs/`, with app routing configured for `/cassette-store`.
- Validated in Phase 1: One-shot tests and production build pass; backup/restore/done-refresh state handling is covered by focused tests and visible operator status.
- Validated in Phase 2: Order domain helpers, Trello operation results, local-first workflow results, durable sync failures, and order-level retry/manual recovery controls are implemented and verified.

### Active

<!-- Current milestone scope. These are hypotheses until shipped and verified. -->

- [ ] Improve the daily operator workflow for order creation, shipping updates, COD payment cycles, backup/restore, quick actions, search, and filters.
- [ ] Refresh the UI/UX for a more beautiful, mobile-friendly, efficient internal operations surface while preserving existing business behavior.
- [ ] Preserve useful current workflows during the refactor so the app remains usable between phases.

### Out of Scope

<!-- Explicit boundaries for the first GSD milestone. -->

- Customer-facing storefront or public shopping experience - this milestone is focused on internal operations.
- Multi-tenant or broad external user management - the current priority is a trusted small operator/team workflow.
- Full product rewrite before stabilization - unsafe foundations and data reliability come first.
- Large backend migration - keep this milestone focused on internal app reliability, workflow speed, and UI/UX.
- External-user/public-hosting work - the app is treated as an internal trusted tool for this milestone.
- Native mobile app - improve responsive web UX first.

## Context

- This is a brownfield React 18 + TypeScript + CRACO/Create React App project with Ant Design, Redux Toolkit, redux-persist, IndexedDB, and Trello API integration.
- The codebase has already been mapped in `.planning/codebase/`. Important references include `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STACK.md`, `.planning/codebase/INTEGRATIONS.md`, `.planning/codebase/TESTING.md`, and `.planning/codebase/CONCERNS.md`.
- Current data is browser-local and persisted through IndexedDB. Trello is used both as an operational board and as a backup attachment target.
- This milestone assumes trusted internal use. External-user/public-hosting concerns are deliberately not driving the v1 roadmap.
- Phase 1 repaired the one-shot test/build baseline. `CI=true yarn test --watchAll=false && yarn build` passes, though the brownfield app still emits non-failing Redux Persist, React `act(...)`, CRA/Babel, Browserslist, and ESLint warnings.
- Phase 2 made core order workflows local-first around Trello side effects: failures are persisted as order sync failures, affected order items show retry/recovery controls, and attachment failures that need browser files require manual reselect.
- Daily operator utility is the product direction: fewer clicks, clearer actions, better search/filtering, safer batch/COD/shipping workflows, and less manual recovery when sync fails.
- UI/UX improvement matters, but it should follow the operational nature of the app: dense, clear, fast, mobile-friendly, and built for repeated use rather than a marketing-style redesign.

## Constraints

- **Brownfield continuity**: Preserve existing customer, order, COD, Trello, and backup workflows while refactoring - the app is already useful and should not be frozen for a large rewrite.
- **Internal tool scope**: Treat external-user/public-hosting work as out of scope for this milestone - the app is used by a trusted internal operator/team.
- **Data integrity**: Order state, customer state, COD cycles, done-order IDs, and Trello card IDs must survive backup/restore and refactor phases without silent loss.
- **Static deployment**: The current deployment shape uses committed `docs/` build output and `/cassette-store` routing; changes to deployment should be deliberate and verified.
- **Testing baseline**: Fix the existing test runner and add focused coverage around reducers, helpers, and Trello/order sync before making broad behavior changes.
- **Audience**: Optimize first for internal operators using the app repeatedly on mobile and desktop, not public customers.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Treat this as a brownfield GSD project | Existing code, build output, routes, state, and Trello workflows already exist and should inform planning | Pending |
| Prioritize data safety and daily workflow before visual polish | Backup/restore, sync reliability, and operator speed are more important than aesthetic changes alone | Pending |
| Focus utilities on daily operations | The user explicitly prioritized hands-on convenience for order, shipping, COD, backup/restore, and quick actions | Pending |
| Optimize for internal operators | The app is primarily for the user or a small trusted team, not external customers | Pending |
| Use the existing codebase map as planning context | `.planning/codebase/` has already captured stack, architecture, testing gaps, integrations, and concerns | Pending |
| Defer external-user/public-hosting work | The user clarified this is just an internal app, so current planning should focus on workflow, UI/UX, and data recovery | Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? Move to Out of Scope with reason
2. Requirements validated? Move to Validated with phase reference
3. New requirements emerged? Add to Active
4. Decisions to log? Add to Key Decisions
5. "What This Is" still accurate? Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-16 after Phase 2 verification*
