# SC-39971: Add playlists to user profiles

This ExecPlan is a living document maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Add a second, responsive and keyboard-accessible tab to `/users/:username` so profile visitors can switch between Contributions and Playlists. Contributions remain the default for existing profile links, while `?tab=playlists` provides a directly navigable playlist view. Add a typed frontend Playlist API boundary with centralized builders for every backend playlist route, and use it to load the profile user's visible playlists.

## Progress

- [x] (2026-09-10) Inspected profile routing, resolver behavior, profile components, existing tab styling, API route helpers, service conventions, and available test/build scripts.
- [x] (2026-09-10) Added typed playlist routes, models, and service methods for CRUD and learning-object membership.
- [x] (2026-09-10) Added the profile playlist presentation component and integrated accessible URL-backed tabs into the existing profile.
- [x] (2026-09-10) Added focused service/profile tests and completed formatting, lint, focused TypeScript validation, and an Angular build; documented the repository-level Jest transformer blocker.

## Surprises & Discoveries

- Observation: The profile is a standalone component registered directly at `/users/:username`; Contributions are not currently a child route.
  Evidence: `src/app/cube/cube.routing.ts` and `src/app/cube/user-profile/user-profile.component.*`.
- Observation: Profile resolver data contains the backend `_id`, while the reusable `User` entity exposes it as `userId`; the profile currently keeps the resolver result untyped.
  Evidence: `src/app/cube/core/profile.resolver.ts`, `src/app/core/user-module/user.service.ts`, and `src/entity/user/user.ts`.
- Observation: The backend's user-filtered playlist GET already applies authentication-aware visibility, so the client should pass the profile user ID and credentials without duplicating access rules.
- Observation: Focused Jest execution fails during global setup before loading test files because the installed `jest-preset-angular` transformer calls a missing `processWithEsbuild` function. The same new specs compile successfully through a focused TypeScript configuration.
  Evidence: `npx jest --runInBand ...` fails from `src/setup-jest.ts`; `npm ls` reports Jest 29.7.0, jest-preset-angular 14.6.2, and ts-jest 29.4.6.
- Observation: The Angular workspace has no `development` build configuration despite that name being common in newer Angular workspaces.
  Evidence: `npx ng build clark --configuration=development` reports that the configuration is not set; the default `npx ng build clark` succeeds.

## Decision Log

- Decision: Represent the selected profile tab with the optional `tab=playlists` query parameter.
  Rationale: `/users/:username` remains backward-compatible and defaults to Contributions, while playlist views can be directly linked, refreshed, and navigated with browser history without restructuring the existing resolved profile route.
  Date/Author: 2026-09-10 / Codex
- Decision: Use native links with ARIA tab semantics and arrow-key handling rather than adding Angular Material tabs to this standalone component.
  Rationale: Native links preserve direct navigation and keyboard activation while local SCSS can match the existing profile design without introducing another UI dependency.
  Date/Author: 2026-09-10 / Codex
- Decision: Add a domain service and centralized route helper under `src/app/core/playlist-module`.
  Rationale: Components should not construct endpoint strings or call `HttpClient` directly, and all backend playlist routes need one discoverable client contract.
  Date/Author: 2026-09-10 / Codex

## Outcomes & Retrospective

The existing profile URL remains intact and now defaults to a Contributions tab, while `?tab=playlists` provides a refresh-safe and shareable Playlists selection. Tabs use native navigation, ARIA associations and selected state, roving tab stops, visible focus, and arrow/Home/End navigation. The new profile playlist view follows the existing profile card treatment and handles loading, failure, empty, public, and owner-private data responsively.

The new core Playlist API boundary covers every backend playlist route and sends credentials for authentication-aware visibility. Production code compiles in the Angular build, lint introduces no new warnings or errors, and both added specs compile. Executing Jest remains blocked by the repository's preset/transformer mismatch before test discovery; package changes were intentionally left out of this story.

## Context and Orientation

`src/app/cube/user-profile/user-profile.component.*` owns the resolved profile and contribution loading. `src/app/cube/cube.routing.ts` maps `/users/:username` to that component. The new playlist service belongs under `src/app/core/playlist-module`, following other domain API modules. A feature-local `profile-playlists` standalone component will render loading, error, empty, and playlist-summary states beneath the profile tabs.

The request flow will be URL → `UserProfileComponent` → `PlaylistService` → `GET /playlists?userId=<profile-user-id>`. Cookies are included so owners receive private playlists while other visitors receive public playlists only, as enforced by the backend.

## Plan of Work

Create playlist types describing visibility, summaries, hydrated details, create/update inputs, and learning-object card data. Create route builders for `GET/POST /playlists`, `PATCH/DELETE /playlists/:playlistId`, and `PUT/DELETE /playlists/:playlistId/objects/:cuid`. Create an injectable service exposing typed Observable methods with `withCredentials` enabled.

Create a standalone profile-playlists component that presents playlist summaries without assuming a playlist-details page exists. Update the profile component to observe the query parameter, load playlists whenever resolved profile data changes, and clean up subscriptions. Add a tablist whose links update the URL, expose selected state, support Enter through native link behavior, and support left/right arrow navigation. Preserve the existing contribution component and base URL behavior.

Add service tests for route/query/method construction and profile tests for URL selection, resolved-user loading, and keyboard navigation. Validate TypeScript templates and styles through Angular lint/build and attempt focused Jest execution without expanding scope into test-infrastructure package changes.

## Concrete Steps

From the `clark-client` root:

    npx prettier --write <changed files>
    npx ng lint clark
    npx jest --runInBand <focused playlist/profile specs>
    npx ng build clark

## Validation and Acceptance

- `/users/:username` selects Contributions and preserves current profile behavior.
- `/users/:username?tab=playlists` directly selects Playlists after refresh or navigation.
- Tab controls are links with `role=tab`, correct `aria-selected`, panel associations, visible keyboard focus, and left/right arrow navigation.
- The layout remains usable at narrow widths.
- Playlist profile requests send `userId` as a query parameter with credentials.
- Loading, request failure, empty results, public results, and owner-visible private results render safely.
- Every backend playlist route has a centralized frontend route builder and typed service method.

## Idempotence and Recovery

All changes are additive except bounded edits to the profile component and its route-backed UI. Existing `/users/:username` links remain valid. If validation fails, revert only the new profile playlist imports/template section and core playlist module files; no persisted data or migration is involved.

## Artifacts and Notes

- `npx prettier --write <changed files>`: passed.
- `npx ng lint clark`: passed with 0 errors and the repository's existing 259 warnings; no changed-file warning was reported.
- `npx ng build clark`: passed; one pre-existing CommonJS optimization warning was reported for the standard-guidelines service.
- Focused `npx tsc` configuration containing only the two new specs: passed.
- `npx jest --runInBand src/app/core/playlist-module/playlist.service.spec.ts src/app/cube/user-profile/user-profile.component.spec.ts`: blocked in global setup by `TypeError: configSet.processWithEsbuild is not a function`; neither suite was loaded.
- `git diff --check`: passed.

## Interfaces and Dependencies

The implementation uses existing Angular `HttpClient`, Router, RxJS, standalone component support, environment API URL configuration, profile resolver output, and existing SCSS variables. It adds no package or environment dependency and does not change authentication guards or interceptors.
