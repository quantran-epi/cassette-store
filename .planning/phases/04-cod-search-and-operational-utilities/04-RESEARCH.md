# Phase 4: COD, Search, and Operational Utilities - Research

**Researched:** 2026-06-17
**Domain:** Client-side React/Redux operations utilities, COD Excel settlement import, selector-backed read models
**Confidence:** HIGH for local architecture and selector/list/status patterns; MEDIUM for COD Excel parser details until a real settlement file sample is available.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Build Phase 4 read models in tested selectors/helpers for dashboard totals, order-list filtered/sorted results, list summary totals/counts, and COD eligible-order/totals logic.
- Keep order-list search, filters, sort, and page URL-backed through route query state.
- Main order search must join order/customer data and match order name, shipping code, customer name, customer phone, customer address/province, order note, and important text.
- Make status, COD paid/unpaid/non-COD, shipping-code present/missing/done-order, customer-backed search, date range, and sort controls first-class.
- COD cycle creation is file-driven: import a COD Excel settlement file, parse it, review results, and apply selected/confirmed matches into a COD payment cycle.
- Target the known COD Excel export format first, but provide a manual fallback with column mapping plus row review when the file format changes.
- Applying confirmed COD matches marks orders as paid COD, creates/updates the COD payment cycle, includes confirmed debit-shipping-fee orders, and leaves unresolved rows unchanged.
- COD review buckets: matched, unmatched, duplicate, amount mismatch, and already paid, each with include/exclude/manual resolve controls.
- Common order actions use a state-aware row action surface that promotes the next relevant action and confirms dangerous actions.
- App-wide operational status shows actionable problems and key checks: Trello sync failures, backup status, done-order refresh status, and COD import/apply issues. Normal success stays quiet or compact.
- Use a compact app-wide status tray near existing floating controls; local rows/screens own detailed resolution actions.

### Agent Discretion
- Exact selector/helper module split and file names.
- Excel parsing library and parser architecture, scoped to browser-side `.xlsx` parsing and focused tests.
- Exact mobile placement and component split for status tray and state-aware row action surface, without pulling Phase 5 visual redesign forward.

### Deferred Ideas (OUT OF SCOPE)
- General order/customer import-export.
- Full visual-system and mobile UI refresh.
- Backend database, authentication, collaboration, public storefront, and external order-status workflows.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

Single-tier browser application - all Phase 4 capabilities reside in the browser client using React, Redux Toolkit, redux-persist/IndexedDB, and Trello API side effects already present in the app.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Selector-backed read models | Browser/Client | IndexedDB-backed Redux state | Derived order/customer/COD values come from local Redux state and should not require remote calls. |
| URL-backed order list state | Browser/Client | Router | React Router query params own view state; Redux remains business data only. |
| COD Excel import and review | Browser/Client | File API | Operator imports a local file; parsing and review can happen entirely in memory before applying Redux updates. |
| COD apply | Browser/Client | Redux persistence | Confirmed matches mutate local order/COD state and persist through existing redux-persist/backup flows. |
| Operational status tray | Browser/Client | Trello integration | Tray aggregates local sync failure state and existing backup/done-refresh statuses. |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 4 should be planned as a sequence of client-side foundations and vertical operator utilities. The safest starting point is a pure selector/helper layer that computes dashboard totals, list results, COD eligibility, COD import review summaries, and operational status counts without rendering React. This directly addresses `ORD-04` and gives later UI work a stable data contract.

For COD Excel settlement import, the standard browser approach is to use a mature workbook parser rather than attempting CSV/ZIP/XML parsing by hand. SheetJS CE is the practical default for client-side `.xlsx` reading, but implementation should verify the current official install path because current SheetJS CE releases are distributed through SheetJS channels and the npm registry package may lag. The parser should normalize workbook rows into a domain-specific settlement row model, then perform deterministic matching by normalized shipping code.

For UI, use existing Ant Design components already in the app: Upload for file selection, Table/List/Tabs/Tags for review buckets, Select for column mapping, Modal/Drawer as needed for focused review, and existing message/status patterns for feedback. Keep state local until apply; only confirmed rows should mutate Redux.

