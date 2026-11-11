# SC-39979 Add User Download History Client

## Purpose / Big Picture

Replace the authenticated user's legacy Library page with a Download History page backed by the new CLARK API endpoint. Users should be able to audit what they downloaded and when, without treating history as current authorization.

## Progress

- [x] (2026-09-25) Identified missing materials-resource hydration before filename matching: basic learning-object requests do not load resourceUris.materials.
- [x] (2026-09-25) Load materials through the existing resource service before matching; regression coverage added. App TypeScript, production build, formatting and diff checks pass. All 16 component tests pass with temporary CLI overrides for existing Jest configuration drift.

- [x] (2026-09-21 14:00Z) Inspected the Download History row model and the existing authorized individual-file download flow.
- [x] (2026-09-21 14:00Z) Made an available File row's filename invoke `FileService.handleFileDownload` only after resolving its current material by `fileName`.
- [x] (2026-09-21 14:00Z) Added focused coverage for clickable and non-clickable filename states; client type check and production build pass. Focused Jest remains blocked by the existing transformer mismatch.
- [x] (2026-09-18 16:00Z) Inspected the Download History component, table styles, tests, and API DTO before the approved table-only refinement.
- [x] (2026-09-18 16:00Z) Added the approved LENGTH, TYPE, TITLE, FILE NAME, and DOWNLOADED columns without changing surrounding page layout.
- [x] (2026-09-18 16:00Z) Added inline filename path expansion on hover/focus, preserving the FILE NAME cell and constraining long paths with ellipsis.
- [x] (2026-09-18 16:00Z) Updated focused table tests for columns, Bundle/File icons, and filename-path derivation; app type-check and production build pass.
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

- Decision: Reuse `FileService.handleFileDownload` for Download History file links after matching the response `fileName` to the current learning object's material.
  Rationale: The history response deliberately supplies display metadata rather than a file-download URL or material ID. The existing service calls CLARK's authorization-aware file endpoint with the resolved material ID, so it re-checks access at request time and does not use `filePath` as a URL.
  Date/Author: 2026-09-21 / Codex

- Decision: Derive the file label from the stored history name and resolve a fuller material path from the already-fetched learning object when one is available.
  Rationale: The Download History API provides a stored `name` rather than separate filename/path fields. Reusing the existing learning-object request supplies the learning-object title and matching material `fullPath` without changing the API or adding a request solely for hover behavior.
  Date/Author: 2026-09-18 / Codex

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

The Download History table now uses the approved five-column structure. Length continues to use the existing colored chips; API `type === "bundle"` renders the existing Font Awesome layers icon and `Bundle`, and every other history type renders the existing file icon and `File`. Bundle rows show an em dash in FILE NAME. File rows derive the compact label from the final segment of the stored history name and swap it in place for a matching material `fullPath` when available (otherwise the stored name) on hover or keyboard focus. The expanded value is clipped safely within its own cell and uses a subtle translucent background rather than any floating tooltip or icon.

The client no longer requests any retired `/users/:username/library` endpoint. `LibraryService` now contains only Download History retrieval and the existing bundle-download implementation. `ClarkComponent` no longer initializes a saved Library, the details action panel downloads directly through the supported bundle flow without saving/removing/checking Library state, and the obsolete Library item/delete component has been removed. `UsageStatsService` no longer calls retired Library metrics.

The existing Download History page remains at `/download-history`, with `/library` redirecting to it and both navbar variants labeled Download History. Unavailable records remain filtered from the history page as required by the preceding UI decision; focused tests cover that behavior alongside rendering, loading, empty, error/retry, pagination, and details navigation.

Validation: `npx tsc -p src/tsconfig.app.json --noEmit`, `npx ng build clark`, `npm run lint` (257 existing warnings, zero errors), Prettier, and `git diff --check` pass. Focused Jest suites do not initialize because of the repository's existing `jest-preset-angular` transformer mismatch. `src/tsconfig.spec.json` additionally reports unrelated pre-existing spec errors; the Download History spec mismatch discovered there was corrected.

Implemented the client Download History page by reusing the old Library feature shell. `/download-history` now lazy-loads the page, `/library` redirects to it, and authenticated navbar entries point to Download History. The page calls `GET /users/download-history`, renders history rows with type, course/resource name, downloaded timestamp, unavailable state, loading, empty, error/retry, and load-more pagination. Available course/resource names fetch the current learning object and navigate to the details page; they do not download. The old Library rating column, download button, delete modal, and `removeFromLibrary` flow are not used.

`npx tsc -p src/tsconfig.app.json --noEmit`, `npx ng lint clark`, targeted Prettier, and `git diff --check` pass. Full Angular build exits early in this environment without diagnostics, and focused Jest specs are blocked before execution by the existing `jest-preset-angular`/`ts-jest` transformer mismatch.

## Context and Orientation

The client is an Angular 18 SPA with lazy-loaded NgModule routes. The current Library feature lives under `src/app/cube/library`, with route registration in `src/app/cube/cube.routing.ts` and account dropdown links in `src/app/components/primary-navbar/primary-navbar.component.html`.

API access for the old Library page is in `src/app/core/library-module/library.service.ts` and `src/app/core/library-module/library.routes.ts`. The existing supported bundle download flow is `LibraryService.downloadBundle(BUNDLING_ROUTES.DOWNLOAD_BUNDLE(learningObjectId))`.

## Plan of Work

September 25 correction: stabilize Download History locally by awaiting `fetchLearningObjectResources(learningObject, ["materials"])` for eligible file records before matching the material name. Preserve the existing template, styles, download helper, routing, and backend. Validate separately loaded materials, resource failures, and missing matches. No new API or state ownership is introduced.

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

September 25 validation: the default Jest command fails with `configSet.processWithEsbuild is not a function`. The following command runs all 16 component tests successfully without editing shared test configuration (diagnostics disabled for this runtime run; application TypeScript checked separately):

```sh
npx jest src/app/cube/library/library.component.spec.ts --runInBand --no-cache --modulePaths '<rootDir>/src' --transform '{"^.+\\.(ts|js|mjs|html)$":["jest-preset-angular",{"tsconfig":{"target":"ES2016","experimentalDecorators":true,"emitDecoratorMetadata":true,"esModuleInterop":true},"stringifyContentPathRegex":"\\.html$","diagnostics":false}]}'
```

The active port 4201 server was confirmed to run from `client-main`, whereas this correction is in `clark-client`. Restart from the corrected checkout to validate in-browser. Authenticated browser download remains a manual check. Historical rows without file metadata cannot resolve an individual download. The production build passed after permitting access to Google Fonts for font inlining.

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
