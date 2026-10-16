# Playlist raw-response support: Resolve learning objects from CUIDs

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Update the Angular playlist pages to consume raw playlist objects from `GET /playlists`. Playlist detail pages will resolve each `learningObjectCuids` entry through the existing `LearningObjectService`, preserving CUID order and showing unavailable entries without failing the page. Playlist routes and backend calls remain unchanged.

## Progress

- [x] (2026-10-05) Read repository planning guidance and identified playlist, learning-object, component, and test files.
- [x] (2026-10-05) Confirmed the existing learning-object observable performs released-version selection when no version is supplied.
- [x] (2026-10-05) Replaced hydrated playlist-only types and detail-component assumptions with raw CUID resolution.
- [x] (2026-10-05) Updated playlist tests for raw responses, ordered resolution, unavailable objects, and empty playlists.
- [x] (2026-10-05) Ran the focused unit-test command and Angular build; the build passed and Jest was blocked before test execution by repository toolchain drift.
- [x] (2026-10-05) Added a playlist-only resolver option that chooses the highest released version explicitly and added a regression test.
- [x] (2026-10-05) Re-ran focused playlist and learning-object Jest specs; Jest remains blocked before test execution by the same transformer mismatch, while the Angular build passes.

## Surprises & Discoveries

- Observation: `Playlist` already models `learningObjectCuids`; the obsolete assumption is concentrated in `PlaylistDetails` and the detail component/tests.
  Evidence: `src/app/core/playlist-module/playlist.types.ts` and `src/app/cube/playlists/playlist-details/playlist-details.component.ts`.
- Observation: `LearningObjectService.getLearningObjectObservable` calls the unchanged learning-object route and filters multiple returned versions to `LearningObject.Status.RELEASED`.
  Evidence: `src/app/core/learning-object-module/learning-object/learning-object.service.ts`.
- Observation: The Angular workspace still declares Karma in `angular.json`, while package scripts and existing focused tests use Jest.
  Evidence: `angular.json` and `package.json`.

## Decision Log

- Decision: Stabilize the playlist feature in place rather than introduce a new playlist state service or alter API routes.
  Rationale: The existing detail component already owns playlist-object hydration and the request only changes the playlist response shape.
  Date/Author: 2026-10-05 / Codex
- Decision: Pass only `{ cuid }` to the existing learning-object observable and require a released `LearningObject` for display.
  Rationale: This reuses current released-version selection and prevents missing, unreleased, or malformed results from breaking the playlist page.
  Date/Author: 2026-10-05 / Codex
- Decision: Make an opt-in playlist resolver path sort released responses by descending version before selecting one.
  Rationale: This guarantees the most recent released playlist object independently of backend response ordering without changing existing detail-page behavior.
  Date/Author: 2026-10-05 / Codex
- Decision: Gate descending-version selection behind the playlist-only `latestReleased` option.
  Rationale: The request is scoped to playlist fetching; existing detail-page resolver behavior must remain unchanged for callers that do not opt in.
  Date/Author: 2026-10-05 / Codex

## Outcomes & Retrospective

The playlist service and detail component now consume raw playlist responses. Detail loading requests each CUID through the existing learning-object service, preserves order with `forkJoin`, and renders unavailable placeholders for errors or non-released results. Playlist requests opt into highest-released-version selection through a scoped resolver option; existing detail-page behavior remains unchanged unless a caller opts in. Hydrated playlist types were removed. The default Angular build passed. Focused Jest execution remains blocked by the installed `jest-preset-angular`/transformer mismatch (`configSet.processWithEsbuild is not a function`), so assertions could not execute in this environment.

## Context and Orientation

