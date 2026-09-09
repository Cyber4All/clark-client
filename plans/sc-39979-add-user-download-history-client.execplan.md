# SC-39979 Add User Download History Client

## Purpose / Big Picture

Replace the authenticated user's legacy Library page with a Download History page backed by the new CLARK API endpoint. Users should be able to audit what they downloaded and when, without treating history as current authorization.

## Progress

- [x] (2026-09-09 00:00Z) Confirmed client branch and clean worktree.
- [x] (2026-09-09 00:00Z) Inspected existing `/library` route, Library component, Library service, navbar links, download flow, and delete modal behavior.
- [x] (2026-09-09 00:00Z) Implemented `/download-history` route, `/library` redirect, and account/profile nav label updates.
- [x] (2026-09-09 00:00Z) Added typed download-history API client method.
- [x] (2026-09-09 00:00Z) Replaced Library page content with Download History list states and safe details navigation.
- [x] (2026-09-09 00:00Z) Added focused service/component tests; app TypeScript, lint, Prettier, and diff checks completed.
- [x] (2026-09-09 00:00Z) Removed Download History rating/download columns and updated row clicks to navigate to details instead of downloading.

## Surprises & Discoveries

- The old Library delete icon calls `libraryService.removeFromLibrary`, which removes saved Library items. It must not be reused for Download History because there is no delete-history endpoint.
- The existing details route requires an author username, but the download-history DTO only provides `cuid`, `version`, and `learningObjectId`. Downloads can safely reuse the bundle flow with `learningObjectId`; title links should not invent a details URL without author data.

## Decision Log

- Decision: Add `/download-history` and redirect `/library` to it.
  Rationale: Product wants the old Library experience sunset while using a URL-safe route for the new page.
  Date/Author: 2026-09-09 / Codex

- Decision: Do not include functional delete behavior on Download History rows.
  Rationale: The existing delete action is for saved Library items, not audit records.
  Date/Author: 2026-09-09 / Codex

## Outcomes & Retrospective

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
