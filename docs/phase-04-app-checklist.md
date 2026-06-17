# Phase 04 App Check Summary

Use this checklist after deploying Phase 04 to verify the new COD, search, action, and operational status utilities in the browser.

## App URL

- Local/dev path: `/cassette-store`
- Deployed checklist path: `/cassette-store/phase-04-app-checklist.md`

## 1. COD Excel Import

Go to the order COD payment screen.

Check:

- The `COD import` section is visible.
- `Import COD Excel` accepts `.xlsx`, `.xls`, and `.csv` files.
- After upload, the app parses rows and shows review buckets:
  - `Matched`
  - `Unmatched`
  - `Duplicate`
  - `Amount mismatch`
  - `Already paid`
- The apply button stays disabled while included unresolved rows remain.
- Applying confirmed matched rows marks only those matched orders as paid COD.
- Unmatched or unresolved rows stay unchanged until manually resolved or excluded.

## 2. Changed Excel Format Fallback

Upload a COD file with changed or unfamiliar column names.

Check:

- Manual column mapping appears when detection confidence is low or required columns are missing.
- You can map fields such as shipping code, COD amount, shipping fee, status, and paid date.
- Review buckets rebuild after mapping changes.
- You can exclude or resolve problem rows before applying.

## 3. URL-Backed Order List Filters

Go to the order list.

Check:

- Search works by order/customer/shipping-code text.
- Status filters work.
- COD filters work for paid, unpaid, and non-COD orders.
- Shipping filters work for has-code, missing-code, and done-order states.
- Date and sort controls update the result list.
- Pagination updates the URL.
- Refreshing the browser keeps the same list context.
- Browser back/forward restores prior filter states.

Example URL shape:

```text
/cassette-store/order/list?q=alice&cod=unpaid&ship=has-code&sort=cod&page=2
```

## 4. State-Aware Order Row Actions

Open the order list and inspect individual order rows.

Check:

- A clear next action is promoted when available, such as shipping code entry, mark delivered, or paid COD.
- `Tác vụ khác` opens grouped secondary actions:
  - `Giao hàng`
  - `Chi tiết`
  - `Khách hàng`
  - `Nguy hiểm`
- Disabled actions show a reason.
- Existing action behavior still works through the new surface.
- Dangerous or irreversible actions still require confirmation, including delete, mark paid COD, refused/bom hàng, broken items, and returned order.

## 5. Operational Status Tray

Look near the bottom-right floating controls.

Check:

- Backup status appears when backup is running, succeeds, or fails.
- Done-order refresh status appears after refresh checks.
- Trello sync failures show `Trello sync needs attention`.
- COD import review issues show `COD import needs review`.

Safe tray actions:

- `View failed sync orders`
- `Open COD review`
- `Backup now`
- `Refresh done orders`

The tray must not expose global destructive actions. It should not clear sync failures, manually resolve sync, or apply COD rows directly. Those actions must stay on the order row or COD review screen.

## 6. Mobile Layout Check

Open the app in a mobile viewport.

Check:

- The tray does not cover the bottom navigation.
- Floating quick actions remain reachable.
- Row action menus are tappable.
- Checklist-critical labels fit inside buttons and tray lines without overlap.

## Known Non-Blocking Warnings

Build and test commands still emit existing brownfield warnings from Redux Persist, React `act(...)`, CRA/Babel, Browserslist, Ant Design, and ESLint. These are tracked in Phase 04 verification and did not block the Phase 04 build or tests.
