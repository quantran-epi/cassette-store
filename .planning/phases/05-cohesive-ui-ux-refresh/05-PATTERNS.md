# Phase 5: Cohesive UI/UX Refresh - Pattern Map

**Mapped:** 2026-06-17
**Files analyzed:** 14 (2 new, 12 modified)
**Analogs found:** 14 / 14

> This is a brownfield re-skin phase (D-06/UX-05), so most "analogs" are the file's own current source — the pattern to copy is the existing wiring and primitive-composition style, while the inline magic numbers / English strings are what gets replaced. New files (the token module) have no in-repo analog and follow the RESEARCH.md Pattern 1 template.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/theme/tokens.ts` | config | transform (constants) | `src/Common/Constants/AppShadow.ts` + `AppConstants.ts` (COLORS) | role-match (no theme module exists yet) |
| `src/theme/buildAppTheme.ts` | config | transform | RESEARCH Pattern 1 (no in-repo analog) | no-analog (template) |
| `src/App.tsx` | provider | config | self (current inline `ConfigProvider`) | exact (self) |
| `src/Hooks/useTheme.ts` | hook | request-response | self (current `useToken` re-export) | exact (self) |
| `src/Components/Card/Card.tsx` | component (primitive) | render | self + `Button.tsx` (token-consuming wrapper) | exact (self) |
| `src/Components/Button/Button.tsx` | component (primitive) | render | self (style-merging wrapper) | exact (self) |
| `src/Components/Typography/Typography.tsx` | component (primitive) | render | `Card.tsx` (wrapper pattern) | role-match |
| `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.tsx` | widget | CRUD (review/apply) | self + `OrderItem.widget.tsx` (List card row) | exact (self) — primary offender |
| `src/Modules/Order/Screens/OrderList.screen.tsx` | screen | CRUD + request-response (URL query) | self + `CustomerList.screen.tsx` | exact (self) |
| `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` | widget | CRUD (row actions) | self (List.Item.Meta card row) | exact (self) — canonical card-row pattern |
| `src/Modules/Customer/Screens/CustomerList.screen.tsx` | screen | CRUD (list) | self + `OrderCodPaymentList.screen.tsx` | exact (self) — cleanest list template |
| `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx` | screen | CRUD (form) | (form screen; verify SmartForm usage) | role-match |
| `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentList.screen.tsx` | screen | CRUD (list) | `CustomerList.screen.tsx` | exact (sibling) |
| `src/Modules/Home/Screens/Dashboard.screen.tsx` | screen | read-only (selector) | self (Card + Statistic + Tabs) | exact (self) |
| `src/Routing/MasterPage.tsx` | layout/provider | event-driven (controls) | self (FloatButton + status tray) | exact (self) |

> New test files (Wave 0 gaps from RESEARCH Validation Architecture) — see "Test Patterns" section.

## Shared Patterns

These cross-cutting patterns apply to nearly every in-scope file. Plans should reference these once rather than re-deriving them.

### Primitive wrapper pattern (style-merge + token consumption)
**Source:** `src/Components/Button/Button.tsx` lines 10-31, `src/Components/Card/Card.tsx` lines 12-36
**Apply to:** All `src/Components/` primitive edits (Card, Button, Typography, Tag).

The established wrapper convention: extend the antd prop type, compute a `_styles()`/`_style()` function that spreads incoming `style` LAST so callers can override, and return the antd component. To tokenize, swap the hard-coded numbers for `theme.useToken()` reads:

```typescript
// CURRENT — src/Components/Card/Card.tsx lines 19-25 (hard-coded magic numbers)
const _style = (): React.CSSProperties => {
    return {
        borderRadius: 10,                                  // -> token.borderRadius
        boxShadow: noShadow ? "none" : AppShadow.card,     // -> tokens.shadow.card
        ...style
    }
}

// TARGET pattern (RESEARCH Pattern 2) — read token at render, keep ...style last
const { token } = theme.useToken();
const _style = (): React.CSSProperties => ({
    borderRadius: token.borderRadius,
    boxShadow: noShadow ? "none" : tokens.shadow.card,
    ...style
});
```

### Token source of truth (folds in existing constants)
**Source:** `src/Common/Constants/AppShadow.ts` (whole file), `src/Common/Constants/AppConstants.ts` lines 61-85 (`COLORS`)
**Apply to:** `src/theme/tokens.ts`.

