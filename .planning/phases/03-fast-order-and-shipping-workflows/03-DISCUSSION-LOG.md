# Phase 3: Fast Order and Shipping Workflows - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md. This log preserves the alternatives considered.

**Date:** 2026-06-16
**Phase:** 3-Fast Order and Shipping Workflows
**Areas discussed:** Customer-to-order entry path, Order creation form compression, Shipping-code capture surface, Post-save status feedback

---

## Customer-to-order Entry Path

### Where should customer lookup live for the faster order creation flow?

| Option | Description | Selected |
|--------|-------------|----------|
| Create lookup | The create route can start and finish the flow even without navigation state; reuse the existing phone search inside the create screen. | ✓ |
| List modal | Keep the order list modal as the only customer lookup step, then navigate to create with a selected customer. | |
| You decide | Let the planner choose the smallest change that reduces clicks without broad UI churn. | |

**User's choice:** Create lookup.
**Notes:** `/order/create` should start the full flow without requiring `location.state.customerId`.

### When the phone number is not found, how should creating a new customer connect to order creation?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline add then continue | Reuse `CustomerAddWidget` or equivalent inside the create flow, then continue directly into the order form with the new customer. | ✓ |
| Open existing add-customer modal | Keep the current order-list behavior, but make it reachable from `/order/create`. | |
| Require customer first | If no customer exists, send the operator to the customer workflow before order creation. | |

**User's choice:** Inline add then continue.
**Notes:** Customer creation should not force the operator out of the order creation path.

### After an existing or new customer is selected, how should the create screen transition into order details?

| Option | Description | Selected |
|--------|-------------|----------|
| Collapse lookup, show form | Keep the operator on `/order/create`, show a compact selected-customer summary, and reveal the order form with existing defaults. | ✓ |
| Two clear steps | Use a simple customer step then order-details step, making the flow explicit but slightly slower. | |
| Full form immediately | Once selected, replace lookup with the full current form and rely on the page title/context. | |

**User's choice:** Collapse lookup, show form.
**Notes:** Selected customer should remain visible as compact context while the operator creates the order.

### What should happen when the operator opens `/order/create` from an existing customer row or other route that already knows the customer?

| Option | Description | Selected |
|--------|-------------|----------|
| Preselect and show form | Respect the passed `customerId`, skip lookup, show the compact selected-customer summary plus order form. | ✓ |
| Always show lookup first | Pre-fill the customer but require the operator to confirm before showing the order form. | |
| Keep old route-state behavior | Only support create when navigated from the list/customer action; otherwise show nothing or redirect. | |

**User's choice:** Preselect and show form.
**Notes:** Existing customer-entry shortcuts should become faster, not lose their current handoff.

---

## Order Creation Form Compression

### Which order details should be visible immediately after the customer is selected?

| Option | Description | Selected |
|--------|-------------|----------|
| Core first | Show customer summary, order name, item list, payment amount, note/attachments, and save. Keep shipping/payment defaults visible but compact or collapsible. | ✓ |
| Current fields, tighter layout | Keep all current fields visible, but reduce scrolling and visual weight. | |
| Minimal first | Show only items and payment amount first; hide shipping, priority, COD, notes, important note, and attachments behind sections. | |

**User's choice:** Core first.
**Notes:** Faster form means better hierarchy, not removing existing order behavior.

### How should less-common fields behave?

| Option | Description | Selected |
|--------|-------------|----------|
| Collapsed defaults | Keep current defaults applied, show a compact more-details section for changes, and make changed values visible in the collapsed summary. | ✓ |
| Always visible compact controls | Keep all controls on-screen but compress them into a denser layout. | |
| Hide unless needed | Only reveal fields when a trigger suggests they are needed, such as non-COD payment or free shipping. | |

**User's choice:** Collapsed defaults.
**Notes:** Applies to priority, free shipping, shipping partner, payment method, COD amount, shipping cost, and important note.

### How should attachments fit into the faster create flow?

| Option | Description | Selected |
|--------|-------------|----------|
| Core visible, quick add | Keep attachments visible in the core flow because they are part of existing order creation, but use a compact add/preview area. | ✓ |
| Collapsed section | Put attachments in the more-details section to reduce initial scrolling. | |
| After-save prompt | Create the order first, then offer to attach images afterward. | |

**User's choice:** Core visible, quick add.
**Notes:** Attachment behavior should remain part of create, but take less screen space.

### On successful order creation, where should the operator land?

| Option | Description | Selected |
|--------|-------------|----------|
| Back to order list | Preserve current behavior: return to the list so the new order is immediately in the operational queue. | ✓ |
| Stay on create reset | Stay on `/order/create`, reset customer lookup and form, ready for the next order. | |
| Stay on created order summary | Show the newly created order details/status before leaving. | |

**User's choice:** Back to order list.
**Notes:** Current post-create navigation should remain.

---

## Shipping-code Capture Surface

