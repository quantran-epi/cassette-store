## Deployment

When the user asks to deploy this app, follow `docs/deployment.md`.

Summary: run `yarn build`, copy all files from `build/` into `docs/` except `build/manifest.json`, then run `git add ./src/*`, `git add ./docs/*`, and `git push`.

<!-- GSD:project-start source:PROJECT.md -->

## Project

**Cassette Store**

Cassette Store is an existing browser-based operations app for running a small cassette sales workflow. It helps an internal operator manage customers, create and track orders, coordinate shipping and COD payment, and mirror operational state into Trello.

The next milestone converts the repo into a GSD-managed brownfield project and drives a major app refactor focused on data safety, daily operator workflow, and a more useful, polished UI/UX for an internal app.

**Core Value:** An internal operator can manage cassette orders, shipping, COD, and customer follow-up quickly and confidently without losing data or desynchronizing Trello.

### Constraints

- **Brownfield continuity**: Preserve existing customer, order, COD, Trello, and backup workflows while refactoring - the app is already useful and should not be frozen for a large rewrite.
- **Internal tool scope**: Treat external-user/public-hosting work as out of scope for this milestone - the app is used by a trusted internal operator/team.
- **Data integrity**: Order state, customer state, COD cycles, done-order IDs, and Trello card IDs must survive backup/restore and refactor phases without silent loss.
- **Static deployment**: The current deployment shape uses committed `docs/` build output and `/cassette-store` routing; changes to deployment should be deliberate and verified.
- **Testing baseline**: Fix the existing test runner and add focused coverage around reducers, helpers, and Trello/order sync before making broad behavior changes.
- **Audience**: Optimize first for internal operators using the app repeatedly on mobile and desktop, not public customers.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript 4.9.5 - All application source under `src/`, including React components, hooks, Redux state, models, and helpers.
- TSX - React view code in `src/App.tsx`, `src/Routing/*.tsx`, `src/Components/**/*.tsx`, and `src/Modules/**/*.tsx`.
- JavaScript - Build/runtime configuration in `craco.config.js` and generated production assets under `docs/`.
- CSS - Global styling in `src/App.css` and `src/index.css`; Ant Design Less variables are customized through `craco.config.js`.

## Runtime

- Browser SPA runtime - The app mounts in `src/index.tsx` and stores user data in browser IndexedDB/localStorage.
- Node.js - Required for development, testing, and builds through Create React App/CRACO scripts in `package.json`; no explicit `engines` or `.nvmrc` version is declared.
- Yarn is the locked package manager because `yarn.lock` is present.
- npm-compatible scripts are defined in `package.json` and can also be run with npm if dependencies are installed.

## Frameworks

- React 18.2.0 - UI framework, mounted from `src/index.tsx`.
- React Router DOM 6.22.3 - Client-side routing in `src/Routing/RootRouter.tsx` and `src/Routing/RootRoutes.ts`.
- Redux Toolkit 2.2.3, React Redux 9.1.0, Redux Persist 6.0.0 - Client state and persistence in `src/Store/Store.ts` and `src/Store/Reducers/*.ts`.
- Ant Design 5.16.1 - Component foundation wrapped by local components in `src/Components/`.
- Jest via `react-scripts test` - Configured implicitly by Create React App and referenced by `package.json`.
- React Testing Library 13.4.0 and `@testing-library/jest-dom` 5.17.0 - Used by `src/App.test.tsx` and `src/setupTests.ts`.
- Create React App `react-scripts` 5.0.1 - Base dev server, Jest config, and webpack build.
- CRACO 7.1.0 - Overrides CRA webpack and Less config in `craco.config.js`.
- `craco-less` 3.0.1 - Enables Less variable overrides for Ant Design theming in `craco.config.js`.
- Workbox 6.6.x - Service worker generation/runtime files are present in `src/service-worker.ts`, `src/serviceWorkerRegistration.ts`, and generated `docs/service-worker.js`, though `src/index.tsx` currently unregisters the service worker.

## Key Dependencies

- `antd` 5.16.1 - Primary UI component library; local wrappers live in `src/Components/`.
- `@ant-design/icons` - Icon usage across routing, lists, order actions, and dashboard views such as `src/Routing/MasterPage.tsx`.
- `idb-keyval` 6.2.2 - IndexedDB storage adapter for redux-persist in `src/Store/idbStorage.ts`.
- `lodash` 4.17.21 - Sorting, cloning, debouncing, and comparison utilities in `src/Hooks/useOrder.ts`, `src/Components/SmartForm/useSmartForm.ts`, and module screens.
- `moment` 2.30.1 and `dayjs` 1.11.10 - Date formatting/calculation, with Moment used heavily in `src/Hooks/useOrder.ts`, `src/Routing/MasterPage.tsx`, and `src/Modules/Home/Screens/Dashboard.screen.tsx`.
- `nanoid` 4.0.1 - Client-side ID generation in `src/Common/Helpers/OrderHelper.ts` and `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx`.
- `react-copy-to-clipboard` 5.1.0 - Clipboard affordances in order/customer item screens.
- Browser `fetch` - Generic API access in `src/Hooks/useAPI.ts`, Trello calls in `src/Hooks/Trello/useTrello.ts`, and backup restore download in `src/Routing/MasterPage.tsx`.
- Browser IndexedDB/localStorage - Persistence through `src/Store/idbStorage.ts` and periodic backup timing in `src/Routing/MasterPage.tsx`.

