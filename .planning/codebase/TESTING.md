---
last_mapped_commit: 267df10e480e7fc98ab019c903934a1defd25960
last_mapped_at: 2026-06-15
---

# Testing Patterns

**Analysis Date:** 2026-06-15

## Test Framework

**Runner:**
- Jest through Create React App `react-scripts test` from `package.json`.
- Config: Implicit CRA Jest config; no custom `jest.config.*` file exists.

**Assertion Library:**
- Jest `expect` plus DOM matchers from `@testing-library/jest-dom` imported in `src/setupTests.ts`.
- React Testing Library render/screen helpers are used in `src/App.test.tsx`.

**Run Commands:**
```bash
yarn test                              # Run CRA Jest in watch mode by default
CI=true yarn test --watchAll=false     # Run all tests once in CI-style mode
yarn test -- --coverage --watchAll=false # Run tests with coverage
```

## Test File Organization

**Location:**
- Tests are co-located under `src/`; currently only `src/App.test.tsx` exists.
- No `tests/`, `__tests__/`, fixture, factory, or E2E directory exists.

**Naming:**
- CRA-style `*.test.tsx` naming is used by `src/App.test.tsx`.
- No `*.spec.ts`, `*.spec.tsx`, integration, or E2E naming convention is present.

**Structure:**
```text
src/
|-- App.test.tsx       # Only test file
|-- setupTests.ts      # Jest DOM setup
`-- App.tsx            # Component under the sample test
```

## Test Structure

**Suite Organization:**
```typescript
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
```

**Patterns:**
- Only top-level Jest `test()` is demonstrated; no `describe`, `beforeEach`, or teardown pattern exists.
- `CI=true yarn test --watchAll=false` failed on 2026-06-15 before assertions because Jest could not resolve the `@store/Store` path alias imported by `src/App.tsx`.
- The current test is also still the CRA sample expectation and does not match the current app UI in `src/App.tsx` once alias resolution is fixed.
- Rendering `<App />` pulls in Redux Persist, BrowserRouter, Ant Design, and provider setup, so future tests may need store/router mocks or integration-style assertions.

## Mocking

**Framework:** Jest built-in mocking through CRA.

**Patterns:**
```typescript
// No project-specific mocking pattern exists yet.
// A likely future pattern for external APIs:
global.fetch = jest.fn();
```

**What to Mock:**
- Trello/network calls from `src/Hooks/Trello/useTrello.ts` and `src/Hooks/useAPI.ts`.
- Browser storage adapters from `src/Store/idbStorage.ts` when testing persisted state flows.
- `URL.createObjectURL` for attachment preview tests in `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx`.
- Timers/localStorage for backup throttling in `src/Routing/MasterPage.tsx`.

**What NOT to Mock:**
- Pure calculations in `src/Common/Helpers/OrderHelper.ts` and `src/Common/Helpers/AreaHelper.ts`.
- Redux reducers in `src/Store/Reducers/*.ts` when unit testing state transitions.

## Fixtures and Factories

**Test Data:**
```typescript
// No factory exists today. Add local factories near tests first.
function createCustomer(overrides?: Partial<Customer>): Customer {
  return {
    id: 'customer-1',
    name: 'Test Customer',
    province: 'Hanoi',
    area: 'North',
    address: 'Test address',
    mobile: '0000000000',
    buyCount: 0,
    buyAmount: 0,
    isVIP: false,
    isInBlacklist: false,
    difficulty: 'Easy',
    note: '',
    ...overrides,
  };
}
```

**Location:**
- No shared fixture directory exists.
- Start with factories inside tests for reducers/helpers, then extract to `src/test-utils/` only when duplication appears.

## Coverage

**Requirements:**
- No enforced coverage target.
- No coverage config or CI gate exists.
- Current practical coverage is zero in a normal one-shot test run because `CI=true yarn test --watchAll=false` fails during module resolution.
- The failure path is `src/App.test.tsx` -> `src/App.tsx` -> `@store/Store`; CRA Jest does not see the `tsconfig.json`/`craco.config.js` path aliases with the current `test` script.

**View Coverage:**
```bash
yarn test -- --coverage --watchAll=false
```

## Test Types

**Unit Tests:**
- Not established, but best first candidates are pure helpers and reducers: `src/Common/Helpers/OrderHelper.ts`, `src/Common/Helpers/AreaHelper.ts`, `src/Store/Reducers/OrderReducer.ts`, and `src/Store/Reducers/CustomerReducer.ts`.

**Integration Tests:**
- Not established. Candidate flows include order creation from `src/Modules/Order/Screens/OrderCreate/OrderCreate.screen.tsx` through Redux and mocked Trello calls.

**E2E Tests:**
- Not used. No Playwright/Cypress dependency or config exists in `package.json`.

## Common Patterns

**Async Testing:**
```typescript
test('creates a Trello-backed order', async () => {
  // Mock fetch/useTrello, render the screen, submit the form, then await UI feedback.
});
```

**Error Testing:**
```typescript
test('returns a user-facing error when Trello update fails', async () => {
  // Mock Trello response/fetch rejection, trigger the action, assert message/error state.
});
```

**Reducer Testing:**
```typescript
test('sorts pending orders by calculated priority', () => {
  // Call `OrderReducer` with add/edit actions and assert resulting order positions.
});
```

---

*Testing analysis: 2026-06-15*
