---
phase: 02-order-state-and-trello-sync-reliability
plan: 02
subsystem: trello-sync
tags: [trello, api, adapter, tests, reliability]

requires:
  - phase: 02-01
    provides: Pure order-domain helpers used for card descriptions and label intent
provides:
  - HTTP failure rejection and URL query merging in useAPI
  - Trello operation result union and helper constructors
  - Order-specific Trello adapter wrapping card, comment, move, attachment, and fetch operations
affects: [order-workflows, trello-sync, phase-02]

tech-stack:
  added: []
  patterns:
    - Discriminated operation result union with ok true/false branches
    - Adapter catches raw Trello/API errors and normalizes retryable failures

key-files:
  created:
    - src/Hooks/useAPI.test.ts
    - src/Hooks/Trello/TrelloOperationResult.ts
    - src/Hooks/Trello/TrelloOperationResult.test.ts
    - src/Hooks/Trello/OrderTrelloAdapter.ts
    - src/Hooks/Trello/OrderTrelloAdapter.test.ts
  modified:
    - src/Hooks/useAPI.ts
    - src/Hooks/Trello/useTrello.ts

key-decisions:
  - "useAPI now rejects non-2xx responses with status, statusText, parsed body, URL, and method details."
  - "OrderTrelloAdapter keeps Trello IDs in useTrello and maps pure order label intent to those IDs."
  - "Missing local card or attachment IDs are non-retryable adapter failures; network/API failures remain retryable."
  - "Attachment retry payloads store order/card and file metadata, not API credentials or binary file content."

patterns-established:
  - "TrelloOperationResult: typed success/failure result for every Trello side effect."
  - "OrderTrelloAdapter: order workflows call adapter methods instead of raw useTrello methods."
  - "useAPI error normalization: parse once, reject failed HTTP responses, preserve status context."

requirements-completed: [SYNC-01, ORD-03]

duration: 9 min
completed: 2026-06-16
---

# Phase 02 Plan 02: Trello Adapter And Operation Results Summary

**Typed Trello operation results and order-specific adapter methods normalize HTTP, network, missing-ID, card, comment, and attachment failures.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-06-16T03:33:00Z
- **Completed:** 2026-06-16T03:42:14Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Reworked `useAPI` to build URLs with `URL`/`URLSearchParams`, reject non-2xx responses, and preserve parsed failure details.
- Added `TrelloOperationResult` types and helper functions for structured Trello operation success/failure handling.
- Exported the `UseTrello` type and added `createOrderTrelloAdapter` with seven order-specific Trello operations.
- Added adapter/API tests for success, network failure, non-2xx failure, missing card ID, and attachment failure retry payloads.

## Task Commits

Each task was committed atomically:

1. **Task 1: Make useAPI expose reliable failures for Trello callers** - `87d5126` (fix)
2. **Task 2: Add Trello operation result types** - `6cc2c94` (feat)
3. **Task 3: Create order-specific Trello adapter around existing useTrello** - `a04c5b1` (feat)

**Plan metadata:** committed with this summary.

## Files Created/Modified

- `src/Hooks/useAPI.ts` - Safer URL building, parsed response handling, and explicit HTTP rejection.
- `src/Hooks/useAPI.test.ts` - Fetch tests for query merging, non-2xx rejection, JSON success, and file upload success.
- `src/Hooks/Trello/TrelloOperationResult.ts` - Trello operation result names, success/failure types, and helper functions.
- `src/Hooks/Trello/TrelloOperationResult.test.ts` - Unit tests for success/failure helper output.
- `src/Hooks/Trello/useTrello.ts` - Exports `UseTrello` as a named type for adapter dependency typing.
- `src/Hooks/Trello/OrderTrelloAdapter.ts` - Typed adapter for create/update/move/comment/attachment/delete/fetch operations.
- `src/Hooks/Trello/OrderTrelloAdapter.test.ts` - Mocked Trello tests covering success and failure normalization.

## Decisions Made

- `useAPI` parses response text once and returns `null` for empty successful responses, which supports `DELETE`-style Trello calls.
- Adapter retry payloads intentionally reference local order/card context and operation inputs but exclude Trello API credentials.
- Missing `trelloCardId` is treated as a local input problem with `retryable: false`; API/network failures are `retryable: true`.

## Deviations from Plan

None - plan executed exactly as written.

---

**Total deviations:** 0 auto-fixed.
**Impact on plan:** No scope change.

## Issues Encountered

- Full-suite runs continue to print existing Redux Persist serializability and React `act(...)` warnings from the current harness; all commands exited 0.
- `useAPI` now logs the supplied message correctly, which exposes existing test mocks that omit HTTP status fields in console output, but does not fail tests.

## User Setup Required

None - no external service configuration required.

## Verification

- `CI=true yarn test --watchAll=false --runInBand src/Hooks/useAPI.test.ts` - passed, 4 tests.
- `CI=true yarn test --watchAll=false --runInBand src/Hooks/Trello/TrelloOperationResult.test.ts` - passed, 2 tests.
- `CI=true yarn test --watchAll=false --runInBand src/Hooks/Trello/TrelloOperationResult.test.ts src/Hooks/Trello/OrderTrelloAdapter.test.ts src/Hooks/useAPI.test.ts` - passed, 12 tests.
- `CI=true yarn test --watchAll=false --runInBand` - passed, 11 suites / 53 tests.

## Next Phase Readiness

Plan `02-03` can refactor `useOrder` workflows through the adapter and persist retryable sync failures using the structured result model.

---
*Phase: 02-order-state-and-trello-sync-reliability*
*Completed: 2026-06-16*
