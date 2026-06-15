# Phase 1: Data Safety and Refactor Baseline - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes the existing internal app safe enough to refactor by repairing the test/build baseline, making backup and restore complete and reliable, and giving the operator clear status for backup, restore, and done-order refresh. It must preserve the current client-side app shape, browser-local persistence, Trello backup attachment workflow, and existing order/customer/COD behavior.

</domain>

<decisions>
## Implementation Decisions

### Backup Format
- **D-01:** Future backups should use a versioned envelope, not a raw Redux dump. Include at minimum `schemaVersion`, `createdAt`, an app/build identifier when available, and a payload containing the required state slices.
- **D-02:** The payload must include complete state needed for normal operation: `order.orders`, `order.lastSequence`, `order.doneOrders`, `order.codPayments`, `customer.customers`, and `appContext` fields that are safe to persist.
- **D-03:** The app must remain able to restore legacy backups produced by the current `JSON.stringify(store.getState())` behavior. Use a normalizer/migration path for legacy raw `RootState` backups.
- **D-04:** Keep the backup workflow easy. Preserve the existing automatic periodic Trello backup and manual "backup now" action, but make the result understandable with metadata and visible status.
- **D-05:** Do not introduce a backend, collaboration system, or new external backup provider in this phase. Trello attachments and local browser state remain the current recovery model.

### Restore Reliability
- **D-06:** Restore must validate and normalize the full backup JSON before dispatching any Redux mutations. Invalid or partial data must not mutate state.
- **D-07:** Legacy or partial-but-recoverable backups may be accepted only after defaults are applied for missing fields. Defaults should be explicit, such as `doneOrders: []`, `codPayments: []`, `customers: []`, and a safe app context default.
- **D-08:** Restore must replace all required persisted slices consistently: order, customer, and app context. The current restore gap where `setOrderState` omits `doneOrders` and `codPayments` must be closed.
- **D-09:** Before mutating state during restore, create or offer a pre-restore recovery snapshot. If the snapshot cannot be created, the operator should see a clear warning before continuing.
- **D-10:** Restore errors should be actionable for an operator. Prefer messages such as missing section, unsupported schema version, invalid JSON, network fetch failed, or backup is empty.

### Backup and Refresh Status
- **D-11:** Use both transient Ant Design messages and a small persistent status surface near the existing backup/restore controls. Phase 1 should not build the full operational status area planned for Phase 4.
- **D-12:** Show loading, success, empty, and failure states for backup, restore, and done-order refresh. Empty done-order refresh means "no done orders found," not an error.
- **D-13:** Show the last successful backup time and last restore result when feasible. Keep the UI simple enough for repeated internal use.
- **D-14:** Keep user-facing copy aligned with the existing app language and tone. Technical identifiers and tests may stay in English.

### Test and Build Baseline
- **D-15:** Phase 1 must make `CI=true yarn test --watchAll=false` pass and keep `yarn build` passing before broader refactors continue.
- **D-16:** Replace the stale CRA sample app test with an app-specific smoke test that verifies the app shell can render under required providers or a lightweight equivalent.
- **D-17:** Add focused tests for backup normalization/validation and restore reducers. These tests are more important than broad UI coverage in Phase 1.
- **D-18:** Keep tooling changes conservative. Do not migrate from CRA/Jest to Vite/Vitest in this phase unless fixing the one-shot test command is impractical without it.

