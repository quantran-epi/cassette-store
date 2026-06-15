---
last_mapped_commit: 267df10e480e7fc98ab019c903934a1defd25960
last_mapped_at: 2026-06-15
---

# Coding Conventions

**Analysis Date:** 2026-06-15

## Naming Patterns

**Files:**
- Use PascalCase for React component files, such as `src/Components/Button/Button.tsx` and `src/Components/Modal/ModalProvider.tsx`.
- Use `*.screen.tsx` for routed screens, such as `src/Modules/Customer/Screens/CustomerList.screen.tsx`.
- Use `*.widget.tsx` for nested feature UI pieces, such as `src/Modules/Order/Screens/OrderItem/OrderRefund.widget.tsx`.
- Use `index.ts` barrel files for component/hook exports, such as `src/Components/Button/index.ts` and `src/Hooks/index.ts`.
- Existing typo must be preserved unless intentionally refactoring: tooltip files live under `src/Components/Tootip/`.

**Functions:**
- camelCase for exported hooks and helpers: `useOrder`, `useTrello`, `useSmartForm`, `calculatePendingOrderPrioritymark`.
- Local helper functions often use `_` prefix inside components/hooks, such as `_onRehydrateData` in `src/Routing/MasterPage.tsx` and `_onUpdatePlacedItems` in `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx`.
- Event handlers commonly use `_on<Action>` naming in feature screens.

**Variables:**
- camelCase for local variables and state values.
- UPPER_SNAKE_CASE for exported constants in `src/Common/Constants/AppConstants.ts`, such as `ORDER_STATUS` and `CUSTOMER_PROVINCES`.
- Component names and type aliases use PascalCase, such as `Order`, `Customer`, `UseOrder`, and `UseSmartForm`.

**Types:**
- Type aliases are preferred over interfaces for domain models in `src/Store/Models/Order.ts` and `src/Store/Models/Customer.ts`.
- Redux state types use interfaces in reducers, such as `OrderState` in `src/Store/Reducers/OrderReducer.ts`.
- Several model fields are typed as `string` with comments pointing to constants, such as `status: string; //ORDER_STATUS` in `src/Store/Models/Order.ts`.

## Code Style

**Formatting:**
- No Prettier config is present.
- Formatting is manually mixed: many files use 4-space indentation, while CRA defaults remain 2-space in `src/App.tsx` and `src/index.tsx`.
- Both double and single quotes appear: aliases and most app code often use double quotes, while CRA-generated code uses single quotes.
- Semicolons are inconsistent; match the surrounding file when editing.

**Linting:**
- CRA ESLint config is declared in `package.json` with `react-app` and `react-app/jest`.
- There is no dedicated `lint` script in `package.json`.
- TypeScript strict mode is disabled in `tsconfig.json` with `strict: false`.

## Import Organization

**Order:**
1. Local aliases and app imports commonly appear first in feature files, for example `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx`.
2. External packages are mixed with internal imports rather than strictly grouped.
3. Relative imports are used for nearby widgets/models, such as `./OrderPlacedItem.widget` in `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx`.

**Path Aliases:**
- `@components/*` maps to `src/Components/*` in `tsconfig.json` and `craco.config.js`.
- `@modules/*` maps to `src/Modules/*`.
- `@routing/*` maps to `src/Routing/*`.
- `@store/*` maps to `src/Store/*`.
- `@common/*` maps to `src/Common/*`.
- `@hooks` maps to `src/Hooks/index.ts`.

## Error Handling

**Patterns:**
- UI actions generally show messages through `useMessage()` from `src/Components/Message/MessageProvider.tsx`.
- Trello-heavy methods in `src/Hooks/useOrder.ts` often use `try/catch` and return `null`, a string error, or the caught error value.
- Fetch wrapper methods in `src/Hooks/useAPI.ts` reject only on network exceptions; non-2xx HTTP statuses are still parsed as JSON.
- Form submission errors flow through `onFinishFailed` in `src/Components/SmartForm/useSmartForm.ts`.

## Logging

**Framework:** console.

**Patterns:**
- `src/Hooks/useAPI.ts` has a `_log` helper intended for API response logging.
- `src/serviceWorkerRegistration.ts` contains CRA service worker console messages.
- Business screens primarily use user-facing messages rather than console output.

## Comments

**When to Comment:**
- Comments are sparse and mostly used for temporarily disabled code or TODO-like workarounds.
- Examples include commented reorder logic in `src/Hooks/useOrder.ts`, a commented `dispatch(test())` in `src/Routing/MasterPage.tsx`, and a commented `console.log` in `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx`.

**JSDoc/TSDoc:**
- No JSDoc/TSDoc pattern is used for app functions or model types.

## Function Design

**Size:**
- Small component wrappers in `src/Components/` are short and focused.
- Domain hook `src/Hooks/useOrder.ts` is large and mixes pure calculations, Redux updates, Trello calls, and statistics. Treat changes there as high-risk.

**Parameters:**
- Hooks use object props types even when empty, such as `UseToggleProps` in `src/Hooks/useToggle.ts` and `UseTrelloProps` in `src/Hooks/Trello/useTrello.ts`.
- Domain helpers frequently pass positional values, such as `OrderHelper.createNewEmptyOrderItem()` in `src/Common/Helpers/OrderHelper.ts`.

**Return Values:**
- Hooks return object APIs, for example `useOrder()` and `useSmartForm()`.
- Some expected failures return string/null instead of throwing, especially in `src/Hooks/useOrder.ts`.

## Module Design

**Exports:**
- Named exports are common for components, hooks, and Redux actions.
- Default exports are used for reducers in `src/Store/Reducers/*.ts` and route config in `src/Modules/*/Routing/*RouteConfig.ts`.

**Barrel Files:**
- Component directories expose public APIs through `index.ts`, such as `src/Components/Form/Input/index.ts`.
- `src/Hooks/index.ts` is the public hook barrel used by imports like `import {useOrder, useTheme} from "@hooks"`.

---

*Convention analysis: 2026-06-15*
