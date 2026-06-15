---
last_mapped_commit: 267df10e480e7fc98ab019c903934a1defd25960
last_mapped_at: 2026-06-15
---

# Codebase Concerns

**Analysis Date:** 2026-06-15

## Tech Debt

**Order domain hook is doing too much:**
- Issue: `src/Hooks/useOrder.ts` combines pure order calculations, Redux mutation orchestration, Trello API side effects, attachment uploads, and dashboard statistics.
- Files: `src/Hooks/useOrder.ts`.
- Impact: Changes to business rules can accidentally affect remote Trello behavior; focused tests are hard to write.
- Fix approach: Extract pure calculations into `src/Common/Helpers/OrderHelper.ts` or new service modules, and isolate Trello mutations behind a smaller adapter.

**Generated deployment output is checked in:**
- Issue: `docs/` contains generated build output that can drift from `src/`.
- Files: `docs/index.html`, `docs/static/js/main.d392b372.js`, `docs/service-worker.js`.
- Impact: A source change can be committed without updating deployed files, or generated files can create noisy diffs.
- Fix approach: Document a release command or add CI/deploy automation; if GitHub Pages requires `docs/`, make build freshness part of the release checklist.

**Route naming/import inconsistencies:**
- Issue: Order route config exports a local variable named `CustomerRoutes`, and order routes render `CustomerRouter` even though `OrderRouter` exists.
- Files: `src/Modules/Order/Routing/OrderRouteConfig.ts`, `src/Routing/RootRouter.tsx`, `src/Modules/Order/Routing/OrderRouter.tsx`.
- Impact: The identical container behavior hides the issue today, but future order-specific route layout changes may not apply.
- Fix approach: Rename the local variable to `OrderRoutes` and use `OrderRouter` for the order route branch.

## Known Bugs

**Test command cannot resolve app path aliases:**
- Symptoms: `CI=true yarn test --watchAll=false` fails before running tests with `Cannot find module '@store/Store' from 'src/App.tsx'`.
- Files: `package.json`, `tsconfig.json`, `craco.config.js`, `src/App.tsx`, `src/App.test.tsx`.
- Trigger: Run `CI=true yarn test --watchAll=false`.
- Workaround: None in the current scripts.
- Root cause: The `test` script uses `react-scripts test`, while path aliases are configured in `tsconfig.json` and CRACO webpack config.
- Fix approach: Run tests through CRACO if supported, add Jest alias mapping, or avoid aliases in test-loaded entry files.

**Sample test no longer matches the app:**
- Symptoms: After alias resolution is fixed, `src/App.test.tsx` still searches for `learn react`, but `src/App.tsx` now renders the cassette store shell.
- Files: `src/App.test.tsx`, `src/App.tsx`.
- Trigger: Run the app test after fixing Jest alias resolution.
- Workaround: None; replace the sample assertion with app-specific provider/router-safe assertions.

**Manual backup restore default target is missing:**
- Symptoms: The drawer restore action defaults to a GitHub raw `docs/data` URL, but no `docs/data` file exists in the current tree.
- Files: `src/Routing/MasterPage.tsx`, `docs/`.
- Trigger: Click restore without changing the input URL.
- Workaround: Manually provide a valid backup URL in the drawer input.
- Fix approach: Commit/generate the expected backup file, change the default URL, or make restore require explicit user input.

**Order rehydrate omits some order state fields:**
- Symptoms: `setOrderState` only copies `orders` and `lastSequence`, omitting `doneOrders` and `codPayments` from backup state.
- Files: `src/Store/Reducers/OrderReducer.ts`, `src/Routing/MasterPage.tsx`.
- Trigger: Restore a backup that contains done-order IDs or COD payment cycles.
- Workaround: None visible in code.
- Fix approach: Update `setOrderState` to restore the full `OrderState` shape with backward-compatible defaults.

**API URL builder can concatenate query params incorrectly:**
- Symptoms: `_buildUrl()` appends caller params and default params without inserting `&` between two non-empty parameter strings.
- Files: `src/Hooks/useAPI.ts`.
- Trigger: Call a Trello API wrapper with a non-empty `params` argument in addition to default auth params.
- Workaround: Most current Trello calls rely on replacers/body and do not pass extra params.
- Fix approach: Build URLs with the `URL`/`URLSearchParams` APIs and append each param set explicitly.

**API logger ignores its argument:**
- Symptoms: `_log(msg)` logs the imported Ant Design `message` object instead of the `msg` parameter.
- Files: `src/Hooks/useAPI.ts`.
- Trigger: Any successful or failed API call that invokes `_log`.
- Workaround: Browser devtools still show network requests.
- Fix approach: Change `_log` to log `msg` or remove it.

## Internal Scope Notes

**Trello API setup is part of the client app:**
- Risk: Trello request construction, operation status, and recovery behavior are coupled to the current hook implementation.
- Files: `src/Hooks/Trello/useTrello.ts`, generated bundle under `docs/static/js/`.
- Current mitigation: Operators manually notice and recover drift.
- Recommendations: Add a typed Trello adapter, structured operation results, and visible retry/recovery states.

**External access is outside the current milestone:**
- Risk: Planning can drift toward customer-facing/public-hosting work before internal workflows are reliable.
- Files: `src/Routing/RootRouter.tsx`, `src/Hooks/Trello/useTrello.ts`.
- Current mitigation: The project is scoped as a trusted internal operator tool.
- Recommendations: Keep v1 focused on data recovery, sync reliability, workflow speed, and UI/UX.