**Primary recommendation:** Plan Phase 4 as four dependent slices: selector/read-model foundation, COD Excel import/review/apply, URL-backed order list utilities, and state-aware actions/status tray.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Current Project Version | Purpose | Why Standard |
|---------|-------------------------|---------|--------------|
| `@reduxjs/toolkit` + `reselect` | RTK `^2.2.3`, reselect `^5.1.0` | Memoized selectors/read models | Already installed; RTK exports `createSelector` patterns and the reducer already imports it. |
| `react-router-dom` | `^6.22.3` | URL query state for list filters/sort/page | Already installed; `useSearchParams` is the intended route-query API. |
| `antd` | `^5.16.1` | Upload, Table/List, Tabs, Tag, Modal, Select, Result/Alert style UI | Existing UI foundation; avoids new design system work. |
| SheetJS CE (`xlsx`) | Verify current official CE install at implementation time | Parse `.xlsx`/spreadsheet files in the browser | Mature workbook parser; avoids hand-rolling Excel file format parsing. |

### Supporting
| Library | Current Project Version | Purpose | When to Use |
|---------|-------------------------|---------|-------------|
| `lodash` | `^4.17.21` | Sorting, grouping, debounced input, normalization helpers | Already used in list screens; OK for stable utility code. |
| `moment` / `dayjs` | moment `^2.30.1`, dayjs `^1.11.10` | Date range handling and display | Existing app uses moment heavily; do not migrate date stack in this phase. |
| Browser File API | n/a | Read uploaded workbook as `ArrayBuffer` | Use inside Upload/File input flow before passing bytes to parser. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SheetJS CE | `exceljs` | ExcelJS is strong for generating/editing workbooks but heavier; Phase 4 needs import parsing and row extraction. |
| SheetJS CE | CSV-only parser | Simpler if source is always CSV, but user explicitly has Excel files and format changes. |
| URL query params | Redux/localStorage persisted view state | Persistence across sessions is stronger but conflicts with the decision not to add business-state persistence for list UI. |
| Ant Design Table | Current List-only rendering | Table is better for review buckets and column mapping, but order list may remain List-based if mobile density is better. |

**Installation candidate:**
```bash
yarn add xlsx
```

Before implementation, verify the current SheetJS CE install command from official docs. If official docs recommend installing from the SheetJS CDN tarball instead of npm, use that exact source and lock it in `yarn.lock`.
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### System Architecture Diagram

```text
Order/customer Redux state
    |
    v
Selector/read-model helpers
    |        \
    |         \-> Dashboard totals / order list query results / operational status counts
    v
COD import UI -> Upload Excel file -> Workbook parser -> Normalized settlement rows
                                                |
                                                v
                                      Match by shipping code
                                                |
                         +----------------------+---------------------+
                         |                                            |
                         v                                            v
                  Ready-to-apply rows                         Review/problem rows
                  matched/exact                              unmatched/duplicate/
                                                             amount mismatch/already paid
                         |                                            |
                         +----------------------+---------------------+
                                                v
                                      Operator review + manual resolve
                                                |
                                                v
                                      Apply confirmed rows only
                                                |
                                                v
                           Redux order/COD state + persisted backup payload
```

### Recommended Project Structure

```text
src/
|-- Store/
|   `-- Selectors/
|       |-- OrderSelectors.ts             # order/customer joined search, filters, sort, summaries
|       |-- DashboardSelectors.ts         # dashboard totals extracted from Dashboard.screen.tsx/useOrder
|       `-- OperationalStatusSelectors.ts # sync failure/backup/done/COD alert read models if needed
|-- Common/
|   `-- Helpers/
|       `-- CodPaymentImportHelper.ts     # workbook row normalization, matching, review/apply helpers
`-- Modules/Order/Screens/OrderCodPayment/
    |-- OrderCodPaymentImport.widget.tsx  # upload, parser status, fallback entry point
    |-- OrderCodPaymentReview.widget.tsx  # review buckets and manual resolution
    `-- OrderCodPaymentColumnMap.widget.tsx # fallback column mapping
```

Exact file names are planner discretion, but separating pure import/matching logic from widgets is important for tests.

### Pattern 1: Pure Read Models Before UI Wiring
**What:** Move derived data into selectors/helpers with explicit input and output shapes.
**When to use:** Dashboard metrics, order list results, COD eligible orders, import review summaries, status counts.
**Example target shape:**
```typescript
type OrderListQuery = {
    text: string;
    statuses: string[];
    codState: "all" | "paid" | "unpaid" | "non-cod";
    shippingState: "all" | "has-code" | "missing-code" | "done-in-trello";
    dateFrom?: string;
    dateTo?: string;
    sort: "newest" | "oldest" | "priority" | "amount" | "cod";
    page: number;
}
```

