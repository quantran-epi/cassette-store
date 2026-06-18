---
quick_id: 260618-men
status: complete
date: 2026-06-18
source_commit: 831d4b7
deployment_commit: e085640
completed_at: 2026-06-18T09:18:17Z
---

# Quick Task 260618-men Summary

## Outcome

Redesigned the order list item to be cleaner, more hands-on, and aligned with `docs/specs/conventional-specs.md`, then deployed the static app through the committed `docs/` build output.

## Changes

- Added shared compact `ActionButton` and used it for in-item order actions, inline shipping-code controls, and sync recovery actions.
- Converted shared `Tag` to rounded pill styling so order status, payment, priority, and Trello tags follow C7 globally.
- Reworked the order row into a scan-first layout: title and customer summary first, tags under the name, payment total separated, top-right primary action plus overflow menu, and copyable quick-action fields for shipping code, phone, and address.
- Preserved tooltip behavior for clipped values instead of adding extra popover buttons.
- Normalized the conventional spec file path to `docs/specs/conventional-specs.md`.
- Deployed generated production assets to `docs/` after `yarn build`.

## Verification

- `CI=true yarn test --watchAll=false --runTestsByPath src/Modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderSyncStatus.widget.test.tsx src/Modules/Order/Screens/OrderItem/OrderActionSurface.widget.test.tsx` passed.
- `yarn build` passed with existing non-failing CRA/Browserslist/ESLint warnings.

## Commits

- Source: `831d4b7` (`fix: redesign order row to conventional spec`)
- Deployment: `e085640` (`docs: deploy order row redesign`)
