---
last_mapped_commit: 267df10e480e7fc98ab019c903934a1defd25960
last_mapped_at: 2026-06-15
---

<!-- refreshed: 2026-06-15 -->
# Architecture

**Analysis Date:** 2026-06-15

## System Overview

```text
Browser user
    |
    v
React app shell: `src/index.tsx` -> `src/App.tsx`
    |
    v
Routing/layout: `src/Routing/RootRouter.tsx`, `src/Routing/MasterPage.tsx`
    |
    +--> Feature screens: `src/Modules/Home`, `src/Modules/Customer`, `src/Modules/Order`
    |        |
    |        +--> Local UI wrappers: `src/Components`
    |        +--> Domain hooks: `src/Hooks/useOrder.ts`, `src/Hooks/Trello/useTrello.ts`
    |
    v
Redux store: `src/Store/Store.ts`, `src/Store/Reducers/*.ts`
    |
    +--> IndexedDB persistence: `src/Store/idbStorage.ts`
    +--> Trello API side effects: `src/Hooks/useAPI.ts`, `src/Hooks/Trello/useTrello.ts`
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| App shell | Global Ant Design theme, message/modal providers, Redux provider, persistence gate, root router | `src/App.tsx` |
| Router | Browser routing and feature route registration | `src/Routing/RootRouter.tsx` |
| Master layout | Header, drawer navigation, bottom tabs, manual backup restore, backup/upload float actions | `src/Routing/MasterPage.tsx` |
| Store | Redux Toolkit store and redux-persist setup | `src/Store/Store.ts` |
| Order domain | Order business rules, Trello orchestration, statistics helpers | `src/Hooks/useOrder.ts` |
| Trello client | Trello list/label constants and REST method wrappers | `src/Hooks/Trello/useTrello.ts` |
| API client | Generic browser fetch wrapper for GET/POST/PUT/DELETE/file upload | `src/Hooks/useAPI.ts` |
| UI library layer | Local wrappers around Ant Design primitives | `src/Components/` |

## Pattern Overview

**Overall:** Client-only React SPA with Redux-persist state and direct third-party API integration.

**Key Characteristics:**
- No backend service or server-side data model; all persistent app state is browser-local in IndexedDB through `src/Store/idbStorage.ts`.
- Route modules are grouped by feature under `src/Modules/`, while shared UI and helpers are grouped under `src/Components/` and `src/Common/`.
- Order workflows combine local Redux mutations with Trello side effects in `src/Hooks/useOrder.ts`.
- Deployment appears to be static, with generated output checked into `docs/` and routing rooted at `/cassette-store`.

## Layers

**Application Shell:**
- Purpose: Compose global providers and runtime setup.
- Location: `src/index.tsx`, `src/App.tsx`.
- Contains: React root mount, Ant Design token configuration, message/modal providers, Redux provider, persist gate, service worker unregister call.
- Depends on: React, ReactDOM, Ant Design, Redux store, router.
- Used by: Browser entry point only.

**Routing and Layout:**
- Purpose: Own top-level navigation, route nesting, drawer/bottom tab UI, and app-wide background actions.
- Location: `src/Routing/RootRouter.tsx`, `src/Routing/RootRoutes.ts`, `src/Routing/MasterPage.tsx`.
- Contains: `BrowserRouter`, `Route` definitions, `Outlet`, menu buttons, backup/restore actions.
- Depends on: Module screens, shared components, `useOrder`, `useTrello`, Redux actions.
- Used by: `src/App.tsx`.

**Feature Modules:**
- Purpose: Own user workflows for dashboard, customers, orders, and COD payments.
- Location: `src/Modules/Home/`, `src/Modules/Customer/`, `src/Modules/Order/`.
- Contains: Screen components, widgets, feature route config, form flows, list/detail actions.
- Depends on: Shared components, store selectors/actions, hooks, constants/helpers.
- Used by: `src/Routing/RootRouter.tsx`.

**Domain and Integration Hooks:**
- Purpose: Encapsulate reusable stateful behavior and side effects.
- Location: `src/Hooks/`.
- Contains: `useOrder`, `useTrello`, `useAPI`, `useToggle`, `useTheme`, `useScreenTitle`.
- Depends on: Redux, Trello models, common helpers, browser fetch/storage APIs.
- Used by: Routing and module screens.

**State Layer:**
- Purpose: Maintain customers, orders, app context, done-order IDs, and COD payment cycles.
- Location: `src/Store/`.
- Contains: Redux slices, TypeScript models, `redux-persist` storage adapter.
- Depends on: Redux Toolkit, redux-persist, idb-keyval, lodash helpers.
- Used by: App provider, hooks, screens, backup/restore flows.

**Shared UI and Utilities:**
- Purpose: Provide local component vocabulary and business helper functions.
- Location: `src/Components/`, `src/Common/`.
- Contains: Ant Design wrappers, layout primitives, SmartForm, constants, route/date/number/order/area helpers.
- Depends on: Ant Design, React, lodash, app model types.
- Used by: Nearly all module screens and routing layout.

## Data Flow

### User Creates an Order

1. User navigates through `src/Routing/RootRouter.tsx` to `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx`.
2. `OrderCreateScreen` uses `useSmartForm` from `src/Components/SmartForm/useSmartForm.ts` to collect and transform form values.
3. Payment/COD amounts are calculated with `src/Hooks/useOrder.ts` and `src/Common/Helpers/OrderHelper.ts`.
4. Submit calls `orderUtils.createOrder()` in `src/Hooks/useOrder.ts`.
5. `useOrder.createOrder()` dispatches Redux actions from `src/Store/Reducers/OrderReducer.ts`, creates a Trello card through `src/Hooks/Trello/useTrello.ts`, stores the Trello card ID, and uploads attachments.
6. Redux-persist writes updated state to IndexedDB through `src/Store/idbStorage.ts`.

### App Startup and Persistence

1. `src/index.tsx` mounts `<App />` and unregisters service workers.
2. `src/App.tsx` creates provider nesting and wraps `<RootRouter />` in `PersistGate`.
3. `src/Store/Store.ts` configures persisted Redux state using `idbStorage` from `src/Store/idbStorage.ts`.
4. Feature screens read state through `useSelector` and mutate via Redux action dispatches.

### Backup and Done-Order Refresh

1. `AppNoti` in `src/Routing/MasterPage.tsx` runs on mount.
2. `_refreshDoneOrder()` calls `useOrder.refreshDoneOrders()` in `src/Hooks/useOrder.ts`.
3. `useOrder.refreshDoneOrders()` calls Trello `getCardsByList()` through `src/Hooks/Trello/useTrello.ts` and dispatches done-order IDs into `src/Store/Reducers/OrderReducer.ts`.
4. `backup()`/`backupNow()` in `src/Routing/MasterPage.tsx` serializes `store.getState()` and uploads it to a Trello card attachment.

**State Management:**
- Durable state: Redux persisted into IndexedDB via `src/Store/Store.ts` and `src/Store/idbStorage.ts`.
- Ephemeral UI state: React `useState` and small hooks like `src/Hooks/useToggle.ts`.
- Remote state: Trello cards/attachments are used as external workflow state and backup storage.

## Key Abstractions

**Local Component Wrappers:**
- Purpose: Normalize Ant Design usage behind app-specific exports.
- Examples: `src/Components/Button/Button.tsx`, `src/Components/List/List.tsx`, `src/Components/Modal/Modal.tsx`, `src/Components/Layout/Stack/Stack.tsx`.
- Pattern: Thin wrapper plus `index.ts` barrel exports.

**SmartForm:**
- Purpose: Centralize Ant Design Form wiring, hidden fields, transformation, and submission callback behavior.
- Examples: `src/Components/SmartForm/SmartForm.tsx`, `src/Components/SmartForm/useSmartForm.ts`, `src/Components/SmartForm/SmartFormItem/SmartFormItem.tsx`.
- Pattern: Compound component plus generic hook.

**Route Config Helpers:**
- Purpose: Build stable route strings for feature modules.
- Examples: `src/Routing/RootRoutes.ts`, `src/Modules/Order/Routing/OrderRouteConfig.ts`, `src/Modules/Customer/Routing/CustomerRouteConfig.ts`, `src/Common/Helpers/RouteHelper.ts`.
- Pattern: Function-returning route tree.

**Redux Slices:**
- Purpose: Store app context, customers, orders, done-order IDs, and COD payment cycles.
- Examples: `src/Store/Reducers/AppContextReducer.ts`, `src/Store/Reducers/CustomerReducer.ts`, `src/Store/Reducers/OrderReducer.ts`.
- Pattern: Redux Toolkit `createSlice` reducers with Immer mutation syntax.

**Domain Models:**
- Purpose: Type the persisted domain entities.
- Examples: `src/Store/Models/Order.ts`, `src/Store/Models/OrderItem.ts`, `src/Store/Models/Customer.ts`, `src/Store/Models/CodPaymentCycle.ts`.
- Pattern: Type aliases with string-valued status/payment fields backed by constants in `src/Common/Constants/AppConstants.ts`.

## Entry Points

**Browser Entry:**
- Location: `src/index.tsx`.
- Triggers: Browser loads the compiled bundle.
- Responsibilities: Create React root, render `<App />`, unregister service workers, initialize optional web vitals loading.

**App Root:**
- Location: `src/App.tsx`.
- Triggers: Rendered by `src/index.tsx`.
- Responsibilities: Provide theme, message/modal contexts, Redux store, persistence gate, and router.

**Route Root:**
- Location: `src/Routing/RootRouter.tsx`.
- Triggers: Rendered inside app providers.
- Responsibilities: Register route tree under `BrowserRouter basename="/cassette-store"`.

## Architectural Constraints

- **Threading:** Single browser main thread; there are no web workers beyond optional/generated service worker code in `src/service-worker.ts` and `docs/service-worker.js`.
- **Global state:** Redux store is a module-level singleton exported from `src/Store/Store.ts` and is also imported directly by `src/Hooks/useOrder.ts` and `src/Routing/MasterPage.tsx`.
- **Client-only secrets:** Trello credentials live in browser-delivered code in `src/Hooks/Trello/useTrello.ts`.
- **Offline/local-first data:** The app has no authoritative backend database; clearing browser storage can remove local app data unless a Trello backup exists.
- **Static route base:** Router basename is hard-coded to `/cassette-store` in `src/Routing/RootRouter.tsx`.

## Anti-Patterns

### Remote API credentials in client source

**What happens:** `src/Hooks/Trello/useTrello.ts` stores Trello credential literals and appends them to every request.
**Why it's wrong:** Browser users can inspect bundled credentials and use the same Trello identity outside the app.
**Do this instead:** Move Trello operations behind a backend/API proxy or a scoped token exchange, then configure secrets outside client source.

### Business logic and remote side effects in one hook

**What happens:** `src/Hooks/useOrder.ts` calculates business status, mutates Redux state, calls Trello, moves cards, uploads attachments, and computes statistics.
**Why it's wrong:** A change to order rules can accidentally affect Trello side effects or UI statistics, and the file has no focused tests.
**Do this instead:** Split pure order calculations into helper/service modules and keep Trello mutations behind a smaller integration adapter.

### Generated build output tracked beside source

**What happens:** `docs/` contains generated files such as `docs/index.html`, `docs/static/js/main.d392b372.js`, and `docs/service-worker.js`.
**Why it's wrong:** Source and generated output can drift unless builds are performed consistently before deployment commits.
**Do this instead:** Document the deployment workflow or automate it in CI.

## Error Handling

**Strategy:** Expected UI failures generally show Ant Design messages; async integration failures are inconsistently caught and often return strings or `null`.

**Patterns:**
- `src/Hooks/useOrder.ts` catches Trello failures in several methods and returns either `null`, a string error message, or the caught value.
- `src/Hooks/useAPI.ts` rejects on fetch failures but does not branch on non-2xx HTTP responses before parsing JSON.
- `src/Routing/MasterPage.tsx` catches backup restore parsing/fetch errors and displays `message.error(e?.message)`.
- There is no React error boundary in `src/App.tsx` or `src/Routing/RootRouter.tsx`.

## Cross-Cutting Concerns

**Logging:** Browser console only, mainly in `src/Hooks/useAPI.ts` and `src/serviceWorkerRegistration.ts`.

**Validation:** Ant Design form validation through SmartForm item definitions; no schema library such as Zod/Yup is used. Domain values are string constants from `src/Common/Constants/AppConstants.ts`.

**Authentication:** No app auth layer. Trello API identity is embedded in `src/Hooks/Trello/useTrello.ts`.

**Theming:** Ant Design theme tokens are set in `src/App.tsx`; Less variables are also overridden in `craco.config.js`.

---

*Architecture analysis: 2026-06-15*
