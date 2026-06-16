# Phase 2: Order State and Trello Sync Reliability - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase keeps the existing order workflows usable while making order state transitions and Trello side effects structured, testable, and recoverable. It covers pure order transition extraction, typed Trello operation results, reliable orchestration between Redux and Trello, and a minimal hands-on recovery path for failed sync actions. It must preserve existing order creation, shipping-code update, shipped/returned/refund/COD behavior, Trello card movement, comments, attachments, and Phase 1 backup/restore safety.

This phase is not the broad workflow-speed redesign from Phase 3, the operational status center from Phase 4, the full UI/UX refresh from Phase 5, or a backend/collaboration migration.

</domain>

<decisions>
## Implementation Decisions

### Reliability and Operator Flow
- **D-01:** Prioritize reliability and hands-on operator recovery over configurable technical options. The user explicitly deferred to the recommended approach and wants the phase focused on reliability plus practical user flow.
- **D-02:** Keep the app local-first for this phase. Local Redux/IndexedDB state remains the source of truth for order business fields; Trello is the operational mirror and workflow board.
- **D-03:** Do not silently swallow Trello failures. Card creation, card movement, comments, and attachments must return structured operation results that make success, failure, retryability, and next action clear.
- **D-04:** Existing business behavior must remain available through the refactor. The operator should still be able to create orders, update shipping codes, mark shipped/returned/waiting-for-return, refund, mark COD paid, and attach images.

### Local-vs-Trello Ordering
- **D-05:** For business actions that reflect real operator intent, apply the local state transition and record any Trello side-effect failure rather than losing the operator's work. Examples: shipping-code update, shipped, return/refuse-to-receive, refund, and COD-paid state.
- **D-06:** Order creation should no longer assume Trello card creation always succeeds. If card creation fails after the local order is created, the order must remain locally visible with a clear pending/failed Trello sync state and a retry path.
- **D-07:** Attachment upload failures should not invalidate the created order or card. Capture attachment failure as a retryable Trello sync problem with enough detail for the operator to retry the failed upload action.
- **D-08:** Avoid automatic rollback unless the local mutation would be meaningless without Trello. In normal order workflows, prefer visible retry over rollback because the internal operator's business decision should not disappear due to a network/API failure.

### Retry and Recovery Surface
- **D-09:** Phase 2 should add a minimal persistent sync status, not a full operations dashboard. Show failure at the point of action and on the affected order item/detail/action surface; defer a broad operational alert center to Phase 4.
- **D-10:** Retry should be action-specific and hands-on: retry card creation, retry card move, retry shipping-code comment, retry card update, and retry attachment upload where applicable.
- **D-11:** Successful retry should clear the affected sync failure state and preserve the local order data. Do not require the operator to manually edit Redux state or recreate orders.
- **D-12:** For trusted internal recovery, a manual "resolved" or equivalent escape hatch is acceptable only if the operator has already fixed Trello manually or intentionally accepts the mismatch. It should not be the primary happy path.

### Conflict Reconciliation
- **D-13:** When local order state and Trello disagree, prefer syncing Trello from local state over mutating local business data from Trello. Trello list/card state can be stale; local state carries the operator's current business truth.
- **D-14:** If an order has no Trello card ID or card creation previously failed, retry should create/push the card and then store the new Trello card ID locally.
- **D-15:** If an order has a Trello card ID but the card is in the wrong list or has stale description/labels/comment state, retry should update/move the existing card according to local state.
- **D-16:** If the stored Trello card ID no longer resolves, surface that as a recoverable sync problem. The planner may choose whether retry recreates the card automatically or asks for confirmation first, but the operator must not be stranded.

