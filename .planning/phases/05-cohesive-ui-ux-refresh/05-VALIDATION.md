---
phase: 05
slug: cohesive-ui-ux-refresh
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-17
updated: 2026-06-18
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for the cohesive mobile UI refresh. Phase 5 uses the existing CRA/Jest/RTL test stack and adds focused render coverage while preserving Phase 1-4 behavior.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest via `react-scripts test` 5.0.1 + React Testing Library 13.4.0 + `@testing-library/jest-dom` 5.17.0 |
| **Config file** | CRA implicit Jest config in `package.json`; setup in `src/setupTests.ts` |
| **Quick run command** | `CI=true yarn test --watchAll=false --runTestsByPath <target tests>` |
| **Full suite command** | `CI=true yarn test --watchAll=false` |
| **Build command** | `yarn build` |
| **Estimated runtime** | Targeted tests ~10-40 seconds; full suite/build depends on local machine but must exit 0 |

---

## Sampling Rate

- **After every task commit:** Run the task's targeted `CI=true yarn test --watchAll=false --runTestsByPath ...` command.
- **After every plan wave:** Run `CI=true yarn test --watchAll=false`.
- **Before `$gsd-verify-work`:** Run `CI=true yarn test --watchAll=false` and `yarn build`.
- **Max feedback latency:** No implementation task may have three consecutive UI edits without an automated targeted test command.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | UX-01, UX-05 | — | N/A | render/unit | `CI=true yarn test --watchAll=false --runTestsByPath src/App.test.tsx src/Routing/RootRouter.test.tsx` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | UX-01, UX-02, UX-03 | — | N/A | render/unit | `CI=true yarn test --watchAll=false --runTestsByPath src/App.test.tsx src/Routing/RootRouter.test.tsx` | ✅ | ⬜ pending |
| 05-01-03 | 01 | 1 | UX-01, UX-02, UX-03 | — | N/A | full/build | `CI=true yarn test --watchAll=false && yarn build` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 2 | UX-02, UX-05 | — | N/A | render | `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderList.screen.test.tsx src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx` | ✅ | ⬜ pending |
| 05-02-02 | 02 | 2 | UX-02, UX-05 | — | N/A | render | `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.test.tsx` | ✅ | ⬜ pending |
| 05-02-03 | 02 | 2 | UX-02, UX-05 | — | N/A | render/full | `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderList.screen.test.tsx src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.test.tsx src/Modules/Order/Screens/OrderItem/OrderActionSurface.widget.test.tsx` | ✅ | ⬜ pending |
| 05-03-01 | 03 | 3 | UX-01, UX-03, UX-05 | — | N/A | render | `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.test.tsx src/Routing/MasterPage.test.tsx` | ✅ | ⬜ pending |
| 05-03-02 | 03 | 3 | UX-03, UX-05 | — | N/A | render/unit | `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget.test.tsx src/Common/Helpers/CodPaymentImportHelper.test.ts` | ✅ | ⬜ pending |
| 05-03-03 | 03 | 3 | UX-01, UX-03, UX-05 | — | N/A | full/build | `CI=true yarn test --watchAll=false && yarn build` | ✅ | ⬜ pending |
| 05-04-01 | 04 | 2 | UX-04, UX-05 | — | N/A | unit/render | `CI=true yarn test --watchAll=false --runTestsByPath src/Store/Selectors/DashboardSelectors.test.ts` | ✅ | ⬜ pending |
| 05-04-02 | 04 | 2 | UX-02, UX-04, UX-05 | — | N/A | unit/render | `CI=true yarn test --watchAll=false --runTestsByPath src/Store/Selectors/DashboardSelectors.test.ts src/Routing/RootRouter.test.tsx` | ✅ | ⬜ pending |
| 05-04-03 | 04 | 2 | UX-04, UX-05 | — | N/A | full/build | `CI=true yarn test --watchAll=false && yarn build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing Jest/RTL infrastructure covers Phase 5. No package install or separate Wave 0 plan is required. Each plan task creates or updates its own focused tests before the related implementation is considered done.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cohesive visual system across root theme, primitives, and refreshed screens | UX-01 | Aesthetic coherence and hierarchy require visual judgment | Run the app on a phone-width viewport and review dashboard, order list, customer list, order create, COD list/review, and operational tray for tokenized spacing/type/color. |
| Dense but tappable mobile layouts | UX-02 | Touch target size and readability are visual/tactile | On a phone-width viewport, tap search/filter controls, order/customer rows, COD include controls, popover reveal fields, and bottom navigation; controls must be readable and not overlap. |
| Workflow states are understandable | UX-03 | Loading/empty/error/success/confirmation presentation spans UI states | Trigger empty order list, filtered empty list, COD parse error, COD apply confirmation, backup/done refresh loading/error/success, and quiet success messages. |
| Dashboard guides operational decisions | UX-04 | Information architecture is judgment-based | Confirm dashboard groups directly answer operator decisions such as COD to reconcile, shipping/follow-up attention, revenue/cost health, and customer follow-up. |
| Phase 1-4 behavior remains available | UX-05 | Full workflow preservation includes browser/Trello/manual interactions | Re-run backup/restore, done refresh, order create, shipping code save, COD import/apply, row actions, and URL-backed order filters after automated tests pass. |

---

## Validation Sign-Off

- [x] All planned tasks include `<automated>` verify commands.
- [x] Sampling continuity: no 3 consecutive implementation tasks lack automated verification.
- [x] No watch-mode commands are used; every test command includes `CI=true` and `--watchAll=false`.
- [x] Wave 0 is not needed because Jest/RTL infrastructure and core tests already exist.
- [x] Phase gate requires full Jest suite and production build.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-06-18
