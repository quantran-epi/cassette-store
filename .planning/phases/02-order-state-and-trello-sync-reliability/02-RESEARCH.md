# Phase 02 Research: Order State and Trello Sync Reliability

**Phase:** 02 - Order State and Trello Sync Reliability  
**Generated:** 2026-06-16  
**Research mode:** Local codebase synthesis with targeted Trello REST documentation check  
**External lookup:** Atlassian Trello REST API card endpoints were checked for operation boundaries.  
**Confidence:** HIGH for local codebase behavior; MEDIUM for exact Trello edge-case error payloads because the current app wrapper does not preserve HTTP status bodies.

## <user_constraints>

### Locked Decisions From CONTEXT.md

- **D-01:** Focus Phase 2 on reliability and hands-on operator recovery, not configurable technical options. [VERIFIED: context]
- **D-02:** Keep the app local-first: Redux/IndexedDB owns order business fields; Trello remains the operational mirror. [VERIFIED: context]
- **D-03:** Trello card creation, movement, comments, and attachments must return structured operation results instead of `null`, strings, or thrown values. [VERIFIED: context]
- **D-04:** Preserve existing order creation, shipping-code update, shipped/returned/refund/COD, and attachment behavior. [VERIFIED: context]
- **D-05 through D-08:** Apply local business transitions and record Trello failures for retry; avoid rollback for normal order workflows. [VERIFIED: context]
- **D-09 through D-12:** Add a minimal persistent sync failure/retry surface near affected orders; defer the full operational status center to Phase 4. [VERIFIED: context]
- **D-13 through D-16:** Prefer syncing Trello from local state when local/Trello disagree; retry should create missing cards, update existing cards, or surface missing-card recovery. [VERIFIED: context]
- **D-17 through D-21:** Extract pure transition/calculation functions, keep `useOrder` as orchestration, introduce a typed Trello/order adapter, normalize HTTP/API failures, and preserve backup/restore defaults for new sync state. [VERIFIED: context]
- **D-22 through D-25:** Prioritize focused tests for pure transitions, adapter results, and partial sync failures over broad UI redesign tests. [VERIFIED: context]

### Deferred Or Out Of Scope

- Phase 3 owns faster order creation and shipping workflow redesign. Phase 2 may touch these screens only to preserve behavior and expose sync recovery. [VERIFIED: roadmap]
- Phase 4 owns a broad operational alerts/status center. Phase 2 should add only per-order/per-action retry visibility. [VERIFIED: roadmap]
- Phase 5 owns full UI/UX refresh. Phase 2 UI changes should be compact and functional. [VERIFIED: roadmap]
- Backend, authentication, multi-operator collaboration, and audit trail remain v2. [VERIFIED: requirements]

## <phase_requirements>

| Requirement | Requirement Text | Research Implication |
|---|---|---|
| SYNC-01 | Order workflows report structured success/failure results for Trello card creation, movement, comments, and attachments. | Add operation result types and wrap create card, update/move card, create comment, create/delete attachment, and bulk attachment flows. |
| SYNC-02 | Local Redux updates and Trello side effects have a clear ordering and recovery strategy for partial failure. | Keep local-first ordering, record failed Trello operations, and expose retry. |
| SYNC-03 | Operator can retry or recover failed Trello sync actions without manually editing application state. | Persist per-order sync failures and add action-specific retry controls on existing order surfaces. |
| ORD-01 | Pure order calculations are extracted from `useOrder` into tested helper/service functions. | Extract payment/COD amount, label selection, card description, transition/can-action rules, and customer side effects. |
| ORD-02 | Order state transitions are testable without rendering React components. | Pure transition functions should accept order/customer inputs and return updated order/customer plus side-effect intent. |
| ORD-03 | Trello integration is accessed through a small typed adapter/port instead of direct logic spread through order workflows. | Introduce adapter methods that return typed results; `useOrder` should orchestrate through the adapter. |

## Summary And Primary Recommendation

Phase 2 should be planned as a reliability refactor in four dependent slices:

1. Extract pure order-domain functions and tests without changing runtime behavior.
2. Add structured Trello operation result types and an adapter around the existing `useTrello`/`useAPI` calls.
3. Refactor `useOrder` to apply local-first transitions, call the adapter, and persist sync failures when Trello side effects fail.
4. Add compact per-order retry/recovery controls and partial-failure regression coverage.