## Configuration

- Local environment files were not inspected during mapping.
- No typed environment variable contract is used by the app today.
- Trello API configuration is currently handled in `src/Hooks/Trello/useTrello.ts`; keep changes scoped to sync reliability and recovery unless explicitly requested.
- `package.json` - Scripts, dependencies, CRA ESLint config, and browser targets.
- `tsconfig.json` - Non-strict TypeScript, `jsx: react-jsx`, `baseUrl: .`, and path aliases for `@components`, `@modules`, `@routing`, `@store`, `@common`, and `@hooks`.
- `craco.config.js` - Webpack aliases, removal of CRA `ModuleScopePlugin`, and Ant Design Less theme variables.
- `public/index.html` - CRA HTML shell, viewport lock, Kanit Google Font, and app metadata.
- `public/manifest.json` - Mostly default CRA manifest values.

## Platform Requirements

- Node.js and Yarn/npm with the checked-in `yarn.lock`.
- A modern browser with IndexedDB, localStorage, fetch, and service worker APIs available.
- Trello board/list/label identifiers must match values used by `src/Hooks/Trello/useTrello.ts`.
- Static SPA deployment. The checked-in `docs/` directory contains a production build, and `src/Routing/RootRouter.tsx` uses `BrowserRouter basename="/cassette-store"`, which aligns with GitHub Pages style hosting.
- No backend server is present; all business data lives in browser storage and Trello attachments/API calls.

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- Use PascalCase for React component files, such as `src/Components/Button/Button.tsx` and `src/Components/Modal/ModalProvider.tsx`.
- Use `*.screen.tsx` for routed screens, such as `src/Modules/Customer/Screens/CustomerList.screen.tsx`.
- Use `*.widget.tsx` for nested feature UI pieces, such as `src/Modules/Order/Screens/OrderItem/OrderRefund.widget.tsx`.
- Use `index.ts` barrel files for component/hook exports, such as `src/Components/Button/index.ts` and `src/Hooks/index.ts`.
- Existing typo must be preserved unless intentionally refactoring: tooltip files live under `src/Components/Tootip/`.
- camelCase for exported hooks and helpers: `useOrder`, `useTrello`, `useSmartForm`, `calculatePendingOrderPrioritymark`.
- Local helper functions often use `_` prefix inside components/hooks, such as `_onRehydrateData` in `src/Routing/MasterPage.tsx` and `_onUpdatePlacedItems` in `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx`.
- Event handlers commonly use `_on<Action>` naming in feature screens.
- camelCase for local variables and state values.
- UPPER_SNAKE_CASE for exported constants in `src/Common/Constants/AppConstants.ts`, such as `ORDER_STATUS` and `CUSTOMER_PROVINCES`.
- Component names and type aliases use PascalCase, such as `Order`, `Customer`, `UseOrder`, and `UseSmartForm`.
- Type aliases are preferred over interfaces for domain models in `src/Store/Models/Order.ts` and `src/Store/Models/Customer.ts`.
- Redux state types use interfaces in reducers, such as `OrderState` in `src/Store/Reducers/OrderReducer.ts`.
- Several model fields are typed as `string` with comments pointing to constants, such as `status: string; //ORDER_STATUS` in `src/Store/Models/Order.ts`.

## Code Style

- No Prettier config is present.
- Formatting is manually mixed: many files use 4-space indentation, while CRA defaults remain 2-space in `src/App.tsx` and `src/index.tsx`.
- Both double and single quotes appear: aliases and most app code often use double quotes, while CRA-generated code uses single quotes.
- Semicolons are inconsistent; match the surrounding file when editing.
- CRA ESLint config is declared in `package.json` with `react-app` and `react-app/jest`.
- There is no dedicated `lint` script in `package.json`.
- TypeScript strict mode is disabled in `tsconfig.json` with `strict: false`.

## Import Organization