### Where should the primary shipping-code entry happen?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline row action | Add an obvious row-level quick action/input for orders that need a shipping code, while still allowing the existing modal where useful. | ✓ |
| Keep focused modal | Keep the current clipboard-prefilled modal as the primary path, but make it easier to reach. | |
| Delivery assistant first | Make the delivery-assistant flow the main entry point, then hand off to shipping-code save. | |

**User's choice:** Inline row action.
**Notes:** The existing modal can remain as a secondary or supporting path.

### How should clipboard prefill work in the inline row flow?

| Option | Description | Selected |
|--------|-------------|----------|
| Offer paste action | Show a paste-from-clipboard button/action when available, so the operator controls when clipboard text is used. | ✓ |
| Auto-prefill on focus | When the inline field opens for a placed order, automatically read clipboard like the current modal. | |
| No clipboard behavior | Keep inline input manual only; leave clipboard prefill to the existing modal. | |

**User's choice:** Offer paste action.
**Notes:** Avoid surprising clipboard reads when the inline input opens.

### After saving a first shipping code, should the order move to delivery-created status automatically as it does today?

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve automatic move | Keep current business behavior: first shipping-code save updates local state, comments to Trello, and moves the Trello card when sync succeeds. | ✓ |
| Ask before move | Save the code first, then ask before changing delivery-created status. | |
| Code only | Only save the shipping code; leave status/list movement to a separate action. | |

**User's choice:** Preserve automatic move.
**Notes:** This locks the existing business behavior for first shipping-code save.

### If local shipping-code save succeeds but Trello comment/move fails, what should the row show immediately?

| Option | Description | Selected |
|--------|-------------|----------|
| Code plus sync warning | Show the saved shipping code on the row and a compact Trello sync warning/retry state using the Phase 2 failure path. | ✓ |
| Warning toast only | Show a warning message, but rely on the existing order sync status area if the operator expands/scrolls. | |
| Keep editor open | Keep the input open until Trello sync succeeds or the operator cancels. | |

**User's choice:** Code plus sync warning.
**Notes:** Local work should remain visible even when Trello sync needs recovery.

---

## Post-save Status Feedback

### What should the operator see immediately after order creation succeeds locally but Trello card creation or attachments fail?

| Option | Description | Selected |
|--------|-------------|----------|
| Toast plus row warning | Return to the list, show a warning toast, and make the new order row visibly show Trello sync failure/retry state. | ✓ |
| Toast only | Return to the list and rely on the warning message plus existing sync status rendering if noticed. | |
| Stay on create | Keep the operator on the create screen until Trello sync is successful or manually acknowledged. | |

**User's choice:** Toast plus row warning.
**Notes:** The operator should not lose the local order or have to hunt for sync failure state.

### How prominent should successful local/Trello completion be after create or shipping-code save?

| Option | Description | Selected |
|--------|-------------|----------|
| Quiet success | Use the existing success toast and normal row content; avoid adding persistent all-good badges. | ✓ |
| Temporary row highlight | Add a short-lived row highlight or status text after successful create/shipping save. | |
| Persistent synced badge | Show a small synced/complete badge on rows with no Trello issues. | |

**User's choice:** Quiet success.
**Notes:** Persistent visual weight should be reserved for problems.

### For compact sync warnings in fast flows, what actions should be visible directly on the row?

| Option | Description | Selected |
|--------|-------------|----------|
| Retry plus resolved | Show compact `Thử lại` and `Đã xử lý` actions, matching Phase 2 recovery behavior. | ✓ |
| Retry only | Show only retry in the fast-flow row; keep manual resolved in the fuller sync status area. | |
| Open details | Show one warning chip that opens the existing sync status controls. | |

**User's choice:** Retry plus resolved.
**Notes:** Fast-flow warnings should mirror the recovery controls already established in Phase 2.

### Should Phase 3 add any broader operational status area for order/shipping sync issues?

| Option | Description | Selected |
|--------|-------------|----------|
| No, keep row-scoped | Keep Phase 3 feedback scoped to create/shipping rows and defer broad operational alerts to Phase 4. | ✓ |
| Small list banner | Add a compact order-list banner when any order has sync failures. | |
| Full status center | Add a broader sync/backup/status area now. | |

**User's choice:** No, keep row-scoped.
**Notes:** Broader operational alerts remain Phase 4 scope.

---

## Agent Discretion

- Exact component split for the create flow, compact details section, selected-customer summary, and inline shipping-code input.
- Exact implementation of the secondary shipping-code modal, as long as the row-level path is primary.
- Exact test structure for route smoke coverage, create flow behavior, and shipping-code status feedback.

## Deferred Ideas

- Broader operational status center, order-list-wide alerting, COD/search utilities, and contextual action surfaces remain Phase 4 scope.
- Cohesive visual-system and mobile UI refresh remains Phase 5 scope.
- Backend, collaboration, public storefront, and external order-status workflows remain outside the current milestone.
