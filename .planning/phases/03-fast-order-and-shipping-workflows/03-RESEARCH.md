# Phase 3: Fast Order and Shipping Workflows - Research

**Researched:** 2026-06-16
**Status:** Ready for validation/UI contract gate

## Research Question

What needs to be known to plan Phase 3 well: faster order creation, faster shipping-code updates, and route cleanup while preserving Phase 2 local-first Trello recovery behavior?

## Sources Reviewed

- `.planning/phases/03-fast-order-and-shipping-workflows/03-CONTEXT.md` - locked user decisions for route/customer entry, form compression, shipping-code capture, and row-scoped status.
- `.planning/ROADMAP.md` - Phase 3 scope, `mvp` mode, dependency on Phase 2, and planned items `03-01` through `03-03`.
- `.planning/REQUIREMENTS.md` - `ORD-05`, `OPS-01`, `OPS-02`.
- `src/Modules/Order/Routing/OrderRouteConfig.ts`, `src/Modules/Order/Routing/OrderRouter.tsx`, `src/Routing/RootRouter.tsx`, `src/Routing/RootRoutes.ts` - route naming and component wiring.
- `src/Modules/Order/Screens/OrderList.screen.tsx`, `src/Modules/Order/Screens/OrderCreate/CustomerSearch.widget.tsx`, `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx`, `src/Modules/Customer/Screens/CustomerAdd.widget.tsx` - current order creation entry and form flow.
- `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx`, `src/Modules/Order/Screens/OrderItem/OrderChangeShippingCode.widget.tsx`, `src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.tsx` - current row actions, shipping-code modal, and sync status.
- `src/Hooks/useOrder.ts`, `src/Hooks/OrderWorkflowResult.ts`, `src/Store/Models/OrderSyncFailure.ts` - workflow result and sync failure contracts.
- `src/Hooks/useOrder.test.ts`, `src/Common/Helpers/OrderDomainHelper.test.ts`, `src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx`, `src/App.test.tsx` - existing test harnesses and coverage patterns.

## Key Findings

### 1. Route Cleanup Is Concrete and Low Risk

- `src/Modules/Order/Routing/OrderRouteConfig.ts` currently creates order paths but stores them in a `CustomerRoutes` constant and exports that as default.
- `src/Routing/RootRouter.tsx` renders the order route root with `CustomerRouter` even though `src/Modules/Order/Routing/OrderRouter.tsx` exists.
- Path strings can remain stable (`/order/list`, `/order/create`, `/order/cod-payment-list`) while exported symbols and route layout components become order-specific.
- A route smoke test can guard that `/cassette-store/order/list`, `/cassette-store/order/create`, and `/cassette-store/order/cod-payment-list` still render through the app shell after the rename.

### 2. Order Creation Entry Should Move Into `/order/create`

- `OrderListScreen` currently owns the add-order modal, uses `CustomerSearchWidget`, and navigates to create with `location.state.customerId`.
- `OrderCreateScreen` currently renders its form only when `orderCustomer` is found from `location.state.customerId`, so direct navigation to `/order/create` is effectively empty.
- `CustomerSearchWidget` already does the phone lookup and empty-state new-customer trigger needed for the new create flow.
- `CustomerAddWidget` already supports `prefilled` values and `onAddSucceed`, which is enough to keep new-customer creation inline and then reveal the order form.
- The plan should avoid duplicating customer add/search logic. Prefer adapting props or composing the existing widgets inside `OrderCreateScreen`.

### 3. Form Compression Should Preserve Business Defaults

- `OrderCreateScreen` owns default order values, sequence assignment, generated order name, placed item defaults, payment amount recalculation, COD amount recalculation, free-shipping recalculation, attachments, and `orderUtils.createOrder()` result handling.
- Less-common fields can move into a compact details section as long as their current defaults still populate the submitted `Order` object.
- The collapsed details summary must expose changed values for priority, free shipping, shipping partner, payment method, COD amount, shipping cost, and important note.
- Attachments should remain visible in the core create flow, but current preview rendering creates object URLs without cleanup. Planning should include cleanup or keep preview changes tightly scoped to avoid leaks.
- Successful create should continue to navigate back to the order list, but local-success/Trello-failure should be visible on the created order row through existing sync failure state.

### 4. Shipping-Code Flow Already Has the Right Domain Contract