### Pattern 2: Normalize, Match, Review, Apply
**What:** COD import should not mutate Redux during parsing. Convert workbook rows to normalized settlement rows, match against local orders, generate review buckets, then apply only confirmed rows.
**When to use:** Every COD settlement upload.
**Key invariants:**
- Normalize shipping codes with trim/uppercase/no whitespace before matching.
- Detect duplicates in file and duplicates against local orders before apply.
- Amount mismatches are review states, not automatic failures.
- Already paid rows must be explicit review rows to prevent double-counting.
- Applying confirmed rows should be idempotent for rows already represented in the selected COD cycle.

### Pattern 3: URL Query as View State Contract
**What:** Convert order list UI controls to query params and derive local component state from `useSearchParams`.
**When to use:** Order list search text, filter chips, sort, date range, page.
**Implementation note:** Keep query param names short and stable, for example `q`, `status`, `cod`, `ship`, `from`, `to`, `sort`, `page`. Multi-select values can use comma-separated values if parsing is centralized.

### Pattern 4: App-Wide Status Tray as Navigation, Not Resolution
**What:** Status tray aggregates counts and safe actions, while local screens own detailed resolution.
**When to use:** Trello sync failures, backup/done refresh, COD import/apply issues.
**Implementation note:** Tray actions can navigate to `OrderListScreen` with query params such as `?sync=failed` or to COD review state. Do not clear failures or apply COD rows from the tray.

### Anti-Patterns to Avoid
- **Parsing Excel directly in React components:** Put parsing, normalization, matching, and review bucket logic in pure helpers with tests.
- **Mutating Redux during parse:** File parsing can fail or produce ambiguous matches. Mutate only after review/apply.
- **Treating file COD amount as authoritative without review:** Local order state remains business truth; amount mismatches need operator review.
- **Adding a broad import/export system:** Phase 4 import is COD settlement-specific.
- **Creating a full activity feed:** Status tray should surface actionable problems and safe checks, not every success event.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Excel workbook parsing | Manual ZIP/XML parsing or ad hoc binary parsing | SheetJS CE or equivalent mature workbook parser | `.xlsx` has workbook, sheet, cell type, date, and encoding edge cases. |
| Selector memoization | Custom cache layer | `createSelector` from RTK/reselect | Already installed and standard for derived Redux data. |
| Query param serialization | Repeated inline `URLSearchParams` parsing in components | Small local query helper plus `useSearchParams` | Keeps URL contract stable and testable. |
| COD review matching | Inline widget filters only | Pure helper returning review buckets | Review states need repeatable behavior and regression tests. |

**Key insight:** The risky parts are not visual rendering; they are deterministic data translation and avoiding silent business-state loss. Treat parsing/matching/apply as domain logic first, UI second.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Stale or Wrong SheetJS Package Source
**What goes wrong:** Implementation installs an old npm `xlsx` package and misses fixes or current docs.
**Why it happens:** SheetJS CE distribution has changed over time; official docs should be checked at implementation time.
**How to avoid:** Planner should require verifying the official SheetJS CE install command before adding the dependency.
**Warning signs:** `yarn add xlsx` installs a version that official SheetJS docs no longer describe as current.

### Pitfall 2: Header Names Drift Between Excel Exports
**What goes wrong:** Parser works for one COD file but fails when the carrier/export changes column names or order.
**Why it happens:** Parser binds directly to exact headers with no alias/mapping fallback.
**How to avoid:** Implement a known-format parser with header aliases plus column-mapping fallback when confidence is low.
**Warning signs:** Uploaded rows have many blank shipping codes or COD amounts despite visible data in preview.

### Pitfall 3: Duplicate Shipping Codes
**What goes wrong:** One file row applies to the wrong order, or duplicate rows mark the same order twice.
**Why it happens:** Matching assumes shipping code is unique in both file and app state.
**How to avoid:** Bucket duplicates explicitly for review before apply.
**Warning signs:** Review has multiple file rows for one shipping code or multiple orders with same non-empty shipping code.