`AppShadow.card`/`.notification` migrate verbatim into `tokens.shadow`. The `COLORS` map is **status/domain encoding** (shipped `#2aa345`, returned `#990505`, etc.) and per UI-SPEC stays as-is — it is NOT part of the 10% accent budget. The accent primary `#f58220` must match craco Less `@primary-color` (Pitfall 4). Existing values to fold in:

```typescript
// AppShadow.ts (migrate into tokens.shadow)
export const AppShadow = {
    card: "0 0 15px 0 rgb(34 41 47 / 5%)",
    notification: "0 5px 25px rgb(34 41 47 / 10%)"
}
// craco.config.js lines 35-39 — keep these Less vars in sync with tokens.ts
'@primary-color': '#f58220', '@primary-fade': '#ffefe0', '@text-color': "rgba(0, 0, 0, 0.65)",
```

### Mobile-native List card row (D-09)
**Source:** `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` lines 276-372 (canonical), `src/Modules/Customer/Screens/CustomerList.screen.tsx` lines 62-70
**Apply to:** All dense list screens (OrderList, COD review, CustomerList, COD payment list).

The repo already renders dense rows as `List` + `renderItem` → `List.Item` / `List.Item.Meta` with a `Stack direction="column"` body — NOT a Table. This is the existing idiom to keep and standardize. The `List` primitive wraps antd `List` (`src/Components/List/List.tsx`, re-exported via `index.ts`):

```typescript
// CustomerList.screen.tsx lines 62-70 — the clean list template
<List
    pagination={filteredCustomers.length > 0 ? { position: "bottom", align: "center", pageSize: 10 } : false}
    itemLayout="horizontal"
    locale={{ emptyText: "Chưa có khách hàng nào" }}   // Vietnamese empty state already correct here
    dataSource={filteredCustomers}
    renderItem={(item) => <CustomerItemWidget item={item} onDelete={_onDelete}/>}
/>
```

### Truncate-with-reveal (D-05) — replace hover Tooltip
**Source:** `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` lines 328-364
**Apply to:** Long fields (name, address, mobile, shipping code, notes) on every card row.

The current code uses `Typography.Paragraph ellipsis` with a **fixed `width: 300/320`** wrapped in a hover `Tooltip` (lines 355-363). Per Pitfall 3 / UI-SPEC, hover tooltip is unreliable on touch — convert to a tap-triggered `Popover` (primitive at `src/Components/Popover`) for inline fields and `ellipsis={{ expandable, symbol: "xem thêm" }}` for notes. Drop the fixed pixel widths in favor of flex/token-driven layout (Pitfall 2):

```typescript
// CURRENT — fixed width + hover tooltip (lines 353-364), the anti-pattern to replace
<Tooltip title={orderCustomer.address}>
    <Space>
        <EnvironmentOutlined />
        <Typography.Paragraph ellipsis style={{ width: 300, marginBottom: 0 }}>{orderCustomer.address}</Typography.Paragraph>
    </Space>
</Tooltip>
// TARGET — tap Popover, no fixed width (one mechanism used consistently across screens)
```

### Workflow states (UX-03)
**Source:** `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` lines 141-145 (quiet success via `useMessage`), lines 183-188 (`modal.confirm` confirmation), `OrderList.screen.tsx` lines 103-112 (Empty), `OrderCodPaymentReview.widget.tsx` line 129 (warning Alert)
**Apply to:** Every in-scope screen.

The five states map to existing primitives already in use: Loading → `Spin`; Empty → `Empty` with Vietnamese `description`; Error → `Result`/`Alert type="error"`; Success → quiet `useMessage().success(...)`; Confirmation → `Popconfirm` / `modal.confirm`. The "quiet success, persistent warning only when operator must act" convention is live in `OrderItem.widget.tsx`:

```typescript
// OrderItem.widget.tsx lines 141-145 — the quiet-success / persistent-warning convention to preserve
const _showWorkflowResult = (result, successMessage) => {
    if (!result.localUpdated) message.error(getOrderWorkflowMessage(result));
    else if (hasOrderWorkflowSyncFailures(result)) message.warning(getOrderWorkflowMessage(result));
    else message.success(successMessage);   // quiet transient success
}
```

### Behavior-preservation boundary (UX-05) — re-skin only
**Apply to:** All screen/widget edits.

