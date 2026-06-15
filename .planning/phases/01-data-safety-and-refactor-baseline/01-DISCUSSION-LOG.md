# Phase 1: Data Safety and Refactor Baseline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-15
**Phase:** 1-Data Safety and Refactor Baseline
**Areas discussed:** Backup Format, Restore Experience, Backup and Refresh Status, Test and Build Baseline

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Backup Format | How should backup files be shaped going forward: strict versioned app snapshot, backward-compatible best effort, or both? | ✓ |
| Restore Experience | What should happen when restore JSON is invalid, partial, or from an older version? | ✓ |
| Backup and Refresh Status | How visible should backup, restore, and done-order refresh status be? | ✓ |
| Test and Build Baseline | What is the minimum confidence gate for Phase 1? | ✓ |

**User's choice:** "i just want to backup and restore easily, reliability, use your recommendation"
**Notes:** User delegated implementation decisions to the agent's recommendation, with emphasis on ease and reliability. The context locks a simple versioned backup format, backward-compatible restore, validate-before-mutate behavior, pre-restore recovery snapshot, minimal persistent status, and conservative test/build baseline.

---

## Backup Format

| Option | Description | Selected |
|--------|-------------|----------|
| Versioned app snapshot | Future backups use schema metadata and complete required state sections. | ✓ |
| Legacy raw Redux dump only | Keep current `JSON.stringify(store.getState())` as the main format. | |
| Both | Write versioned backups while accepting legacy raw backups through normalization. | ✓ |

**User's choice:** Agent recommendation.
**Notes:** Future backups should be versioned and complete, while restore remains backward compatible with existing raw Redux backups.

---

## Restore Experience

| Option | Description | Selected |
|--------|-------------|----------|
| Validate before mutation | Parse, validate, normalize, and only then dispatch restore actions. | ✓ |
| Best-effort dispatch | Dispatch whatever fields are present and rely on reducers. | |
| Require manual repair | Ask operator to edit/fix JSON before restore. | |

**User's choice:** Agent recommendation.
**Notes:** Invalid or unsupported backups must not mutate state. Recoverable legacy backups get explicit defaults. Restore should include order, customer, and app context state and close the current `doneOrders`/`codPayments` gap.

---

## Backup and Refresh Status

| Option | Description | Selected |
|--------|-------------|----------|
| Transient messages only | Keep current Ant Design message-only feedback. | |
| Minimal persistent status | Add compact status around existing drawer/floating backup controls. | ✓ |
| Full status center | Build a broader operational status surface now. | |

**User's choice:** Agent recommendation.
**Notes:** Phase 1 should use messages plus a compact persistent status. Full operational alerts/status area remains Phase 4 scope.

---

## Test and Build Baseline

| Option | Description | Selected |
|--------|-------------|----------|
| Commands only | Make one-shot test and build commands pass. | |
| Focused safety tests | Fix commands and add backup/restore reducer/normalizer tests. | ✓ |
| Tooling migration | Migrate CRA/Jest to a newer test/build stack now. | |

**User's choice:** Agent recommendation.
**Notes:** Keep tooling conservative. Fix `CI=true yarn test --watchAll=false`, keep `yarn build` passing, replace stale CRA sample test, and add focused tests for restore validation/normalization.

---

## Agent Discretion

- Exact schema validation implementation, with preference for a compact local validator unless a library clearly reduces risk.
- Exact placement of minimal persistent status UI, using existing `MasterPage`, drawer/floating controls, and Ant Design patterns.
- Exact restore source UX, as long as it remains easy and does not expand into a large import/export feature.

## Deferred Ideas

- Full backend database and multi-operator collaboration.
- Broad operational status center for Phase 4.
- Full UI/UX redesign for Phase 5.