**No collaborative editing model:**
- Risk: Multiple operators can overwrite each other or diverge across browser-local state.
- Files: `src/Store/Store.ts`, `src/Store/idbStorage.ts`, `src/Hooks/useOrder.ts`.
- Current mitigation: Trusted internal usage with manual coordination.
- Recommendations: Defer backend/collaboration work until the single-operator workflow and recovery path are reliable.

## Performance Bottlenecks

**Repeated in-memory filtering and reducing:**
- Problem: Dashboard and order list calculations repeatedly scan all orders/customers on render.
- Files: `src/Modules/Home/Screens/Dashboard.screen.tsx`, `src/Modules/Order/Screens/OrderList.screen.tsx`, `src/Hooks/useOrder.ts`.
- Cause: Client-only state with direct array filters/reduces in render paths and hook methods.
- Improvement path: Add memoized selectors in `src/Store/Reducers/OrderReducer.ts` or a selectors module, and keep expensive derived statistics out of render bodies.

**Full-state Trello backup attachments:**
- Problem: `backupNow()` serializes the entire Redux store and uploads it as one attachment.
- Files: `src/Routing/MasterPage.tsx`.
- Cause: No incremental sync or backend persistence.
- Improvement path: Store backup metadata, compress/split large data, or move persistence to an actual backend if data grows.

## Fragile Areas

**Order/Trello synchronization:**
- Files: `src/Hooks/useOrder.ts`, `src/Hooks/Trello/useTrello.ts`, `src/Store/Reducers/OrderReducer.ts`.
- Why fragile: Local Redux writes and Trello writes are not transactional; partial failure can leave local orders and Trello cards out of sync.
- Safe modification: Add tests with mocked Trello failures before changing state transition flows; consider a retry/reconciliation design.
- Test coverage: No targeted tests.

**SmartForm state semantics:**
- Files: `src/Components/SmartForm/useSmartForm.ts`, `src/Components/SmartForm/SmartForm.tsx`.
- Why fragile: `isDirty()` currently returns `isEqual(getValues(), defaultValues)`, which reads as the inverse of typical dirty semantics.
- Safe modification: Verify all callers before changing because no current caller appeared in the scanned code.
- Test coverage: No tests.

**Restore flow parses arbitrary JSON into Redux state:**
- Files: `src/Routing/MasterPage.tsx`, `src/Store/Reducers/OrderReducer.ts`, `src/Store/Reducers/CustomerReducer.ts`.
- Why fragile: `_onRehydrateData()` trusts fetched JSON shape and dispatches it directly without schema validation.
- Safe modification: Add runtime validation and defaults for missing fields before dispatch.
- Test coverage: No tests.

## Scaling Limits

**Browser-local data store:**
- Current capacity: Bound by each user's browser IndexedDB/localStorage quotas and device performance.
- Limit: Large order/customer histories will slow renders and backups because state is loaded and processed client-side.
- Scaling path: Move canonical data to a backend database or add indexed/memoized client-side selectors and archival workflows.

**Trello as workflow backend:**
- Current capacity: Bound by Trello API rate limits, board/list/card limits, and token health.
- Limit: Every operator shares one embedded token, and failed/limited Trello calls break order workflows.
- Scaling path: Add a backend integration layer with rate-limit handling, per-user auth, and observability.

## Dependencies at Risk

**Create React App / `react-scripts`:**
- Risk: CRA is a legacy stack choice and tends to lag modern React/build tooling.
- Impact: Future React/TypeScript upgrades and dependency updates may be harder.
- Migration plan: Consider Vite or another maintained React build setup when planning larger maintenance work.

**Moment:**
- Risk: `moment` is legacy and used in multiple app paths.
- Impact: Bundle size and inconsistent date library usage because `dayjs` is also installed.
- Migration plan: Standardize on `dayjs` or date-fns and migrate usages in `src/Hooks/useOrder.ts`, `src/Routing/MasterPage.tsx`, and `src/Modules/Home/Screens/Dashboard.screen.tsx`.

## Missing Critical Features

**Trello operation recovery:**
- Problem: Trello calls do not share a typed result/retry model.
- Blocks: Clear recovery when local state and Trello disagree.
- Files: `src/Hooks/Trello/useTrello.ts`, `src/Hooks/useOrder.ts`.

**Automated deployment verification:**
- Problem: No CI verifies tests/build or `docs/` freshness.
- Blocks: Confidence that committed deployment output matches `src/`.
- Files: `package.json`, `docs/`.

## Test Coverage Gaps

**Order lifecycle and Trello side effects:**
- What's not tested: Create order, update order, mark shipped/returned, attach images, move Trello cards, refresh done orders.
- Files: `src/Hooks/useOrder.ts`, `src/Hooks/Trello/useTrello.ts`.
- Risk: Order workflows can break silently or desynchronize local/Trello state.
- Priority: High.

**Reducers and restore behavior:**
- What's not tested: Order sorting/priority updates, COD payment state, `setOrderState`, customer restore.
- Files: `src/Store/Reducers/OrderReducer.ts`, `src/Store/Reducers/CustomerReducer.ts`, `src/Routing/MasterPage.tsx`.
- Risk: Backups can restore incomplete state or reorder orders unexpectedly.
- Priority: High.

**UI form flows:**
- What's not tested: Customer add/edit, order creation, COD payment creation, SmartForm transforms.
- Files: `src/Modules/Customer/Screens/*.tsx`, `src/Modules/Order/Screens/**/*.tsx`, `src/Components/SmartForm/useSmartForm.ts`.
- Risk: User-facing workflows can regress without detection.
- Priority: Medium.

---

*Concerns audit: 2026-06-15*