Keep every selector wiring and handler call intact. Do not move derived computation into the view. Verified wirings to preserve:
- `OrderList.screen.tsx`: `selectOrderListReadModel` (lines 78-79), `parseOrderListQuery`/`mergeOrderListQuery`/`serializeOrderListQuery` URL sync (lines 77, 82-85).
- `Dashboard.screen.tsx`: `selectDashboardReadModel` (line 23) — read `dashboard.totals.*` / `dashboard.customers.*`, never recompute.
- `OrderItem.widget.tsx`: `useOrder()` handlers + `buildOrderActionModel` (lines 147-157).
- `OrderCodPaymentReview.widget.tsx`: `canApplyCodImportReview`, `updateCodImportReviewRow` (lines 46-74) and the `CodImportReviewBucket` enum **keys** (only display labels change).

---

## Pattern Assignments

### `src/theme/tokens.ts` + `src/theme/buildAppTheme.ts` (config, NEW)

**Analog:** No in-repo theme module. Follow RESEARCH Pattern 1; fold in `AppShadow.ts` + `COLORS` + craco `@primary-color`.

**buildAppTheme template** (RESEARCH lines 180-199):
```typescript
import { theme, type ThemeConfig } from "antd";
import { tokens } from "./tokens";

export const buildAppTheme = (): ThemeConfig => ({
    algorithm: [theme.defaultAlgorithm, theme.compactAlgorithm], // mobile density (D-09)
    token: {
        colorPrimary: tokens.color.primary,        // #f58220 (== craco @primary-color)
        colorLink: tokens.color.link,              // #3d4195
        colorBorderSecondary: tokens.color.border, // #d9d9d9
        fontSize: tokens.font.base,                // 14 (was 18 — D-04)
        borderRadius: tokens.radius.base,
        controlHeight: tokens.control.height,      // >= 44 effective tap target
    },
    components: { /* per-component overrides only where algorithm default isn't enough */ },
});
```
Type scale (UI-SPEC Typography): Label 12/400, Body 14/400, Heading 18/600, Display 24/600. Spacing multiples of 4 (xs4 sm8 md16 lg24 xl32). Keep `controlHeight >= 44` so `compactAlgorithm` never produces sub-44px taps.

---

### `src/App.tsx` (provider, config)

**Analog:** Self (lines 12-19, the inline theme to replace).

**Replace inline theme** with `buildAppTheme()`:
```typescript
// BEFORE (lines 12-19) — fontSize: 18 is the prime overflow cause (D-04)
<ConfigProvider theme={{ token: { colorPrimary: "rgb(245, 130, 32)", colorLink: "#3d4195", colorBorderSecondary: "#d9d9d9", fontSize: 18 } }}>
// AFTER
<ConfigProvider theme={buildAppTheme()}>
```
Keep the provider nesting (`MessageProvider` > `ModalProvider` > `Provider` > `PersistGate` > `RootRouter`) exactly — lines 21-29 are unchanged wiring.

---

### `src/Hooks/useTheme.ts` (hook)

**Analog:** Self (whole file — currently `export const useTheme = useToken`).

Consolidate: keep re-exporting antd `useToken` AND expose the `tokens` constants so primitives import one place. Minimal change; do not break existing `useTheme` callers (e.g. `MasterPage.tsx` imports `useTheme` from `@hooks`).

---

### `src/Components/Card/Card.tsx` (primitive)

**Analog:** Self (lines 12-36) + Button wrapper convention.

**Tokenize** the `_style()` magic numbers (lines 19-25): `borderRadius: 10` → `token.borderRadius`, `AppShadow.card` → `tokens.shadow.card`. Also the hard-coded `marginTop/marginBottom: 10` in `_renderTitle()` (lines 29-31) should move to spacing tokens. Keep `...style` spread last (override contract) and the `noShadow` prop behavior.

---

### `src/Components/Button/Button.tsx` + `Typography/Typography.tsx` (primitives)

**Analog:** `Button.tsx` is already a clean style-merge wrapper (lines 10-31) — minimal token work (it inherits `colorPrimary`/`controlHeight` from the theme automatically). `Typography.tsx` is a bare `export const Typography = AntTypography` (line 4); if a tokenized heading/label helper is needed, wrap following the Card pattern, otherwise leave as pass-through and let the type-scale come from the theme `fontSize` seed.

---

### `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.tsx` (widget, CRUD) — PRIMARY OFFENDER

**Analog:** Self + `OrderItem.widget.tsx` card-row pattern.

