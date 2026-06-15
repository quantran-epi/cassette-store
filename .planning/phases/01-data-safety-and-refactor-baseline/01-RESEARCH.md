# Phase 01 Research: Data Safety and Refactor Baseline

**Phase:** 01 - Data Safety and Refactor Baseline  
**Generated:** 2026-06-15  
**Research mode:** Recovery synthesis from verified local evidence  
**External lookup:** Disabled by instruction; no web, registry, `npm view`, test, or build commands were run in this recovery pass. [VERIFIED: command output]  
**Confidence:** HIGH for codebase and prior local command evidence; LOW for any item tagged `[ASSUMED]`.

## <user_constraints>

### Locked Decisions From CONTEXT.md

- **D-01:** Future backups must use a versioned envelope, not a raw Redux dump, with at least `schemaVersion`, `createdAt`, an app/build identifier when available, and a payload containing required state slices. [VERIFIED: codebase]
- **D-02:** Backup payload must include `order.orders`, `order.lastSequence`, `order.doneOrders`, `order.codPayments`, `customer.customers`, and safe `appContext` fields. [VERIFIED: codebase]
- **D-03:** Restore must remain compatible with legacy backups from current `JSON.stringify(store.getState())`; use a normalizer or migration path for raw `RootState`. [VERIFIED: codebase]
- **D-04:** Preserve automatic periodic Trello backup and manual backup-now workflows, but add understandable metadata and visible status. [VERIFIED: codebase]
- **D-05:** Do not introduce a backend, collaboration system, or new backup provider in Phase 1; Trello attachments and browser-local state remain the recovery model. [VERIFIED: codebase]
- **D-06:** Restore must validate and normalize the full backup JSON before any Redux mutation. Invalid or partial data must not mutate state. [VERIFIED: codebase]
- **D-07:** Legacy or partial-but-recoverable backups may be accepted only after explicit defaults such as `doneOrders: []`, `codPayments: []`, `customers: []`, and safe app context defaults. [VERIFIED: codebase]
- **D-08:** Restore must consistently replace order, customer, and app context slices; the current `setOrderState` omission of `doneOrders` and `codPayments` must be closed. [VERIFIED: codebase]
- **D-09:** Before mutating state during restore, create or offer a pre-restore recovery snapshot; if snapshot creation fails, show a clear warning before continuing. [VERIFIED: codebase]
- **D-10:** Restore errors must be actionable: missing section, unsupported schema version, invalid JSON, network fetch failed, or empty backup. [VERIFIED: codebase]
- **D-11:** Use transient Ant Design messages plus a small persistent status surface near existing backup/restore controls; do not build the full Phase 4 operational status area. [VERIFIED: codebase]
- **D-12:** Show loading, success, empty, and failure states for backup, restore, and done-order refresh; empty done-order refresh is not an error. [VERIFIED: codebase]
- **D-13:** Show last successful backup time and last restore result when feasible. [VERIFIED: codebase]
- **D-14:** Keep user-facing copy aligned with existing app language and tone; technical identifiers and tests may stay in English. [VERIFIED: codebase]
- **D-15:** Phase 1 must make `CI=true yarn test --watchAll=false` pass and keep `yarn build` passing. [VERIFIED: command output]
- **D-16:** Replace the stale CRA sample app test with an app-specific smoke test. [VERIFIED: codebase]
- **D-17:** Add focused tests for backup normalization/validation and restore reducers before broad UI coverage. [VERIFIED: codebase]
- **D-18:** Keep tooling conservative; do not migrate CRA/Jest to Vite/Vitest unless the one-shot test command is impractical without it. [VERIFIED: codebase]

### Agent Discretion From CONTEXT.md

- The planner may choose the exact validation implementation; prefer a small local validator/normalizer while the schema is compact, and add a library only if it clearly reduces risk or complexity. [VERIFIED: codebase]
- The planner may keep restore URL-only or add local JSON file import, as long as restore stays easy and reliable and does not become a large import/export feature. [VERIFIED: codebase]
- The planner may choose exact placement for persistent status UI, reusing `MasterPage`, drawer, floating actions, messages, and Ant Design patterns where practical. [VERIFIED: codebase]

