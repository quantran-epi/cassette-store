# Phase 4: COD, Search, and Operational Utilities - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-17
**Phase:** 4-COD, Search, and Operational Utilities
**Areas discussed:** Selectors + Search, COD Cycles, Actions + Alerts

---

## Selectors + Search

### Selector Foundation Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 4 read models | Move dashboard totals, order-list filtered/sorted results, list summary totals/counts, and COD eligible-order/totals logic into tested selectors/helpers. | Yes |
| Dashboard/list only | Extract dashboard totals and order-list filtering/summaries, but leave COD cycle calculations inside COD widgets. | |
| Minimal cleanup | Only move existing `useOrder.getTotal*` dashboard helpers out of `useOrder`; keep most screen reductions. | |

**User's choice:** Phase 4 read models.
**Notes:** This locks `ORD-04` as a foundation for the rest of Phase 4, not only a dashboard cleanup.

### List Context Retention

| Option | Description | Selected |
|--------|-------------|----------|
| URL-backed list state | Keep search, filters, sort, and page in route query params so refresh/back/return-to-list restores context. | Yes |
| Persisted app state | Store list filters/sort/page in Redux or local storage across sessions. | |
| Component state only | Improve filters/sort but accept reset on navigation or refresh. | |

**User's choice:** URL-backed list state.
**Notes:** Avoid adding persisted Redux state for list UI state.

### Search Fields

| Option | Description | Selected |
|--------|-------------|----------|
| Operational broad search | Match order name, shipping code, customer name, phone, address/province, note, and important text. | Yes |
| Order fields only | Match order name, shipping code, order note, and important text. | |
| Exact workflow search | Prioritize exact shipping code, phone, and order name matches first. | |

**User's choice:** Operational broad search.
**Notes:** Requires order/customer joined read models.

### Sort and Filters

| Option | Description | Selected |
|--------|-------------|----------|
| Status, COD, shipping, customer, date, sort | First-class controls for status, COD state, shipping-code state, customer-backed search, date range, and sort by newest/oldest/priority/amount/COD. | Yes |
| Status + COD + date only | Keep controls compact with status, COD state, date range, and newest/oldest sort. | |
| Presets first | Provide operational presets with fewer manual controls. | |

**User's choice:** Status, COD, shipping, customer, date, sort.
**Notes:** The user selected the broad utility set.

---

## COD Cycles

### Cycle Input Model

| Option | Description | Selected |
|--------|-------------|----------|
| Review-first batch builder | Use searchable lists, running totals, selected counts, and review panel before saving. | |
| Keep tabs, add totals | Preserve current two-tab select flow but add totals/counts. | |
| Preset-based selection | Start with all unpaid shipped COD and uncollected shipping fees, then remove exceptions. | |
| COD Excel import | Import COD Excel file, parse data, review results, then apply. | Yes |

**User's choice:** COD Excel import.
**Notes:** User clarified that COD data comes from an Excel file and wants the app to parse it, show results for review, then apply.

### File Format Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Known carrier/export format | Build around the real COD Excel structure: match by shipping code, read COD amount/status/date, detect fees, and show matched/unmatched rows. | Yes |
| App-defined template | Require a fixed simple app template. | |
| Column mapping step | Ask the operator to map columns every time or when needed. | |

**User's choice:** Known carrier/export format.
**Notes:** User also raised an edge case: the Excel file may change format, or a different format may appear.

### Format Fallback

| Option | Description | Selected |
|--------|-------------|----------|
| Column mapping + row review | Let the operator map shipping code, COD amount, shipping fee, status/date columns, then review matched/problem rows. | Yes |
| Manual row matching only | Parse what can be parsed, then manually match unmatched rows. | |
| Reject unknown format with editable preview | Show parsed table/errors and require later support before applying. | |

**User's choice:** Column mapping + row review.
**Notes:** Manual fallback is required for changed or additional Excel formats.

### Apply Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Apply confirmed matches only | Create a COD cycle, mark confirmed matched paid COD orders, include confirmed debit shipping fees, and leave unresolved rows unchanged. | Yes |
| Create cycle only | Save the COD cycle but do not mark orders as paid COD automatically. | |
| Auto-apply exact matches | Apply exact matches automatically and only review problem rows. | |

**User's choice:** Mark matched orders as paid COD and allow manual update of other rows.
**Notes:** Confirmed matches should mark `isPayCOD`; unresolved rows remain available for manual update/resolution.

### Review Buckets

| Option | Description | Selected |
|--------|-------------|----------|
| Matched, unmatched, duplicate, amount mismatch, already paid | Show explicit review buckets with include/exclude/manual resolve controls. | Yes |
| Matched vs needs review | Use two groups with row details. | |
| Spreadsheet-style editable table | Use one editable table with status chips and inline corrections. | |

**User's choice:** Matched, unmatched, duplicate, amount mismatch, already paid.
**Notes:** Explicit row states are required for review before apply.

---

## Actions + Alerts

### Order Action Surface

| Option | Description | Selected |
|--------|-------------|----------|
| State-aware row action surface | Promote the most relevant next action for each order state, group secondary actions, and confirm dangerous actions. | Yes |
| Keep dropdowns, reorganize labels | Preserve current menus but improve order/grouping and disabled reasons. | |
| Global command sheet | Add a larger quick-action panel from the order list. | |

**User's choice:** State-aware row action surface.
**Notes:** This refines the current row pattern without pulling in a new global command workflow.

### Operational Status Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Only actionable problems + key checks | Show Trello sync failures, backup status, done-order refresh status, and COD import/apply issues. | Yes |
| Full operations feed | Show a running feed of all operational events. | |
| Current backup/done panel plus sync count | Extend the existing panel only with sync count. | |

**User's choice:** Only actionable problems + key checks.
**Notes:** Normal success should stay quiet or compact.

### Status Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Compact status tray + local row/screen details | Use an app-wide tray for counts/issues and local details for actions. | Yes |
| Dedicated status page | Add a route for all alerts and history. | |
| Header strip | Put status chips in the top header. | |

**User's choice:** Compact status tray + local row/screen details.
**Notes:** Tray should live near existing floating controls.

### Tray Actions

| Option | Description | Selected |
|--------|-------------|----------|
| Navigate + trigger safe checks | Navigate to filtered orders/COD review, run backup/done refresh, and show counts. | Yes |
| Full inline resolution | Retry/clear failures and apply COD rows directly from tray. | |
| Read-only summary | Only summarize counts/status. | |

**User's choice:** Navigate + trigger safe checks.
**Notes:** Destructive or manual resolution actions stay on local rows/screens.

## Agent's Discretion

- Exact selector/helper module split and file names.
- Exact Excel parsing library and parser architecture.
- Exact component split and mobile placement for the status tray and state-aware row action surface, within the Phase 4 utility-first boundary.

## Deferred Ideas

- General order/customer import-export remains a future capability; Phase 4 COD import is scoped specifically to COD settlement review and cycle application.
- Full visual-system and mobile UI refresh remains Phase 5 scope.
- Backend database, authentication, collaboration, public storefront, and external order-status workflows remain v2/out-of-scope for this milestone.