**1. English → Vietnamese sweep** (UI-SPEC Copywriting table, keys UNCHANGED):
```typescript
// BEFORE — lines 30-36
const BUCKET_LABELS: Record<CodImportReviewBucket, string> = {
    matched: "Matched", unmatched: "Unmatched", duplicate: "Duplicate",
    "amount-mismatch": "Amount mismatch", "already-paid": "Already paid"
}
// AFTER (display strings only)
const BUCKET_LABELS = { matched: "Đã khớp", unmatched: "Chưa khớp", duplicate: "Trùng",
    "amount-mismatch": "Lệch số tiền", "already-paid": "Đã thanh toán" }
```
Other offenders in this file: `Row {row.rowNumber}` → `Dòng {n}` (line 81), `"No shipping code"` (82), `Needs review` → `Cần kiểm tra` + `Confirmed` → (line 83), `Matched order:` (85), `Include` → `Bao gồm` (89), `Imported COD/shipping fee/Current app COD` tags (93-95), `Payment row` → (96), `placeholder="Manual resolve"` (104), `"no code"` (53), `Include/exclude or resolve...` (115), `No rows in this bucket.` → `Không có dòng nào trong nhóm này` (125), the warning message `Some rows need review...` (129), `Confirmed included / Unresolved included` (133-134), `Apply confirmed COD rows` → `Áp dụng các dòng COD đã xác nhận` (143).

**2. Inline magic numbers to remove** (Pitfall 2/4):
```typescript
// line 77 — hard-coded padding + border color
style={{padding: 12, borderBottom: "1px solid #d9d9d9"}}   // -> token.padding + token.colorBorderSecondary
// line 111 — fixed-width select overflows narrow phones
style={{minWidth: 260, flex: 1}}                            // -> token-driven / flex only
```

**3. Apply confirmation** — wrap the apply button (lines 136-144) in `Popconfirm` (irreversible COD apply, UI-SPEC Destructive table). Keep `canApplyCodImportReview`/`onApply` wiring intact.

---

### `src/Modules/Order/Screens/OrderList.screen.tsx` (screen, CRUD + URL query)

**Analog:** Self + CustomerList list template.

**1. English option arrays → Vietnamese** (Pitfall 5):
```typescript
// lines 45-65 — COD_OPTIONS / SHIPPING_OPTIONS / SORT_OPTIONS labels are English
{label: "All COD", value: "all"}      // -> "Tất cả COD"
{label: "Paid", value: "paid"}        // -> "Đã trả", "Unpaid" -> "Chưa trả", "Non-COD" -> "Không COD"
{label: "Newest", value: "newest"}    // -> "Mới nhất", etc.  (VALUES unchanged — URL query keys)
```
Also English filter tags (lines 182-189: `Search:`, `Status:`, `COD:`, `Shipping:`, `From:`, `To:`, `Sort:`, `Clear filters`), the Empty body (lines 109-110: `No orders match these filters` / `Clear filters or adjust search...`), and summary tags (lines 196-202: `Orders:`, `Thu:`/`COD:` mixed).

**2. Magic numbers / fixed widths** (Pitfall 2): `fontSize: "0.6em"` (lines 131-144), `minWidth: 132/152/140`, `width: 150` on the filter Selects/Inputs (lines 152-178) — move to tokens, let `compactAlgorithm` size them.

**3. Preserve** the `selectOrderListReadModel` + URL query wiring (lines 77-85) and the `List` + `OrderItemWidget` renderItem (lines 206-219) exactly.

---

### `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` (widget) — CANONICAL CARD ROW

**Analog:** Self (the reference card-row layout).

This is the most complete existing mobile card row (`List.Item` + `List.Item.Meta` with `title` = name button + `description` = stacked `Stack`/`Space` lines with icons). The refresh: (a) replace fixed `width: 300/320` ellipsis paragraphs (lines 291-361) and hover `Tooltip` reveals with the shared truncate-with-reveal Popover; (b) replace inline `paddingInline/fontWeight/textAlign` (lines 290, 298) and color literals with tokens; (c) keep all `useOrder`/`buildOrderActionModel`/`modal.confirm` wiring (lines 147-255) untouched. Status/COD/priority Tag colors come from `COLORS` (domain encoding) — keep.

---

### `src/Modules/Customer/Screens/CustomerList.screen.tsx` (screen) — CLEAN LIST TEMPLATE

