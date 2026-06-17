# Phase 4: COD, Search, and Operational Utilities - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase gives the internal operator practical daily utilities for COD settlement, order list navigation, contextual order actions, operational alerts, and selector-backed totals. It covers tested selector/helper foundations, URL-backed order search/filter/sort state, COD Excel import with review/apply behavior, state-aware order action surfaces, and a compact operational status tray for actionable problems and key checks.

This phase is not the full Phase 5 visual-system refresh, a general import/export system, a backend migration, multi-user collaboration, authentication, or public/customer-facing work. UI changes should be utility-first and preserve the app's local-first Redux/IndexedDB source of truth and Phase 2 Trello sync recovery behavior.

</domain>

<decisions>
## Implementation Decisions

### Selector and Search Foundations
- **D-01:** Build Phase 4 read models in tested selectors/helpers: derived dashboard totals, order-list filtered/sorted results, list summary totals/counts, and COD eligible-order/totals logic should move out of render-time reductions and `useOrder` where practical.
- **D-02:** Order-list search, filters, sort, and page should be URL-backed through route query state so refresh, browser back, and return-to-list preserve the operator's working context without adding persisted Redux state.
- **D-03:** The main order search should be operationally broad and join order/customer data. It should match order name, shipping code, customer name, customer phone, customer address/province, order note, and important text.
- **D-04:** Phase 4 should make these order-list controls first-class: status, COD paid/unpaid/non-COD, shipping-code present/missing/done-order state, customer-backed search, date range, and sort by newest/oldest/priority/amount/COD.

### COD Cycle Import and Review
- **D-05:** COD cycle creation should be file-driven. The operator imports a COD Excel settlement file, the app parses it, shows a review result, and applies selected/confirmed matches into a COD payment cycle.
- **D-06:** The primary parser should target the known COD Excel export format used by the operator. It should match rows by shipping code, read paid COD amount/status/date, detect debit shipping fees where available, and show matched/unmatched rows for review.
- **D-07:** When the Excel format changes or a different file format is uploaded, the app should provide a manual fallback with column mapping plus row review. The operator can map columns such as shipping code, COD amount, shipping fee, and status/date.
- **D-08:** Applying the COD review should mark confirmed matched orders as paid COD, create/update the COD payment cycle, include confirmed debit-shipping-fee orders, and leave unresolved rows unchanged.
- **D-09:** The review screen should allow manual update or resolution for rows that are not ready to apply automatically.
- **D-10:** COD import review should bucket rows as matched, unmatched, duplicate, amount mismatch, and already paid. Each bucket should support clear include/exclude or manual resolve controls before apply.
- **D-11:** General order/customer import-export is not part of this phase. The Excel import is scoped specifically to COD settlement review and cycle application.

### Actions and Operational Alerts
- **D-12:** Common order actions should use a state-aware row action surface. Promote the most relevant next action for each order state, group secondary actions clearly, and keep dangerous actions behind confirmation.
- **D-13:** The app-wide operational status area should show actionable problems and key checks: Trello sync failures, backup status, done-order refresh status, and COD import/apply issues. Normal success should stay quiet or compact.
- **D-14:** Use a compact app-wide status tray near the existing floating controls for counts and urgent issues, with row/screen-local details for resolution actions.
- **D-15:** The status tray may navigate to filtered orders or COD review and trigger safe checks such as backup and done-order refresh. Destructive actions, manual sync resolution, and COD row application should stay on the relevant row or screen.

