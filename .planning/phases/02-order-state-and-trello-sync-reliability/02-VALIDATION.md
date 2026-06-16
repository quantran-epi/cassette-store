---
phase: 02
slug: order-state-and-trello-sync-reliability
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-16
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest via Create React App / CRACO, React Testing Library |
| **Config file** | `package.json`, `craco.config.js`, `tsconfig.json` |
| **Quick run command** | `CI=true yarn test --watchAll=false --runInBand` |
| **Full suite command** | `CI=true yarn test --watchAll=false && yarn build` |
| **Estimated runtime** | ~60-180 seconds |

---

## Sampling Rate

- **After every task commit:** Run `CI=true yarn test --watchAll=false --runInBand`
- **After every plan wave:** Run `CI=true yarn test --watchAll=false && yarn build`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | ORD-01, ORD-02 | — | N/A | unit | `CI=true yarn test --watchAll=false --runInBand src/Common/Helpers/OrderDomainHelper.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | ORD-01, ORD-02 | — | N/A | unit | `CI=true yarn test --watchAll=false --runInBand src/Common/Helpers/OrderDomainHelper.test.ts src/Store/Reducers/OrderReducer.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | SYNC-01, ORD-03 | — | N/A | unit | `CI=true yarn test --watchAll=false --runInBand src/Hooks/Trello/TrelloOperationResult.test.ts src/Hooks/useAPI.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | SYNC-01, ORD-03 | — | N/A | unit | `CI=true yarn test --watchAll=false --runInBand src/Hooks/Trello/OrderTrelloAdapter.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | SYNC-02, ORD-02, ORD-03 | — | N/A | integration/unit | `CI=true yarn test --watchAll=false --runInBand src/Hooks/useOrder.test.ts` | ✅ | ⬜ pending |
| 02-03-02 | 03 | 3 | SYNC-02, SYNC-01 | — | N/A | integration/unit | `CI=true yarn test --watchAll=false --runInBand src/Hooks/useOrder.test.ts src/Store/Reducers/OrderReducer.test.ts` | ✅ | ⬜ pending |
| 02-04-01 | 04 | 4 | SYNC-03 | — | N/A | component/unit | `CI=true yarn test --watchAll=false --runInBand src/Modules/Order/Screens/OrderItem/OrderItem.widget.test.tsx src/Hooks/useOrder.test.ts` | ❌ W0 | ⬜ pending |
| 02-04-02 | 04 | 4 | SYNC-03, SYNC-02 | — | N/A | regression | `CI=true yarn test --watchAll=false && yarn build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers the phase. Some plan tasks create new test files listed above before implementing the matching production change.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Operator can understand and act on a sync failure from the order list/item surface | SYNC-03 | Visual placement and wording require a human sanity check in the browser | Run the app, seed or trigger a failed Trello operation, confirm the affected order shows failure text plus an action-specific retry/control without blocking unrelated order actions. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 180s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