### Deferred Or Out Of Scope

- Full backend database and multi-operator collaboration remain v2 candidates. [VERIFIED: codebase]
- Broad operational status center belongs in Phase 4; Phase 1 should only add minimal status for backup, restore, and done-order refresh. [VERIFIED: codebase]
- Full UI/UX redesign belongs in Phase 5; Phase 1 UI changes should stay narrow and functional. [VERIFIED: codebase]
- Static deployment currently uses committed `docs/` build output and `/cassette-store` routing; deployment-specific file copying should follow `docs/deployment.md` only when deploying. [VERIFIED: codebase]

## <phase_requirements>

| Requirement | Requirement Text | Phase 1 Research Implication |
|---|---|---|
| SAFE-01 | Developer can run a one-shot test command that passes without module-alias errors. | Fix Jest alias resolution for `@store`, `@routing`, `@components`, `@modules`, `@common`, and `@hooks` without adding packages. [VERIFIED: command output] |
| SAFE-02 | Developer can run a production build command and confirm generated deployment output matches current source. | Keep `yarn build` passing through CRACO and verify build status without changing deployment shape. [VERIFIED: command output] |
| SAFE-03 | The stale CRA sample app test is replaced with an app-specific smoke test. | Replace `learn react` assertion with an app shell smoke test that accounts for providers and router basename. [VERIFIED: codebase] |
| DATA-01 | Backup payloads include a schema/version marker and all required persisted state sections. | Introduce a versioned backup envelope builder around current Redux state. [VERIFIED: codebase] |
| DATA-02 | Restore validates backup JSON before mutating Redux state and reports actionable validation errors. | Implement parse, validate, normalize, then dispatch; no dispatch on invalid input. [VERIFIED: codebase] |
| DATA-03 | Restore preserves order state fields including orders, last sequence, done-order IDs, and COD payment cycles. | Fix `OrderReducer.setState` or add explicit restore reducer to cover all `OrderState` fields. [VERIFIED: codebase] |
| DATA-04 | Restore preserves customer state and app context needed for normal operation. | Restore `customer.customers` and safe `appContext` fields; current restore does not dispatch app context. [VERIFIED: codebase] |
| DATA-05 | Operator can see backup/restore status, last backup time, and restore success/failure feedback. | Add compact persistent status near existing drawer/float controls while keeping Ant Design messages. [VERIFIED: codebase] |
| SYNC-04 | Done-order refresh has visible loading, success, empty, and failure states. | Preserve existing message states and make refresh atomic so failure does not erase local `doneOrders`. [VERIFIED: codebase] |

## Summary And Primary Recommendation

Phase 1 should be implemented as a narrow safety layer around the existing CRA/CRACO React app, Redux persisted state, Trello attachment backup, and `MasterPage` operator controls. [VERIFIED: codebase]

Primary recommendation: create a small local backup schema module that can build a versioned envelope, normalize both new envelopes and legacy raw `RootState`, validate before dispatch, and produce typed restore results for UI status and tests. [VERIFIED: codebase] Do not add new packages unless execution proves the local validator is becoming more complex than the compact Phase 1 schema warrants. [ASSUMED]

The first planner task should repair the Jest alias baseline because `CI=true yarn test --watchAll=false` currently fails before assertions with `Cannot find module '@store/Store' from 'src/App.tsx'`. [VERIFIED: command output]

## Architectural Responsibility Map