### Domain and Adapter Shape
- **D-17:** Extract pure transition/calculation functions from `src/Hooks/useOrder.ts` so shipped, returned, waiting-for-return, refuse-to-receive, broken-items return, COD-paid, refund, shipping-code update, payment amount, COD amount, Trello labels, and Trello card description behavior can be tested without rendering React.
- **D-18:** Keep `useOrder` as a thin orchestration layer after extraction: gather current order/customer state, apply pure transition output, dispatch Redux mutations, call the Trello adapter, and record/return structured results.
- **D-19:** Introduce a typed Trello/order integration adapter or port around `useTrello`/`useAPI`. Order workflows should depend on adapter methods and operation result types rather than raw Trello hook calls.
- **D-20:** Normalize network errors, non-2xx HTTP statuses, and Trello API errors into the same operation-result model. Fixing `useAPI` URL/error handling is in scope when needed for reliable Trello results.
- **D-21:** If sync status is persisted in Redux, Phase 2 must update backup/restore validation defaults from Phase 1 so the status survives restore without breaking legacy backups.

### Testing Priorities
- **D-22:** Add focused tests for pure order transition functions before and during `useOrder` refactor. These tests should cover status changes, customer VIP/blacklist/buy totals, priority/position recalculation, shipping-code behavior, COD paid, refund, labels, and card description where extracted.
- **D-23:** Add adapter tests with mocked Trello/API behavior for success, network failure, non-2xx failure, missing card, and attachment failure.
- **D-24:** Add orchestration regression tests for partial failures: local order created but Trello card fails; shipping code saved but Trello comment/move fails; shipped/returned local update succeeds but card move fails; attachments partially fail.
- **D-25:** Keep tests focused on reliability boundaries. Full UI workflow redesign tests belong with later operator workflow and UI phases unless needed to prove retry visibility.

### Agent Discretion
- The planner may choose exact type names, file names, and whether sync status lives on each order or in a small separate order-sync state structure. Prefer the smallest persisted model that supports visible retry and restore safety.
- The planner may choose exact UI placement for the minimal sync failure/retry controls. Prefer existing order item/detail widgets and Ant Design message patterns rather than creating the Phase 4 operations center early.
- The planner may choose whether a missing Trello card retry recreates automatically or asks for confirmation, as long as the operator has a clear recovery path.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` - Internal-operator scope, data integrity constraints, brownfield continuity, and v1 milestone priorities.
- `.planning/REQUIREMENTS.md` - Phase 2 requirements `SYNC-01`, `SYNC-02`, `SYNC-03`, `ORD-01`, `ORD-02`, and `ORD-03`.
- `.planning/ROADMAP.md` - Phase 2 goal, success criteria, and planned work items `02-01` through `02-04`.
- `.planning/STATE.md` - Current project state and the Phase 2 focus.
- `.planning/phases/01-data-safety-and-refactor-baseline/01-CONTEXT.md` - Phase 1 decisions for backup/restore, Trello backup continuity, visible status, and conservative refactor safety.

### Codebase Maps
- `.planning/codebase/ARCHITECTURE.md` - Current React/Redux/Trello architecture, `useOrder` coupling, and integration boundaries.
- `.planning/codebase/INTEGRATIONS.md` - Trello API, IndexedDB, backup attachment, and local-only integration context.
- `.planning/codebase/CONCERNS.md` - Known order/Trello synchronization fragility, missing recovery, and test coverage gaps.

### Source Files
- `src/Hooks/useOrder.ts` - Main order business logic, Redux dispatch orchestration, Trello side effects, attachment upload, and dashboard calculations to split carefully.
- `src/Hooks/Trello/useTrello.ts` - Current Trello REST wrappers and hard-coded board/list/label identifiers. Do not copy sensitive token values into planning docs or logs.
- `src/Hooks/useAPI.ts` - Fetch wrapper, URL construction, logging, and HTTP error behavior that affect structured Trello results.
- `src/Store/Reducers/OrderReducer.ts` - Order state, priority/position mutation, done-order IDs, COD payment state, and possible sync-status persistence point.
- `src/Store/Reducers/CustomerReducer.ts` - Customer updates touched by shipped/refuse-to-receive transitions.
- `src/Store/Models/Order.ts` - Persisted order fields, including status, shipping code, Trello card ID, refund, COD, and priority fields.
- `src/Store/Models/Customer.ts` - Customer fields affected by order transitions such as VIP, blacklist, buy count, and buy amount.
- `src/Common/Helpers/OrderHelper.ts` - Existing order item, priority, total, and shipping helpers that can host or guide pure calculations.
- `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx` - Existing order creation flow that must survive card-create retry behavior.
- `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` - Existing order item/action surface likely to show minimal sync failure and retry controls.
- `src/Modules/Order/Screens/OrderItem/OrderChangeShippingCode.widget.tsx` - Shipping-code workflow that needs local/Trello result visibility.
- `src/Modules/Order/Screens/OrderItem/OrderAttachments.widget.tsx` - Attachment workflow that needs retryable upload failure handling.
- `src/Modules/Order/Screens/OrderItem/OrderRefund.widget.tsx` - Refund workflow that must remain behaviorally stable.
- `src/Modules/Order/Screens/OrderList.screen.tsx` - List surface that may need a compact per-order sync indicator.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/Common/Helpers/OrderHelper.ts`: Already contains pure helpers for item creation, priority mark, total amount, and shipping amount; can guide extracted order-domain helpers.
- `src/Store/Reducers/OrderReducer.ts`: Existing Redux slice handles order add/edit, done-order IDs, and COD payment cycles; likely persistence point for minimal sync status if added.
- `src/Hooks/Trello/useTrello.ts`: Existing low-level Trello calls can be wrapped rather than replaced wholesale.
- `src/Components/Message/MessageProvider.tsx` and Ant Design messages: Existing transient feedback pattern for immediate action success/failure.
- `src/Modules/Order/Screens/OrderItem/*.widget.tsx`: Existing order action widgets are the practical place for hands-on retry controls without building the later Phase 4 status center.

