# SC-40577: Sort Learning Objects by Author and Name

## Purpose / Big Picture

Add sortable Author and Learning Object Name controls to the admin learning-objects table. Clicking either control will update the existing query state, preserve all current filters/search/pagination/date parameters, and request `GET /learning-objects` with the selected `orderBy` (`author` or `name`) and `sortType` (`1` or `-1`). Existing Date sorting remains unchanged.

## Progress

- [x] (2026-10-27) Read repository planning guidance and inspected the learning-objects component, search service, query types, and existing tests.
- [x] (2026-10-27) Fetched `origin` and created `feature/sc-40577/add-sort-by-author-and-learning-object-name-in` from `origin/main`.
- [x] (2026-10-27) Added `OrderBy.Author` and sorting behavior for Name and Author.
- [x] (2026-10-27) Added clickable header controls and direction indicators.
- [x] (2026-10-27) Added focused tests for Name and Author in both directions and parameter preservation.
- [x] (2026-10-27) Ran tests and build; recorded repository tooling failures below.
- [x] (2026-10-27) Committed the completed branch; push remains as the final handoff step.

## Surprises & Discoveries

- The repository uses a standalone Angular component for this page inside an otherwise mixed NgModule application.
- `SearchService` already serializes arbitrary `Query` fields into the `/learning-objects` URL, so no new API method is needed.
- The repository has known Jest transformer drift; focused tests may fail before executing if installed versions are incompatible.

## Decision Log

- Decision: Keep sorting logic in `LearningObjectsComponent` and reuse the existing `Query` setter and `SearchService`.
  Rationale: This is the established ownership for table interactions, and it preserves query-string synchronization without expanding scope.
  Date/Author: 2026-10-27 / Codex
- Decision: Leave `sortByDate()` behavior unchanged and add a separate generic method for Name and Author.
  Rationale: The story explicitly requires existing Date sorting to remain unchanged while allowing each new field to toggle independently.
  Date/Author: 2026-10-27 / Codex
- Decision: Do not change routing, guards, interceptors, shared components, or build/environment configuration.
  Rationale: The request is a local admin table interaction and the existing API serialization already meets the backend contract.
  Date/Author: 2026-10-27 / Codex

## Outcomes & Retrospective

Implemented Name and Author sorting without changing Date sorting, routing, API service boundaries, or shared components. The new tests assert `orderBy`, both `sortType` directions, preserved search/filter/date/page query parameters, and router URL synchronization. The production build passes. Jest cannot initialize because the installed Angular Jest transformer expects a missing `processWithEsbuild` method; the configured `test:unit` script also has no matching `uri-retriever` or `featuredObjects` tests. Targeted ESLint and `git diff --check` pass.

## Context and Orientation

The route `src/app/admin/admin.routing.ts` loads `LearningObjectsComponent` from `src/app/admin/pages/learning-objects/`. The component stores the current query in `_query`, synchronizes it to the browser URL through its `query` setter, and calls `SearchService.getLearningObjects`. `src/app/core/learning-object-module/search/search.service.ts` serializes the query with `URLSearchParams`, producing the backend request. `src/app/interfaces/query.ts` defines `OrderBy` and `SortType`.

The page currently renders Name and Author as plain header text and has a Date control wired to `sortByDate()`. The new controls must update the same query object so existing text, status, collection, date, page, and other parameters stay intact.

This work is local to the admin page, query enum, and page tests. It does not touch routing, guards/interceptors, shared UI contracts, state ownership, entities, API service boundaries, or environment/build behavior. Existing `toPromise` usage and broader testing-tool drift are intentionally left in place.

## Plan of Work

1. Add the Author enum value to `OrderBy`.
2. Add a component method that toggles the selected Name or Author direction, preserves the existing query, clears the loaded list, and reloads the first/current query as the existing Date flow does.
3. Add accessible clickable controls to the Name and Author headers, with direction indicators scoped to the active field.
4. Extend component tests to assert both directions for both fields, URL query synchronization, and preservation of existing query parameters.
5. Run focused tests, the configured client test command, lint/build as practical, then inspect the final diff.
6. Commit with the requested message and push the feature branch.

## Concrete Steps

- Edit `src/app/interfaces/query.ts` to add `OrderBy.Author = "author"`.
- Edit `src/app/admin/pages/learning-objects/learning-objects.component.ts` with a reusable Name/Author sort handler while retaining `sortByDate()`.
- Edit `src/app/admin/pages/learning-objects/learning-objects.component.html` to make Name and Author headers clickable and show ascending/descending state only for the active field.
- Edit `src/app/admin/pages/learning-objects/learning-objects.component.spec.ts` with focused interaction/query tests.
- Use `git diff`, test output, and build output as the handoff evidence.

## Validation and Acceptance

Acceptance requires:

- Name clicks send `orderBy=name` and alternate `sortType=1` / `sortType=-1`.
- Author clicks send `orderBy=author` and alternate `sortType=1` / `sortType=-1`.
- Existing query values for text, status, collection, dates, pagination, and other filters remain in the router URL and serialized request after sorting.
- Date sorting behavior is unchanged.
- Focused tests cover both fields in both directions.
- The client test command and production build are run; failures are reported accurately if repository/tooling drift prevents completion.

Manual browser verification, if the app can be served, should inspect the address bar and DevTools network request after each header click.

## Idempotence and Recovery

The changes are additive and can be reapplied safely by checking the current enum, component method, template controls, and tests before patching. If validation exposes a pre-existing toolchain issue, do not alter dependency versions as part of this story; record the exact failure and preserve the source changes. If the branch or push already exists, inspect status and remote tracking before retrying Git operations.

## Artifacts and Notes

- Branch: `feature/sc-40577/add-sort-by-author-and-learning-object-name-in`
- Plan: `plans/sc-40577-learning-object-sorting.execplan.md`
- Expected source files: `src/app/interfaces/query.ts` and files under `src/app/admin/pages/learning-objects/`

## Interfaces and Dependencies

- `OrderBy` and `SortType` in `src/app/interfaces/query.ts`.
- `Query` serialization in `SearchService.getLearningObjects`.
- Angular Router query parameters managed by `LearningObjectsComponent.query`.
- Backend `GET /learning-objects` query contract: `orderBy=name|author`, `sortType=1|-1`.
