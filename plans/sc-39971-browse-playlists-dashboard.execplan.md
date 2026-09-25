# SC-39971: Add the public playlist browse dashboard

This ExecPlan is a living document maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Add a public playlist dashboard at `/playlists`. Visitors can browse every public playlist, open a playlist detail page, and follow its available learning objects to their existing CLARK detail pages. The user profile remains unchanged and contributions-only.

## Progress

- [x] (2026-09-10) Added the typed playlist read service and route builder.
- [x] (2026-09-10) Added lazy-loaded browse and detail routes with responsive cards and loading, empty, and failure states.
- [x] (2026-09-10) Added Browse Playlists to the secondary navigation and linked learning objects through the existing card component.
- [x] (2026-09-11) Removed the profile playlist tabs, profile-specific component/tests, and unused playlist mutation client methods.
- [x] (2026-09-11) Re-ran formatting, lint, build, focused TypeScript spec compilation, and Jest; documented the unchanged Jest infrastructure blocker.

## Surprises & Discoveries

- Observation: The hydrated playlist response has CUID/version card data but not the author username required by the existing learning-object URL. The detail page resolves each available entry through `LearningObjectService` before rendering the established linked card.
- Observation: Jest is currently blocked during global setup by `TypeError: configSet.processWithEsbuild is not a function`; focused TypeScript compilation is the available spec-validation fallback.

## Decision Log

- Decision: Keep `/playlists` as the canonical URL and redirect `/playlits` to it.
  Rationale: This supports the originally requested misspelling without making it the permanent route contract.
  Date/Author: 2026-09-10 / Codex
- Decision: Keep playlist browsing independent from user profiles.
  Rationale: The revised branch scope is the public browse dashboard only.
  Date/Author: 2026-09-11 / Codex
- Decision: Retain only `getPlaylists()` and `getPlaylist()` in the client service.
  Rationale: Creation, mutation, membership, and profile filtering are not used by this read-only dashboard.
  Date/Author: 2026-09-11 / Codex

## Outcomes & Retrospective

The branch now contains only the public playlist browse/detail experience. The user profile matches `origin/main` and has no playlist tab, playlist request, or profile-only test/component. The playlist client boundary contains only the two GET operations consumed by the dashboard. The Angular build, lint, and focused TypeScript spec compilation pass; Jest remains blocked before test discovery by the repository's transformer mismatch.

## Context and Orientation

`src/app/cube/cube.routing.ts` lazy-loads `src/app/cube/playlists/playlists.module.ts`. The feature router owns the index and `:playlistId` detail routes. `src/app/core/playlist-module` owns the backend read contract. The existing learning-object service and card component supply canonical learning-object navigation.

## Plan of Work

Keep the public playlist grid, playlist detail page, shared playlist card, secondary Browse link, read-only service, and related tests. Restore `src/app/cube/user-profile/user-profile.component.*` to its original contributions-only behavior and remove all profile playlist files and tests.

## Concrete Steps

From the `clark-client` root:

    npx prettier --write <changed files>
    npx ng lint clark
    npx ng build clark
    npx jest --runInBand <focused playlist specs>

## Validation and Acceptance

- `/users/:username` has no playlist tab and behaves as it did before this branch.
- `/playlists` requests the unfiltered public playlist collection.
- `/playlists/:playlistId` displays the selected playlist.
- Available learning-object cards navigate to their real detail pages; stale references render safely.
- Browse Playlists remains between Browse Curriculum and Browse Resources.
- No profile playlist component, state, service call, or test remains.

## Idempotence and Recovery

The cleanup restores profile files to their base-branch content and deletes only branch-added profile files. No persisted data or backend behavior changes.

## Artifacts and Notes

- `npx prettier --write <changed files>`: passed.
- `npx ng lint clark`: passed with 0 errors and 259 existing warnings.
- `npx ng build clark`: passed.
- Focused `npx tsc` spec configuration: passed.
- Focused `npx jest --runInBand ...`: blocked before test discovery by `TypeError: configSet.processWithEsbuild is not a function`.
- `git diff --check`: passed.

## Interfaces and Dependencies

The dashboard uses Angular Router, `HttpClient`, RxJS, the existing learning-object service/card, and the backend `GET /playlists` query contract. It adds no package or environment dependency.