### Pitfall 4: Amount Mismatch Auto-Apply
**What goes wrong:** COD paid state is marked even when file amount and local order COD amount disagree.
**Why it happens:** Parser treats shipping-code match as sufficient.
**How to avoid:** Exact match can be ready; amount mismatches require manual include/exclude or correction.
**Warning signs:** Imported COD amount differs from `order.codAmount` or net COD differs after shipping fee subtraction.

### Pitfall 5: List Query State Becomes Unshareable
**What goes wrong:** Search/filter controls appear to preserve context but URL does not fully encode it.
**Why it happens:** Some controls remain component state.
**How to avoid:** Define one query model and round-trip tests for parse/serialize.
**Warning signs:** Browser refresh, back, or returning from order detail loses page/filter/sort state.
</common_pitfalls>

<code_examples>
## Code Examples

### Browser Workbook Read Pattern
```typescript
// Source pattern: SheetJS CE browser docs. Verify current package install before implementation.
import {read, utils} from "xlsx";

export const parseWorkbookRows = async (file: File): Promise<Record<string, unknown>[]> => {
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer, {type: "array"});
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return utils.sheet_to_json<Record<string, unknown>>(worksheet, {defval: ""});
}
```

### URL Query Round Trip Pattern
```typescript
// Source pattern: React Router useSearchParams docs.
const [searchParams, setSearchParams] = useSearchParams();
const query = parseOrderListQuery(searchParams);

const updateQuery = (patch: Partial<OrderListQuery>) => {
    setSearchParams(serializeOrderListQuery({...query, ...patch, page: 1}));
}
```

### Selector Read Model Pattern
```typescript
// Source pattern: Redux/Reselect selector docs.
export const selectOrderListReadModel = createSelector(
    [selectOrders, selectCustomers, (_state: RootState, query: OrderListQuery) => query],
    (orders, customers, query) => buildOrderListReadModel(orders, customers, query)
);
```

### COD Review Bucket Pattern
```typescript
export type CodImportRowStatus = "matched" | "unmatched" | "duplicate" | "amount-mismatch" | "already-paid";

export type CodImportReviewRow = {
    rowNumber: number;
    shippingCode: string;
    fileCodAmount: number | null;
    fileShippingFee: number | null;
    matchedOrderId?: string;
    status: CodImportRowStatus;
    included: boolean;
}
```
</code_examples>

<validation_architecture>
## Validation Architecture

### Automated Coverage Strategy
- Unit tests for selector/read-model helpers: order list query parsing/serialization, broad order/customer text search, status/COD/shipping/date filters, sort orders, and list summary totals.
- Unit tests for dashboard/COD summary helpers: preserve existing totals from `DashboardScreen`, COD paid/unpaid/net amount calculations, and COD cycle totals.
- Unit tests for COD import helpers: known-format parser normalization, column-mapping fallback, duplicate detection, unmatched rows, amount mismatches, already-paid rows, include/exclude/manual resolution, and apply payload generation.
- Reducer/domain tests for applying confirmed COD import results: confirmed matches become `isPayCOD = true`, COD cycle includes confirmed payment/debit order IDs, unresolved rows do not mutate orders.
- Focused UI tests for COD upload/review and order-list query controls where helper tests cannot prove behavior.

### Manual/UAT Coverage Strategy
- Import a real COD Excel settlement file and confirm matched/problem buckets match operator expectations.
- Use a deliberately changed-column Excel file and confirm fallback column mapping can recover.
- Refresh order list URL after applying filters/sort/page and confirm the same view returns.
- Trigger sample Trello sync failure/backup/done status states and confirm status tray navigates to the right local resolution surface.

### Sampling Guidance
- After pure helper tasks, run targeted Jest tests for the helper module.
- After UI wiring tasks, run affected RTL tests plus `CI=true yarn test --watchAll=false` when practical.
- Before execution verification, run `CI=true yarn test --watchAll=false` and `yarn build`.
</validation_architecture>

<sota_updates>
## State of the Art (2024-2026)

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Render-time reductions in large React screens | Memoized selectors/read-model helpers | Easier focused tests and fewer repeated calculations. |
| Component-local list state only | URL-backed query state for operator lists | Refresh/back/share/return-to-list preserve context. |
| Hard-coded spreadsheet headers only | Known-format parser plus confidence checks and column-mapping fallback | Handles changed carrier/export formats without blocking the operator. |
| Global all-events feed | Compact actionable status summary plus local resolution surfaces | Better for repeated internal operations and mobile density. |

