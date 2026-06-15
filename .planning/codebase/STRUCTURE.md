---
last_mapped_commit: 267df10e480e7fc98ab019c903934a1defd25960
last_mapped_at: 2026-06-15
---

# Codebase Structure

**Analysis Date:** 2026-06-15

## Directory Layout

```text
cassette-store/
|-- src/                 # Application source
|   |-- Common/          # Constants, helpers, shared types
|   |-- Components/      # Local UI wrapper library
|   |-- Hooks/           # App/domain hooks and Trello/API clients
|   |-- Modules/         # Feature screens and route config
|   |-- Routing/         # Root routes and master page layout
|   `-- Store/           # Redux store, reducers, persisted models
|-- public/              # CRA public assets and HTML shell
|-- assets/              # Source static assets, currently cassette icon
|-- docs/                # Generated static build output for deployment
|-- .codex/              # Local Codex/GSD runtime resources, currently untracked
|-- .codegraph/          # Local codegraph index, currently untracked
|-- package.json         # Scripts and dependency manifest
|-- tsconfig.json        # TypeScript and path alias config
|-- craco.config.js      # CRA webpack/Less overrides
`-- yarn.lock            # Yarn dependency lockfile
```

## Directory Purposes

**`src/Common/`:**
- Purpose: Shared non-React business utilities and constants.
- Contains: `src/Common/Constants/AppConstants.ts`, helpers such as `src/Common/Helpers/OrderHelper.ts`, and shared utility types in `src/Common/Types/UtilityTypes.ts`.
- Key files: `src/Common/Constants/AppConstants.ts`, `src/Common/Helpers/AreaHelper.ts`, `src/Common/Helpers/RouteHelper.ts`.

**`src/Components/`:**
- Purpose: Local component vocabulary wrapping Ant Design and layout primitives.
- Contains: UI wrappers such as `src/Components/Button/Button.tsx`, `src/Components/Modal/Modal.tsx`, `src/Components/Form/*`, `src/Components/Layout/*`, and SmartForm.
- Key files: `src/Components/SmartForm/useSmartForm.ts`, `src/Components/Message/MessageProvider.tsx`, `src/Components/Modal/ModalProvider.tsx`.

**`src/Hooks/`:**
- Purpose: Reusable hooks and integration clients.
- Contains: `src/Hooks/useOrder.ts`, `src/Hooks/useAPI.ts`, `src/Hooks/useScreenTitle.ts`, `src/Hooks/useTheme.ts`, `src/Hooks/useToggle.ts`, and Trello files under `src/Hooks/Trello/`.
- Key files: `src/Hooks/useOrder.ts`, `src/Hooks/Trello/useTrello.ts`.

**`src/Modules/`:**
- Purpose: User-facing feature modules.
- Contains: Customer, order, and dashboard screens. Order screens are further split into `OrderCreate`, `OrderItem`, and `OrderCodPayment` widgets.
- Key files: `src/Modules/Home/Screens/Dashboard.screen.tsx`, `src/Modules/Customer/Screens/CustomerList.screen.tsx`, `src/Modules/Order/Screens/OrderList.screen.tsx`, `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx`.

**`src/Routing/`:**
- Purpose: Top-level route registration and shell layout.
- Contains: `src/Routing/RootRouter.tsx`, `src/Routing/RootRoutes.ts`, and `src/Routing/MasterPage.tsx`.
- Key files: `src/Routing/MasterPage.tsx` owns navigation, restore, and backup float actions.

**`src/Store/`:**
- Purpose: Redux state, persistence, and domain model types.
- Contains: `src/Store/Store.ts`, `src/Store/idbStorage.ts`, reducers under `src/Store/Reducers/`, and models under `src/Store/Models/`.
- Key files: `src/Store/Reducers/OrderReducer.ts`, `src/Store/Reducers/CustomerReducer.ts`.

**`public/`:**
- Purpose: CRA public assets and HTML shell.
- Contains: `public/index.html`, `public/manifest.json`, and `public/robots.txt`.

**`docs/`:**
- Purpose: Generated production build output for static deployment.
- Contains: `docs/index.html`, `docs/static/`, `docs/service-worker.js`, and deployment assets.
- Generated: Yes, from `yarn build`/`npm run build`.

## Key File Locations

**Entry Points:**
- `src/index.tsx`: ReactDOM root mount and service worker unregister call.
- `src/App.tsx`: Global providers and theme setup.
- `src/Routing/RootRouter.tsx`: Browser route tree.

**Configuration:**
- `package.json`: Dependency manifest and scripts.
- `tsconfig.json`: Compiler options and path aliases.
- `craco.config.js`: Webpack aliases, ModuleScopePlugin removal, Less variable overrides.
- `.gitignore`: Dependency/build/test ignores; note that plain `.env` is not ignored.

