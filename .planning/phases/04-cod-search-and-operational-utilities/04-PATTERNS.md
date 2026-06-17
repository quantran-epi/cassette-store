# Phase 04: Pattern Map

**Mapped:** 2026-06-17
**Inputs:** 04-CONTEXT.md, 04-RESEARCH.md, 04-UI-SPEC.md

## Target Files and Closest Analogs

| Planned File | Role | Closest Existing Analog | Pattern to Reuse |
|--------------|------|-------------------------|------------------|
| `src/Store/Selectors/OrderSelectors.ts` | Order/customer joined read models, order list query/filter/sort summaries | `src/Store/Reducers/OrderReducer.ts` existing `createSelector` exports; `src/Modules/Order/Screens/OrderList.screen.tsx` current filters | Use RTK/reselect `createSelector`, keep pure builders testable without React. |
| `src/Store/Selectors/DashboardSelectors.ts` | Dashboard totals extracted from render-time reductions | `src/Modules/Home/Screens/Dashboard.screen.tsx`; `src/Hooks/useOrder.ts` `getTotal*` helpers | Preserve existing calculations first, then wire screen to selectors. |
| `src/Common/Helpers/CodPaymentImportHelper.ts` | COD spreadsheet row normalization, matching, review buckets, apply payloads | `src/Common/Helpers/BackupHelper.ts`; `src/Common/Helpers/OrderDomainHelper.ts` | Pure helper with explicit result types, no React or Redux mutation while parsing/reviewing. |
| `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.tsx` | COD file import entry and parser state | `OrderCodPaymentCreate.widget.tsx`; `OrderCreate.screen.tsx` attachment patterns | Use local widget state, existing message/modal providers, Ant Design Upload or file input. |
| `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.tsx` | Review buckets and manual include/exclude/resolve | `OrderCodPaymentCreate.widget.tsx`; `OrderSyncStatus.widget.tsx` compact actions | Keep unresolved rows local until apply; use tags/buttons for row status and actions. |
| `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentColumnMap.widget.tsx` | Manual fallback when known parser confidence is low | Existing Select usage in `OrderCodPaymentCreate.widget.tsx` and `MasterPage.tsx` | Use existing `Select`/`Option` wrapper and form-style labels; no new registry components. |
| `src/Common/Helpers/OrderListQueryHelper.ts` | URL query parse/serialize for order list state | `src/Common/Helpers/RouteHelper.ts`; React Router usage in route files | Centralize query param names and defaults so refresh/back preserve list context. |
| `src/Modules/Order/Screens/OrderItem/OrderActionSurface.widget.tsx` | State-aware row action surface | `OrderItem.widget.tsx` current delivery/action dropdowns | Extract grouping/promotion logic while preserving existing `useOrder` actions and confirmations. |
| `src/Routing/OperationalStatusTray.widget.tsx` | App-wide compact operational tray | `MasterPage.tsx` `AppNoti`; `OrderSyncStatus.widget.tsx` | Reuse existing backup/done refresh state and sync failure model; tray navigates/triggers safe checks only. |

## Data Flow Patterns

### Selector Read Models

Current screens compute many totals inline. Phase 4 should introduce pure read model functions that can be tested with plain arrays, then wrap them in selectors where Redux memoization helps. This keeps implementation safe for a non-strict TypeScript brownfield app.

```text
RootState.order + RootState.customer + query
  -> pure builder/filter/sort/summary helper
  -> memoized selector where useful
  -> DashboardScreen / OrderListScreen / status tray UI
```

### COD Import

COD import is a local staged workflow. No Redux mutation happens during file read or review.

```text
File -> workbook parser -> raw rows -> normalized COD rows
  -> match against local orders by normalized shipping code
  -> review buckets
  -> confirmed apply payload
  -> useOrder/addPaymentOrderCycle or reducer transition
```

### Status Tray

The tray aggregates counts and safe entry points only. Local row/COD screens retain resolution authority.

```text
syncFailures + backup status + done refresh status + COD import issue state
  -> operational status read model
  -> compact tray lines/actions
  -> navigate to filtered orders/COD review OR trigger backup/done refresh
```

## Constraints for Executors

- Preserve local-first state and Phase 2 sync failure handling.
- Do not introduce backend, auth, public/customer-facing UI, or broad import/export.
- Do not move destructive/manual resolution into the status tray.
- Keep new UI dense and Ant Design based; do not add shadcn/Radix/Tailwind UI.
- Verify SheetJS CE installation source against official docs immediately before adding `xlsx` to dependencies.