| Area | Current Owner | Phase 1 Responsibility |
|---|---|---|
| App shell and providers | `src/App.tsx` | Keep provider tree intact; adjust smoke test strategy around aliases, persistence, and router. [VERIFIED: codebase] |
| Routing | `src/Routing/RootRouter.tsx` | Preserve `BrowserRouter basename="/cassette-store"`; tests must account for basename or render a lightweight router-safe shell. [VERIFIED: codebase] |
| Operator controls | `src/Routing/MasterPage.tsx` | Refactor backup, restore, refresh, and compact status UI near existing drawer and float actions. [VERIFIED: codebase] |
| Redux store | `src/Store/Store.ts` | Treat `appContext`, `customer`, and `order` as persisted slices backed by `redux-persist` and `idbStorage`. [VERIFIED: codebase] |
| Order reducer | `src/Store/Reducers/OrderReducer.ts` | Restore `orders`, `lastSequence`, `doneOrders`, and `codPayments` together. [VERIFIED: codebase] |
| Customer reducer | `src/Store/Reducers/CustomerReducer.ts` | Preserve current full `customers` restore behavior. [VERIFIED: codebase] |
| App context reducer | `src/Store/Reducers/AppContextReducer.ts` | Add safe restore path for `loading` and `currentFeatureName`, or normalize only fields needed for normal operation. [VERIFIED: codebase] |
| Order/Trello hook | `src/Hooks/useOrder.ts` | Make `refreshDoneOrders` atomic: fetch first, then replace local done-order IDs only after success. [VERIFIED: codebase] |
| Trello backup | `useTrello.createAttachment` through `AppNoti.backupNow()` | Continue uploading backup attachments to Trello, but upload the envelope instead of raw store JSON. [VERIFIED: codebase] |

## Standard Stack

Use existing packages only for Phase 1 unless local validation becomes unmanageable during execution. [VERIFIED: codebase]

| Capability | Existing Tooling | Planner Direction |
|---|---|---|
| App runtime | React 18.2.0, React Router DOM 6.22.3, Ant Design 5.16.1. [VERIFIED: command output] | Keep runtime architecture unchanged. |
| Build | `@craco/craco` 7.1.0 over `react-scripts` 5.0.1. [VERIFIED: command output] | Keep `yarn build`; do not migrate bundlers. |
| Tests | CRA Jest via `react-scripts test`, React Testing Library 13.4.0, jest-dom 5.17.0. [VERIFIED: command output] | Fix aliases using package-level `moduleNameMapper` or CRACO test config; do not add packages for aliases. |
| State | Redux Toolkit 2.2.3, React Redux 9.1.0, Redux Persist 6.0.0, `idb-keyval` 6.2.2. [VERIFIED: command output] | Preserve persisted Redux shape while adding explicit backup normalization. |
| Validation | TypeScript plus local helper functions. [VERIFIED: codebase] | Prefer local parse/type guard/defaulting functions for Phase 1 schema. |
| Dates/status | Existing `moment`, browser `localStorage`, and Ant Design messages. [VERIFIED: codebase] | Reuse current status mechanisms; add only minimal persistent status. |

CRACO is installed and local CRACO code supports a test script path and `jest.configure` merge support; CRA also supports `jest.moduleNameMapper`. [VERIFIED: command output] The planner may choose either route, but package-level Jest config is likely the smaller change. [ASSUMED]

## Architecture Patterns

### Backup Envelope And Normalizer

- Add a backup schema module, for example under `src/Common/Helpers` or a small `src/Common/Backup` folder following existing helper patterns. [ASSUMED]
- New backups should serialize an envelope: `schemaVersion`, `createdAt`, optional `appVersion` or build identifier, and `payload` with complete `order`, `customer`, and safe `appContext`. [VERIFIED: codebase]
- Normalizer should accept both the new envelope and legacy raw `RootState`, then return one normalized object for restore and tests. [VERIFIED: codebase]

### Restore Preflight, No Mutation Before Validation

- Restore flow should fetch/read text, parse JSON, validate and normalize, optionally create a pre-restore recovery snapshot, then dispatch slice updates. [VERIFIED: codebase]
- Invalid JSON, empty backup, unsupported schema, missing required sections, and network failure should return distinct operator-facing error results. [VERIFIED: codebase]
- Existing `MasterPage._onRehydrateData()` currently parses arbitrary JSON and dispatches immediately; this is the key behavior to replace. [VERIFIED: codebase]

### Complete Slice Restore

- `OrderState` currently contains `orders`, `lastSequence`, `doneOrders`, and `codPayments`, but `setState` writes only `orders` and `lastSequence`. [VERIFIED: codebase]
- Customer state has a full `customers` setter today. [VERIFIED: codebase]
- App context currently has only `updateCurrentFeatureName`; Phase 1 needs a safe restore action or a deliberate decision to normalize app context defaults. [VERIFIED: codebase]