- `@components/*` maps to `src/Components/*` in `tsconfig.json` and `craco.config.js`.
- `@modules/*` maps to `src/Modules/*`.
- `@routing/*` maps to `src/Routing/*`.
- `@store/*` maps to `src/Store/*`.
- `@common/*` maps to `src/Common/*`.
- `@hooks` maps to `src/Hooks/index.ts`.

## Error Handling

- UI actions generally show messages through `useMessage()` from `src/Components/Message/MessageProvider.tsx`.
- Trello-heavy methods in `src/Hooks/useOrder.ts` often use `try/catch` and return `null`, a string error, or the caught error value.
- Fetch wrapper methods in `src/Hooks/useAPI.ts` reject only on network exceptions; non-2xx HTTP statuses are still parsed as JSON.
- Form submission errors flow through `onFinishFailed` in `src/Components/SmartForm/useSmartForm.ts`.

## Logging

- `src/Hooks/useAPI.ts` has a `_log` helper intended for API response logging.
- `src/serviceWorkerRegistration.ts` contains CRA service worker console messages.
- Business screens primarily use user-facing messages rather than console output.

## Comments

- Comments are sparse and mostly used for temporarily disabled code or TODO-like workarounds.
- Examples include commented reorder logic in `src/Hooks/useOrder.ts`, a commented `dispatch(test())` in `src/Routing/MasterPage.tsx`, and a commented `console.log` in `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx`.
- No JSDoc/TSDoc pattern is used for app functions or model types.

## Function Design

- Small component wrappers in `src/Components/` are short and focused.
- Domain hook `src/Hooks/useOrder.ts` is large and mixes pure calculations, Redux updates, Trello calls, and statistics. Treat changes there as high-risk.
- Hooks use object props types even when empty, such as `UseToggleProps` in `src/Hooks/useToggle.ts` and `UseTrelloProps` in `src/Hooks/Trello/useTrello.ts`.
- Domain helpers frequently pass positional values, such as `OrderHelper.createNewEmptyOrderItem()` in `src/Common/Helpers/OrderHelper.ts`.
- Hooks return object APIs, for example `useOrder()` and `useSmartForm()`.
- Some expected failures return string/null instead of throwing, especially in `src/Hooks/useOrder.ts`.

## Module Design

- Named exports are common for components, hooks, and Redux actions.
- Default exports are used for reducers in `src/Store/Reducers/*.ts` and route config in `src/Modules/*/Routing/*RouteConfig.ts`.
- Component directories expose public APIs through `index.ts`, such as `src/Components/Form/Input/index.ts`.
- `src/Hooks/index.ts` is the public hook barrel used by imports like `import {useOrder, useTheme} from "@hooks"`.

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

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

- No backend service or server-side data model; all persistent app state is browser-local in IndexedDB through `src/Store/idbStorage.ts`.
- Route modules are grouped by feature under `src/Modules/`, while shared UI and helpers are grouped under `src/Components/` and `src/Common/`.
- Order workflows combine local Redux mutations with Trello side effects in `src/Hooks/useOrder.ts`.
- Deployment appears to be static, with generated output checked into `docs/` and routing rooted at `/cassette-store`.

## Layers

- Purpose: Compose global providers and runtime setup.
- Location: `src/index.tsx`, `src/App.tsx`.
- Contains: React root mount, Ant Design token configuration, message/modal providers, Redux provider, persist gate, service worker unregister call.
- Depends on: React, ReactDOM, Ant Design, Redux store, router.
- Used by: Browser entry point only.
- Purpose: Own top-level navigation, route nesting, drawer/bottom tab UI, and app-wide background actions.
- Location: `src/Routing/RootRouter.tsx`, `src/Routing/RootRoutes.ts`, `src/Routing/MasterPage.tsx`.
- Contains: `BrowserRouter`, `Route` definitions, `Outlet`, menu buttons, backup/restore actions.
- Depends on: Module screens, shared components, `useOrder`, `useTrello`, Redux actions.
- Used by: `src/App.tsx`.
- Purpose: Own user workflows for dashboard, customers, orders, and COD payments.
- Location: `src/Modules/Home/`, `src/Modules/Customer/`, `src/Modules/Order/`.
- Contains: Screen components, widgets, feature route config, form flows, list/detail actions.
- Depends on: Shared components, store selectors/actions, hooks, constants/helpers.
- Used by: `src/Routing/RootRouter.tsx`.
- Purpose: Encapsulate reusable stateful behavior and side effects.
- Location: `src/Hooks/`.
- Contains: `useOrder`, `useTrello`, `useAPI`, `useToggle`, `useTheme`, `useScreenTitle`.
- Depends on: Redux, Trello models, common helpers, browser fetch/storage APIs.
- Used by: Routing and module screens.
- Purpose: Maintain customers, orders, app context, done-order IDs, and COD payment cycles.
- Location: `src/Store/`.
- Contains: Redux slices, TypeScript models, `redux-persist` storage adapter.
- Depends on: Redux Toolkit, redux-persist, idb-keyval, lodash helpers.
- Used by: App provider, hooks, screens, backup/restore flows.
- Purpose: Provide local component vocabulary and business helper functions.
- Location: `src/Components/`, `src/Common/`.
- Contains: Ant Design wrappers, layout primitives, SmartForm, constants, route/date/number/order/area helpers.
- Depends on: Ant Design, React, lodash, app model types.
- Used by: Nearly all module screens and routing layout.

