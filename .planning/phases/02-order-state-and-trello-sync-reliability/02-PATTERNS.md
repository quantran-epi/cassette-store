# Phase 02 Pattern Map: Order State and Trello Sync Reliability

**Generated:** 2026-06-16  
**Scope:** Existing patterns and nearest analogs for order-domain extraction, Trello adapter results, sync failure persistence, and compact retry UI.

## Closest Existing Analogs

| Target Work | Closest Existing File | Pattern To Reuse |
|---|---|---|
| Pure order calculations and defaults | `src/Common/Helpers/OrderHelper.ts` | Plain exported helper object with typed inputs and no React/Redux side effects. |
| Versioned/defaulted persisted state | `src/Common/Helpers/BackupHelper.ts` | Small local type guards/default helpers, explicit result union, no new validation package. |
| Order persisted state and selectors | `src/Store/Reducers/OrderReducer.ts` | Redux Toolkit slice, Immer mutation syntax, exported action aliases, memoized selectors at file bottom. |
| Hook tests with mocked Trello | `src/Hooks/useOrder.test.ts` | Render hook through a small React harness under Redux Provider; mock `useTrello`. |
| Reducer regression tests | `src/Store/Reducers/OrderReducer.test.ts` | Local builders for `Order` and `CodPaymentCycle`; assert complete state replacement/defaults. |
| Operator action surface | `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` | Ant Design dropdown actions, local `useToggle`, `useMessage`, compact tags/badges near order metadata. |
| Shipping-code modal | `src/Modules/Order/Screens/OrderItem/OrderChangeShippingCode.widget.tsx` | Controlled modal with a single primary save button and loading state. |
| Attachment modal | `src/Modules/Order/Screens/OrderItem/OrderAttachments.widget.tsx` | Modal-specific local add/delete state with save button and Ant Design messages. |

## Data Flow Patterns

### Existing Order Action Flow

1. UI calls a `useOrder` method from an order item/action widget.
2. `useOrder` clones current `Order`/`Customer` from Redux selectors.
3. `useOrder` mutates local copies and dispatches `editOrder` / `editCustomer`.
4. `useOrder` calls `useTrello` directly.
5. UI shows success if result is `null`/truthy enough, or error message if a string/error is returned.

### Target Order Action Flow

1. UI calls a `useOrder` workflow method.
2. `useOrder` calls a pure transition/helper to compute updated order/customer and Trello operation intent.
3. `useOrder` dispatches local Redux updates for the operator's business action.
4. `useOrder` calls a Trello/order adapter that returns structured operation results.
5. `useOrder` records failed retryable sync operations in persisted state and returns a workflow result.
6. UI shows success with sync warning, failure tag, and action-specific retry without hiding local business progress.

## Concrete Code Patterns To Preserve

### Helper Style

`OrderHelper` is a plain object export:

```ts
export const OrderHelper = {
    calculateTotalOrderItemsAmount: (items: OrderItem[]): number => { ... },
    getShippingAmountByArea: (area: string): number => { ... }
}
```

New pure helpers should follow this low-ceremony style unless the executor finds a cleaner local convention.

### Reducer Style

`OrderReducer.ts` uses `createSlice`, exported action aliases, and direct Immer assignment:

```ts
setState: (state, action: PayloadAction<OrderState>) => {
    state.orders = action.payload.orders || [];
    state.lastSequence = action.payload.lastSequence || 0;
    state.doneOrders = action.payload.doneOrders || [];
    state.codPayments = action.payload.codPayments || [];
}
```

Sync failure defaults should mirror this explicit fallback pattern and should be covered by reducer tests.

### Restore Defaulting Style

`BackupHelper.ts` uses compact local helpers:

```ts
const _asArray = <T>(value: unknown): T[] => {
    return Array.isArray(value) ? value as T[] : [];
}
```

If `OrderState` gains sync failures, normalize missing legacy backups to an empty array/map using this pattern.

### Hook Test Style

`useOrder.test.ts` renders a small harness with the real store and mocked Trello hook. Extend this approach for orchestration tests, but reset all new sync state in `beforeEach`.

## Planned Artifact Roles

| Artifact | Role |
|---|---|
| `src/Common/Helpers/OrderDomainHelper.ts` | Pure transition/calculation/card-description/label intent helpers extracted from `useOrder`. |
| `src/Common/Helpers/OrderDomainHelper.test.ts` | Unit tests for extracted order-domain behavior without React rendering. |
| `src/Hooks/Trello/TrelloOperationResult.ts` | Shared result types for Trello/order sync operations. |
| `src/Hooks/Trello/OrderTrelloAdapter.ts` | Small adapter around `useTrello`/Trello methods returning operation results. |
| `src/Hooks/Trello/OrderTrelloAdapter.test.ts` | Adapter result tests for success and failures. |
| `src/Hooks/useAPI.test.ts` | Tests for URL building and non-2xx rejection if `useAPI` is changed. |
| `src/Store/Models/OrderSyncFailure.ts` | Persisted sync failure model, if the executor chooses a separate model file. |
| `src/Store/Reducers/OrderReducer.ts` | Add sync failure state/actions/defaults if state is kept under order. |
| `src/Hooks/useOrder.ts` | Thin orchestration around pure transitions, Redux dispatch, adapter calls, failure recording, and retry methods. |
| `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` | Compact sync failure indicator and retry action entry point. |

## Constraints For Executors

- Do not copy Trello token values into docs or tests.
- Do not add a backend, auth, or a broad status center.
- Preserve existing Vietnamese operator-facing messages; new copy should be short and actionable.
- Avoid changing route names/components in this phase; route cleanup belongs to Phase 3.
- Keep `CI=true yarn test --watchAll=false` and `yarn build` green after each wave.

## PATTERN MAPPING COMPLETE
