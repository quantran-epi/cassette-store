# Phase 5: Cohesive UI/UX Refresh - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase gives the refactored app a single, coherent, mobile-native internal-operations interface. It fixes the visual mess introduced by recent feature phases — overflow, line-breaks, cramped layouts, and English labels where Vietnamese belongs — and replaces the ad-hoc inline theme with a token-driven visual system applied across shared components. It covers a cohesive type/spacing/color scale, mobile-native layouts for the dense order/COD/dashboard/customer surfaces, standardized loading/empty/error/success/confirmation states, and a dashboard organized around operational decisions.

This phase is NOT new business capability, backend migration, multi-user/auth work, public/customer-facing work, or a marketing-style redesign. It must preserve verified Phase 1–4 business behavior (backup/restore, local-first Trello sync recovery, COD import/apply, order/shipping workflows, URL-backed search/filters). UI is dense, fast, and built for repeated mobile operator use — not airy or decorative.

</domain>

<decisions>
## Implementation Decisions

### Language / Labels
- **D-01:** All operator-facing text MUST be Vietnamese. The app is Vietnamese-first (~95 files already use Vietnamese diacritics); recent Phase 4 widgets regressed to English and must be corrected.
- **D-02:** Known English-label offenders to fix include `OrderCodPaymentReview.widget.tsx` ("Matched", "Unmatched", "Duplicate", "Amount mismatch", "Already paid", "Needs review", "Payment row", "Manual resolve"). Planner should sweep Phase 4-touched surfaces for any other English operator-facing strings.
- **D-03:** Vietnamese strings stay **inline** in components, matching the existing convention. Do NOT introduce an i18n framework or extracted message catalog — that is a larger change out of scope here.

### Overflow & Density
- **D-04:** The primary fix for overflow/line-break/cramped layouts is a **lower base font plus a deliberate type scale**. The current global `fontSize: 18` in the inline `ConfigProvider` theme (`src/App.tsx`) is a prime cause of overflow on dense tables and should be reduced and replaced with a defined scale.
- **D-05:** When content still doesn't fit after the smaller font (long customer names, addresses, notes, shipping codes), **truncate with an on-tap reveal** (e.g., ellipsis + tap to expand/popover) rather than wrapping or letting it overflow. Keep rows single-height and scannable.

### Visual System Scope
- **D-06:** Build a **token-driven visual system**: define spacing, typography, color, density, and action-hierarchy tokens in one place and drive both the antd `ConfigProvider` theme and `src/Components/` primitives from them. Replace the inline ad-hoc theme in `src/App.tsx` and consolidate with `src/Hooks/useTheme.ts`.
- **D-07:** Shared `src/Components/` primitives (Card, Button, Typography, Tag, etc.) are the application surface for the system — refactor screens to consume tokenized primitives rather than one-off inline styles.

### Mobile Layout
- **D-08:** This app is **mobile-only**. There is no desktop layout requirement — all design and layout effort targets the phone. Do not maintain or build separate desktop table layouts.
- **D-09:** The dense table screens (order list, COD review/payment, dashboard, customer list) should be **rebuilt as mobile-native layouts** (stacked/card-style rows tuned for tap), NOT desktop tables squeezed onto a phone. Density stays high but everything must be tappable and readable.