Primary recommendation: do not attempt a large hook rewrite first. Create tested pure functions and adapter/result types first, then migrate each workflow through them. This keeps brownfield behavior visible and reduces the risk of breaking order creation, shipping, returns, COD, or attachments.

## Current Architecture Findings

### Order Hook Coupling

- `src/Hooks/useOrder.ts` owns pure decisions, Redux dispatching, direct Trello side effects, attachment upload, and dashboard statistics. [VERIFIED: codebase]
- Existing transition methods often mutate cloned order/customer objects, dispatch local Redux updates, call Trello, and return `null`, a Vietnamese string error, or a caught exception. [VERIFIED: codebase]
- `createOrder()` dispatches local order first, then calls Trello card creation, then dereferences `trelloCard.id`. If card creation returns `null`, this can crash and leave a local order without a recoverable Trello state. [VERIFIED: codebase]
- `changeShippingCode()` saves local status/code before Trello comment/move. This already matches local-first ordering but loses structured detail about whether the comment or move failed. [VERIFIED: codebase]
- `markOrderAsShipped()`, `markOrderAsRefuseToReceive()`, and `markOrderAsBrokenItems()` update local order/customer state before moving Trello cards. These need result recording rather than rollback. [VERIFIED: codebase]
- `updateOrder()` updates local order first, then updates the card and related pending-order positions. Position update failures currently fail through `Promise.all` without a recoverable operation model. [VERIFIED: codebase]

### Trello Adapter Surface

- `src/Hooks/Trello/useTrello.ts` wraps Trello endpoints but returns raw promise values for card, attachment, action, and void operations. [VERIFIED: codebase]
- `src/Hooks/useAPI.ts` parses JSON for all responses and does not check `response.ok`; non-2xx Trello responses can be treated as normal parsed values instead of failures. [VERIFIED: codebase]
- `useAPI._buildUrl()` concatenates optional params and auth params without an `&` when both are non-empty, a known reliability concern from the codebase map. [VERIFIED: codebase]
- Official Trello docs model card creation, card update, comment creation, and attachment creation as separate card REST operations, which supports action-specific operation results and retries. [VERIFIED: Atlassian docs]

### State And Persistence

- `OrderState` currently contains `orders`, `lastSequence`, `doneOrders`, and `codPayments`; Phase 1 backup/restore now normalizes these arrays. [VERIFIED: codebase]
- A retry model needs durable state. The smallest useful structure is a per-order sync failure queue or map keyed by local order ID, with operation name, status, message, timestamp, retry data, and optional Trello card ID. [RECOMMENDED]
- If new sync state is added to `OrderState`, `BackupHelper._normalizeOrderState()` and `OrderReducer.setState()` must default it for legacy backups. [VERIFIED: codebase]

### UI Recovery Surface

- `OrderItemWidget` already owns delivery actions, shipping-code modal toggles, status tags, messages, and the order action menus. It is the best compact surface for per-order sync failure badges and retry buttons. [VERIFIED: codebase]
- `OrderChangeShippingCodeWidget` already has `loading` and save callbacks; it can surface structured results without redesigning the modal. [VERIFIED: codebase]
- `OrderAttachmentsWidget` already fetches, adds, and deletes Trello attachments in a modal; it needs partial-failure handling because add/delete promises are currently grouped incorrectly and error detail is lost. [VERIFIED: codebase]
- `OrderCreateScreen` already interprets a non-null `createOrder()` result as success. It should instead interpret a structured result: local order success plus Trello sync success or retryable failure. [VERIFIED: codebase]

## Recommended Technical Shape

### Pure Domain Module

Create a small order-domain helper/service module, likely under `src/Common/Helpers/` to match current local patterns, for pure functions such as:

- `buildOrderTrelloDescription(order, customer)`
- `getOrderTrelloLabelKeys` or `getOrderTrelloLabelIds` with injected label IDs
- `calculateOrderPaymentAmount(placedItems, customer, isFreeShip)`
- `getAutoCODAmount(paymentMethod, paymentAmount)`
- `canMarkAsShipped`, `canMarkAsReturned`, `canMarkAsWaitingForReturn`, `canMarkAsPayCOD`
- `markOrderAsShippedTransition(order, customer)` returning updated order/customer
- `markOrderAsRefuseToReceiveTransition(order, customer)` returning updated order/customer
- `markOrderAsBrokenItemsTransition(order, customer)` returning updated order/customer
- `changeShippingCodeTransition(order, customer, code)` returning updated order plus whether the card needs first-time list movement
- `refundTransition(order, customer, amount)`