### Atomic Done-Order Refresh

- Current `refreshDoneOrders()` dispatches `removeAllDoneOrder()` before `trello.getCardsByList(...)` succeeds, so a failed Trello call can erase local done-order IDs. [VERIFIED: codebase]
- Fetch Trello cards first, derive done IDs, then replace done-order IDs in a single successful state update. [ASSUMED]
- Preserve empty as a successful state: no done orders found. [VERIFIED: codebase]

### Minimal Persistent Status Surface

- Keep existing Ant Design messages for transient feedback. [VERIFIED: codebase]
- Add compact persistent fields for backup status, last successful backup time, last restore result, and done-refresh status near current drawer/float controls. [VERIFIED: codebase]
- Avoid a broad operational status center; that belongs to Phase 4. [VERIFIED: codebase]

## Don't Hand-Roll

- Do not build a backend, database migration service, auth system, collaboration layer, or server-side backup pipeline in Phase 1. [VERIFIED: codebase]
- Do not add a new backup provider; Trello attachments remain the recovery target. [VERIFIED: codebase]
- Do not redesign the app shell or broader UI; status changes should stay narrow and functional. [VERIFIED: codebase]
- Do not create a generic migration framework; implement only the versioned envelope and legacy raw `RootState` normalization needed for this milestone. [ASSUMED]
- Do not replace CRA/Jest with Vite/Vitest for this phase unless the alias baseline cannot be fixed conservatively. [VERIFIED: codebase]

## Runtime State Inventory

| Category | Explicit Answer For Phase 1 |
|---|---|
| 1. Redux persisted state | `appContext`, `customer`, and `order` are combined in `src/Store/Store.ts` and persisted through `redux-persist` using `idbStorage`. Restore must cover all required safe fields. [VERIFIED: codebase] |
| 2. Browser local non-Redux state | `localStorage.lastCheckTime` throttles automatic backup; IndexedDB stores the persisted Redux root. Backup status can reuse `lastCheckTime` but should not rely on it as the only status source. [VERIFIED: codebase] |
| 3. React component local UI state | `MasterPage` and `SidebarDrawer` hold drawer open state, restore URL, loading toggles, modal state, and small form state. These are transient and should not be included in backups. [VERIFIED: codebase] |
| 4. Router/navigation state | `RootRouter` uses `BrowserRouter basename="/cassette-store"`; route state is runtime navigation, not backup data, but tests must respect the basename. [VERIFIED: codebase] |
| 5. Remote integration state | Trello card attachments contain backups; Trello TODO list cards with `dueComplete` drive `doneOrders`. Remote reads/writes can fail and must not corrupt local persisted state. [VERIFIED: codebase] |

## Common Pitfalls

- Fixing only webpack aliases will not fix Jest; current test failure is in Jest alias resolution before assertions. [VERIFIED: command output]
- Rendering `<App />` in a smoke test can trigger persistence and router concerns; account for providers, basename, and IndexedDB mocks or use a lighter app-shell test. [VERIFIED: codebase]
- Restoring legacy raw store JSON without a normalizer can keep the existing partial restore bug. [VERIFIED: codebase]
- Dispatching any restore action before full validation risks mixed old/new state if later sections fail. [VERIFIED: codebase]
- Resetting `doneOrders` before a Trello fetch succeeds can silently erase useful local state. [VERIFIED: codebase]
- Treating empty done-order refresh as failure violates the Phase 1 requirement; empty is a successful state. [VERIFIED: codebase]
- Adding a validator package for a compact schema may increase Phase 1 risk unless the local validator becomes hard to reason about. [ASSUMED]
- Running deployment copy steps during Phase 1 planning would blur build verification with deployment; deployment has separate instructions. [VERIFIED: codebase]

## Environment Availability

- Node v24.16.0, Yarn 1.22.19, npm 11.13.0, and `node_modules` are present locally. [VERIFIED: command output]
- Local installed versions include React 18.2.0, `react-scripts` 5.0.1, `@craco/craco` 7.1.0, `redux-persist` 6.0.0, Redux Toolkit 2.2.3, React Redux 9.1.0, React Testing Library 13.4.0, jest-dom 5.17.0, Ant Design 5.16.1, and `idb-keyval` 6.2.2. [VERIFIED: command output]
- Prior local run: `CI=true yarn test --watchAll=false` failed before assertions with `Cannot find module '@store/Store' from 'src/App.tsx'`. [VERIFIED: command output]
- Prior local run: `yarn build` completed successfully in about 12 seconds with existing ESLint and stale Browserslist warnings, and no tracked git diff was created. [VERIFIED: command output]
- Security enforcement is disabled in `.planning/config.json` via `workflow.security_enforcement: false`; Security Domain research is skipped for this phase artifact. [VERIFIED: codebase]
- Nyquist validation is enabled in `.planning/config.json` via `workflow.nyquist_validation: true`. [VERIFIED: codebase]

## Validation Architecture

Nyquist validation is enabled, so each requirement should have positive, negative, edge, and regression coverage where practical. [VERIFIED: codebase]

| Requirement | Validation Plan | Command Or Evidence |
|---|---|---|
| SAFE-01 | Verify one-shot Jest passes after alias fix. Include regression that imports app aliases under Jest. | `CI=true yarn test --watchAll=false` during execution. [VERIFIED: command output] |
| SAFE-02 | Verify production build remains green after Phase 1 changes and does not create unexpected tracked output. | `yarn build`, then `git status --short` during execution. [VERIFIED: command output] |
| SAFE-03 | Replace stale CRA test with app-specific smoke test that renders stable shell/provider output or a lightweight router-safe shell. | Jest/RTL smoke test. [VERIFIED: codebase] |
| DATA-01 | Unit-test backup envelope builder for schema metadata and required order/customer/appContext payload fields. | Jest unit tests for backup schema module. [ASSUMED] |
| DATA-02 | Unit-test invalid JSON, empty backup, unsupported schema, missing sections, and no-dispatch-on-invalid restore preflight. | Jest tests using normalizer plus mocked dispatch flow. [ASSUMED] |
| DATA-03 | Reducer/normalizer tests prove restored order state preserves `orders`, `lastSequence`, `doneOrders`, and `codPayments`. | Jest reducer tests. [VERIFIED: codebase] |
| DATA-04 | Tests prove restore preserves `customer.customers` and safe `appContext` defaults or values. | Jest reducer/normalizer tests. [VERIFIED: codebase] |
| DATA-05 | Component or helper tests cover backup/restore status values and last backup/restore result formatting; manual check can verify exact placement. | Jest tests plus targeted manual browser check if UI status is hard to assert. [ASSUMED] |
| SYNC-04 | Test done-order refresh loading/success/empty/failure result mapping and atomic failure behavior that preserves previous IDs. | Unit test extracted refresh helper or hook-adjacent logic with mocked Trello API. [ASSUMED] |

Validation should also include a legacy backup fixture shaped like raw `RootState` because current backups are created with `JSON.stringify(store.getState())`. [VERIFIED: codebase]

## Sources And Metadata

- Output contract: `.codex/agents/gsd-phase-researcher.md`. [VERIFIED: codebase]
- Phase context: `.planning/phases/01-data-safety-and-refactor-baseline/01-CONTEXT.md`. [VERIFIED: codebase]
- Requirements and roadmap: `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`. [VERIFIED: codebase]
- Workflow config: `.planning/config.json`. [VERIFIED: codebase]
- Package and tooling evidence: `package.json`, local `node_modules` version checks from prior run, CRACO/CRA alias capability from prior local inspection. [VERIFIED: command output]
- Source files inspected: `src/App.tsx`, `src/App.test.tsx`, `src/Routing/RootRouter.tsx`, `src/Routing/MasterPage.tsx`, `src/Store/Store.ts`, reducers under `src/Store/Reducers/`, `src/Hooks/useOrder.ts`, and `craco.config.js`. [VERIFIED: codebase]
- Prior command behavior reused by instruction: failing one-shot test, passing build, local environment versions, and no tracked build diff. [VERIFIED: command output]
- No web, external documentation, package registry, `npm view`, test, build, branch switch, source edit, or PLAN file creation occurred during this recovery pass. [VERIFIED: command output]

