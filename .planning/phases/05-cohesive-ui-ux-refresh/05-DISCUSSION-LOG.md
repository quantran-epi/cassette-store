# Phase 5: Cohesive UI/UX Refresh - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-17
**Phase:** 5-Cohesive UI/UX Refresh
**Areas discussed:** Language / labels, Overflow & density, Visual system scope, Mobile layout

---

## Language / labels

| Option | Description | Selected |
|--------|-------------|----------|
| All Vietnamese | All operator-facing text is Vietnamese; English-only labels added in recent phases are a regression to fix | ✓ |
| Mixed (VI + technical EN) | Vietnamese prose, English for technical/status tokens | |
| Keep as-is | Leave current mix | |

**User's choice:** All Vietnamese
**Notes:** This was the user's strongest complaint — English labels (e.g. "Matched", "Unmatched", "Manual resolve", "Needs review" in `OrderCodPaymentReview.widget.tsx`) appeared where Vietnamese belongs. App is Vietnamese-first (~95 files use Vietnamese diacritics). Downstream agents must audit Phase 4 additions and translate all operator-facing English to Vietnamese.

### Follow-up: string management

| Option | Description | Selected |
|--------|-------------|----------|
| Inline (match current) | Keep Vietnamese strings inline in components, matching the existing codebase convention | ✓ |
| Central i18n / constants | Extract to a strings module or i18n library | |

**User's choice:** Inline (match current)
**Notes:** No i18n library exists today; introducing one is out of scope. Match the current inline convention.

---

## Overflow & density

| Option | Description | Selected |
|--------|-------------|----------|
| Lower base font + type scale | Reduce the global `fontSize: 18` base and define a deliberate type scale; root cause of much overflow | ✓ |
| Per-component spacing fixes | Patch overflow case-by-case | |
| Horizontal scroll containers | Wrap wide content in scroll regions | |

**User's choice:** Lower base font + type scale
**Notes:** `App.tsx:17` sets `fontSize: 18` globally via an inline antd `ConfigProvider`. A large base font on dense tables is a prime cause of overflow and line-breaks. Define a smaller base + intentional type scale via design tokens.

### Follow-up: long-content handling

| Option | Description | Selected |
|--------|-------------|----------|
| Truncate + reveal on tap | Truncate long values (names, addresses, notes, shipping codes); reveal full text on tap | ✓ |
| Always wrap | Let everything wrap to multiple lines | |
| Always truncate (no reveal) | Truncate with no way to see full value | |

**User's choice:** Truncate + reveal on tap
**Notes:** Even with a smaller font, long values overflow. Truncate with a tap-to-reveal affordance keeps rows dense while preserving access to full data.

---

## Visual system scope

| Option | Description | Selected |
|--------|-------------|----------|
| Token-driven system | Centralize design tokens (color, spacing, type, density) and drive shared `src/Components/` primitives + antd theme from them | ✓ |
| Light cleanup | Fix the worst offenders only, no system | |
| Full redesign | Marketing-style visual overhaul | |

**User's choice:** Token-driven system (recommended)
**Notes:** An inline antd `ConfigProvider` theme, a `src/Components/` primitive library, and `useTheme.ts` already exist. Consolidate into a token-driven system rather than a marketing redesign. Operational density and existing behavior preserved (UX-05).

---

## Mobile layout

| Option | Description | Selected |
|--------|-------------|----------|
| Mobile-only, mobile-native | App is used only on mobile; drop desktop concerns and build screens as mobile-native layouts | ✓ |
| Responsive (desktop + mobile) | Maintain both desktop and mobile layouts | |
| Tables squeezed onto phone | Keep desktop tables, shrink for mobile | |

**User's choice:** Mobile-only, mobile-native everywhere (recommended)
**Notes:** User stated the app is only used on mobile — "dont care about desktop". This removes the need for desktop layouts entirely. Dense table screens (order list, COD, dashboard) should be rebuilt as mobile-native stacked/card layouts rather than desktop tables forced onto a phone. All design effort targets the phone.

## Claude's Discretion

- Exact token module location/shape and how tokens feed the antd `ConfigProvider` vs `src/Components/` primitives.
- Specific type-scale values and the new base font size.
- Per-screen mobile-native layout patterns (stacked rows vs cards) for order list, COD review, and dashboard.
- The truncation/reveal component implementation (Popover, expandable row, modal, etc.).

## Deferred Ideas

- None — discussion stayed within phase scope.