### Established Patterns
- Redux Toolkit slices and redux-persist are the durable state mechanism; any new sync status must be backup/restore-safe.
- Trello calls currently go through `useTrello`, backed by `useAPI` and browser `fetch`; Phase 2 should add an adapter/result layer above this.
- Existing order transitions often mutate cloned order/customer objects, dispatch local Redux updates first, then call Trello and return `null`, strings, or caught errors. Phase 2 should make that behavior explicit and typed.
- User-facing failures generally use Ant Design messages; persistent failure state is currently missing for order/Trello sync.

### Integration Points
- `useOrder.createOrder()` currently dispatches local order, creates a Trello card, assumes `trelloCard.id`, stores it, then uploads attachments.
- `useOrder.changeShippingCode()` currently saves local shipping code, creates a Trello comment, optionally moves the card, and removes done-order state.
- `useOrder.markOrderAsShipped()`, `markOrderAsRefuseToReceive()`, and `markOrderAsBrokenItems()` update local order/customer state before moving Trello cards.
- `useOrder.updateOrder()` updates local order and then updates the Trello card plus related pending order card positions.
- `useAPI._buildUrl()` and non-2xx handling can affect all Trello reliability work and should be treated as part of the adapter reliability boundary if needed.

</code_context>

<specifics>
## Specific Ideas

The user wants this phase focused on reliability and hands-on user flow, and asked the agent to use its recommended approach. Favor practical operator recovery over broad configurability: keep local work visible, make Trello failures obvious, and provide clear retry actions.

</specifics>

<deferred>
## Deferred Ideas

- Full backend database, authentication, collaboration, and audit trail remain v2 candidates.
- A broad operational status center belongs in Phase 4. Phase 2 should add only the minimum persistent sync status and retry controls needed for reliability.
- Faster order creation and shipping-code workflow redesign belong in Phase 3. Phase 2 may touch these surfaces only to preserve behavior and expose reliable sync results.
- Full UI/UX refresh belongs in Phase 5. Phase 2 should avoid visual redesign beyond necessary recovery/status affordances.

</deferred>

---

*Phase: 2-Order State and Trello Sync Reliability*
*Context gathered: 2026-06-16*
