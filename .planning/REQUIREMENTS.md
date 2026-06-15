# Requirements: Cassette Store

**Defined:** 2026-06-15
**Core Value:** An internal operator can manage cassette orders, shipping, COD, and customer follow-up quickly and confidently without losing data or desynchronizing Trello.

## v1 Requirements

Requirements for the first GSD-managed refactor milestone. Each maps to roadmap phases.

### Refactor Safety

- [x] **SAFE-01**: Developer can run a one-shot test command that passes without module-alias errors.
- [x] **SAFE-02**: Developer can run a production build command and confirm generated deployment output matches current source.
- [x] **SAFE-03**: The stale CRA sample app test is replaced with an app-specific smoke test.

### Data Reliability

- [ ] **DATA-01**: Backup payloads include a schema/version marker and all required persisted state sections.
- [ ] **DATA-02**: Restore validates backup JSON before mutating Redux state and reports actionable validation errors.
- [ ] **DATA-03**: Restore preserves order state fields including orders, last sequence, done-order IDs, and COD payment cycles.
- [ ] **DATA-04**: Restore preserves customer state and app context needed for normal operation.
- [ ] **DATA-05**: Operator can see backup/restore status, last backup time, and restore success/failure feedback.

### Trello Sync

- [ ] **SYNC-01**: Order workflows report structured success/failure results for Trello card creation, movement, comments, and attachments.
- [ ] **SYNC-02**: Local Redux updates and Trello side effects have a clear ordering and recovery strategy for partial failure.
- [ ] **SYNC-03**: Operator can retry or recover failed Trello sync actions without manually editing application state.
- [ ] **SYNC-04**: Done-order refresh has visible loading, success, empty, and failure states.

### Order Domain Refactor

- [ ] **ORD-01**: Pure order calculations are extracted from `useOrder` into tested helper/service functions.
- [ ] **ORD-02**: Order state transitions for shipped, returned, waiting-for-return, COD paid, refund, and shipping-code update are testable without rendering React components.
- [ ] **ORD-03**: Trello integration is accessed through a small typed adapter/port instead of direct logic spread through order workflows.
- [ ] **ORD-04**: Derived order/customer dashboard values are provided by memoized selectors or tested helpers rather than repeated render-time reductions.
- [ ] **ORD-05**: Route naming and routing components are corrected so order routes use order-specific route names and layout components.

### Daily Operator Utilities

- [ ] **OPS-01**: Operator can create an order with fewer steps while preserving existing pricing, priority, customer, payment, and attachment behavior.
- [ ] **OPS-02**: Operator can update a shipping code quickly and clearly see whether local state and Trello were updated.
- [ ] **OPS-03**: Operator can manage COD payment cycles with clearer selection, totals, included orders, debit shipping fees, and confirmation.
- [ ] **OPS-04**: Operator can search, filter, and sort orders by status, COD state, shipping code, customer, and date without losing list context.
- [ ] **OPS-05**: Operator can perform common order actions from a clear contextual action surface instead of hunting through modals.
- [ ] **OPS-06**: Operator can see operational alerts for sync, backup, and done-order checks from a consistent status area.

### UI/UX Refresh

- [ ] **UX-01**: Refactored screens use a cohesive internal-operations visual system with consistent spacing, typography, colors, and action hierarchy.
- [ ] **UX-02**: Mobile layouts for dashboard, customer list, order list, order detail/actions, order creation, and COD payment remain dense but tappable and readable.
- [ ] **UX-03**: Primary operator workflows expose expected loading, empty, error, success, and confirmation states.
- [ ] **UX-04**: Dashboard metrics are organized around operational decisions, not just raw totals.
- [ ] **UX-05**: Existing business behavior remains available after UI refresh unless explicitly replaced by a better verified workflow.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Backend & Collaboration

- **BACK-01**: App can use a full backend database as the canonical source of truth.
- **BACK-02**: Multiple operators can authenticate independently with roles and audit trail.
- **BACK-03**: App can detect and resolve concurrent edits from multiple operators.

### Advanced Operations

- **ADV-01**: Operator can batch process shipping and COD actions across many orders.
- **ADV-02**: Operator can import/export order and customer data in structured formats.
- **ADV-03**: Dashboard can recommend next actions based on operational metrics.

### External Workflows

- **EXT-01**: Customers can interact with a public storefront or order-status page.
- **EXT-02**: External collaborators can access limited order/shipping information.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Public customer storefront | First milestone is focused on internal operations stability and speed. |
| Full backend rewrite | Data recovery and workflow improvements are the current priority. |
| Native mobile app | Responsive web improvements are the current mobile strategy. |
| Multi-tenant SaaS features | Current audience is a trusted internal operator/team. |
| Real-time multi-user collaboration | Adds complexity before core data reliability and Trello sync are stable. |
| External-user/public-hosting work | User clarified this is an internal app, so v1 should focus on data safety, workflow, UI, and UX. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SAFE-01 | Phase 1 | Complete |
| SAFE-02 | Phase 1 | Complete |
| SAFE-03 | Phase 1 | Complete |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| DATA-05 | Phase 1 | Pending |
| SYNC-04 | Phase 1 | Pending |
| SYNC-01 | Phase 2 | Pending |
| SYNC-02 | Phase 2 | Pending |
| SYNC-03 | Phase 2 | Pending |
| ORD-01 | Phase 2 | Pending |
| ORD-02 | Phase 2 | Pending |
| ORD-03 | Phase 2 | Pending |
| ORD-05 | Phase 3 | Pending |
| OPS-01 | Phase 3 | Pending |
| OPS-02 | Phase 3 | Pending |
| ORD-04 | Phase 4 | Pending |
| OPS-03 | Phase 4 | Pending |
| OPS-04 | Phase 4 | Pending |
| OPS-05 | Phase 4 | Pending |
| OPS-06 | Phase 4 | Pending |
| UX-01 | Phase 5 | Pending |
| UX-02 | Phase 5 | Pending |
| UX-03 | Phase 5 | Pending |
| UX-04 | Phase 5 | Pending |
| UX-05 | Phase 5 | Pending |

**Coverage:**

- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2026-06-15*
*Last updated: 2026-06-15 after roadmap adjustment*
