---
last_mapped_commit: 267df10e480e7fc98ab019c903934a1defd25960
last_mapped_at: 2026-06-15
---

# Technology Stack

**Analysis Date:** 2026-06-15

## Languages

**Primary:**
- TypeScript 4.9.5 - All application source under `src/`, including React components, hooks, Redux state, models, and helpers.
- TSX - React view code in `src/App.tsx`, `src/Routing/*.tsx`, `src/Components/**/*.tsx`, and `src/Modules/**/*.tsx`.

**Secondary:**
- JavaScript - Build/runtime configuration in `craco.config.js` and generated production assets under `docs/`.
- CSS - Global styling in `src/App.css` and `src/index.css`; Ant Design Less variables are customized through `craco.config.js`.

## Runtime

**Environment:**
- Browser SPA runtime - The app mounts in `src/index.tsx` and stores user data in browser IndexedDB/localStorage.
- Node.js - Required for development, testing, and builds through Create React App/CRACO scripts in `package.json`; no explicit `engines` or `.nvmrc` version is declared.

**Package Manager:**
- Yarn is the locked package manager because `yarn.lock` is present.
- npm-compatible scripts are defined in `package.json` and can also be run with npm if dependencies are installed.

## Frameworks

**Core:**
- React 18.2.0 - UI framework, mounted from `src/index.tsx`.
- React Router DOM 6.22.3 - Client-side routing in `src/Routing/RootRouter.tsx` and `src/Routing/RootRoutes.ts`.
- Redux Toolkit 2.2.3, React Redux 9.1.0, Redux Persist 6.0.0 - Client state and persistence in `src/Store/Store.ts` and `src/Store/Reducers/*.ts`.
- Ant Design 5.16.1 - Component foundation wrapped by local components in `src/Components/`.

**Testing:**
- Jest via `react-scripts test` - Configured implicitly by Create React App and referenced by `package.json`.
- React Testing Library 13.4.0 and `@testing-library/jest-dom` 5.17.0 - Used by `src/App.test.tsx` and `src/setupTests.ts`.

**Build/Dev:**
- Create React App `react-scripts` 5.0.1 - Base dev server, Jest config, and webpack build.
- CRACO 7.1.0 - Overrides CRA webpack and Less config in `craco.config.js`.
- `craco-less` 3.0.1 - Enables Less variable overrides for Ant Design theming in `craco.config.js`.
- Workbox 6.6.x - Service worker generation/runtime files are present in `src/service-worker.ts`, `src/serviceWorkerRegistration.ts`, and generated `docs/service-worker.js`, though `src/index.tsx` currently unregisters the service worker.

## Key Dependencies

**Critical:**
- `antd` 5.16.1 - Primary UI component library; local wrappers live in `src/Components/`.
- `@ant-design/icons` - Icon usage across routing, lists, order actions, and dashboard views such as `src/Routing/MasterPage.tsx`.
- `idb-keyval` 6.2.2 - IndexedDB storage adapter for redux-persist in `src/Store/idbStorage.ts`.
- `lodash` 4.17.21 - Sorting, cloning, debouncing, and comparison utilities in `src/Hooks/useOrder.ts`, `src/Components/SmartForm/useSmartForm.ts`, and module screens.
- `moment` 2.30.1 and `dayjs` 1.11.10 - Date formatting/calculation, with Moment used heavily in `src/Hooks/useOrder.ts`, `src/Routing/MasterPage.tsx`, and `src/Modules/Home/Screens/Dashboard.screen.tsx`.
- `nanoid` 4.0.1 - Client-side ID generation in `src/Common/Helpers/OrderHelper.ts` and `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx`.
- `react-copy-to-clipboard` 5.1.0 - Clipboard affordances in order/customer item screens.

**Infrastructure:**
- Browser `fetch` - Generic API access in `src/Hooks/useAPI.ts`, Trello calls in `src/Hooks/Trello/useTrello.ts`, and backup restore download in `src/Routing/MasterPage.tsx`.
- Browser IndexedDB/localStorage - Persistence through `src/Store/idbStorage.ts` and periodic backup timing in `src/Routing/MasterPage.tsx`.

## Configuration

**Environment:**
- Local environment files were not inspected during mapping.
- No typed environment variable contract is used by the app today.
- Trello API configuration is currently handled in `src/Hooks/Trello/useTrello.ts`; keep changes scoped to sync reliability and recovery unless explicitly requested.

**Build:**
- `package.json` - Scripts, dependencies, CRA ESLint config, and browser targets.
- `tsconfig.json` - Non-strict TypeScript, `jsx: react-jsx`, `baseUrl: .`, and path aliases for `@components`, `@modules`, `@routing`, `@store`, `@common`, and `@hooks`.
- `craco.config.js` - Webpack aliases, removal of CRA `ModuleScopePlugin`, and Ant Design Less theme variables.
- `public/index.html` - CRA HTML shell, viewport lock, Kanit Google Font, and app metadata.
- `public/manifest.json` - Mostly default CRA manifest values.

## Platform Requirements

**Development:**
- Node.js and Yarn/npm with the checked-in `yarn.lock`.
- A modern browser with IndexedDB, localStorage, fetch, and service worker APIs available.
- Trello board/list/label identifiers must match values used by `src/Hooks/Trello/useTrello.ts`.

**Production:**
- Static SPA deployment. The checked-in `docs/` directory contains a production build, and `src/Routing/RootRouter.tsx` uses `BrowserRouter basename="/cassette-store"`, which aligns with GitHub Pages style hosting.
- No backend server is present; all business data lives in browser storage and Trello attachments/API calls.

---

*Stack analysis: 2026-06-15*
