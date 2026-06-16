# Roadmap: Cassette Store

## Overview

This roadmap turns the existing cassette operations app into a more reliable, convenient, and polished internal tool. The milestone starts with data safety and lightweight refactor safety, then improves Trello/order sync, daily order and shipping workflows, COD/search/action utilities, and finally the UI/UX layer across the refactored flows.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Data Safety and Refactor Baseline** - Backup, restore, refresh, tests, and build checks become dependable enough for daily app refactoring. (completed 2026-06-15)
- [x] **Phase 2: Order State and Trello Sync Reliability** - Order transitions and Trello side effects become structured, testable, and recoverable. (completed 2026-06-16)
- [ ] **Phase 3: Fast Order and Shipping Workflows** - Order creation and shipping-code updates become faster and clearer for operators.
- [ ] **Phase 4: COD, Search, and Operational Utilities** - COD cycles, list utilities, quick actions, and operational alerts become practical daily tools.
- [ ] **Phase 5: Cohesive UI/UX Refresh** - Refactored workflows get a consistent, mobile-friendly internal-operations interface.

## Phase Details

### Phase 1: Data Safety and Refactor Baseline

**Goal**: Operators can trust backup/restore and done-order refresh while the developer has enough test/build confidence to refactor safely.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: [SAFE-01, SAFE-02, SAFE-03, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, SYNC-04]
**Success Criteria** (what must be TRUE):

  1. Developer can run passing one-shot tests and production build checks before changing workflows.
  2. Backup payloads include schema/version metadata and all required persisted state sections.
  3. Restore validates backup JSON and preserves orders, customers, app context, done-order IDs, and COD cycles.
  4. Operator can see backup, restore, and done-order refresh loading, success, empty, and failure states.

**Plans**: 4 plans
Plans:
**Wave 1**

- [x] 01-01: Repair test command, alias resolution, stale app smoke test, and build check.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02: Define persisted-state schema, versioning, validation, and migration defaults.

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03: Refactor backup/restore to validate, report, and restore complete state.

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-04: Add visible backup/restore/done-refresh status and verification coverage.

### Phase 2: Order State and Trello Sync Reliability

**Goal**: Core order workflows stay usable while order business rules and Trello side effects become testable, structured, and recoverable.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: [SYNC-01, SYNC-02, SYNC-03, ORD-01, ORD-02, ORD-03]
**Success Criteria** (what must be TRUE):

  1. Order calculations and state transitions can be tested without rendering React components.
  2. Trello card creation, movement, comments, and attachment operations return structured success/failure results.
  3. Partial local/Trello failures have a clear ordering, visible failure state, and retry or recovery path.
  4. Existing order creation, shipping, return, refund, COD, and attachment behavior still works through the refactored boundaries.

**Plans**: 4 plans
Plans:
**Wave 1**

- [x] 02-01: Extract pure order calculations and transition functions with focused tests.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02: Create typed Trello/order integration adapter and operation result types.

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-03: Refactor order workflows to use domain transitions and integration adapter.

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 02-04: Add recovery/retry handling and regression coverage for partial sync failures.

### Phase 3: Fast Order and Shipping Workflows

**Goal**: Operators can create orders and update shipping information faster while preserving existing business behavior.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: [ORD-05, OPS-01, OPS-02]
**Success Criteria** (what must be TRUE):

  1. Order routes use order-specific names and layout components without breaking navigation.
  2. Operator can create an order with fewer steps while preserving pricing, priority, customer, payment, and attachment behavior.
  3. Operator can update shipping codes quickly and see local/Trello update status immediately.

**Plans**: 3 plans
Plans:
**Wave 1**

- [ ] 03-01: Correct order route naming/components and add route smoke coverage.

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 03-02: Streamline order creation around existing business behavior and attachments.
- [ ] 03-03: Improve shipping-code update flow and local/Trello status feedback.

### Phase 4: COD, Search, and Operational Utilities

**Goal**: Operators get practical daily utilities for COD cycles, list navigation, quick actions, and operational status.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: [ORD-04, OPS-03, OPS-04, OPS-05, OPS-06]
**Success Criteria** (what must be TRUE):

  1. Dashboard and list totals come from memoized selectors or tested helper functions.
  2. Operator can manage COD payment cycles with clearer selected orders, totals, debit shipping fees, and confirmation.
  3. Operator can search, filter, and sort orders by status, COD state, shipping code, customer, and date without losing context.
  4. Common order actions and operational alerts are available from consistent contextual surfaces.

**Plans**: 4 plans

Plans:

- [ ] 04-01: Extract derived order/customer/dashboard selectors with tests.
- [ ] 04-02: Improve COD cycle selection, totals, confirmation, and review behavior.
- [ ] 04-03: Upgrade order list search/filter/sort behavior around selector-backed state.
- [ ] 04-04: Add contextual quick actions and a consistent operational status area.

### Phase 5: Cohesive UI/UX Refresh

**Goal**: Refactored app surfaces feel coherent, mobile-friendly, and purpose-built for repeated internal operations work.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: [UX-01, UX-02, UX-03, UX-04, UX-05]
**Success Criteria** (what must be TRUE):

  1. Refactored screens share a cohesive visual system for spacing, typography, colors, density, and action hierarchy.
  2. Dashboard, customer list, order list, order actions, order creation, and COD payment flows are tappable and readable on mobile.
  3. Primary workflows have clear loading, empty, error, success, and confirmation states.
  4. Dashboard metrics guide operational decisions while preserving verified existing business behavior.

**Plans**: 4 plans

Plans:

- [ ] 05-01: Define and apply the internal-operations visual system across shared components.
- [ ] 05-02: Refresh mobile layouts for dashboard, customer, order, and COD surfaces.
- [ ] 05-03: Standardize workflow states for loading, empty, error, success, and confirmation.
- [ ] 05-04: Rework dashboard presentation around operational decisions and verify behavior preservation.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Safety and Refactor Baseline | 4/4 | Complete    | 2026-06-15 |
| 2. Order State and Trello Sync Reliability | 4/4 | Complete    | 2026-06-16 |
| 3. Fast Order and Shipping Workflows | 0/3 | Not started | - |
| 4. COD, Search, and Operational Utilities | 0/4 | Not started | - |
| 5. Cohesive UI/UX Refresh | 0/4 | Not started | - |

## Requirement Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| SAFE-01 | Phase 1 | Pending |
| SAFE-02 | Phase 1 | Pending |
| SAFE-03 | Phase 1 | Pending |
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