## Data Flow

### User Creates an Order

### App Startup and Persistence

### Backup and Done-Order Refresh

- Durable state: Redux persisted into IndexedDB via `src/Store/Store.ts` and `src/Store/idbStorage.ts`.
- Ephemeral UI state: React `useState` and small hooks like `src/Hooks/useToggle.ts`.
- Remote state: Trello cards/attachments are used as external workflow state and backup storage.

## Key Abstractions

- Purpose: Normalize Ant Design usage behind app-specific exports.
- Examples: `src/Components/Button/Button.tsx`, `src/Components/List/List.tsx`, `src/Components/Modal/Modal.tsx`, `src/Components/Layout/Stack/Stack.tsx`.
- Pattern: Thin wrapper plus `index.ts` barrel exports.
- Purpose: Centralize Ant Design Form wiring, hidden fields, transformation, and submission callback behavior.
- Examples: `src/Components/SmartForm/SmartForm.tsx`, `src/Components/SmartForm/useSmartForm.ts`, `src/Components/SmartForm/SmartFormItem/SmartFormItem.tsx`.
- Pattern: Compound component plus generic hook.
- Purpose: Build stable route strings for feature modules.
- Examples: `src/Routing/RootRoutes.ts`, `src/Modules/Order/Routing/OrderRouteConfig.ts`, `src/Modules/Customer/Routing/CustomerRouteConfig.ts`, `src/Common/Helpers/RouteHelper.ts`.
- Pattern: Function-returning route tree.
- Purpose: Store app context, customers, orders, done-order IDs, and COD payment cycles.
- Examples: `src/Store/Reducers/AppContextReducer.ts`, `src/Store/Reducers/CustomerReducer.ts`, `src/Store/Reducers/OrderReducer.ts`.
- Pattern: Redux Toolkit `createSlice` reducers with Immer mutation syntax.
- Purpose: Type the persisted domain entities.
- Examples: `src/Store/Models/Order.ts`, `src/Store/Models/OrderItem.ts`, `src/Store/Models/Customer.ts`, `src/Store/Models/CodPaymentCycle.ts`.
- Pattern: Type aliases with string-valued status/payment fields backed by constants in `src/Common/Constants/AppConstants.ts`.

## Entry Points

- Location: `src/index.tsx`.
- Triggers: Browser loads the compiled bundle.
- Responsibilities: Create React root, render `<App />`, unregister service workers, initialize optional web vitals loading.
- Location: `src/App.tsx`.
- Triggers: Rendered by `src/index.tsx`.
- Responsibilities: Provide theme, message/modal contexts, Redux store, persistence gate, and router.
- Location: `src/Routing/RootRouter.tsx`.
- Triggers: Rendered inside app providers.
- Responsibilities: Register route tree under `BrowserRouter basename="/cassette-store"`.

## Architectural Constraints

- **Threading:** Single browser main thread; there are no web workers beyond optional/generated service worker code in `src/service-worker.ts` and `docs/service-worker.js`.
- **Global state:** Redux store is a module-level singleton exported from `src/Store/Store.ts` and is also imported directly by `src/Hooks/useOrder.ts` and `src/Routing/MasterPage.tsx`.
- **Client-side Trello configuration:** Trello API setup lives in `src/Hooks/Trello/useTrello.ts` as part of the current trusted internal app shape.
- **Offline/local-first data:** The app has no authoritative backend database; clearing browser storage can remove local app data unless a Trello backup exists.
- **Static route base:** Router basename is hard-coded to `/cassette-store` in `src/Routing/RootRouter.tsx`.

## Anti-Patterns

### Scattered Trello request construction

### Business logic and remote side effects in one hook

### Generated build output tracked beside source

## Error Handling

- `src/Hooks/useOrder.ts` catches Trello failures in several methods and returns either `null`, a string error message, or the caught value.
- `src/Hooks/useAPI.ts` rejects on fetch failures but does not branch on non-2xx HTTP responses before parsing JSON.
- `src/Routing/MasterPage.tsx` catches backup restore parsing/fetch errors and displays `message.error(e?.message)`.
- There is no React error boundary in `src/App.tsx` or `src/Routing/RootRouter.tsx`.

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
