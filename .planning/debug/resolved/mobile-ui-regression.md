---
status: resolved
trigger: "User reports deployed mobile UI is ugly/broken after Phase 5: backup section overlays the screen, hides other sections, UI no longer follows Ant Design standard, and the redesign is unnecessary."
created: 2026-06-18T03:34:21Z
updated: 2026-06-18T03:52:00Z
---

# Debug Session: mobile-ui-regression

## Symptoms

- expected_behavior: Mobile UI should remain functional, simple, and consistent with Ant Design defaults.
- actual_behavior: Phase 5 mobile UI appears broken/overstyled; backup/operational section overlays the screen and hides other content.
- errors: No JavaScript error reported; visual/layout regression reported from deployed mobile page.
- timeline: Started after Phase 5 cohesive UI/UX refresh was deployed.
- reproduction: Open the deployed app on a mobile browser and inspect the main layout/backup/operational controls.

## Current Focus

- hypothesis: Phase 5 custom fixed-position layout or custom card/list styling in MasterPage and refreshed screens is causing overlay and visual regressions.
- test: Inspect MasterPage/operational tray/layout changes from Phase 5, reproduce with mobile viewport if possible, then simplify back to Ant Design-standard layout.
- expecting: Removing custom overlay/floating redesign and using normal AntD components/spacing fixes blocked content without changing business behavior.
- next_action: resolved

## Evidence

- 2026-06-18T03:41:00Z: Headless mobile screenshot showed the custom fixed operational status tray was removed after changing `MasterPage` to use Ant Design messages plus `FloatButton.Group` actions only.
- 2026-06-18T03:47:00Z: Headless mobile screenshot showed dashboard restored from Phase 5 decision cards to the older Ant Design `Tabs` + `Statistic` layout.
- 2026-06-18T03:49:00Z: Order and customer route mobile screenshots showed no persistent backup/operational overlay blocking content.
- 2026-06-18T03:51:00Z: Full test suite passed: 29 suites / 148 tests.

## Eliminated

## Resolution

- root_cause: Phase 5 added a persistent fixed operational tray that rendered normal backup/done statuses as a floating panel over mobile content, and the first dashboard screen was replaced by custom decision-card styling that did not match the existing Ant Design workflow UI.
- fix: Removed the persistent operational tray from `MasterPage`, kept backup/done feedback in Ant Design messages, exposed failed-sync/COD/backup/refresh actions through the existing Ant Design `FloatButton.Group`, restored the dashboard to the tabbed Ant Design `Statistic` layout, and simplified the global theme back to the minimal pre-redesign override.
- verification: Focused app-shell/dashboard/theme tests passed; full Jest suite passed; mobile screenshots captured for dashboard, order list, and customer list.
- files_changed: src/Routing/MasterPage.tsx, src/Routing/MasterPage.test.tsx, src/Modules/Home/Screens/Dashboard.screen.tsx, src/Modules/Home/Screens/Dashboard.screen.test.tsx, src/theme/buildAppTheme.ts, src/theme/buildAppTheme.test.ts, src/Components/Card/Card.tsx