### Claude's Discretion
- The planner may choose where the token module lives (new `theme/tokens` module vs. expanding `useTheme.ts`), the exact token names/values, and the type-scale steps.
- The planner may decide the exact mobile-native row/card component structure per screen and the truncate-reveal mechanism (popover vs. expand vs. detail nav), as long as it stays consistent across screens.
- The planner may sequence which screens convert first, but all in-scope surfaces (dashboard, customer list, order list, order actions, order creation, COD payment/review) must end coherent.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` — Internal-operator scope, brownfield continuity, "dense/clear/fast/mobile-friendly, not marketing redesign" UI direction, data-integrity constraints.
- `.planning/REQUIREMENTS.md` — Phase 5 requirements `UX-01` (cohesive visual system), `UX-02` (mobile dense-but-tappable), `UX-03` (workflow states), `UX-04` (decision-oriented dashboard), `UX-05` (preserve verified business behavior).
- `.planning/ROADMAP.md` — Phase 5 goal, success criteria, and planned work items `05-01` through `05-04`.
- `.planning/STATE.md` — Current project state and Phase 4 carry-forward context.
- `.planning/phases/04-cod-search-and-operational-utilities/04-CONTEXT.md` — Phase 4 surfaces (COD review, status tray, row actions) that introduced the English-label/overflow regressions this phase fixes; quiet-success/persistent-warning convention.
- `.planning/phases/03-fast-order-and-shipping-workflows/03-CONTEXT.md` — Fast order create and row-scoped shipping feedback to preserve visually.

### Codebase Maps
- `.planning/codebase/STACK.md` — React 18 + TS + CRACO/CRA + Ant Design stack and package constraints.
- `.planning/codebase/ARCHITECTURE.md` — App layers, screen/widget structure, Redux/IndexedDB source of truth, Trello integration surfaces.
- `.planning/codebase/CONVENTIONS.md` — `*.screen.tsx` / `*.widget.tsx` conventions, component patterns in `src/Components/`, inline-string convention.

### Source Files — Theme / System
- `src/App.tsx` — Inline `ConfigProvider` theme with `fontSize: 18` and ad-hoc tokens to replace with the token-driven system.
- `src/Hooks/useTheme.ts` — Existing theme hook to consolidate token usage into.
- `src/Components/` — Shared primitive library (Card, Button, Typography, Tag, Grid, etc.) to tokenize and reuse.
- `src/App.css`, `src/index.css` — Global styles to reconcile with the token system.

### Source Files — Screens to Refresh
- `src/Modules/Home/Screens/Dashboard.screen.tsx` — Dashboard metrics to reorganize around operational decisions (UX-04).
- `src/Modules/Customer/Screens/CustomerList.screen.tsx` — Customer list to convert to mobile-native layout.
- `src/Modules/Order/Screens/OrderList.screen.tsx` — Dense order list (search/filter/sort/summary) to rebuild mobile-native.
- `src/Modules/Order/Screens/OrderItem/OrderItem.widget.tsx` — Order row metadata/actions/tags/shipping affordances.
- `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx` — Order creation flow.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.tsx` — English-label offender + COD review buckets to relabel and mobile-native-ify.
- `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentList.screen.tsx` — COD cycle history/totals display.
- `src/Routing/MasterPage.tsx` — Floating controls + operational status tray placement on mobile.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/Components/` already provides a primitive library (Card, Button, Typography, Tag, Grid, Layout, etc.) — the natural home for the token-driven system rather than building new primitives.
- `src/Hooks/useTheme.ts` exists and can centralize token access.
- `src/App.tsx` `ConfigProvider` is the single antd theme entry point — one place to swap the ad-hoc tokens for the scale.

### Established Patterns
- Vietnamese-first inline strings (~95 files); inline (not extracted) is the convention to match.
- `*.screen.tsx` for routed screens, `*.widget.tsx` for nested flow components; local Ant Design wrappers in `src/Components/`.
- Quiet success, persistent warnings only when the operator must act (carry into standardized state styling).
- Redux/IndexedDB remain source of truth; this phase is visual/layout only and must not change business state behavior.

### Integration Points
- antd `ConfigProvider` token theme → all antd-based components and `src/Components/` wrappers.
- Each in-scope screen consumes tokenized primitives; mobile-native row/card components replace squeezed tables.

</code_context>

<specifics>
## Specific Ideas

- Root cause hypothesis for the overflow mess: global `fontSize: 18` on dense tables. Reduce base font and introduce a real type scale first, then truncate-with-reveal for remaining long fields.
- The app is used on mobile only — treat the phone as the only target, not a fallback.
- Fix the English-label regression in Phase 4 COD widgets as part of the cohesive sweep (Vietnamese everywhere).

</specifics>

<deferred>
## Deferred Ideas

- i18n framework / extracted message catalog — explicitly out of scope; keep strings inline this milestone.
- Desktop-optimized layouts — out of scope; mobile-only.

None other — discussion stayed within phase scope.

</deferred>

---

*Phase: 5-Cohesive UI/UX Refresh*
*Context gathered: 2026-06-17*
