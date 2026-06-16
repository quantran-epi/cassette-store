---
phase: 03
slug: fast-order-and-shipping-workflows
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-16
---

# Phase 03 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest via Create React App `react-scripts test`; React Testing Library |
| **Config file** | `package.json` `jest.moduleNameMapper` |
| **Quick run command** | `CI=true yarn test --watchAll=false --runTestsByPath <test files>` |
| **Full suite command** | `CI=true yarn test --watchAll=false` |
| **Build command** | `yarn build` |
| **Estimated runtime** | ~20-90 seconds depending on full suite/build |

---

## Sampling Rate

- **After every task commit:** Run targeted `CI=true yarn test --watchAll=false --runTestsByPath <test files>` for files touched by the task.
- **After every plan wave:** Run `CI=true yarn test --watchAll=false`.
- **Before `$gsd-verify-work`:** `CI=true yarn test --watchAll=false` and `yarn build` must pass.
- **Max feedback latency:** 90 seconds for targeted feedback; full build is allowed to take longer.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 03-01 | 1 | ORD-05 | - | N/A | route smoke | `CI=true yarn test --watchAll=false --runTestsByPath src/App.test.tsx` or new route smoke test | existing / planned | pending |
| 03-01-02 | 03-01 | 1 | ORD-05 | - | N/A | build/type regression | `yarn build` | existing | pending |
| 03-02-01 | 03-02 | 2 | OPS-01 | - | N/A | create flow UI | `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.test.tsx` | planned | pending |
| 03-02-02 | 03-02 | 2 | OPS-01 | - | N/A | workflow regression | `CI=true yarn test --watchAll=false --runTestsByPath src/Hooks/useOrder.test.ts src/Common/Helpers/OrderDomainHelper.test.ts` | existing | pending |
| 03-03-01 | 03-03 | 3 | OPS-02 | - | N/A | shipping row UI | `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx` plus any new inline shipping test | existing / planned | pending |
| 03-03-02 | 03-03 | 3 | OPS-02 | - | N/A | full regression | `CI=true yarn test --watchAll=false && yarn build` | existing | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Phase 1 already repaired Jest alias resolution and one-shot test/build commands.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Direct create route flow | OPS-01 | Operator speed and scrolling are hard to fully prove in Jest | Open `/cassette-store/order/create`, search/select customer, verify compact selected-customer summary and core-first form. |
| Inline new-customer handoff | OPS-01 | End-to-end form interaction spans customer and order widgets | Search unknown phone, add customer inline, verify order form opens for the new customer. |
| Row-level shipping-code save | OPS-02 | Clipboard permission behavior may vary by browser | Use row-level shipping-code input, trigger explicit paste, save, verify code appears on row. |
| Trello failure visibility | OPS-02 | Real Trello failure cannot be forced safely in production | In test/mocked environment or by simulated failure, verify row shows saved code plus retry/resolved sync warning. |

---

## Validation Sign-Off

- [x] Existing automated test infrastructure is present.
- [x] All phase requirements have automated verification targets.
- [x] Manual-only checks are limited to browser interaction/clipboard/operator-flow confirmation.
- [x] No watch-mode flags are used in verification commands.
- [x] Full phase verification includes both tests and production build.

**Approval:** approved 2026-06-16