### Agent Discretion
- The planner may choose the exact validation implementation. Prefer a small local validator/normalizer if the schema stays compact; add a library only if it clearly reduces risk or complexity.
- The planner may choose whether the restore source remains URL-only or adds local JSON file import, as long as the result stays easy and reliable. Do not let this become a large import/export feature.
- The planner may choose the exact placement of the persistent status UI, but it should reuse existing `MasterPage`, drawer, floating action, message, and Ant Design patterns where practical.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` - Internal app scope, core value, and milestone constraints.
- `.planning/REQUIREMENTS.md` - Phase 1 requirements `SAFE-01`, `SAFE-02`, `SAFE-03`, `DATA-01` through `DATA-05`, and `SYNC-04`.
- `.planning/ROADMAP.md` - Phase 1 goal, success criteria, and four planned work items.
- `.planning/STATE.md` - Current project state and known blockers.

### Codebase Maps
- `.planning/codebase/TESTING.md` - Current Jest/CRA test setup, alias failure, and test coverage gaps.
- `.planning/codebase/INTEGRATIONS.md` - Trello, GitHub raw backup URL, IndexedDB, and deployment integration notes.
- `.planning/codebase/CONCERNS.md` - Known bugs and fragile areas for restore, backup, tests, and sync.

### Source Files
- `package.json` - Current scripts; `test` uses `react-scripts test`, while `start` and `build` use CRACO.
- `src/App.tsx` - App provider tree and alias import that currently breaks tests.
- `src/App.test.tsx` - Stale CRA sample test to replace.
- `src/Store/Store.ts` - Redux persisted store and persisted reducer setup.
- `src/Store/idbStorage.ts` - IndexedDB storage adapter for redux-persist.
- `src/Store/Reducers/OrderReducer.ts` - `OrderState`, `setOrderState`, `doneOrders`, and `codPayments` restore gap.
- `src/Store/Reducers/CustomerReducer.ts` - Customer restore reducer.
- `src/Store/Reducers/AppContextReducer.ts` - App context state that may need safe restore handling.
- `src/Routing/MasterPage.tsx` - Restore drawer, backup action, automatic backup, done-order refresh, and status messages.
- `src/Hooks/useOrder.ts` - `refreshDoneOrders`, done-order state updates, and order/Trello workflow coupling.
- `src/Hooks/Trello/useTrello.ts` - Trello attachment and card/list APIs used by backup and done-order refresh.
- `src/Hooks/useAPI.ts` - Fetch wrapper behavior that can affect restore/Trello failure handling.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/Routing/MasterPage.tsx`: Existing drawer, floating buttons, Ant Design `message`, and backup/done-refresh entry points are the main UI surface for Phase 1.
- `src/Components/Message/MessageProvider.tsx`: Existing message provider should continue to handle transient success/error feedback.
- `src/Components/Button`, `src/Components/Layout/Stack`, and Ant Design primitives: Reuse for compact status UI instead of adding a new design system in Phase 1.
- `src/Store/Reducers/OrderReducer.ts` and `src/Store/Reducers/CustomerReducer.ts`: Existing reducers provide restore entry points, but order restore currently needs full state coverage.

### Established Patterns
- Redux Toolkit slices hold app state and redux-persist stores it in IndexedDB through `idb-keyval`.
- Trello calls go through `useTrello`, backed by `useAPI` and browser `fetch`.
- User-facing operational feedback currently uses Ant Design message notifications.
- Routes and the app shell are centralized in `RootRouter`, `App`, and `MasterPage`.

### Integration Points
- Backup upload: `AppNoti.backupNow()` serializes `store.getState()` and uploads it to a Trello card attachment.
- Automatic backup: `AppNoti.backup()` uses `localStorage.lastCheckTime` to throttle periodic backup.
- Restore: `SidebarDrawer._onRehydrateData()` fetches the backup URL, parses JSON, and dispatches restore actions.
- Done-order refresh: `useOrder.refreshDoneOrders()` reads Trello TODO list cards, filters `dueComplete`, and writes `doneOrders` to Redux.
- Test baseline: `src/App.test.tsx` renders `<App />`, which imports aliases and full providers.

</code_context>

<specifics>
## Specific Ideas

The user explicitly wants backup and restore to be easy and reliable and asked the agent to use its recommendation. Favor simple operator workflows over a configurable recovery system.

</specifics>

<deferred>
## Deferred Ideas

- Full backend database and multi-operator collaboration remain v2 candidates.
- Broad operational status center belongs in Phase 4; Phase 1 should only add minimal status needed for backup, restore, and done-order refresh.
- Full UI/UX redesign belongs in Phase 5; Phase 1 should keep UI changes narrow and functional.

</deferred>

---

*Phase: 1-Data Safety and Refactor Baseline*
*Context gathered: 2026-06-15*