Return data, not dispatch calls. Keep Redux and Trello out of this module.

### Operation Result Types

Use a compact discriminated union for Trello/order operations. Suggested shape:

- Success: `{ok: true, operation, data}`
- Failure: `{ok: false, operation, retryable, message, cause?, retryPayload?}`

For order workflows, return a workflow result that preserves local success separately from sync success:

- `{ok: true, localUpdated: true, sync: [...]}` where `sync` can include failed retryable operations
- Avoid a single boolean that makes local success look like total failure.

### Sync Failure State

Recommended minimum persisted state:

- Operation IDs generated with existing `nanoid`.
- Fields: `id`, `orderId`, `operation`, `status`, `message`, `createdAt`, `updatedAt`, `retryPayload`, `trelloCardId?`.
- Operations: `create-card`, `update-card`, `move-card`, `create-comment`, `create-attachment`, `delete-attachment`, `sync-order-card`.
- Reducer actions: add/replace failed operation, mark retrying, clear by ID, clear completed for order.

Keep this either in `OrderState` or a small sibling order-sync state. Given backup/restore is already order-centric and Phase 2 is scoped to order sync, adding it to `OrderState` is the smallest brownfield option if defaults are handled.

### Retry Flow

Retry should replay a specific failed operation using local order/customer state and stored retry payload:

- Missing Trello card ID or failed `create-card`: create/push the card, store `trelloCardId`, then optionally retry queued dependent operations.
- Failed card move: update existing card `idList` from local order status/operation target.
- Failed shipping-code comment: create the comment using current local shipping code.
- Failed attachment upload: re-upload stored `RcFile` only while the file object is still available; for persisted failures, record that upload needs manual reselect if the browser cannot persist the blob safely.
- Missing card ID that no longer resolves: surface recoverable failure; planner can choose confirm-before-recreate.

## Validation Architecture

### Automated Test Strategy

- Add pure unit tests for extracted order-domain functions before wiring them into `useOrder`.
- Add adapter tests for `useAPI`/Trello adapter success, network reject, non-2xx response, missing card, and attachment failure.
- Add reducer tests for sync failure defaults, add/update/clear actions, and backup restore compatibility.
- Add `useOrder` orchestration tests using mocked Trello adapter methods for local-first partial failures.
- Add focused UI tests only where needed to prove failed sync is visible and retryable from existing order item/action surfaces.

### Required Commands

- Quick command: `CI=true yarn test --watchAll=false --runInBand`
- Full command: `CI=true yarn test --watchAll=false && yarn build`

### High-Value Scenarios

| Scenario | Expected Result |
|---|---|
| Create order succeeds locally, Trello create card fails | Order remains visible locally, sync failure is recorded, retry can create card and store `trelloCardId`. |
| Shipping code save succeeds locally, Trello comment fails | `shippingCode` and `CREATE_DELIVERY` status remain local, failed comment is visible and retryable. |
| Shipping code first-time move fails after comment succeeds | Comment success is not retried unnecessarily; card move failure is visible and retryable. |
| Shipped/returned transition succeeds locally, card move fails | Order/customer transition persists, card move failure is visible and retryable. |
| Attachment upload partially fails | Successful uploads remain complete, failed uploads are reported with retry/manual reselect path. |
| Legacy backup restored after sync-state addition | Missing sync state defaults to empty without restore failure. |

## Source Audit Notes

- GOAL is covered by the four recommended slices above.
- All Phase 2 requirement IDs map to those slices: `ORD-01`/`ORD-02` in pure domain extraction, `ORD-03`/`SYNC-01` in adapter/result typing, `SYNC-02` in orchestration ordering, and `SYNC-03` in persisted retry/recovery UI.
- CONTEXT decisions D-01 through D-25 are implementation constraints for the same slices. No decision needs a phase split if plans preserve local-first ordering, structured results, and compact hands-on retry.

## External References

- Atlassian Trello REST API, Cards group: create card, update card, card comments, and card attachments are separate endpoint operations. Use this only for operation boundaries; keep token/list IDs from local `useTrello.ts` out of planning docs.

## RESEARCH COMPLETE