### Agent Discretion
- The planner may choose exact selector/helper file names and whether selectors live in `OrderReducer.ts`, a new selector module, or focused helper modules. Prefer small tested read-model helpers over adding broad abstractions.
- The planner may choose the Excel parsing library and exact parser architecture. If adding a dependency, keep it scoped to browser-side `.xlsx` parsing and focused tests.
- The planner may decide exact mobile placement and component split for the status tray and row action surface, but should avoid pulling the full Phase 5 visual redesign forward.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` - Internal-operator scope, brownfield continuity, data integrity constraints, and daily workflow priority.
- `.planning/REQUIREMENTS.md` - Phase 4 requirements `ORD-04`, `OPS-03`, `OPS-04`, `OPS-05`, and `OPS-06`; v2/general import-export boundaries.
- `.planning/ROADMAP.md` - Phase 4 goal, success criteria, and planned work items `04-01` through `04-04`.
- `.planning/STATE.md` - Current project state and completed Phase 3 carry-forward context.
- `.planning/phases/03-fast-order-and-shipping-workflows/03-CONTEXT.md` - Fast create/shipping decisions, row-scoped feedback, and Phase 4 boundaries for broader actions/alerts.
- `.planning/phases/02-order-state-and-trello-sync-reliability/02-CONTEXT.md` - Local-first Trello sync recovery, retry/manual resolved behavior, and persistent sync failure model.
- `.planning/phases/01-data-safety-and-refactor-baseline/01-CONTEXT.md` - Backup/restore status patterns and conservative refactor safety decisions.

### Codebase Maps
- `.planning/codebase/STACK.md` - React/Redux/Ant Design/CRA stack, package constraints, and local browser runtime.
- `.planning/codebase/ARCHITECTURE.md` - App layers, `useOrder` coupling, Redux persistence, Trello integration, and operation surfaces.
- `.planning/codebase/CONVENTIONS.md` - File naming, hook/helper conventions, selector usage, component patterns, and test style constraints.

### Source Files
- `src/Store/Reducers/OrderReducer.ts` - Current order state, COD payment state, sync failure state, and existing selectors.
- `src/Store/Models/Order.ts` - Persisted order fields used by search, filters, COD matching, shipping code, and paid COD state.
- `src/Store/Models/CodPaymentCycle.ts` - Persisted COD cycle model that imported settlements should create/update.
- `src/Store/Models/OrderSyncFailure.ts` - Persisted Trello sync failure model for operational status counts and local resolution.
- `src/Hooks/useOrder.ts` - Existing dashboard-style reductions, COD payment apply method, refresh done orders, and action orchestration to split carefully.
- `src/Modules/Home/Screens/Dashboard.screen.tsx` - Current inline dashboard totals and customer/order reductions to move behind tested helpers/selectors.
- `src/Modules/Order/Screens/OrderList.screen.tsx` - Current search/filter/sort/list summary implementation and page context surface.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentCreate.widget.tsx` - Current COD cycle creation flow to replace or refactor around Excel import/review/apply.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentList.screen.tsx` - COD cycle history list and summary display.
- `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` - Current order row metadata, dropdown actions, status tags, shipping-code affordances, and sync status placement.
- `src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.tsx` - Existing row-level Trello failure retry/manual resolved controls to preserve and count in the status tray.
- `src/Routing/MasterPage.tsx` - Existing backup/done refresh status panel, floating action group, COD navigation, and candidate location for the compact operational status tray.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `OrderReducer.ts`: Already imports `createSelector` and exposes small selectors; can host or guide new read-model selectors.
- `DashboardScreen`: Contains many repeated order/customer reductions that define the metrics to preserve while extracting selector-backed totals.
- `OrderListScreen`: Already has search text, status filters, COD radio filters, summary tags, pagination, and order row rendering. It is the main integration point for URL-backed list state.
- `OrderCodPaymentCreateWidget`: Already models payment orders and debit shipping fee orders, but currently relies on manual multi-select tabs. It is the natural replacement point for COD Excel import, review, and apply.
- `OrderCodPaymentListScreen`: Already displays COD cycle history and calculated totals; can reuse new cycle summary helpers.
- `OrderItemWidget`: Current row action dropdowns and row metadata can be reorganized into state-aware next actions without creating a new global command workflow.
- `OrderSyncStatusWidget`: Existing compact row-level Trello retry and manual resolved controls should remain the detailed resolution surface.
- `MasterPage.AppNoti`: Existing backup/done refresh status box and floating action group provide the starting point for the compact operational status tray.

### Established Patterns
- Redux/IndexedDB local state remains the source of truth; Trello and COD files are inputs/mirrors, not the authority that silently rewrites local business state.
- User-facing failures use Ant Design messages plus persistent local status where action is needed.
- Prior phases favor quiet success and persistent warnings only when the operator must act.
- Feature UI uses `*.screen.tsx` for routed screens, `*.widget.tsx` for nested flow components, and local Ant Design wrappers from `src/Components/`.
- Tests should focus on pure selectors/helpers and edge cases before broad UI coverage.

### Integration Points
- URL-backed list state connects through `OrderListScreen` and React Router query params.
- COD import connects through the COD payment route and current add-payment modal/screen, then applies through order state mutations and `addPaymentOrderCycle`-style behavior.
- Status tray connects to `MasterPage.AppNoti`, existing backup/done refresh methods, `state.order.syncFailures`, and COD import/apply review state.
- State-aware row actions connect to `OrderItemWidget` without changing the existing order business methods in `useOrder` beyond what selectors/helper extraction requires.

</code_context>

<specifics>
## Specific Ideas

- COD settlement should start from an Excel file because that is where the real COD data comes from.
- The app should parse the known COD export automatically, but not strand the operator when the file format changes. Column mapping plus row review is the manual fallback.
- Confirmed COD matches should mark orders as paid COD. Other rows should be manually resolvable before apply or left unchanged.
- Operational status should help the operator move to the right screen or run safe checks, not become a full event feed.

</specifics>

<deferred>
## Deferred Ideas

- General order/customer import-export remains a future capability; Phase 4 COD import is scoped specifically to COD settlement review and cycle application.
- Full visual-system and mobile UI refresh remains Phase 5 scope.
- Backend database, authentication, collaboration, public storefront, and external order-status workflows remain v2/out-of-scope for this milestone.

</deferred>

---

*Phase: 4-COD, Search, and Operational Utilities*
*Context gathered: 2026-06-17*
