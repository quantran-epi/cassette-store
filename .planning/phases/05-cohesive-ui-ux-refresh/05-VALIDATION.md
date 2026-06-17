---
phase: 05
slug: cohesive-ui-ux-refresh
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-17
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | {jest / react-testing-library — confirm during planning} |
| **Config file** | {path or "none — Wave 0 installs"} |
| **Quick run command** | `{quick command}` |
| **Full suite command** | `{full command}` |
| **Estimated runtime** | ~{N} seconds |

---

## Sampling Rate

- **After every task commit:** Run `{quick run command}`
- **After every plan wave:** Run `{full suite command}`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** {N} seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | UX-01 | — | N/A | unit | `{command}` | ✅ / ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `{tests/test_file}` — stubs for UX-01..UX-05
- [ ] `{shared fixtures}`
- [ ] `{framework install}` — if no framework detected

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cohesive visual system (spacing/type/color/density) | UX-01 | Aesthetic coherence is not machine-assertable | Visual review of refreshed screens against token scale |
| Mobile tappable + readable layouts | UX-02 | Touch ergonomics / readability are visual | Manual mobile review of dashboard, customer, order, COD surfaces |
| Workflow states clear (loading/empty/error/success/confirm) | UX-03 | Visual state presentation | Trigger each state per surface and review |
| Dashboard guides operational decisions | UX-04 | Information design judgment | Review dashboard against operator decision needs |
| Verified Phase 1–4 business behavior preserved | UX-05 | Behavior-preservation regression | Re-run/observe backup-restore, sync recovery, COD apply, order/shipping flows; assert Vietnamese labels present + selectors unchanged |

*Automated checks can assert label/selector preservation; aesthetics are manual (phase has `ui_safety_gate: true`).*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < {N}s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
