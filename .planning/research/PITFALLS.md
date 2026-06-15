# Pitfalls Research

**Domain:** Brownfield internal operations React SPA refactor
**Researched:** 2026-06-15
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Shipping secrets in the client bundle

**What goes wrong:** Trello credentials remain in source or get moved to client-visible environment variables.
**Warning signs:** Trello key/token-like values appear in `src/`, `docs/static/js/`, or `REACT_APP_`/`VITE_` variables.
**Prevention:** Rotate exposed tokens and move secret-bearing Trello calls behind a proxy/serverless boundary.
**Phase to address:** First stabilization phase.

### Pitfall 2: Refactoring workflows before fixing tests

**What goes wrong:** Order/COD/shipping behavior changes without feedback, and regressions are found manually later.
**Warning signs:** `CI=true yarn test --watchAll=false` still fails; no reducer/helper tests exist.
**Prevention:** Fix alias/test runner setup and add focused tests around helpers, reducers, and Trello mocks before broad refactors.
**Phase to address:** First stabilization phase.

### Pitfall 3: Treating Trello and local Redux writes as atomic

**What goes wrong:** Local state updates succeed but Trello fails, or Trello succeeds but local assignment/attachment fails.
**Warning signs:** Methods return `null` or strings for errors without structured retry/recovery; no sync health surface exists.
**Prevention:** Introduce operation result types, retry/reconcile flows, and visible sync status.
**Phase to address:** Sync/domain refactor phase.

### Pitfall 4: Breaking persisted state shape

**What goes wrong:** Refactors rename fields or omit `doneOrders`/`codPayments`, causing restore or persistence data loss.
**Warning signs:** Reducer `setState` copies partial state; no schema version; no migration tests.
**Prevention:** Add versioned persisted-state schema, migrations, and restore tests before changing model fields.
**Phase to address:** Persistence stabilization phase.

### Pitfall 5: Making the UI prettier but slower for operators

**What goes wrong:** Visual redesign adds more screens, larger cards, or extra clicks while daily workflows remain clumsy.
**Warning signs:** UI work starts from layout aesthetics rather than order/shipping/COD task sequences.
**Prevention:** Design around operator actions, dense information, mobile reachability, and visible workflow state.
**Phase to address:** UI/UX phase after critical flows are safer.

## Security Pitfalls

| Pitfall | Risk | Prevention |
|---------|------|------------|
| Client env vars for Trello secrets | Still visible in browser bundles | Use server-side env only behind proxy. |
| Committing `.env` | Secret leak in git history | Ignore `.env`, add `.env.example`, audit history if needed. |
| Arbitrary backup restore | Malformed JSON can corrupt state | Validate and preview before dispatching state. |
| No auth boundary | Anyone with URL can use the app identity | Keep deployment private or add auth/proxy controls. |

## Technical Pitfalls

| Pitfall | Impact | Prevention |
|---------|--------|------------|
| Big-bang CRA-to-Vite + domain refactor + UI redesign | Hard to isolate failures | Split into stabilization, architecture, workflow, UI phases. |
| Keeping all derived calculations in render bodies | Performance degrades as data grows | Add memoized selectors and tested helper functions. |
| Mixed `moment` and `dayjs` usage | Inconsistent dates and bigger bundle | Standardize on one library in a dedicated phase/task. |
| Generated `docs/` drift | Deployment may not match source | Add build freshness verification or automate deploy. |

## UX Pitfalls

| Pitfall | Impact | Prevention |
|---------|--------|------------|
| Marketing-style redesign | Wastes space and slows repeated operations | Use dense, utilitarian, action-first internal-tool design. |
| Hidden sync/backup status | Operator cannot trust whether data is safe | Add status indicators and explicit recovery actions. |
| Batch actions without confirmation | High-risk data/Trello mistakes | Use previews, confirmations, and undo/retry where possible. |
| Mobile controls too small | Daily use becomes frustrating | Use stable touch targets and compact but tappable layouts. |

## Phase Mapping

| Pitfall | Address In | Success Signal |
|---------|------------|----------------|
| Client Trello credentials | Phase 1 | No secret-bearing values in client bundle; Trello calls route safely. |
| Broken tests | Phase 1 | One-shot test command passes with meaningful tests. |
| Partial sync failures | Phase 2 | Trello operations return structured results and failures are visible/recoverable. |
| Persisted state drift | Phase 2 | Backup restore validates/migrates complete state. |
| UI polish without utility | Phase 4+ | Daily order/shipping/COD tasks require fewer steps and clearer status. |

## Sources

- Existing codebase map: `.planning/codebase/CONCERNS.md`, `.planning/codebase/TESTING.md`, `.planning/codebase/INTEGRATIONS.md`.
- Vite env exposure docs: https://vite.dev/guide/env-and-mode
- Trello REST API docs: https://developer.atlassian.com/cloud/trello/rest/
- Zod validation docs: https://zod.dev/

---
*Pitfalls research for: Brownfield internal operations React SPA refactor*
*Researched: 2026-06-15*
