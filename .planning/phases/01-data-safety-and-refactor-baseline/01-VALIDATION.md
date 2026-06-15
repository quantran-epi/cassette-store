---
phase: 01
slug: data-safety-and-refactor-baseline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-15
---

# Phase 01 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest via `react-scripts` 5.0.1, React Testing Library 13.4.0, `@testing-library/jest-dom` 5.17.0 |
| **Config file** | `package.json`, `craco.config.js`, `src/setupTests.ts` |
| **Quick run command** | `CI=true yarn test --watchAll=false --runTestsByPath src/App.test.tsx` |
| **Full suite command** | `CI=true yarn test --watchAll=false` |
| **Estimated runtime** | ~30 seconds after alias repair |

---

## Sampling Rate

- **After every task commit:** Run `CI=true yarn test --watchAll=false --runTestsByPath <changed-test-files>` when focused tests exist.
- **After every plan wave:** Run `CI=true yarn test --watchAll=false`.
- **Before `$gsd-verify-work`:** Full test suite and `yarn build` must be green.
- **Max feedback latency:** 30 seconds for focused tests, 90 seconds for full local gate.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01-01 | 1 | SAFE-01, SAFE-03 | - | N/A - security enforcement disabled | smoke/config | `CI=true yarn test --watchAll=false --runTestsByPath src/App.test.tsx` | partial | pending |
| 01-01-02 | 01-01 | 1 | SAFE-02 | - | N/A - security enforcement disabled | build | `yarn build` then `git status --short` | yes | pending |
| 01-02-01 | 01-02 | 1 | DATA-01, DATA-02 | - | Reject invalid backup before mutation | unit | `CI=true yarn test --watchAll=false --runTestsByPath src/Common/Helpers/BackupHelper.test.ts` | Wave 0 | pending |
| 01-02-02 | 01-02 | 1 | DATA-03, DATA-04 | - | Restore complete safe slices only | reducer/unit | `CI=true yarn test --watchAll=false --runTestsByPath src/Store/Reducers/OrderReducer.test.ts src/Store/Reducers/CustomerReducer.test.ts src/Store/Reducers/AppContextReducer.test.ts` | Wave 0 | pending |
| 01-03-01 | 01-03 | 2 | DATA-02, DATA-03, DATA-04 | - | No dispatch until normalized backup passes validation | integration/unit | `CI=true yarn test --watchAll=false --runTestsByPath src/Common/Helpers/BackupHelper.test.ts src/Routing/MasterPage.test.tsx` | Wave 0 | pending |
| 01-04-01 | 01-04 | 2 | DATA-05, SYNC-04 | - | Failed done-order refresh preserves prior IDs | unit/component | `CI=true yarn test --watchAll=false --runTestsByPath src/Hooks/useOrder.test.ts src/Routing/MasterPage.test.tsx` | Wave 0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] Repair Jest alias resolution for `@components`, `@routing`, `@modules`, `@store`, `@common`, and `@hooks` before relying on any test gate.
- [ ] Replace `src/App.test.tsx` stale `learn react` assertion with an app-specific smoke test that accounts for `/cassette-store` routing or uses a router-safe shell.
- [ ] Add backup schema/normalizer test coverage for new envelope, legacy raw `RootState`, empty input, invalid JSON, unsupported schema version, missing sections, and explicit defaults.
- [ ] Add reducer tests for complete order restore: `orders`, `lastSequence`, `doneOrders`, and `codPayments`.
- [ ] Add customer and app-context restore/default tests.
- [ ] Add done-order refresh tests proving success, empty, failure, and atomic failure behavior.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Persistent backup/restore/done-refresh status placement is readable and unobtrusive on the existing drawer/floating-action surfaces. | DATA-05, SYNC-04 | Exact placement is UI judgement in Phase 1 and should stay compact rather than becoming the Phase 4 status center. | Run the app, trigger backup/restore/done-refresh success, empty, and failure states with mocks or controlled inputs, and confirm status copy does not overlap existing controls on mobile and desktop widths. |
| Production build output remains suitable for static `/cassette-store` hosting. | SAFE-02 | Deployment output is generated and committed only during deploy, not during ordinary planning. | Run `yarn build`; confirm the build summary says it is hosted at `/cassette-store/`; do not copy `build/` to `docs/` unless deploying. |

---

## Validation Sign-Off

- [ ] All tasks have automated verify commands or Wave 0 dependencies.
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify.
- [ ] Wave 0 covers all missing test references.
- [ ] No watch-mode flags.
- [ ] Feedback latency < 90 seconds for the full local gate.
- [ ] `nyquist_compliant: true` set in frontmatter after Wave 0 and phase tests are in place.

**Approval:** pending