**Core Logic:**
- `src/Hooks/useOrder.ts`: Order state transitions, Trello mutations, calculations, and statistics.
- `src/Hooks/Trello/useTrello.ts`: Trello API adapter and hard-coded list/label IDs.
- `src/Hooks/useAPI.ts`: Fetch wrapper used by Trello integration.
- `src/Store/Reducers/OrderReducer.ts`: Order sorting, mutation, done-order, and COD payment reducers.
- `src/Common/Helpers/OrderHelper.ts`: Priority, item, and shipping calculations.
- `src/Common/Helpers/AreaHelper.ts`: Province-to-area classification.

**Testing:**
- `src/App.test.tsx`: Only test file currently present.
- `src/setupTests.ts`: CRA Jest setup importing `@testing-library/jest-dom`.
- `package.json`: `test` script runs `react-scripts test`.

**Documentation and Build Output:**
- `docs/index.html`: Generated deployed HTML.
- `docs/static/js/main.d392b372.js`: Generated app bundle.
- `docs/service-worker.js`: Generated service worker.
- `.planning/codebase/`: Generated GSD codebase map documents.

## Naming Conventions

**Files:**
- PascalCase `.tsx` for component implementations such as `src/Components/Button/Button.tsx` and `src/Components/Layout/Stack/Stack.tsx`.
- Feature screens use `*.screen.tsx`, for example `src/Modules/Order/Screens/OrderList.screen.tsx`.
- Feature widgets use `*.widget.tsx`, for example `src/Modules/Customer/Screens/CustomerAdd.widget.tsx`.
- Directory barrels use `index.ts`, for example `src/Components/Button/index.ts` and `src/Hooks/index.ts`.
- Route config files use `*RouteConfig.ts`, for example `src/Modules/Order/Routing/OrderRouteConfig.ts`.
- Reducers use `*Reducer.ts`, for example `src/Store/Reducers/OrderReducer.ts`.

**Directories:**
- Top-level source directories use PascalCase: `src/Components`, `src/Modules`, `src/Routing`, `src/Store`, `src/Common`, `src/Hooks`.
- Component directories mirror component names, such as `src/Components/SmartForm/` and `src/Components/Modal/`.
- Module directories group by domain: `src/Modules/Customer/`, `src/Modules/Order/`, `src/Modules/Home/`.

## Where to Add New Code

**New Feature Module:**
- Primary code: `src/Modules/<Feature>/Screens/` and `src/Modules/<Feature>/Routing/`.
- Route registration: `src/Routing/RootRoutes.ts` and `src/Routing/RootRouter.tsx`.
- Shared domain constants/helpers: `src/Common/Constants/` and `src/Common/Helpers/`.
- Tests: Co-locate as `*.test.tsx` near the screen/component until a broader test structure is introduced.

**New Component:**
- Implementation: `src/Components/<Name>/<Name>.tsx`.
- Public export: `src/Components/<Name>/index.ts`.
- Form control wrappers: `src/Components/Form/<Control>/`.
- Layout primitive: `src/Components/Layout/<Name>/`.

**New Hook or Integration:**
- Generic hook: `src/Hooks/use<Name>.ts` and export from `src/Hooks/index.ts`.
- External service client: `src/Hooks/<Service>/` if it has models/types, following `src/Hooks/Trello/`.
- API plumbing: Prefer extending or replacing `src/Hooks/useAPI.ts` with typed behavior.

**New State:**
- Model type: `src/Store/Models/<Name>.ts`.
- Reducer slice: `src/Store/Reducers/<Name>Reducer.ts`.
- Store registration: `src/Store/Store.ts`.
- Persist compatibility: Include all fields in reducer `setState`/rehydrate flows if manual backup restore uses them.

## Special Directories

**`docs/`:**
- Purpose: Static deployment output.
- Generated: Yes.
- Committed: `docs/index.html`, `docs/service-worker.js`, and `docs/static/js/main.d392b372.js` are tracked by git.

**`node_modules/`:**
- Purpose: Installed dependencies.
- Generated: Yes.
- Committed: No, ignored by `.gitignore`.

**`.codex/`:**
- Purpose: Local Codex/GSD runtime, skills, agents, and workflow resources.
- Generated: Yes, local tooling.
- Committed: Currently untracked in this working tree.

**`.codegraph/`:**
- Purpose: Local codegraph index used for code navigation.
- Generated: Yes, local tooling.
- Committed: Currently untracked in this working tree.

**`.planning/codebase/`:**
- Purpose: Generated GSD codebase map documents.
- Generated: Yes, by `$gsd-map-codebase`.
- Committed: Intended to be committed by the GSD workflow.

---

*Structure analysis: 2026-06-15*
