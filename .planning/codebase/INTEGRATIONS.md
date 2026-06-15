---
last_mapped_commit: 267df10e480e7fc98ab019c903934a1defd25960
last_mapped_at: 2026-06-15
---

# External Integrations

**Analysis Date:** 2026-06-15

## APIs & External Services

**Trello:**
- Trello REST API - Order card creation, card updates, list moves, comments, attachment uploads, done-order checks, and backup storage.
  - SDK/Client: No Trello SDK; calls go through browser `fetch` in `src/Hooks/useAPI.ts` via wrapper methods in `src/Hooks/Trello/useTrello.ts`.
  - Base URL: `https://api.trello.com/1` in `src/Hooks/Trello/useTrello.ts`.
  - Auth: API key and token are hard-coded as string literals in `src/Hooks/Trello/useTrello.ts`; do not copy values into docs.
  - Board coupling: List IDs and label IDs are hard-coded in `src/Hooks/Trello/useTrello.ts` and consumed by `src/Hooks/useOrder.ts`.

**GitHub Raw Content:**
- GitHub raw URL - Manual backup rehydrate source in `src/Routing/MasterPage.tsx`.
  - SDK/Client: Browser `fetch`.
  - Default URL: Points to a `docs/data` path in the GitHub repository, but no `docs/data` file exists in the current working tree.
  - Auth: None.

**Google Fonts:**
- Google Fonts - Loads the Kanit font from `public/index.html`.
  - SDK/Client: Browser stylesheet request.
  - Auth: None.

## Data Storage

**Databases:**
- Browser IndexedDB - Primary persisted application state through `redux-persist`.
  - Connection: Browser local IndexedDB database managed by `idb-keyval`.
  - Client: `src/Store/idbStorage.ts` implements the storage adapter used by `src/Store/Store.ts`.
  - Data model: Redux slices in `src/Store/Reducers/CustomerReducer.ts`, `src/Store/Reducers/OrderReducer.ts`, and `src/Store/Reducers/AppContextReducer.ts`.

**File Storage:**
- Trello card attachments - Periodic backup uploads in `src/Routing/MasterPage.tsx` create a text attachment containing serialized Redux state.
- Static generated assets - Production build files live under `docs/`, including `docs/index.html`, `docs/static/js/main.d392b372.js`, and `docs/service-worker.js`.

**Caching:**
- Browser localStorage - `src/Routing/MasterPage.tsx` stores `lastCheckTime` to throttle backup uploads.
- Workbox/service worker - Runtime code exists in `src/service-worker.ts` and generated `docs/service-worker.js`, but `src/index.tsx` calls `serviceWorkerRegistration.unregister()`.
- No Redis/server cache exists.

## Authentication & Identity

**Application Users:**
- No user sign-in or collaborative operator model exists in the React app.
  - Implementation: Every route under `src/Routing/RootRouter.tsx` is reachable client-side.
  - Data access: Browser storage and Trello API calls are available to the browser runtime.

**Trello API Identity:**
- Trello API configuration is shared by the trusted internal app workflow.
  - Implementation: `src/Hooks/Trello/useTrello.ts` appends key/token parameters through `src/Hooks/useAPI.ts`.
  - Current scope: Improve operation results, recovery, and status feedback before considering backend collaboration work.

## Monitoring & Observability

**Error Tracking:**
- None. There is no Sentry, Datadog, or similar integration in `package.json` or source imports.

**Analytics:**
- `web-vitals` is installed and loaded by `src/reportWebVitals.ts`, but `src/index.tsx` calls `reportWebVitals()` without a handler, so metrics are not sent anywhere.

**Logs:**
- Browser console logging only, mainly from `src/Hooks/useAPI.ts` and CRA service worker helper code in `src/serviceWorkerRegistration.ts`.
- User-facing success/error messages are shown through the local message provider in `src/Components/Message/MessageProvider.tsx` and `useMessage()` calls.

## CI/CD & Deployment

**Hosting:**
- Static hosting is implied by the committed `docs/` build output and router basename `/cassette-store` in `src/Routing/RootRouter.tsx`.
- No deployment provider config is present in the repo root.

**CI Pipeline:**
- No `.github/workflows/` directory or other CI config is present.
- Builds and tests are local commands from `package.json`.

## Environment Configuration

**Required env vars:**
- None are required by code at runtime today; Trello API configuration is handled in source.
- CRA variables such as `PUBLIC_URL` and `NODE_ENV` are referenced by `src/service-worker.ts`, `src/serviceWorkerRegistration.ts`, and `src/Store/Store.ts`.

**Local environment files:**
- Local environment files were not inspected during mapping.
- This milestone does not depend on environment-variable setup.

## Webhooks & Callbacks

**Incoming:**
- None. There are no backend endpoints or webhook handlers in the repo.

**Outgoing:**
- Trello API requests from `src/Hooks/Trello/useTrello.ts` through `src/Hooks/useAPI.ts`.
- GitHub raw file fetch from `src/Routing/MasterPage.tsx`.
- Google Fonts stylesheet requests from `public/index.html`.

---

*Integration audit: 2026-06-15*
