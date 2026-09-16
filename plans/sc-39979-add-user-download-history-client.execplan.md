# SC-39979 Add User Download History Client

## Purpose / Big Picture

Replace the authenticated user's legacy Library page with a Download History page backed by the new CLARK API endpoint. Users should be able to audit what they downloaded and when, without treating history as current authorization.

## Progress

- [x] (2026-09-16 18:11Z) Re-audited the client after the Library endpoint retirement: startup, service, action panel, routing, navbar, usage metrics, and legacy Library item dependencies.
- [x] (2026-09-16 18:15Z) Removed retired Library/cart HTTP helpers, saved-item state, startup fetch, Library metrics request, and unused delete UI.
- [x] (2026-09-16 18:15Z) Preserved the Download History endpoint and bundle-download flow, with action-panel access checks independent of history.
- [x] (2026-09-16 18:15Z) Added focused Download History loading and action-panel download tests; app type-check, production build, lint, formatting, and retired-endpoint scan pass.
- [x] (2026-09-16 18:15Z) Attempted focused Jest and spec type checks; both are blocked by existing repository test-tooling/spec drift documented below.
- [x] (2026-09-09 00:00Z) Confirmed client branch and clean worktree.
- [x] (2026-09-09 00:00Z) Inspected existing `/library` route, Library component, Library service, navbar links, download flow, and delete modal behavior.
- [x] (2026-09-09 00:00Z) Implemented `/download-history` route, `/library` redirect, and account/profile nav label updates.
- [x] (2026-09-09 00:00Z) Added typed download-history API client method.
- [x] (2026-09-09 00:00Z) Replaced Library page content with Download History list states and safe details navigation.
- [x] (2026-09-09 00:00Z) Added focused service/component tests; app TypeScript, lint, Prettier, and diff checks completed.
- [x] (2026-09-09 00:00Z) Removed Download History rating/download columns and updated row clicks to navigate to details instead of downloading.

## Surprises & Discoveries

- The initial Download History implementation left the old Library service methods and their `/users/:username/library` route helpers in place. They must now be deleted rather than merely unused because the backend intentionally returns 404 for them.
- `UsageStatsService` still combines `STATS_ROUTES.LIBRARY_METRICS` with learning-object metrics. This retired metric request must be removed while preserving the learning-object statistics returned to callers.
- The details action panel currently records a Library save before downloading. Download must directly invoke the existing bundle endpoint and must retain its current access checks. An uncommitted one-line removal of the primary button's obsolete save handler was present before this implementation pass; it is consistent with this story and will be retained.
- The old `LibraryItemComponent` is no longer rendered by the Download History page and is not consumed elsewhere. It retains the retired delete/save UI and should be removed from the feature module.

- The old Library delete icon calls `libraryService.removeFromLibrary`, which removes saved Library items. It must not be reused for Download History because there is no delete-history endpoint.
- The existing details route requires an author username, but the download-history DTO only provides `cuid`, `version`, and `learningObjectId`. Downloads can safely reuse the bundle flow with `learningObjectId`; title links should not invent a details URL without author data.

## Decision Log

- Decision: Stabilize in place by retaining the existing `LibraryService` file and injection token for Download History and bundle-download support, but remove all Library/cart state and endpoint methods.
  Rationale: Renaming the feature/service would create unnecessary broad churn; removing the retired runtime behavior and route helpers satisfies the API sunset without altering the supported bundle flow.
  Date/Author: 2026-09-16 / Codex

- Decision: Return learning-object statistics directly instead of merging retired Library metrics.
  Rationale: The Library metrics endpoint is no longer supported; its values are not required by the `LearningObjectStats` contract used by current consumers.
  Date/Author: 2026-09-16 / Codex

- Decision: Add `/download-history` and redirect `/library` to it.
  Rationale: Product wants the old Library experience sunset while using a URL-safe route for the new page.
  Date/Author: 2026-09-09 / Codex

- Decision: Do not include functional delete behavior on Download History rows.
  Rationale: The existing delete action is for saved Library items, not audit records.
  Date/Author: 2026-09-09 / Codex

## Outcomes & Retrospective

The client no longer requests any retired `/users/:username/library` endpoint. `LibraryService` now contains only Download History retrieval and the existing bundle-download implementation. `ClarkComponent` no longer initializes a saved Library, the details action panel downloads directly through the supported bundle flow without saving/removing/checking Library state, and the obsolete Library item/delete component has been removed. `UsageStatsService` no longer calls retired Library metrics.

