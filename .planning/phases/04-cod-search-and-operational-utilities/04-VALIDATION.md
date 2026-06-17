---
phase: 04
slug: cod-search-and-operational-utilities
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-17
---

# Phase 04 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest via `react-scripts test`, React Testing Library |
| **Config file** | `package.json` Jest `moduleNameMapper`, `src/setupTests.ts` |
| **Quick run command** | `CI=true yarn test --watchAll=false --runTestsByPath <changed-test-file>` |
| **Full suite command** | `CI=true yarn test --watchAll=false` |
| **Estimated runtime** | ~20-60 seconds for targeted tests, project dependent for full suite |

---

## Sampling Rate

- **After every task commit:** Run the most targeted Jest command for the changed helper/widget/reducer tests.
- **After every plan wave:** Run `CI=true yarn test --watchAll=false`.
- **Before `$gsd-verify-work`:** Run `CI=true yarn test --watchAll=false` and `yarn build`.
- **Max feedback latency:** One task between automated checks; no three consecutive tasks may skip automated verification.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-selector-read-models | 01 | 1 | ORD-04, OPS-04 | N/A | No sensitive data written outside local Redux/browser state | unit | `CI=true yarn test --watchAll=false --runTestsByPath src/Store/Selectors/*.test.ts src/Common/Helpers/*Selector*.test.ts` | W0 | pending |
| 04-02-cod-import-helpers | 02 | 2 | OPS-03 | T-04-01 | Imported files do not mutate Redux until reviewed/applied | unit | `CI=true yarn test --watchAll=false --runTestsByPath src/Common/Helpers/CodPaymentImportHelper.test.ts` | W0 | pending |
| 04-02-cod-import-ui | 02 | 2 | OPS-03, UX-03 | T-04-01 | Problem rows require review before apply | RTL | `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderCodPayment/*.test.tsx` | W0 | pending |
| 04-03-order-list-url-state | 03 | 3 | OPS-04 | N/A | URL query state preserves view context only; no business state mutation | unit + RTL | `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderList.screen.test.tsx src/Store/Selectors/*.test.ts` | W0 | pending |
| 04-04-actions-status-tray | 04 | 4 | OPS-05, OPS-06 | T-04-02 | Tray safe actions do not clear failures or apply COD rows directly | unit + RTL | `CI=true yarn test --watchAll=false --runTestsByPath src/Routing/MasterPage.test.tsx src/Modules/Order/Screens/OrderItem/*.test.tsx` | W0 | pending |

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. New tests should be added beside the new/changed helpers and widgets during the relevant implementation tasks.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real COD Excel import | OPS-03 | Requires real carrier/export file shape that may not be safe to commit | Import a sanitized real COD file, confirm matched/unmatched/duplicate/amount-mismatch/already-paid buckets, apply confirmed rows, and verify matched orders become paid COD. |
| Changed Excel format fallback | OPS-03 | Requires intentionally modified spreadsheet headers | Upload a changed-format file, map shipping code/COD amount/shipping fee/status columns, confirm review buckets recover. |
| Mobile status tray placement | OPS-06, UX-02 | Visual/touch density check is better in browser | Open app on mobile viewport, confirm tray does not overlap bottom nav/floating controls and navigates to local resolution screens. |

---

## Threat References

| ID | Threat | Required Mitigation |
|----|--------|---------------------|
| T-04-01 | Imported Excel rows may incorrectly mark orders as paid COD | Parsing must generate review buckets; only confirmed/included rows can mutate Redux; unresolved rows remain unchanged. |
| T-04-02 | App-wide status tray may allow broad destructive actions from the wrong context | Tray may navigate and trigger safe checks only; clear/apply/manual resolution remains local to row or COD review screen. |

---

## Validation Sign-Off

- [x] All planned task areas have automated or targeted verification.
- [x] Sampling continuity: no three consecutive tasks without automated verify.
- [x] Existing Jest infrastructure covers all phase requirements.
- [x] No watch-mode flags.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending
