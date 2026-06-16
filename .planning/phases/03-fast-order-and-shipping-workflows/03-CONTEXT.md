# Phase 3: Fast Order and Shipping Workflows - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes order creation and shipping-code updates faster and clearer for the internal operator while preserving existing order business behavior, local-first state, Trello sync recovery, attachments, customer state, pricing, priority, payment, and COD calculations. It covers route naming/layout cleanup, an improved `/order/create` flow, a compressed order creation form, row-level shipping-code entry, and row-scoped local/Trello status feedback for create and shipping actions.

This phase is not the COD/search/utilities work from Phase 4, the broad operational status center from Phase 4, the full visual-system refresh from Phase 5, or any backend/public/customer-facing expansion.

</domain>

<decisions>
## Implementation Decisions

### Route and Customer Entry
- **D-01:** `/order/create` should be able to start the full order creation flow without relying on `location.state.customerId`. Customer lookup belongs inside the create flow.
- **D-02:** Reuse the existing phone-based customer search behavior inside the create screen rather than inventing a new customer lookup model.
- **D-03:** If a phone number is not found, the operator should add the new customer inline inside the create flow and continue directly into the order form.
- **D-04:** After selecting or creating a customer, keep the operator on `/order/create`, collapse lookup into a compact selected-customer summary, and reveal the order form with current defaults.
- **D-05:** If `/order/create` is opened with a known `customerId` from an existing customer row or other route, preselect that customer, skip lookup, and show the compact selected-customer summary plus order form.
- **D-06:** Route naming and router components should be corrected to order-specific names/components as required by `ORD-05`, but navigation behavior must remain stable.

### Order Creation Form
- **D-07:** The first visible order form should be core-first: selected-customer summary, order name, item list, payment amount, note/attachments, and save action.
- **D-08:** Preserve current defaults and calculations for priority, free shipping, shipping partner, payment method, COD amount, shipping cost, and important note. Put these less-common fields into a compact more-details section.
- **D-09:** The collapsed more-details summary should make changed values visible so operators do not accidentally hide non-default choices.
- **D-10:** Attachments remain part of the core create flow because they are existing order creation behavior. Use a compact add/preview area rather than moving attachments to after-save.
- **D-11:** Successful order creation should preserve current behavior and return to the order list so the new order is immediately in the operational queue.
- **D-12:** The faster create flow must preserve pricing, COD, customer, priority, payment, shipping, Trello card creation, attachment upload, and Phase 2 sync failure recording/retry behavior.

### Shipping-Code Capture
- **D-13:** The primary shipping-code path should be an obvious row-level quick action/input for orders that need a code. The existing focused modal may remain available where useful.
- **D-14:** Inline shipping-code entry should offer an explicit paste-from-clipboard action. Do not auto-read clipboard just because the field opens; the operator controls paste timing.
- **D-15:** Preserve current first-shipping-code business behavior: local state updates, a Trello shipping-code comment is created, and the Trello card moves to delivery-created when sync succeeds.
- **D-16:** If local shipping-code save succeeds but Trello comment or move fails, the row should immediately show the saved shipping code plus a compact Trello sync warning/retry state using the Phase 2 failure path.

### Status Feedback
- **D-17:** If order creation succeeds locally but Trello card creation or attachment upload fails, return to the list, show a warning toast, and make the new order row visibly show Trello sync failure/retry state.
- **D-18:** Successful local/Trello completion should stay quiet: existing success toast and normal row content are enough. Do not add persistent all-good badges.
- **D-19:** Compact sync warnings in the fast create/shipping flows should show both `Thử lại` and `Đã xử lý`, matching Phase 2 recovery behavior.
- **D-20:** Keep Phase 3 feedback row-scoped. Do not build a broader operational status area or order-list-wide alert center in this phase; that belongs in Phase 4.

