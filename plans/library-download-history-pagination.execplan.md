# Download History Pagination

## Purpose / Big Picture

Update the Cube library download-history view to consume the page-based API response and show one page of up to 20 download-history records at a time. Users should be able to select numbered pages and navigate through all pages reported by the API without accumulating every page in the browser.

## Progress

- [x] (2026-09-30) Read repository planning guidance and inspected the library component, service, route helper, pagination component, and nearby tests.
- [x] (2026-09-30) Confirmed the current implementation requests `limit: 20` but still uses cursor-based accumulation, while the supplied response exposes `page`, `limit`, `totalPages`, `hasNextPage`, and `hasPreviousPage`.
- [x] (2026-09-30) Updated the service request/response types for page-based pagination and fixed the default page size at 20 from the library view.
- [x] (2026-09-30) Updated the library component/template to load and display one page at a time using the existing numbered paginator.
- [x] (2026-09-30) Updated focused tests for page query parameters and page navigation/replacement.
- [x] (2026-09-30) Ran Jest, lint, production build, formatting, and diff checks; Jest is blocked by existing transformer drift and the build is blocked only at remote font inlining.
- [x] (2026-10-02) Prototyped unavailable-record display, then superseded it when the product decision changed to backend-side `availableOnly` filtering.
- [x] (2026-10-02) Updated component coverage and request assertions for the final available-only behavior.
- [x] (2026-10-02) Switched the library request to `availableOnly=true`, so the backend filters before pagination and the view receives only usable records.
- [x] (2026-10-02) Expanded library component coverage for initial/page-2 request flags, page replacement, backend-provided `totalPages`, available-only rows, and the empty state.
- [x] (2026-10-02) Replaced the reused numbered paginator presentation with compact previous/next arrows and `Page X of Y`, preserving its public inputs/output.
- [x] (2026-10-02) Added paginator boundary and adjacent-page tests; lint passed and Angular bundle compilation completed before remote font inlining failed.

## Surprises & Discoveries

- The library feature already has a standalone numbered `PaginationComponent`, but the library page currently renders a separate cursor-based “Load More” button instead of using it.
- The existing response type only models `items` and `nextCursor`; it must be expanded to represent the supplied page metadata.
- The repository has Jest specs, while `angular.json` still points Angular’s test target at Karma. Validation will use the configured Jest tooling for the touched specs and report any tooling drift.

## Decision Log

- Decision: Replace cursor accumulation with page-based requests for this view.
  Rationale: The supplied endpoint response is page-based and includes total-page metadata; numbered pagination can request only the selected 20-item page.
  Date/Author: 2026-09-30 / Codex
- Decision: Reuse the existing Cube library `PaginationComponent` without changing its public API.
  Rationale: It already emits page numbers and is used by other feature areas; changing it would expand the story and risk downstream consumers.
  Date/Author: 2026-09-30 / Codex
- Decision: Request only available download records for the library view.
  Rationale: The product requirement is to show up to 20 usable records per page; the backend now filters before calculating pagination metadata, avoiding short pages caused by unavailable history entries.
  Date/Author: 2026-10-02 / Codex

## Outcomes & Retrospective

Implemented page-based download-history pagination using backend-side availability filtering. The library requests 20 available records per page, replaces visible rows after navigation, and uses backend pagination metadata calculated from usable records. Jest execution remains blocked before test discovery by the repository’s `jest-preset-angular`/TypeScript tooling mismatch; lint and formatting pass, and Angular bundle compilation completes before the environment-dependent Google Fonts fetch fails.

## Context and Orientation

The route is defined in `src/app/cube/cube.routing.ts` and lazy-loads `src/app/cube/library`. `LibraryComponent` calls `LibraryService.getDownloadHistory`, enriches available records with learning-object details, and renders the table. `LibraryService` builds the authenticated request to `src/app/core/library-module/library.routes.ts`. `src/app/cube/library/components/pagination/pagination.component.ts` is a reusable numbered paginator that emits the selected page number.

This is a local feature change across the library component, its domain service/type, template, and tests. It does not change routing, guards, interceptors, shared API boundaries beyond the library service method, state ownership, entities, environment configuration, or build behavior.

## Plan of Work

1. Change the download-history response model and service options to send `page` plus a fixed page size of 20, while retaining the authenticated request behavior.
2. Track the current page and total page count in `LibraryComponent`; replace cursor accumulation with replacement of the current page’s items.
3. Import and render the existing `PaginationComponent` when more than one page exists, with loading/error behavior that prevents duplicate page requests.
4. Update focused service and component tests for page query parameters, page metadata, and selecting another page.
5. Run the relevant tests and lint/build checks available in the repository.

## Concrete Steps

- Edit `src/app/core/library-module/library.service.ts` and its spec to type and send `page`/`limit`.
- Edit `src/app/cube/library/library.component.ts`, `.html`, and tests to use page navigation.
- Keep existing item rendering, enrichment, retry behavior, and file/object actions unchanged; request only available records.
- Update this plan’s progress and outcomes after each implementation/validation milestone.

## Validation and Acceptance

- The initial request includes `page=1&limit=20`.
- Selecting page 2 requests `page=2&limit=20`, replaces the visible rows with page 2 records, and updates the selected page.
- The paginator is hidden when the API reports one or fewer pages.
- Loading and error states remain usable, and a failed page request does not silently retain stale page metadata.
- Existing row actions and empty-state behavior remain covered.
- Run the library component and service Jest specs; run lint or a focused Angular build if practical.

## Idempotence and Recovery

The changes are additive and limited to the library feature. Re-running tests is safe. If the API still supports only cursor pagination in an environment, revert the service/component page-contract edits together and restore the existing cursor flow; do not leave mixed page and cursor parameters in the request path.

## Artifacts and Notes

The supplied API example contains 125 total records, 20 records per page, and 7 pages. The backend now supports filtering unavailable records before pagination, and the frontend opts into that behavior for full pages of usable history records.

## Interfaces and Dependencies

- API: `GET /users/download-history?page=<page>&limit=20` with the supplied page metadata.
- Service: `LibraryService.getDownloadHistory({ page, limit, availableOnly })` returns `DownloadHistoryResponse`.
- UI: `PaginationComponent` receives `lastPageNumber` and `currentPageNumber`, and emits `newPageNumberClicked`.
- Tests: Jest specs under `src/app/cube/library` and `src/app/core/library-module`.

## Validation Results

- `npx ng lint clark`: passed with 257 existing warnings and no errors.
- `npx prettier --check ...`: passed for all touched files.
- `git diff --check`: passed.
- Focused Jest command: blocked before running tests by `TypeError: configSet.processWithEsbuild is not a function` from `jest-preset-angular`.
- `npx ng build clark --configuration=production`: application bundles compiled; index generation failed because `fonts.googleapis.com` was not resolvable in the environment.