The existing Download History page remains at `/download-history`, with `/library` redirecting to it and both navbar variants labeled Download History. Unavailable records remain filtered from the history page as required by the preceding UI decision; focused tests cover that behavior alongside rendering, loading, empty, error/retry, pagination, and details navigation.

Validation: `npx tsc -p src/tsconfig.app.json --noEmit`, `npx ng build clark`, `npm run lint` (257 existing warnings, zero errors), Prettier, and `git diff --check` pass. Focused Jest suites do not initialize because of the repository's existing `jest-preset-angular` transformer mismatch. `src/tsconfig.spec.json` additionally reports unrelated pre-existing spec errors; the Download History spec mismatch discovered there was corrected.

Implemented the client Download History page by reusing the old Library feature shell. `/download-history` now lazy-loads the page, `/library` redirects to it, and authenticated navbar entries point to Download History. The page calls `GET /users/download-history`, renders history rows with type, course/resource name, downloaded timestamp, unavailable state, loading, empty, error/retry, and load-more pagination. Available course/resource names fetch the current learning object and navigate to the details page; they do not download. The old Library rating column, download button, delete modal, and `removeFromLibrary` flow are not used.

`npx tsc -p src/tsconfig.app.json --noEmit`, `npx ng lint clark`, targeted Prettier, and `git diff --check` pass. Full Angular build exits early in this environment without diagnostics, and focused Jest specs are blocked before execution by the existing `jest-preset-angular`/`ts-jest` transformer mismatch.

## Context and Orientation

The client is an Angular 18 SPA with lazy-loaded NgModule routes. The current Library feature lives under `src/app/cube/library`, with route registration in `src/app/cube/cube.routing.ts` and account dropdown links in `src/app/components/primary-navbar/primary-navbar.component.html`.

API access for the old Library page is in `src/app/core/library-module/library.service.ts` and `src/app/core/library-module/library.routes.ts`. The existing supported bundle download flow is `LibraryService.downloadBundle(BUNDLING_ROUTES.DOWNLOAD_BUNDLE(learningObjectId))`.

## Plan of Work

Reuse the existing Library module as the Download History page shell to minimize churn. Add a typed client request method for `GET /users/download-history`, then simplify `LibraryComponent` to load and render download-history rows with loading, empty, error, unavailable, and load-more states. Update navigation labels and route metadata.

## Concrete Steps

1. Add `GET_DOWNLOAD_HISTORY` route helper.
2. Add `DownloadHistoryItem` and `DownloadHistoryResponse` types near the existing Library service.
3. Add `LibraryService.getDownloadHistory({ limit, cursor })`.
4. Replace old Library page template logic with Download History content.
5. Update component behavior to load first page, retry, load more by `nextCursor`, and download via existing bundle flow only when `resource.learningObjectId` is present.
6. Update `/library` routing to redirect to `/download-history`.
7. Update desktop and mobile authenticated navbar labels/links.
8. Add focused tests for service route construction and component states.

## Validation and Acceptance

- `npx prettier --check` for touched files.
- `npm run lint` or targeted lint if practical.
- `npm run build` if environment allows.
- Focused Jest tests for Library service/component.
- Manual validation: authenticated user can open `/download-history`, see rows newest first, load more when `nextCursor` exists, retry errors, and cannot delete history rows.

## Idempotence and Recovery

All changes are additive or scoped replacements in the Library feature. If the route replacement causes navigation issues, revert the route redirect and keep `/library` loading the same module while preserving Download History text and data.

## Artifacts and Notes

Backend endpoint: `GET /users/download-history?limit=20&cursor=<optional>`.

Client must not call the admin endpoint or depend on `_id`/`note`.

## Interfaces and Dependencies

Expected response:

```json
{
    "items": [
        {
            "timestamp": "2025-07-11T21:04:27.612000Z",
            "downloadedBy": "5dd599c7fa53ebc86eb8b5cf",
            "learningObject": {
                "cuid": "136c63fd-cfd6-48f5-bdb3-9600f28079c8",
                "version": 0
            },
            "type": "file",
            "fileName": "10.CAS_Unit4_Scenario2_Presentation.pptx",
            "available": true,
            "resource": {
                "learningObjectId": "mongo-learning-object-id",
                "cuid": "136c63fd-cfd6-48f5-bdb3-9600f28079c8",
                "version": 0
            }
        }
    ],
    "nextCursor": "opaque-cursor-string"
}
```
