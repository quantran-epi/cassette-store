# Feature Research

**Domain:** Brownfield internal operations app for cassette order management
**Researched:** 2026-06-15
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features internal operators need before the app can be considered safe and pleasant to use.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Safe Trello integration | Operators rely on Trello card state, but credentials cannot remain in client source | HIGH | Requires token rotation and proxy/secret boundary. |
| Reliable tests and build | Refactor work needs fast feedback and confidence | MEDIUM | Fix Jest aliases/stale test or migrate to Vite/Vitest. |
| Backup/restore validation | Operational data is local-first and restore can currently accept arbitrary JSON | MEDIUM | Add schema validation, versioning, and full state restore. |
| Order/Trello sync safety | Local order state and Trello card state can drift on partial failure | HIGH | Add clear success/failure states and retry/reconciliation path. |
| Quick order creation | Daily workflow depends on creating orders with minimal friction | MEDIUM | Preserve current behavior while reducing steps. |
| Shipping update utility | Operators need fast shipping-code entry and card/list updates | MEDIUM | Treat as a primary workflow, not a detail widget. |
| COD payment cycle management | COD tracking is core to operations | MEDIUM | Improve selection, totals, status visibility, and history. |
| Search/filter/sort | Lists must stay usable as customers/orders grow | MEDIUM | Improve search fields, filters, pagination, and derived selectors. |
| Mobile-friendly layout | Current app is operations-heavy and likely used on mobile | MEDIUM | Dense, tappable, readable layouts; avoid marketing-style pages. |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Sync health panel | Operator can see whether Trello/local state is healthy | MEDIUM | Shows failed operations, last backup, last done-order refresh. |
| Command/quick-action surface | Reduces repetitive clicks for common order tasks | MEDIUM | Could be a floating action menu or contextual action bar. |
| Batch COD/shipping utilities | Saves time when processing multiple orders | HIGH | Needs careful test coverage and confirmation UI. |
| Operator dashboard refresh | Makes sales/COD/returns more actionable, not just prettier | MEDIUM | Tie metrics to next actions. |
| Data recovery workflow | Makes local-first storage less risky | MEDIUM | Backup history, restore preview, validation errors. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full customer storefront | Seems like natural expansion | Distracts from internal operations and requires auth/payments/catalog work | Keep first milestone internal-only. |
| Full backend rewrite first | Feels cleaner architecturally | Delays immediate risk reduction and UX improvements | Add only the backend/proxy pieces required for security and sync. |
| Real-time everything | Sounds modern | Adds complexity without proving operator value | Use explicit refresh, sync status, and retry first. |
| Large visual redesign before tests | Produces visible progress | Can break workflows without safety net | Stabilize test/build/data flows first, then redesign. |

## Feature Dependencies

```text
Test/build baseline
    -> order/domain refactor
    -> safer Trello sync
    -> daily workflow utilities
    -> UI/UX refresh at scale

Trello secret boundary
    -> safer Trello sync
    -> deploy confidence

Backup/restore validation
    -> data recovery workflow
    -> operator confidence

Shared UI patterns
    -> quick actions
    -> mobile-friendly screens
```

### Dependency Notes

- **Tests/build baseline before broad refactor:** Without a working test command, even simple architecture changes are hard to verify.
- **Secret boundary before public deploy confidence:** Trello tokens in client bundles make any public deployment unsafe.
- **Restore validation before better backup UX:** A pretty restore UI still needs schema/version checks.
- **Domain services before batch utilities:** Batch order/COD actions need predictable pure operations and clear side-effect boundaries.

## MVP Definition

### Launch With (v1)

Minimum viable refactor milestone.

- [ ] Fix test/build baseline — required for safe refactoring.
- [ ] Move Trello secret-bearing behavior behind a safe boundary — required for security.
- [ ] Add backup/restore validation and complete state restore — required for data safety.
- [ ] Extract order calculations/selectors/integration boundaries — required for maintainability.
- [ ] Improve the highest-frequency order/shipping/COD workflows — required for daily utility.
- [ ] Apply a coherent mobile-friendly UI refresh to refactored flows — required for operator adoption.

### Add After Validation (v1.x)

- [ ] Batch processing for shipping/COD — add once single-item flows are safe.
- [ ] Sync health/audit panel — add once operations have structured statuses.
- [ ] Dashboard action recommendations — add after dashboard metrics are trusted.
- [ ] Import/export tools — add after schemas and validation are stable.

### Future Consideration (v2+)

- [ ] Full backend database — consider if IndexedDB/Trello backup remains too risky.
- [ ] Multi-user roles and auth — consider if more operators use the app.
- [ ] Customer-facing workflows — separate milestone after internal operations are stable.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Test/build baseline | HIGH | MEDIUM | P1 |
| Trello secret boundary | HIGH | HIGH | P1 |
| Backup/restore validation | HIGH | MEDIUM | P1 |
| Order domain refactor | HIGH | HIGH | P1 |
| Quick order/shipping/COD actions | HIGH | MEDIUM | P1 |
| Mobile-friendly UI refresh | HIGH | MEDIUM | P1 |
| Sync health panel | MEDIUM | MEDIUM | P2 |
| Batch operations | HIGH | HIGH | P2 |
| Dashboard recommendations | MEDIUM | MEDIUM | P2 |
| Customer-facing features | LOW for current milestone | HIGH | P3 |

**Priority key:**
- P1: Must have for the current refactor milestone
- P2: Should have after core safety and workflow improvements land
- P3: Future consideration

## Competitor Feature Analysis

| Feature | Generic CRM/order tools | Trello-only workflow | Our Approach |
|---------|-------------------------|----------------------|--------------|
| Order workflow | Rich but often too generic | Visual cards but manual data entry | Keep app-specific order/COD logic, integrate safely with Trello. |
| Daily operator speed | Depends on configuration | Good for drag/drop, weak for structured totals | Build focused quick actions and computed fields. |
| Backup/recovery | Usually server-backed | Manual attachments/cards | Add explicit backup validation and restore preview. |
| UI polish | Often polished but broad | Simple board UI | Refine the internal tool surface for repeated mobile/desktop use. |

## Sources

- Existing codebase map: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/TESTING.md`.
- Trello REST integration docs: https://developer.atlassian.com/cloud/trello/rest/
- Ant Design component/theme docs: https://ant.design/components/config-provider/

---
*Feature research for: Brownfield internal operations app for cassette order management*
*Researched: 2026-06-15*