**New tools/patterns to consider:**
- Reselect 5 supports modern memoization APIs, but this phase can use standard `createSelector` unless profiling proves otherwise.
- Ant Design 5 Upload/Table/Alert/Tag components are sufficient for the COD import/review workflow; no new UI library is needed.

**Deprecated/outdated:**
- Hand-written `.xlsx` parsing and hidden local-only list state are inappropriate for this phase's data-safety and workflow-context requirements.
</sota_updates>

<open_questions>
## Open Questions

1. **Exact COD Excel headers and carrier-specific meaning**
   - What we know: The user has a real COD Excel file and wants known-format parsing first.
   - What is unclear: Exact column names, date/status conventions, whether shipping fee/debit fee is in the same file, and whether net COD or gross COD is exported.
   - Recommendation: Planner should include an implementation task that creates parser fixtures from a sanitized sample file or from documented header aliases. If no sample is available, implement the column-mapping fallback first enough to unblock review.

2. **COD apply cycle naming/date source**
   - What we know: Current cycle name is date-based and stored in `CodPaymentCycle`.
   - What is unclear: Whether imported file date should drive `cycleDate`/name or whether apply date should.
   - Recommendation: Default to apply date for cycle metadata unless file contains a clear settlement date; expose editable cycle name/date in review if low effort.

3. **Status tray route targets**
   - What we know: Tray should navigate and trigger safe checks only.
   - What is unclear: Whether sync failures should use a new query param such as `sync=failed` or a status preset.
   - Recommendation: Use URL-backed order-list query state so tray navigation reuses the same parser/serializer as list filters.
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- SheetJS CE documentation - browser workbook parsing, workbook read, and install caveat: `https://docs.sheetjs.com/`
- Ant Design Upload docs - file selection and controlled upload behavior: `https://ant.design/components/upload/`
- Ant Design Table docs - tabular review, row selection, pagination, and summary patterns: `https://ant.design/components/table/`
- React Router `useSearchParams` docs - URL query state hook: `https://reactrouter.com/`
- Redux docs, Deriving Data with Selectors - selector/read-model rationale: `https://redux.js.org/usage/deriving-data-selectors`
- Reselect `createSelector` docs - memoized selector API: `https://reselect.js.org/api/createselector/`

### Local Code (HIGH confidence)
- `package.json` - current dependencies include Ant Design, React Router, Redux Toolkit, reselect, lodash, moment/dayjs; no Excel parser yet.
- `src/Store/Reducers/OrderReducer.ts` - order/COD/sync state and existing `createSelector` usage.
- `src/Modules/Order/Screens/OrderList.screen.tsx` - current local filter/search state and list summary calculations.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentCreate.widget.tsx` - current manual COD cycle selection flow.
- `src/Routing/MasterPage.tsx` - existing backup/done status panel and floating action group.

### Secondary (MEDIUM confidence)
- General browser File API usage - stable platform API, but implementation details should be tested in Jest/jsdom where possible.
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: React 18, Redux Toolkit/reselect, React Router query params, Ant Design 5, browser Excel parsing.
- Ecosystem: SheetJS CE, Ant Design Upload/Table, Reselect selectors, local Redux/IndexedDB persistence.
- Patterns: normalize-match-review-apply, URL-backed list state, selector read models, compact operational status tray.
- Pitfalls: spreadsheet format drift, duplicate shipping codes, amount mismatch auto-apply, stale package source, hidden list state.

**Confidence breakdown:**
- Standard stack: HIGH for existing stack; MEDIUM for Excel parser package source until verified at implementation time.
- Architecture: HIGH - follows existing local-first browser app architecture and prior phase decisions.
- Pitfalls: HIGH - derived from local state risks and spreadsheet import failure modes.
- Code examples: MEDIUM - patterns are standard but must be adapted to TypeScript 4.9/CRA/Jest environment.

**Research date:** 2026-06-17
**Valid until:** 2026-07-17 for app architecture; verify SheetJS install/source at implementation time.
</metadata>

---

*Phase: 04-cod-search-and-operational-utilities*
*Research completed: 2026-06-17*
*Ready for planning: yes*