- `useOrder.changeShippingCode(orderId, code)` already applies the local transition first, creates a Trello comment, moves the card on first shipping code, and records sync failures.
- `OrderDomainHelper.changeShippingCodeTransition()` already preserves first-code behavior and marks status `CREATE_DELIVERY`.
- `OrderChangeShippingCodeWidget` auto-reads clipboard after open for placed orders. The user selected explicit paste action instead for the new inline row flow.
- Inline row entry should call the existing `orderUtils.changeShippingCode()` and reuse `getOrderWorkflowMessage()` / `hasOrderWorkflowSyncFailures()` behavior rather than introducing a new save path.
- The current `OrderSyncStatusWidget` already renders `Thử lại` and `Đã xử lý`. The fast row flow can reuse it directly or extract a compact mode if needed.

### 5. Tests Can Extend Existing Harnesses

- Route/app smoke patterns already exist in `src/App.test.tsx` with `window.history.pushState` and mocked IndexedDB/fetch.
- `OrderSyncStatus.widget.test.tsx` already mocks `useOrder`, renders `OrderItemWidget`, and verifies order-scoped sync failures.
- `useOrder.test.ts` already covers local-first create/shipping failures, including `create-card`, `create-comment`, `move-card`, and `create-attachment` cases.
- New tests should focus on UI composition and routing, not re-test all Phase 2 domain behavior.

## Recommended Planning Shape

Keep the roadmap's three-plan shape. It maps cleanly to stable execution boundaries:

1. **03-01 Route cleanup and smoke coverage** - Rename route config symbols, use `OrderRouter`, preserve route paths, and add smoke coverage.
2. **03-02 Create flow streamlining** - Move lookup/add-customer into `/order/create`, add selected-customer summary, compress the form, keep attachments and defaults, preserve create result handling.
3. **03-03 Row-level shipping-code flow and status feedback** - Add inline shipping-code action/input, explicit paste action, call existing `changeShippingCode`, and reuse compact sync warning actions.

Because Phase 3 is `mvp` mode, each plan should deliver a usable vertical slice with its own UI, state wiring, and verification. Do not split into broad horizontal refactors.

## Risks and Constraints

- **Direct create route blank state:** If `/order/create` is changed without a customer lookup state machine, direct navigation remains broken or confusing.
- **Duplicate customer flow:** Copying `CustomerSearchWidget` or `CustomerAddWidget` logic would create drift; compose or lightly extend existing widgets.
- **Hidden defaults:** Collapsing fields is safe only if submitted values still include all current defaults and changed values are visible in summary.
- **Attachment behavior:** Do not move attachment upload to after-save. Keep `orderUtils.createOrder(order, customer, files)` behavior intact.
- **Trello sync regression:** Inline shipping save must not bypass `useOrder.changeShippingCode()` or Phase 2 failure recording.
- **Scope creep:** Do not build a Phase 4 status center, broad search/filter upgrade, COD cycle redesign, or action command center.

## Validation Architecture

### Automated Validation Targets

- **Route smoke:** Rendering the app at order paths proves order route naming/component cleanup does not break navigation.
- **Create flow UI:** Component tests should verify direct `/order/create` shows phone lookup, selecting an existing customer reveals the order form, and inline new-customer success reveals the form with the new customer.
- **Create behavior preservation:** Tests should assert core defaults and changed compact details still flow into the submitted order payload, including payment/COD/free shipping/priority/important note where feasible.
- **Shipping-code UI:** Row/widget tests should verify inline shipping-code action appears for eligible orders, explicit paste fills from clipboard, save calls `changeShippingCode(order.id, code)`, and local-success/Trello-failure renders row sync warning actions.
- **Existing workflow regression:** Keep `CI=true yarn test --watchAll=false` passing. Run targeted tests for affected files during execution and full test/build before phase verification.

### Suggested Test Files

- `src/Routing/RootRouter.test.tsx` or extend `src/App.test.tsx` for order route smoke coverage.
- `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.test.tsx` for lookup, inline customer add handoff, selected-customer summary, collapsed details, and create navigation behavior.
- `src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.test.tsx` if a new inline widget is extracted, otherwise extend `OrderSyncStatus.widget.test.tsx` or create `OrderItem.widget.test.tsx` focused on shipping-code row actions.

### Commands

- Targeted during tasks: `CI=true yarn test --watchAll=false --runTestsByPath <test files>`
- Full regression: `CI=true yarn test --watchAll=false`
- Production build: `yarn build`

### Manual Checks

- Open `/cassette-store/order/create`, search by phone, select existing customer, verify selected-customer summary and core-first order form.
- Search an unknown phone, add customer inline, verify the new customer flows directly into the order form.
- Create an order with attachments and non-default details, confirm it returns to the list and row status is visible.
- Enter a shipping code from an order row using explicit paste, confirm code appears immediately and sync warning appears if Trello fails.

## Research Complete

Phase 3 can be planned with high confidence after the UI-SPEC gate is satisfied. The critical planning rule is to reuse Phase 2 workflow results and existing widgets, changing operator flow and visibility rather than rebuilding business logic.