`src/app/core/playlist-module/playlist.service.ts` calls the unchanged playlist routes in `playlist.routes.ts` and should type both collection and detail responses as raw `Playlist` objects. `src/app/cube/playlists/playlists.component.ts` displays the collection and resolves author names; `playlist-card.component.ts` derives its object count from `learningObjectCuids`. `src/app/cube/playlists/playlist-details/playlist-details.component.ts` fetches one playlist and renders its learning objects through `LearningObjectListingComponent`, but currently reads obsolete hydrated `learningObjects` data. `LearningObjectService` in `src/app/core/learning-object-module/learning-object/learning-object.service.ts` is the existing API/version-resolution boundary.

This is cross-cutting across playlist types, the playlist detail UI/service contract, and tests, but does not touch routing, guards, interceptors, shared UI contracts, environment/build configuration, or backend code. State remains owned by the detail component for this bounded change.

## Plan of Work

1. Remove `PlaylistDetails` and the obsolete hydrated playlist learning-object types; use `Playlist` for raw collection/detail responses.
2. Update the detail component to map `playlist.learningObjectCuids` with `forkJoin`. Each CUID produces an ordered `{ cuid, object }` view entry. Per-object errors and non-released results become `object: null`.
3. Keep the list/card UI based on raw playlist data and verify templates do not reference `playlist.learningObjects`.
4. Update service and component tests to prove raw loading, CUID requests, released-object handling, order, missing objects, and empty playlists.
5. Add playlist-only opt-in selection of the highest released version and regression coverage.
6. Run focused Jest tests and the configured Angular build; document any existing build/tooling drift.

## Concrete Steps

From the repository root, run:

    rg -n "PlaylistDetails|PlaylistLearningObject|learningObjects" src/app/core/playlist-module src/app/cube/playlists
    npx jest --runInBand src/app/core/learning-object-module/learning-object/learning-object.service.spec.ts src/app/core/playlist-module/playlist.service.spec.ts src/app/cube/playlists/playlists.component.spec.ts src/app/cube/playlists/playlist-details/playlist-details.component.spec.ts src/app/cube/playlists/components/playlist-card/playlist-card.component.spec.ts
    npm run build

Expect the playlist tests to pass, with raw playlist fixtures and ordered object views, followed by a successful Angular production-default build. In the current environment, Jest fails during transformer setup before loading tests because of the repository's existing Jest dependency drift; the build succeeds.

## Validation and Acceptance

- Playlist service tests verify collection and detail calls still use the existing `/playlists` routes and raw `Playlist` response shape (test execution blocked by Jest setup drift in this environment).
- Detail tests verify each CUID is requested, result order follows `learningObjectCuids`, empty playlists make no learning-object requests, and errors/unreleased/missing objects render as unavailable entries without setting the page-level error (test execution blocked by Jest setup drift in this environment).
- Playlist opt-in released-version selection is exercised through the no-version learning-object service call.
- Learning-object service coverage verifies an out-of-order response selects the highest released version and ignores a higher unreleased version when the playlist option is enabled.
- Playlist list/card tests verify raw CUID counts and existing playlist links.
- Build validation passed and confirms TypeScript/template references no longer require `playlist.learningObjects`.
- Manual check, if a browser is available: open `/playlists`, open a playlist containing released, missing, and empty cases, and confirm the page remains usable and preserves order.

## Idempotence and Recovery

The edits are additive or type-removal changes and can be reapplied safely after checking the working tree. If tests fail, first inspect the focused playlist specs and restore only the affected fixture/type contract; do not change backend routes. Build-generated `src/commit-hash.ts` may change as part of `npm run build` and is expected repository tooling behavior.

## Artifacts and Notes

The story-specific plan is `plans/playlist-raw-response.execplan.md`. No backend files, routes, guards, interceptors, or environment files are in scope.

## Interfaces and Dependencies

- `PlaylistService` / `Playlist` types in `src/app/core/playlist-module`.
- `PlaylistDetailsComponent`, `PlaylistsComponent`, and `PlaylistCardComponent` under `src/app/cube/playlists`.
- `LearningObjectService` and `LearningObject` entity for API resolution and released status.
- RxJS `forkJoin`, `catchError`, and existing Angular standalone component imports.
- Jest-focused unit tests and Angular CLI build tooling.
