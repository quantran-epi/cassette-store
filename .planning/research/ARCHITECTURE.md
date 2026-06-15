# Architecture Research

**Domain:** Brownfield internal operations React SPA refactor
**Researched:** 2026-06-15
**Confidence:** HIGH

## Standard Architecture

### System Overview

```text
Operator UI
    |
    v
Feature screens and widgets
`src/Modules/*`
    |
    +--> Shared UI system
    |    `src/Components/*`
    |
    +--> Domain services/selectors
    |    `src/Common/` or new `src/Domain/`
    |
    +--> State actions/reducers
    |    `src/Store/*`
    |
    v
Integration adapters
`src/Hooks/Trello/*`, API proxy client
    |
    +--> IndexedDB persistence
    +--> Trello API via safe proxy
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Feature screens | User workflows and layout composition | `src/Modules/Order/Screens/*`, `src/Modules/Customer/Screens/*` |
| UI wrappers | Consistent app-specific AntD usage | `src/Components/*` with `index.ts` barrels |
| Domain services | Pure calculations and business transitions | Extract from `src/Hooks/useOrder.ts` into helper/service modules |
| Selectors | Derived state for lists, totals, dashboard | Memoized selectors near reducers or in `src/Store/Selectors/` |
| Integration adapters | Trello/API calls and request/response mapping | Keep `useTrello` small or replace with a typed client/proxy adapter |
| Persistence boundary | IndexedDB, backup, restore, migration | Versioned schemas and validation around Redux state |

## Recommended Project Structure

```text
src/
|-- Components/          # Shared app UI primitives and wrappers
|-- Modules/             # Feature screens and widgets
|-- Store/               # Redux slices, models, selectors
|-- Common/              # Current constants/helpers, gradually slimmed down
|-- Domain/              # New pure order/customer/COD business logic (recommended)
|-- Integrations/        # Trello/proxy clients and API contracts (recommended)
|-- Routing/             # Root route tree and shell layout
`-- test-utils/          # Render helpers, factories, MSW handlers (recommended)
```

### Structure Rationale

- **`Domain/`:** Pulls business logic out of React hooks so order calculations and transitions can be unit tested.
- **`Integrations/`:** Makes Trello/API side effects explicit and mockable.
- **`Store/Selectors/`:** Keeps derived dashboard/list data out of render bodies.
- **`test-utils/`:** Avoids repeating provider setup and mock state in component tests.
- **Existing directories:** Preserve current `Components`, `Modules`, `Routing`, and `Store` paths to reduce migration risk.

## Architectural Patterns

### Pattern 1: Ports and Adapters for Trello

**What:** Define a small interface for Trello operations used by order workflows, then implement it with a proxy-backed adapter.
**When to use:** Any code that creates, moves, comments on, or attaches files to Trello cards.
**Trade-offs:** Slightly more structure, but dramatically easier testing and secret handling.

**Example:**
```typescript
type TrelloOrdersPort = {
  createOrderCard(input: CreateCardInput): Promise<TrelloCardRef>;
  moveCard(input: MoveCardInput): Promise<TrelloCardRef>;
  attachFiles(input: AttachFilesInput): Promise<TrelloAttachmentRef[]>;
};
```

### Pattern 2: Pure Domain Transitions

**What:** Calculate next order/customer state in pure functions, then let UI/integration orchestration apply effects.
**When to use:** Shipping, return, refund, COD, priority, and customer rank changes.
**Trade-offs:** Requires extracting from `useOrder.ts`, but unlocks focused tests.

**Example:**
```typescript
const result = markOrderShipped({ order, customer });
dispatch(editOrder(result));
await trello.moveCard({ cardId: order.trelloCardId, list: 'done' });
```

### Pattern 3: Versioned Persisted State

**What:** Add schema version, validation, and migrations around backup/restore.
**When to use:** Any persisted Redux state or Trello backup attachment.
**Trade-offs:** More upfront code, but prevents data loss from stale/malformed backups.

## Data Flow

### Request Flow

```text
Operator action
    -> Screen/widget handler
    -> Domain transition or selector
    -> Redux action
    -> Integration command if needed
    -> User-visible success/failure state
```

### State Management

```text
Redux store
    -> memoized selectors
    -> screens/widgets
    -> domain commands
    -> reducers
    -> IndexedDB persistence
```

### Key Data Flows

1. **Order creation:** Form input -> validated order model -> local state -> Trello card -> local Trello ID assignment -> attachment upload.
2. **Shipping update:** Shipping code input -> local order update -> Trello comment/list move -> done-order cleanup.
3. **Backup restore:** Backup source -> fetch -> schema validation -> migration/defaults -> Redux state replacement -> operator confirmation.
4. **COD cycle:** Order selection -> derived totals -> cycle creation -> order/COD state update -> dashboard/list visibility.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single operator/small team | Local Redux + IndexedDB can remain, but add validation and backups. |
| Growing order history | Add selectors, indexing/search helpers, pagination, and archive flows. |
| Multiple operators | Add auth, backend persistence, conflict handling, and per-user audit trail. |

### Scaling Priorities

1. **First bottleneck:** Data reliability and sync confidence; fix with validation, tests, and sync status.
2. **Second bottleneck:** List/dashboard render cost; fix with memoized selectors and better filtering.
3. **Third bottleneck:** Multi-user concurrency; fix with backend persistence if needed.

## Anti-Patterns

### Anti-Pattern 1: React hook as domain/service layer

**What people do:** Keep adding calculations, dispatches, API calls, and statistics to `useOrder.ts`.
**Why it's wrong:** Every change becomes hard to test and can break side effects.
**Do this instead:** Extract pure functions and integration ports first.

### Anti-Pattern 2: Treat backup JSON as trusted state

**What people do:** Fetch JSON and dispatch it directly into reducers.
**Why it's wrong:** Missing fields, stale versions, or malformed data can silently lose state.
**Do this instead:** Validate, version, migrate, and preview restore effects.

### Anti-Pattern 3: UI polish without operational redesign

**What people do:** Add cards, colors, and spacing while keeping slow workflows.
**Why it's wrong:** Operators still spend too many clicks on daily tasks.
**Do this instead:** Redesign around order/shipping/COD actions and then polish the visual layer.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Trello REST API | Safe proxy or adapter layer | Credentials must not ship to browser bundles. |
| GitHub raw backup URL | Explicit import source or remove default | Current default points to missing `docs/data`. |
| Google Fonts | Static HTML link | Keep or self-host if reliability/privacy matters. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Screens <-> Domain | Function calls with typed inputs/outputs | Keep UI-specific state out of domain functions. |
| Domain <-> Store | Plain actions and selectors | Reducers should stay predictable and tested. |
| Domain <-> Trello | Port/interface | Mock in tests; implement with proxy-backed adapter. |
| Backup <-> Store | Versioned schema | Avoid direct arbitrary state replacement. |

## Sources

- Existing codebase map: `.planning/codebase/ARCHITECTURE.md` and `.planning/codebase/CONCERNS.md`.
- Redux Toolkit TypeScript guidance: https://redux-toolkit.js.org/usage/usage-with-typescript
- Ant Design theming/components: https://ant.design/components/config-provider/
- Trello REST API docs: https://developer.atlassian.com/cloud/trello/rest/
- MSW testing approach: https://mswjs.io/docs/

---
*Architecture research for: Brownfield internal operations React SPA refactor*
*Researched: 2026-06-15*