**Analog:** Self — already Vietnamese, already `List` card rows (lines 57-80). This is the cleanest template other list screens should converge toward. Refresh is light: ensure the row widget (`CustomerItemWidget`) uses tokenized spacing and truncate-with-reveal; `Stack.Compact` search + `Button` add icon header (lines 58-61) is the shared list-header idiom (also in OrderList line 115-123, COD list line 38-41).

---

### `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentList.screen.tsx` (screen)

**Analog:** `CustomerList.screen.tsx` (sibling list pattern).

Already mostly Vietnamese with `List` card rows (lines 36-54+). **English offender:** `Manual cycle` button label (line 40) → Vietnamese. Tokenize row spacing. Keep `useOrder().applyCodPaymentImportReview` wiring (line 39).

---

### `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx` (screen, form)

**Analog:** Form screen — verify `SmartForm`/`Form` primitive usage during planning (not read this session; `src/Components/SmartForm` and `Form` exist). Apply token spacing to form fields; sweep for any English labels/placeholders; preserve pricing/COD/attachment handlers and the `OrderCreate.screen.test.tsx` coverage (Pitfall 1).

---

### `src/Modules/Home/Screens/Dashboard.screen.tsx` (screen, read-only) — UX-04 REORG

**Analog:** Self (Card + `Statistic` + `Tabs` structure, lines 26-235).

Reorganize from flat tabs (`Tổng`/`COD`/`Chuyển khoản`/`Khách hàng`/`Bom`) into **decision groups** (needs-action-today, COD-to-reconcile, shipping-pending). **Read all values from `dashboard.totals.*` / `dashboard.customers.*`** (the `selectDashboardReadModel` output, line 23) — do NOT recompute (UX-05; A3: if a new grouping needs a value the selector lacks, extend the selector, flag it, don't compute in view). Replace inline `width: 220/280` ellipsis (lines 172-197) and `padding`/`marginBottom` literals (lines 169-191) with tokens. Vietnamese already correct here ("Thống kê", "Tổng tiền", "Tổng tiền COD") — match these terms in the COD widget sweep.

---

### `src/Routing/MasterPage.tsx` (layout/provider) — floating controls + status tray

**Analog:** Self (FloatButton + `OperationalStatusTrayWidget` placement).

Tokenize the floating-control chrome and status-tray surface (secondary `#f5f5f5`/border `#d9d9d9` per UI-SPEC color table). Preserve all backup/restore (`createBackupEnvelope`/`parseBackupText`), Trello (`useTrello`), and `buildOperationalStatusReadModel` wiring (this file is dense with business handlers — re-skin only, UX-05). Note `layoutStyles` const (line 43-45) is an existing inline-style pattern to migrate.

---

## Test Patterns (Wave 0 gaps)

**Analog for new render tests:** existing sibling tests in the same dirs — `OrderInlineShippingCode.widget.test.tsx`, `OrderSyncStatus.widget.test.tsx`, `OrderActionSurface.widget.test.tsx`, `OrderCodPaymentImport.widget.test.tsx`, `OrderCreate.screen.test.tsx`, `OrderList.screen.test.tsx` (Jest + RTL via `react-scripts test`, setup in `src/setupTests.ts`).

New tests to add (RESEARCH Validation Architecture):
- `OrderCodPaymentReview.widget.test.tsx` — assert Vietnamese bucket labels render, guard against English regression (UX-01/D-02).
- Dashboard selector/render test — assert decision-group values come from `selectDashboardReadModel` (UX-04/UX-05).
- Representative state-render test — Empty/Spin/Result presence (UX-03).

Commands: quick `CI=true yarn test --watchAll=false --findRelatedTests <files>`; full `CI=true yarn test --watchAll=false`; build gate `yarn build`.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/theme/buildAppTheme.ts` | config | transform | No theme/config module exists in repo yet; follows RESEARCH Pattern 1 template (antd `ThemeConfig` builder). `tokens.ts` folds in existing `AppShadow`/`COLORS`/craco vars so it is partially analog-backed. |

## Metadata

**Analog search scope:** `src/App.tsx`, `src/Hooks/`, `src/Components/` (Card, Button, Typography, Stack, List), `src/Common/Constants/`, `craco.config.js`, `src/Modules/Order/Screens/` (OrderList, OrderItem, OrderCodPaymentReview, OrderCodPaymentList), `src/Modules/Customer/Screens/CustomerList`, `src/Modules/Home/Screens/Dashboard`, `src/Routing/MasterPage` (head).
**Files scanned:** 14 read in full or targeted, plus structure greps.
**Pattern extraction date:** 2026-06-17