### Agent Discretion
- The planner may decide the exact component split for customer lookup, selected-customer summary, more-details section, and inline shipping-code input. Prefer reusing existing widgets and local component patterns over introducing a new design system in this phase.
- The planner may decide whether the existing shipping-code modal remains as a secondary action or is refactored into a shared component used by the inline row flow.
- The planner may decide exact smoke/regression test shape, but tests must cover route naming/component correction, create flow behavior, and local/Trello status handling for shipping-code updates.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` - Internal-operator scope, brownfield continuity, local data integrity, and milestone priorities.
- `.planning/REQUIREMENTS.md` - Phase 3 requirements `ORD-05`, `OPS-01`, and `OPS-02`; Phase 4/5 boundaries that should not be pulled forward.
- `.planning/ROADMAP.md` - Phase 3 goal, success criteria, and planned work items `03-01` through `03-03`.
- `.planning/STATE.md` - Current project state and Phase 2 carry-forward concerns.
- `.planning/phases/02-order-state-and-trello-sync-reliability/02-CONTEXT.md` - Local-first Trello sync decisions, structured operation results, retry/manual recovery, and minimal sync status boundaries that Phase 3 must preserve.
- `.planning/phases/01-data-safety-and-refactor-baseline/01-CONTEXT.md` - Backup/restore safety, visible status patterns, and conservative brownfield refactor decisions.

### Codebase Maps
- `.planning/codebase/ARCHITECTURE.md` - Current React/Redux/Trello architecture, route/module organization, `useOrder` orchestration, and brownfield coupling.
- `.planning/codebase/INTEGRATIONS.md` - Trello API, IndexedDB persistence, local-only app shape, and deployment/integration constraints.
- `.planning/codebase/CONVENTIONS.md` - Naming, file, hook, widget, route, component, and error-handling conventions.

### Source Files
- `src/Modules/Order/Routing/OrderRouteConfig.ts` - Current order route config exports `CustomerRoutes`; must be corrected without breaking paths.
- `src/Modules/Order/Routing/OrderRouter.tsx` - Existing order router/container component available for route layout cleanup.
- `src/Routing/RootRouter.tsx` - Currently renders order routes with `CustomerRouter`; Phase 3 route smoke coverage should guard this fix.
- `src/Routing/RootRoutes.ts` - Root route composition for customer/order route configs.
- `src/Modules/Order/Screens/OrderList.screen.tsx` - Current order list, add-order modal, customer search handoff, order filters, and row rendering.
- `src/Modules/Order/Screens/OrderCreate/CustomerSearch.widget.tsx` - Existing phone lookup and new-customer entry trigger to reuse inside create flow.
- `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx` - Current order form, defaults, price/COD recalculation, attachments, and create result handling.
- `src/Modules/Customer/Screens/CustomerAdd.widget.tsx` - Existing add-customer flow to reuse inline for phone-not-found create flow.
- `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` - Current order row actions, shipping-code modal trigger, status display, sync warning placement, and row details.
- `src/Modules/Order/Screens/OrderItem/OrderChangeShippingCode.widget.tsx` - Existing shipping-code modal and clipboard behavior to adapt or keep as secondary.
- `src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.tsx` - Phase 2 row-scoped sync warning, retry, and manual resolved controls to reuse in fast flows.
- `src/Hooks/useOrder.ts` - `createOrder`, `changeShippingCode`, local-first updates, Trello adapter calls, and sync failure recording.
- `src/Hooks/OrderWorkflowResult.ts` - Result shape and success/warning/error message helpers used by create and shipping flows.
- `src/Store/Models/OrderSyncFailure.ts` - Persisted sync failure model used by row warnings and retry controls.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CustomerSearchWidget`: Already performs phone lookup, empty-state new-customer trigger, and existing-customer selection. Reuse inside `/order/create`.
- `CustomerAddWidget`: Existing new-customer form can support the inline phone-not-found path before revealing the order form.
- `OrderCreateScreen`: Already owns order defaults, item editing, payment/COD recalculation, attachments, create result handling, and navigation back to list.
- `OrderChangeShippingCodeWidget`: Existing focused modal has shipping-code save wiring and clipboard read behavior; useful as a secondary path or shared logic source.
- `OrderSyncStatusWidget`: Already renders Trello sync failure labels plus `Thử lại` and `Đã xử lý`; reuse for compact row-scoped warnings.
- `useOrder.createOrder()` and `useOrder.changeShippingCode()`: Already return `OrderWorkflowResult` with local/Trello sync failure detail from Phase 2.

### Established Patterns
- Route configs use `RouteHelpers.CreateRoutes`; route path behavior should be preserved while fixing names/components.
- Feature screens use `*.screen.tsx`; nested order UI uses `*.widget.tsx` and local Ant Design wrapper components.
- UI feedback combines transient messages from `useMessage()` with persistent row-scoped sync failure state.
- Redux/IndexedDB local state remains the source of truth; Trello failures are recorded rather than rolling back local operator work.
- The app is an internal operations surface, so prefer dense, low-friction controls over tutorial-like or marketing-style UI.

### Integration Points
- `/order/list` currently opens a customer search modal, then navigates to `/order/create` with `location.state.customerId`.
- `/order/create` currently renders only when `orderCustomer` resolves from `location.state.customerId`; Phase 3 should support empty-start create.
- First shipping-code save currently calls `OrderDomainHelper.changeShippingCodeTransition()`, dispatches local order/customer updates, creates a Trello comment, moves the card on first code, and records failures.
- Order row status already renders shipping code, copy affordances, sync failures, and dropdown actions. Inline shipping-code entry should connect here.

</code_context>

<specifics>
## Specific Ideas

- The create flow should feel like one continuous path: phone/customer lookup, inline customer add when needed, compact selected-customer summary, then the core order form.
- The create form should reduce scrolling by making defaults compact, not by removing current behavior.
- Shipping code entry should become visible directly on the order row for orders that need it, with an explicit paste action and immediate row feedback.
- Success should stay quiet; only problems need persistent visual weight.

</specifics>

<deferred>
## Deferred Ideas

- Broad operational alerts/status center for sync, backup, and done-order checks remains Phase 4 scope.
- COD cycle improvements, search/filter/sort upgrades, and contextual quick actions beyond create/shipping remain Phase 4 scope.
- Full visual-system and mobile UI refresh remains Phase 5 scope.
- Backend database, authentication, collaboration, public storefront, and external order-status workflows remain v2/out-of-scope for this milestone.

</deferred>

---

*Phase: 3-Fast Order and Shipping Workflows*
*Context gathered: 2026-06-16*
