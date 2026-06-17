# Phase 5: Cohesive UI/UX Refresh - Research

**Researched:** 2026-06-17
**Domain:** Mobile-first design-system refactor on Ant Design 5 (React 18 + TypeScript + CRACO/CRA)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** All operator-facing text MUST be Vietnamese. The app is Vietnamese-first (~95 files already use Vietnamese diacritics); recent Phase 4 widgets regressed to English and must be corrected.
- **D-02:** Known English-label offenders to fix include `OrderCodPaymentReview.widget.tsx` ("Matched", "Unmatched", "Duplicate", "Amount mismatch", "Already paid", "Needs review", "Payment row", "Manual resolve"). Planner should sweep Phase 4-touched surfaces for any other English operator-facing strings.
- **D-03:** Vietnamese strings stay **inline** in components, matching the existing convention. Do NOT introduce an i18n framework or extracted message catalog — that is a larger change out of scope here.
- **D-04:** The primary fix for overflow/line-break/cramped layouts is a **lower base font plus a deliberate type scale**. The current global `fontSize: 18` in the inline `ConfigProvider` theme (`src/App.tsx`) is a prime cause of overflow on dense tables and should be reduced and replaced with a defined scale.
- **D-05:** When content still doesn't fit after the smaller font (long customer names, addresses, notes, shipping codes), **truncate with an on-tap reveal** (e.g., ellipsis + tap to expand/popover) rather than wrapping or letting it overflow. Keep rows single-height and scannable.
- **D-06:** Build a **token-driven visual system**: define spacing, typography, color, density, and action-hierarchy tokens in one place and drive both the antd `ConfigProvider` theme and `src/Components/` primitives from them. Replace the inline ad-hoc theme in `src/App.tsx` and consolidate with `src/Hooks/useTheme.ts`.
- **D-07:** Shared `src/Components/` primitives (Card, Button, Typography, Tag, etc.) are the application surface for the system — refactor screens to consume tokenized primitives rather than one-off inline styles.
- **D-08:** This app is **mobile-only**. There is no desktop layout requirement — all design and layout effort targets the phone. Do not maintain or build separate desktop table layouts.
- **D-09:** The dense table screens (order list, COD review/payment, dashboard, customer list) should be **rebuilt as mobile-native layouts** (stacked/card-style rows tuned for tap), NOT desktop tables squeezed onto a phone. Density stays high but everything must be tappable and readable.

### Claude's Discretion
- The planner may choose where the token module lives (new `theme/tokens` module vs. expanding `useTheme.ts`), the exact token names/values, and the type-scale steps.
- The planner may decide the exact mobile-native row/card component structure per screen and the truncate-reveal mechanism (popover vs. expand vs. detail nav), as long as it stays consistent across screens.
- The planner may sequence which screens convert first, but all in-scope surfaces (dashboard, customer list, order list, order actions, order creation, COD payment/review) must end coherent.

### Deferred Ideas (OUT OF SCOPE)
- i18n framework / extracted message catalog — explicitly out of scope; keep strings inline this milestone.
- Desktop-optimized layouts — out of scope; mobile-only.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UX-01 | Refactored screens use a cohesive internal-operations visual system with consistent spacing, typography, colors, and action hierarchy. | "Standard Stack" (antd v5 token system), "Pattern 1" (token module driving ConfigProvider), "Pattern 2" (tokenized primitives). Tokens centralize spacing/type/color/action hierarchy in one place. |
| UX-02 | Mobile layouts for dashboard, customer list, order list, order detail/actions, order creation, and COD payment remain dense but tappable and readable. | "Pattern 3" (mobile-native card rows via antd List, not Table), "Pattern 4" (truncate-with-reveal via Typography.Text ellipsis + Popover), `compactAlgorithm` + reduced base font for density. |
| UX-03 | Primary operator workflows expose expected loading, empty, error, success, and confirmation states. | "Pattern 5" (standardized state components: Spin, Empty, Result, Alert, Popconfirm, Message), "Validation Architecture" maps states to tests. Existing primitives already wrap all five. |
| UX-04 | Dashboard metrics are organized around operational decisions, not just raw totals. | "Pattern 6" (decision-grouped dashboard reading from `selectDashboardReadModel`), preserves selector behavior (UX-05). |
| UX-05 | Existing business behavior remains available after UI refresh unless explicitly replaced by a better verified workflow. | "Common Pitfalls" (behavior-preservation regression), "Runtime State Inventory" (visual-only, no data/state changes), "Validation Architecture" (full suite green as phase gate). |
</phase_requirements>

## Project Constraints (from AGENTS.md)

`config.json.claude_md_path` points to `./AGENTS.md` (there is no `./CLAUDE.md`). Actionable directives extracted:

- **Deployment workflow:** When asked to deploy, follow `docs/deployment.md` — `yarn build`, copy `build/*` into `docs/` (except `build/manifest.json`), then `git add ./src/*`, `git add ./docs/*`, `git push`. (Deployment is not part of this phase's implementation, but build output lives in `docs/` and is tracked in git.)
- **Brownfield continuity:** Preserve existing customer, order, COD, Trello, and backup workflows while refactoring. Do not freeze the app for a rewrite.
- **Internal-tool scope:** External-user/public-hosting work is out of scope.
- **Data integrity:** Order state, customer state, COD cycles, done-order IDs, and Trello card IDs must survive refactors without silent loss. This phase is visual-only and must not touch state shape.
- **Static deployment shape:** Committed `docs/` build output and `/cassette-store` routing; deployment changes must be deliberate and verified.
- **Testing baseline:** Keep reducer/helper/Trello-sync coverage green before broad changes.

> Note: AGENTS.md (sourced partly from PROJECT.md) still says "internal operators using the app repeatedly on mobile and desktop." CONTEXT.md D-08 **supersedes** this for Phase 5: treat the target as **mobile-only**. The planner should follow D-08.

## Summary

Phase 5 is a **visual/layout refactor inside the existing Ant Design 5.16.1 stack** — no new runtime dependencies, no backend, no state-shape changes. The work is: (1) replace the ad-hoc inline `ConfigProvider` theme in `src/App.tsx` (which hard-codes `fontSize: 18` plus three colors) with a centralized token module that defines a real type/spacing/color/density scale; (2) consolidate token access through `src/Hooks/useTheme.ts` (currently just a re-export of antd's `theme.useToken`); (3) tokenize the shared `src/Components/` primitives so screens stop using one-off inline styles; (4) rebuild the dense table-style screens as mobile-native stacked/card rows with truncate-with-reveal for long fields; (5) standardize loading/empty/error/success/confirmation states using the primitives that already wrap antd's `Spin`/`Empty`/`Result`/`Alert`/`Popconfirm`/`Message`; and (6) reorganize the dashboard around operational decisions while preserving the verified `selectDashboardReadModel` selector behavior. A cross-cutting requirement (D-01/D-02) is sweeping Phase 4 COD widgets for English labels and restoring Vietnamese.

Everything needed is already in the dependency tree. Ant Design v5's token system is the correct, idiomatic vehicle for D-06: `SeedToken` (e.g. `fontSize`, `colorPrimary`, `borderRadius`, `controlHeight`) cascades into derived component tokens, `theme.components` allows per-component overrides, and `compactAlgorithm` provides density tuning. `theme.useToken()` (already aliased as `useTheme`) is the runtime consumer for `src/Components/` primitives. The biggest risk is **behavior preservation (UX-05)**: the screens being rebuilt (`OrderList`, `Dashboard`, `OrderCreate`, COD widgets) wire into Redux selectors, URL-backed query state (`OrderListQueryHelper`), and Trello sync flows that have test coverage. The plan must rebuild presentation while keeping those wirings and tests green.

**Primary recommendation:** Create a single `src/theme/tokens.ts` (plain TS constants) that is the one source of truth for the type scale, spacing scale, color palette (folding in the existing `COLORS` and craco Less `@primary-color: #f58220`), border radius, and `controlHeight`. Feed it into a `buildAppTheme()` that returns the antd `ThemeConfig` (`token` + `components` + `algorithm: [defaultAlgorithm, compactAlgorithm]`) consumed by `ConfigProvider` in `src/App.tsx`, and expose the same constants to `src/Components/` via `useTheme`. Then convert screens one at a time to mobile-native `List`-based card rows with `Typography.Text ellipsis` + `Popover` reveal, keeping every existing selector/handler wiring intact.

## Architectural Responsibility Map

This is a client-only SPA. "Tiers" here are the app's internal layers (per ARCHITECTURE.md), not network tiers.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Design tokens (type/spacing/color/density) | App Shell (`src/App.tsx` ConfigProvider) + new `src/theme/` | Shared UI (`src/Components/`) | Theme is configured once at the root; primitives consume tokens at render via `useToken`. |
| Token-driven primitives (Card, Button, Typography, Tag) | Shared UI (`src/Components/`) | — | Primitives are the application surface for the system (D-07); screens consume them. |
| Mobile-native list/card layouts | Feature Modules (`src/Modules/**/Screens`) | Shared UI primitives | Layout structure is screen-specific; built from shared primitives. |
| Workflow states (loading/empty/error/success/confirm) | Shared UI (`Spin`/`Empty`/`Result`/`Alert`/`Popconfirm`/`Message`) | Feature Modules (state selection logic) | Primitives render the states; screens decide which state applies from Redux/async status. |
| Dashboard metric organization | Feature Modules (`Dashboard.screen.tsx`) | State Layer (`selectDashboardReadModel`) | Presentation reorganizes; derived values stay in the existing memoized selector (UX-05). |
| Vietnamese label correction | Feature Modules (inline strings, D-03) | — | Strings stay inline in components; no extraction layer. |
| Business state, Trello sync, persistence | State Layer / Domain Hooks | — | **Out of scope for visual changes** — must remain untouched (UX-05, data-integrity constraint). |

**Why this matters:** The single most common way a "UI refresh" phase breaks things is by moving business logic into the view while reorganizing it. The boundary here is firm: this phase touches the App Shell theme, Shared UI primitives, and the presentation layer of Feature Modules. It must NOT touch the State Layer, Domain Hooks (`useOrder`, `useTrello`), selectors, or query helpers except to consume them.

## Standard Stack

This phase introduces **no new packages**. It uses what is already installed. Versions verified against `package.json` and `yarn.lock` in the repo.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `antd` | 5.16.1 | Theme token system (`ConfigProvider`, `theme.useToken`, algorithms), all UI primitives | Already the app's component foundation; v5 token system is the idiomatic way to build a design system [CITED: ant.design/docs/react/customize-theme] |
| `react` / `react-dom` | 18.2.0 | View layer | Existing |
| `typescript` | 4.9.5 | Types (strict mode OFF per tsconfig) | Existing |
| `@craco/craco` + `craco-less` | 7.1.0 / 3.0.1 | Webpack/Less overrides; antd Less vars in `craco.config.js` | Existing build tooling |
| `@ant-design/icons` | (in tree) | Icons for action hierarchy and state affordances | Existing |

### Supporting (already present, relevant to this phase)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lodash` | 4.17.21 | `debounce` for search inputs, comparisons | Already used in screens; reuse for any reveal/scroll debouncing |
| `moment` | 2.30.1 | Date formatting on dashboard/lists | Already used; do NOT introduce dayjs migration in this phase (out of scope) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| antd `theme.components` + token module | A separate CSS-in-JS lib (styled-components/emotion) | Adds a dependency and a parallel styling system; antd v5 already ships CSS-in-JS internally and a token API. Rejected — violates "no new framework" spirit and brownfield continuity. |
| antd `List` card rows | antd `Table` with responsive columns | D-09 explicitly forbids squeezing desktop tables onto phones. Rejected. |
| `compactAlgorithm` + smaller `fontSize` seed | Hand-tuned per-component padding everywhere | Algorithm derives consistent spacing from seed tokens automatically; hand-tuning is the current ad-hoc mess. Use the algorithm. |
| New `src/theme/tokens.ts` module | Expand `src/Hooks/useTheme.ts` only | Both are valid (Claude's discretion). A dedicated module keeps non-React token constants importable by `buildAppTheme()` and craco without React. Recommended but not mandated. |

**Installation:** None. `yarn install` already satisfies all needs.

**Version verification:** `antd` resolved version confirmed as `5.16.1` via `node -p "require('antd/package.json').version"` in repo. The antd v5 token API (`theme.components[X].algorithm`, available `>= 5.8.0`) is supported at 5.16.1 [CITED: ant.design/docs/react/customize-theme].

## Package Legitimacy Audit

**Not applicable.** This phase installs zero external packages. All libraries used (`antd`, `react`, `lodash`, `moment`, `@ant-design/icons`) are pre-existing, locked in `yarn.lock`, and were vetted during prior phases. No `npm install` / `yarn add` step should appear in any Phase 5 plan. If a plan proposes adding a package, that is a scope violation and should be flagged.

## Architecture Patterns

### System Architecture Diagram

Token + render data flow for this phase (conceptual, not file listing):

```text
src/theme/tokens.ts  (single source of truth: type scale, spacing, colors, radius, controlHeight)
        |
        |  imported by
        v
buildAppTheme() ----> ThemeConfig { token, components, algorithm:[default, compact] }
        |                                   |
        v                                   |
src/App.tsx <ConfigProvider theme=...>      |  (also re-exported for craco Less parity)
        |                                   |
        |  provides token context           |
        v                                   v
src/Hooks/useTheme.ts (theme.useToken) <----+
        |
        |  consumed by
        v
src/Components/ primitives (Card, Button, Typography, Tag, ...)  -- tokenized, no inline magic numbers
        |
        |  composed into
        v
Feature screens (OrderList, Dashboard, CustomerList, OrderCreate, COD widgets)
        |
        |  mobile-native List card rows + truncate-with-reveal
        |  read-only consumption of:
        v
Redux selectors (selectDashboardReadModel, selectOrderListReadModel) + URL query (OrderListQueryHelper)
        |
        v
[UNCHANGED] Redux store / IndexedDB / Trello sync  <-- this phase must NOT modify
```

A reader can trace: tokens define the system -> theme config applies it at the root -> primitives consume tokens -> screens compose primitives into mobile card rows -> screens read existing selectors/query state without changing them.

### Recommended Project Structure
```text
src/
├── theme/                      # NEW (recommended) — single source of truth
│   ├── tokens.ts               # type scale, spacing, palette, radius, controlHeight (plain TS)
│   └── buildAppTheme.ts        # tokens -> antd ThemeConfig (token + components + algorithm)
├── Hooks/
│   └── useTheme.ts             # consolidate: re-export useToken AND expose tokens module
├── Components/                 # tokenize existing primitives (Card, Button, Typography, Tag, ...)
│   └── ... (existing)
└── Modules/
    ├── Home/Screens/Dashboard.screen.tsx          # reorganize around decisions (UX-04)
    ├── Customer/Screens/CustomerList.screen.tsx   # mobile-native cards
    └── Order/Screens/
        ├── OrderList.screen.tsx                   # mobile-native cards, keep URL query wiring
        ├── OrderItem/OrderItem.widget.tsx         # row metadata/actions/tags
        ├── OrderCreate/OrderCreate.screen.tsx     # tokenized form layout
        └── OrderCodPayment/OrderCodPaymentReview.widget.tsx  # Vietnamese labels + mobile cards
```

### Pattern 1: Centralized token module driving ConfigProvider
**What:** One module exports the design tokens as plain constants. `buildAppTheme()` maps them into an antd `ThemeConfig`. `App.tsx` passes that into `ConfigProvider`. This replaces the inline `{ token: { fontSize: 18, colorPrimary: ... } }` object.
**When to use:** UX-01, D-06. The foundation task for the whole phase.
**Example:**
```typescript
// Source pattern: ant.design/docs/react/customize-theme (SeedToken + components + algorithm)
// src/theme/buildAppTheme.ts
import { theme, type ThemeConfig } from "antd";
import { tokens } from "./tokens";

export const buildAppTheme = (): ThemeConfig => ({
    algorithm: [theme.defaultAlgorithm, theme.compactAlgorithm], // density for mobile
    token: {
        colorPrimary: tokens.color.primary,          // #f58220 (matches craco Less @primary-color)
        colorLink: tokens.color.link,                // #3d4195
        colorBorderSecondary: tokens.color.border,   // #d9d9d9
        fontSize: tokens.font.base,                  // reduced from 18 -> e.g. 14/15 (planner picks)
        borderRadius: tokens.radius.base,
        controlHeight: tokens.control.height,        // keep taps >= 44px effective target
    },
    components: {
        // per-component overrides only where the algorithm default isn't enough
        Card: { paddingLG: tokens.space.md },
        List: { padding: tokens.space.sm },
    },
});
```
```typescript
// src/App.tsx (replacement for the inline theme object)
<ConfigProvider theme={buildAppTheme()}>
   ...providers...
</ConfigProvider>
```

### Pattern 2: Tokenized primitives via useToken
**What:** `src/Components/` wrappers read tokens at render through `theme.useToken()` (already aliased as `useTheme`) instead of hard-coding numbers like `Card`'s `borderRadius: 10` / `boxShadow`.
**When to use:** UX-01, D-07. After Pattern 1 lands.
**Example:**
```typescript
// Source pattern: ant.design/docs/react/customize-theme (theme.useToken consumer)
import { theme } from "antd";
const { token } = theme.useToken();
// inside a primitive:
const style = { borderRadius: token.borderRadius, padding: token.padding };
```
> Current `src/Components/Card/Card.tsx` hard-codes `borderRadius: 10` and pulls shadow from `AppShadow`. Migrate the magic numbers to tokens; `AppShadow` can become part of `tokens.ts` (`tokens.shadow.card`).

### Pattern 3: Mobile-native card rows (List, not Table)
**What:** Render dense lists as `List` with `renderItem` producing a stacked card per record, using `Stack` (the existing flex wrapper) for layout. Keep rows single-height (D-05).
**When to use:** UX-02, D-09. Order list, COD review, customer list, dashboard sections.
**Example:**
```typescript
// Existing primitive: src/Components/List wraps antd List; Stack wraps antd Space as flexbox
<List
  dataSource={items}
  locale={{ emptyText: <Empty description="Không có đơn hàng" /> }} // Vietnamese empty state
  renderItem={(order) => (
    <List.Item>
      <Stack direction="column" align="stretch" fullwidth gap={4}>
        {/* primary line: name + status tag */}
        {/* secondary line: truncate-with-reveal fields */}
        {/* action row: contextual buttons (action hierarchy) */}
      </Stack>
    </List.Item>
  )}
/>
```

### Pattern 4: Truncate-with-reveal for long fields
**What:** Long customer names, addresses, notes, shipping codes use `Typography.Text` with `ellipsis` and an on-tap reveal (Popover or `ellipsis={{ tooltip }}`/expandable). Keep consistent across screens (Claude's discretion on exact mechanism).
**When to use:** UX-02, D-05.
**Example:**
```typescript
// antd Typography supports ellipsis with tooltip and expandable reveal
import { Typography } from "@components/Typography"; // = antd Typography
<Typography.Text ellipsis={{ tooltip: fullAddress }}>{fullAddress}</Typography.Text>
// or tap-to-expand:
<Typography.Paragraph ellipsis={{ rows: 1, expandable: true, symbol: "xem thêm" }}>
  {longNote}
</Typography.Paragraph>
```
> Note: a hover `tooltip` is weak on touch devices. For a true on-tap reveal prefer the existing `Popover` primitive (tap to open) or `expandable` text. Pick one mechanism and use it everywhere.

### Pattern 5: Standardized workflow states
**What:** Five states map to existing primitives. Use them consistently per screen.
**When to use:** UX-03.

| State | Primitive (already wrapped) | antd source |
|-------|------------------------------|-------------|
| Loading | `Spin` (`src/Components/Spin`) | antd Spin |
| Empty | `Empty` (`src/Components/Empty`) with Vietnamese `description` | antd Empty |
| Error | `Result` (`src/Components/Result`) status="error" or `Alert` type="error" | antd |
| Success | quiet `Message` (`useMessage()`) — per Phase 4 "quiet success" convention | antd message |
| Confirmation | `Popconfirm` (`src/Components/Popconfirm`) for destructive/irreversible actions | antd |

> Carry forward Phase 4 convention (CONTEXT.md code_context): **quiet success, persistent warnings only when the operator must act.** Bake this into the standardized state styling.

### Pattern 6: Decision-oriented dashboard
**What:** Reorganize `Dashboard.screen.tsx` so metrics are grouped by the decision they inform (e.g., "needs action today", "COD to reconcile", "shipping pending") rather than a flat totals tab. **Read from the existing `selectDashboardReadModel` selector** — do not recompute in the view.
**When to use:** UX-04, UX-05.
> The dashboard already consumes `selectDashboardReadModel` (memoized selector). UX-04 is a presentation reorganization; the derived values must keep coming from the selector to preserve verified behavior (UX-05, ORD-04 from Phase 4).

### Anti-Patterns to Avoid
- **Squeezing tables onto phones:** Do not respond to mobile with horizontal scroll tables. Use `List`/card rows (D-09).
- **Recomputing dashboard/order-list derived values in the view:** Selectors (`selectDashboardReadModel`, `selectOrderListReadModel`) already exist. Recomputing risks divergence from verified behavior (UX-05).
- **Wrapping long text or letting it overflow:** Use truncate-with-reveal; keep rows single-height (D-05).
- **Per-screen inline magic numbers:** Once tokens exist, screens must consume tokens/primitives, not re-introduce `fontSize: 18`, `padding: 12`, `borderBottom: "1px solid #d9d9d9"` ad hoc (the COD widget currently does exactly this).
- **Touching state shape / selectors / Trello logic for a visual change:** Hard boundary (UX-05, data-integrity constraint).
- **Introducing an i18n framework or a new styling library:** Out of scope (D-03, brownfield continuity).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Design-token cascade (spacing/type/color derivation) | A custom theming context + CSS var generator | antd v5 `ConfigProvider` token + `theme.components` + algorithms | antd derives map/alias tokens from seeds automatically; reinventing it duplicates the framework [CITED: ant.design/docs/react/customize-theme] |
| Density tuning | Hand-tuned padding per component | `theme.compactAlgorithm` | Algorithm derives consistent compact spacing from seed tokens |
| Text truncation + reveal | Custom JS measuring text width | `Typography.Text ellipsis` / `Typography.Paragraph ellipsis={{expandable}}` + `Popover` | antd handles measurement, resize, and reveal |
| Empty/loading/error/result states | Custom placeholder components | `Empty` / `Spin` / `Result` / `Alert` (already wrapped) | Already in `src/Components/`; consistent and accessible |
| Confirmation dialogs | Custom modal state machine | `Popconfirm` / `Modal.confirm` (already wrapped) | Standard, accessible, keyboard-friendly |
| Responsive grid | Custom media-query CSS | antd `Grid` (`Row`/`Col`) already imported, or `Stack` flex wrapper | Already in use across screens |

**Key insight:** Every primitive this phase needs already exists in `src/Components/` as a thin antd wrapper. The phase is about **consistent consumption of existing primitives driven by central tokens**, not building new UI machinery. The risk is over-engineering a bespoke theme system when antd's token API already does the job.

## Runtime State Inventory

This phase involves a string sweep (English -> Vietnamese, D-01/D-02) and replacing the inline theme, so a runtime-state check applies. However, the changes are **presentation-only** — no stored keys, IDs, or persisted values change.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — Vietnamese labels are display strings, not stored keys. COD bucket keys (`matched`, `unmatched`, etc.) are internal enum values typed as `CodImportReviewBucket`; only their **display labels** (`BUCKET_LABELS`) change, not the keys. Redux/IndexedDB shape untouched. | Code edit only (relabel display maps). Verify enum keys/values are NOT renamed. |
| Live service config | None — no service registers any of these UI strings. Trello list/label IDs live in `useTrello.ts` and are out of scope. | None — verified by scope (visual layer only). |
| OS-registered state | None — browser SPA, no OS registrations. | None. |
| Secrets/env vars | None — no env var names reference UI labels or theme tokens. | None. |
| Build artifacts | `docs/` contains the committed production build (per AGENTS.md / STACK.md). After UI changes it will be **stale** until a rebuild+deploy. Phase 5 implementation does not deploy; deploy is a separate AGENTS.md workflow. | None during implementation. Flag: a deploy (rebuild `docs/`) is needed post-phase for changes to reach the hosted app. |

**The canonical question — after every file is updated, what runtime systems still hold the old strings?** Only the committed `docs/` build (stale until rebuilt). No databases, services, or OS state store these UI strings.

## Common Pitfalls

### Pitfall 1: Business-behavior regression during presentation rebuild (UX-05)
**What goes wrong:** Rebuilding `OrderList`/`Dashboard`/`OrderCreate`/COD widgets as card layouts accidentally drops a handler, a selector wiring, or URL-query sync — breaking search/filter/sort, order creation pricing, or COD apply.
**Why it happens:** Replacing JSX structure tempts wholesale rewrites that lose event handlers and prop wiring.
**How to avoid:** Treat each screen as "re-skin, keep wiring." Keep the same selectors (`selectOrderListReadModel`, `selectDashboardReadModel`), the same `OrderListQueryHelper` URL serialization, the same submit/handler calls into `useOrder`. Run the existing test suite (see Validation Architecture) after each screen.
**Warning signs:** A test in `OrderListQueryHelper.test.ts`, `OrderCreate.screen.test.tsx`, `OrderDomainHelper.test.ts`, or `useOrder.test.ts` goes red; URL no longer reflects filters; COD apply button enable/disable logic changes.

### Pitfall 2: Reducing base font breaks layouts that assumed 18px
**What goes wrong:** Dropping `fontSize` from 18 fixes overflow but can leave hard-coded paddings, fixed `minWidth`s (e.g. the COD `Select` `minWidth: 260`), and line-heights looking wrong.
**Why it happens:** Inline magic numbers were tuned for 18px.
**How to avoid:** When lowering the seed font, sweep for hard-coded sizes in touched screens and move them to tokens. Let `compactAlgorithm` handle spacing rather than re-tuning by hand.
**Warning signs:** Buttons/inputs look oversized relative to text; fixed-width selects overflow narrow phones.

### Pitfall 3: Hover tooltips don't work on touch
**What goes wrong:** Using `Typography ellipsis={{ tooltip }}` for the reveal — tooltips trigger on hover, which is unreliable on phones (D-08 is mobile-only).
**Why it happens:** Tooltip is the easiest ellipsis reveal API.
**How to avoid:** Use a tap-triggered `Popover` or `expandable` paragraph for the on-tap reveal (D-05).
**Warning signs:** Long fields can't be revealed by tapping on a real device.

### Pitfall 4: Less vars and JS tokens drift apart
**What goes wrong:** `craco.config.js` sets Less `@primary-color: #f58220`, `@primary-fade`, `@text-color` independently of the JS `ConfigProvider` token. Changing one but not the other causes inconsistent color.
**Why it happens:** Two parallel theme entry points (Less compile-time vs. JS runtime token).
**How to avoid:** Make `tokens.ts` the source for the shared values and keep the craco Less vars in sync with it (or document that antd v5 runtime tokens are authoritative and Less vars are legacy). Note antd v5 primarily uses the JS token system; the Less overrides are partly legacy from the migration.
**Warning signs:** Primary color differs between antd components and any Less-styled element.

### Pitfall 5: Missed English strings outside the known offender
**What goes wrong:** Fixing only `OrderCodPaymentReview.widget.tsx` leaves English in other Phase 4-touched COD/order surfaces (e.g. `COD_OPTIONS`/`SHIPPING_OPTIONS`/`SORT_OPTIONS` labels in `OrderList.screen.tsx` are English: "All COD", "Paid", "Newest", etc.).
**Why it happens:** D-02 lists one known offender but says "sweep" for others.
**How to avoid:** Grep Phase 4-touched files for operator-facing English string literals (option label arrays, `BUCKET_LABELS`, placeholders like `"Manual resolve"`, `"no code"`). Confirmed additional offenders: `OrderList.screen.tsx` option arrays and `Empty`/placeholder text.
**Warning signs:** Any Latin-only operator-facing string remains after the sweep.

## Code Examples

### Replacing the inline theme (the foundation change)
```typescript
// BEFORE — src/App.tsx (current)
<ConfigProvider theme={{
  token: {
    colorPrimary: "rgb(245, 130, 32)",
    colorLink: "#3d4195",
    colorBorderSecondary: "#d9d9d9",
    fontSize: 18            // <-- prime overflow cause (D-04)
  },
}}>

// AFTER — tokens centralized, density via algorithm, scale defined once
<ConfigProvider theme={buildAppTheme()}>   // see Pattern 1
```

### Vietnamese label correction (D-02)
```typescript
// BEFORE — src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.tsx
const BUCKET_LABELS: Record<CodImportReviewBucket, string> = {
  matched: "Matched", unmatched: "Unmatched", duplicate: "Duplicate",
  "amount-mismatch": "Amount mismatch", "already-paid": "Already paid"
}
// AFTER — keys unchanged (stored/typed enum), only display strings to Vietnamese
const BUCKET_LABELS: Record<CodImportReviewBucket, string> = {
  matched: "Đã khớp", unmatched: "Chưa khớp", duplicate: "Trùng",
  "amount-mismatch": "Lệch số tiền", "already-paid": "Đã thanh toán"
}
// Also: "Row {n}" -> "Dòng {n}", "Needs review" -> "Cần kiểm tra",
// "Payment row" -> ..., "Manual resolve" placeholder -> ..., "Include" -> ...,
// "Apply confirmed COD rows" -> ..., "No rows in this bucket." -> ...
```
> The exact Vietnamese wording is the operator's domain language — the planner should match terms already used elsewhere in the ~95 Vietnamese files (e.g. Dashboard uses "Thống kê", "Tổng tiền", "Tổng tiền COD") for consistency.

### Tokenizing the Card primitive
```typescript
// src/Components/Card/Card.tsx currently hard-codes:
//   borderRadius: 10, boxShadow: AppShadow.card
// Move to tokens:
const { token } = theme.useToken();
const style = { borderRadius: token.borderRadius, boxShadow: tokens.shadow.card, ...style };
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| antd v4 Less variable theming (`modifyVars`) | antd v5 JS design-token system (`ConfigProvider` token + algorithms + CSS-in-JS) | antd v5 (this app is on 5.16.1) | The craco Less `modifyVars` is partly legacy; the JS token system is the supported v5 path. Drive the design system from JS tokens. [CITED: ant.design/docs/react/customize-theme] |
| Per-component `algorithm` not derivable | `theme.components[X].algorithm: true` derives component tokens via the global algorithm | antd >= 5.8.0 (available at 5.16.1) | Component-level tokens can use derivation when needed. |

**Deprecated/outdated:**
- Relying on `craco.config.js` Less `modifyVars` as the primary theme mechanism: legacy under antd v5. Keep it only for parity, or document JS tokens as authoritative (Pitfall 4).
- The CRA-default `src/App.css` (`.App-logo` spin animation, `.App-header` dark hero) is dead/irrelevant boilerplate; safe to prune the unused selectors while reconciling global styles with tokens, but the `.ant-*` overrides at the bottom of `App.css` are live — preserve or migrate them deliberately.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Reducing the seed `fontSize` (from 18 toward ~14-15) plus `compactAlgorithm` is the right density lever for the overflow problem. | Summary / Pattern 1 / D-04 | Low — D-04 locks the font-reduction direction; exact value is Claude's discretion. If chosen value is too small, adjust the scale step. |
| A2 | The COD bucket keys (`matched`, etc.) are internal enum values, not persisted/stored keys, so only display labels change. | Runtime State Inventory | Medium — if any bucket key string is persisted in backups or compared against stored data, renaming display labels is still safe but the planner must confirm keys are untouched. (Inventory says keys unchanged — verify during planning.) |
| A3 | `selectDashboardReadModel` and `selectOrderListReadModel` provide all derived values the refreshed screens need, so the view need not recompute. | Pattern 6 / Anti-Patterns | Low-Medium — if UX-04's new decision groupings need a value the selector doesn't expose, the planner may need to extend the selector (a State Layer change) rather than compute in the view. Flag if so. |
| A4 | No `./CLAUDE.md` exists; `./AGENTS.md` (per config `claude_md_path`) is the project instruction file. | Project Constraints | Low — verified `CLAUDE.md` absent and `AGENTS.md` read. |
| A5 | Exact Vietnamese wording can be matched from existing Vietnamese files; suggested translations in Code Examples are illustrative, not authoritative. | Code Examples | Low — operator-facing wording is the user's domain; planner/operator should confirm terms. |

## Open Questions

1. **Token module location: `src/theme/` vs. expanding `useTheme.ts`?**
   - What we know: Claude's discretion (CONTEXT.md). Both work.
   - What's unclear: Team preference for a new top-level `theme/` dir vs. keeping it under `Hooks/`.
   - Recommendation: New `src/theme/tokens.ts` + `buildAppTheme.ts` (plain TS, importable without React), keep `useTheme.ts` as the React consumer that re-exports `useToken` and the tokens. Defer final call to planner.

2. **Truncate-with-reveal mechanism: Popover vs. expandable vs. detail-nav?**
   - What we know: Must be consistent across screens (Claude's discretion).
   - What's unclear: Which feels best for the operator on a phone.
   - Recommendation: Tap-triggered `Popover` for inline fields (single-height rows preserved), `expandable` paragraph for long notes. Avoid hover tooltip (Pitfall 3).

3. **Keep craco Less vars or make JS tokens authoritative?**
   - What we know: Both theme entry points exist (Pitfall 4).
   - What's unclear: Whether any live Less-styled element depends on `@primary-fade`/`@text-color`.
   - Recommendation: Keep Less vars in sync with `tokens.ts` values; document JS tokens as authoritative. A grep for Less-var usage during planning resolves this.

4. **Which screen converts first?**
   - What we know: Sequence is Claude's discretion; all surfaces must end coherent.
   - Recommendation: Tokens first (foundation, plan 05-01), then the COD review widget (highest density + the English-label offender, plan 05-02/05-03), then order list, customer list, order create, then dashboard reorg (05-04).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js + Yarn | dev/test/build | ✓ (assumed — used in all prior phases) | `yarn.lock` present | — |
| `antd` | entire phase | ✓ | 5.16.1 (verified in repo) | — |
| `react-scripts test` (Jest) | validation | ✓ | 5.0.1 | — |
| `@craco/craco build` | build verification | ✓ | 7.1.0 | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None. This phase is fully satisfied by the existing toolchain.

## Validation Architecture

> `nyquist_validation: true` in config — section included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest via `react-scripts test` 5.0.1 + React Testing Library 13.4.0 + `@testing-library/jest-dom` 5.17.0 |
| Config file | none explicit — CRA-implicit (`react-app/jest` ESLint preset); setup in `src/setupTests.ts` |
| Quick run command | `CI=true yarn test --watchAll=false --findRelatedTests <changed files>` (or target a single file: `CI=true yarn test --watchAll=false src/path/File.test.tsx`) |
| Full suite command | `CI=true yarn test --watchAll=false` |
| Build verification | `yarn build` (CRACO production build must succeed) |

> `yarn test` defaults to watch mode; `CI=true` + `--watchAll=false` makes it single-run for automation.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-01 | Theme renders without crashing; primitives consume tokens | smoke/render | `CI=true yarn test --watchAll=false src/App.test.tsx src/Routing/RootRouter.test.tsx` | ✅ (App.test.tsx, RootRouter.test.tsx) |
| UX-02 | Order list filter/sort/search behavior preserved after card rebuild | unit | `CI=true yarn test --watchAll=false src/Common/Helpers/OrderListQueryHelper.test.ts` | ✅ |
| UX-02 | Order list screen renders mobile rows for sample data | render | `CI=true yarn test --watchAll=false src/Modules/Order/Screens/OrderList.screen.test.tsx` | ❌ Wave 0 (no screen test today) |
| UX-03 | Loading/empty/error/success/confirm states render per workflow | render | per-screen render tests asserting Spin/Empty/Result/Popconfirm presence | ❌ Wave 0 (state-render tests) |
| UX-03 | Inline shipping + sync status states preserved | render | `CI=true yarn test --watchAll=false src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx` | ✅ |
| UX-04 | Dashboard derived values unchanged (read from selector) | unit | dashboard selector test (extend `OrderDomainHelper.test.ts` coverage or add a DashboardSelectors test) | ⚠️ partial — `OrderDomainHelper.test.ts` exists; no dedicated DashboardSelectors test |
| UX-04/UX-05 | Order create pricing/COD/attachment behavior preserved | render/unit | `CI=true yarn test --watchAll=false src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.test.tsx` | ✅ |
| UX-05 | Order domain calculations unchanged | unit | `CI=true yarn test --watchAll=false src/Common/Helpers/OrderDomainHelper.test.ts src/Hooks/useOrder.test.ts` | ✅ |
| UX-05 | Trello adapter / sync result behavior unchanged | unit | `CI=true yarn test --watchAll=false src/Hooks/Trello/OrderTrelloAdapter.test.ts src/Hooks/Trello/TrelloOperationResult.test.ts` | ✅ |
| UX-05 | Backup/restore behavior unchanged | unit | `CI=true yarn test --watchAll=false src/Common/Helpers/BackupHelper.test.ts` | ✅ |

### Sampling Rate
- **Per task commit:** quick run on related files (`--findRelatedTests`) + `tsc`/build sanity on touched modules.
- **Per wave merge:** full suite `CI=true yarn test --watchAll=false`.
- **Phase gate:** full suite green AND `yarn build` succeeds before `/gsd-verify-work`. Visual states (UX-02/UX-03) also need manual mobile-viewport spot-check since render tests don't assert pixel layout.

### Wave 0 Gaps
- [ ] `src/Modules/Order/Screens/OrderList.screen.test.tsx` — render test for mobile card rows + empty/loading states (covers UX-02/UX-03).
- [ ] `src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentReview.widget.test.tsx` — assert Vietnamese labels and bucket rendering (covers UX-01/D-02 and guards against English regression).
- [ ] Dashboard selector/render test asserting decision-group values come from `selectDashboardReadModel` (covers UX-04/UX-05).
- [ ] Shared state-component conventions: a small render test verifying Empty/Spin/Result usage on a representative screen (covers UX-03).
- [ ] Framework install: none needed — Jest/RTL already present.

> Caveat: existing tests emit non-failing warnings (Redux Persist, React `act(...)`, CRA/Babel, Browserslist, brownfield ESLint) per STATE.md blockers. These are pre-existing and non-blocking; do not let them mask new failures — assert on green exit code, not absence of warnings.

## Sources

### Primary (HIGH confidence)
- Repo source (read directly this session): `src/App.tsx`, `src/Hooks/useTheme.ts`, `src/Components/Card/Card.tsx`, `src/Components/Button/Button.tsx`, `src/Components/Typography/*`, `src/Components/Layout/Stack/*`, `src/Common/Constants/AppShadow.ts`, `src/Common/Constants/AppConstants.ts` (COLORS), `craco.config.js`, `package.json`, `OrderCodPaymentReview.widget.tsx`, `OrderList.screen.tsx`, `Dashboard.screen.tsx`, `public/index.html` (viewport), `.planning/config.json`, `AGENTS.md`, codebase maps (STACK/ARCHITECTURE/CONVENTIONS).
- `antd` version 5.16.1 — verified in `package.json` / repo.

### Secondary (MEDIUM confidence)
- [Ant Design — Customize Theme](https://ant.design/docs/react/customize-theme) — SeedToken, `theme.components`, algorithms (`defaultAlgorithm`/`darkAlgorithm`/`compactAlgorithm`), `theme.useToken()`, nested ConfigProvider, component `algorithm: true` (>= 5.8.0).

### Tertiary (LOW confidence)
- General web search on antd v5 token customization (used only to locate the official docs page above; no claims rest on it alone).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — everything verified in-repo; no new packages; antd token API confirmed against official docs.
- Architecture: HIGH — based on direct reads of the actual screens, primitives, and codebase maps.
- Pitfalls: HIGH — derived from observed inline magic numbers, the live COD widget English labels, two parallel theme entry points, and STATE.md blockers.
- Vietnamese wording specifics: MEDIUM — exact terms should match existing files (A5).

**Research date:** 2026-06-17
**Valid until:** 2026-07-17 (stable stack; antd 5.x token API is settled). Re-verify only if antd major version changes.
