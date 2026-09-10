# SC-39971: Add playlist discovery and profile navigation

This ExecPlan is a living document maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Add a second, responsive and keyboard-accessible tab to `/users/:username` so profile visitors can switch between Contributions and Playlists. Contributions remain the default for existing profile links, while `?tab=playlists` provides a directly navigable playlist view. Add public playlist discovery at `/playlists`, playlist details at `/playlists/:playlistId`, and navigation from both profile cards and the secondary Browse menu. Add a typed frontend Playlist API boundary with centralized builders for every backend playlist route and use it across these views.

## Progress

- [x] (2026-09-10) Inspected profile routing, resolver behavior, profile components, existing tab styling, API route helpers, service conventions, and available test/build scripts.
- [x] (2026-09-10) Added typed playlist routes, models, and service methods for CRUD and learning-object membership.
- [x] (2026-09-10) Added the profile playlist presentation component and integrated accessible URL-backed tabs into the existing profile.
- [x] (2026-09-10) Added focused service/profile tests and completed formatting, lint, focused TypeScript validation, and an Angular build; documented the repository-level Jest transformer blocker.
- [x] (2026-09-10) Inspected the existing Cube routing, Browse card grid, secondary Browse menu, and profile playlist presentation before expanding the feature.
- [x] (2026-09-10) Added public playlist browse and playlist-details routes and responsive views.
- [x] (2026-09-10) Linked profile playlist cards and the secondary Browse menu to the new routes.
- [x] (2026-09-10) Added focused service/view/card coverage and completed formatting, lint, focused TypeScript validation, and an Angular build; confirmed the existing Jest transformer blocker remains.
- [x] (2026-09-10) Replaced static playlist-content summaries with the existing linked learning-object cards, resolving each hydrated CUID/version through `LearningObjectService` while preserving unavailable placeholders.

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
- Decision: Use `/playlists` as the canonical client route and redirect `/playlits` to it.
  Rationale: The requested URL included a misspelling, while the existing feature and backend consistently use `playlists`; the compatibility redirect satisfies direct navigation without preserving the typo in links.
  Date/Author: 2026-09-10 / Codex
- Decision: Use `/playlists/:playlistId` for shareable playlist details.
  Rationale: It gives every profile and browse card a stable native link and cleanly separates the all-public index from hydrated single-playlist rendering.
  Date/Author: 2026-09-10 / Codex
- Decision: Resolve hydrated playlist entries through `LearningObjectService` before rendering the existing learning-object card component.
  Rationale: The playlist API's compact card contract does not contain the author username required by the canonical learning-object detail URL. The established card component receives the full object, supplies the correct link, and keeps playlist rendering consistent with Browse.
  Date/Author: 2026-09-10 / Codex

## Outcomes & Retrospective

The existing profile URL remains intact and now defaults to a Contributions tab, while `?tab=playlists` provides a refresh-safe and shareable Playlists selection. Tabs use native navigation, ARIA associations and selected state, roving tab stops, visible focus, and arrow/Home/End navigation. Profile playlist cards now reuse the public browse card and link to a shareable detail page.

`/playlists` loads the backend's unfiltered public collection and presents it in a responsive card grid matching the Browse page's visual language. `/playlists/:playlistId` renders playlist metadata and hydrated learning-object summaries, including a safe unavailable state for stale CUID references. `/playlits` redirects to the canonical spelling. The secondary Browse menu exposes Browse Playlists in the requested position.

The new core Playlist API boundary covers every backend playlist route and sends credentials for authentication-aware visibility. Production code compiles in the Angular build, lint introduces no new warnings or errors, and both added specs compile. Executing Jest remains blocked by the repository's preset/transformer mismatch before test discovery; package changes were intentionally left out of this story.

## Context and Orientation

`src/app/cube/user-profile/user-profile.component.*` owns the resolved profile and contribution loading. `src/app/cube/cube.routing.ts` maps `/users/:username` to that component. The new playlist service belongs under `src/app/core/playlist-module`, following other domain API modules. A feature-local `profile-playlists` standalone component will render loading, error, empty, and playlist-summary states beneath the profile tabs.

The request flow will be URL → `UserProfileComponent` → `PlaylistService` → `GET /playlists?userId=<profile-user-id>`. Cookies are included so owners receive private playlists while other visitors receive public playlists only, as enforced by the backend.

## Plan of Work

Create playlist types describing visibility, summaries, hydrated details, create/update inputs, and learning-object card data. Create route builders for `GET/POST /playlists`, `PATCH/DELETE /playlists/:playlistId`, and `PUT/DELETE /playlists/:playlistId/objects/:cuid`. Create an injectable service exposing typed Observable methods with `withCredentials` enabled.

Create a reusable playlist card and standalone public browse/details components under a lazy-loaded Cube playlist feature module. Register `/playlists` and `/playlists/:playlistId` in its feature routing module, plus a compatibility redirect from `/playlits` in the parent router. The index calls the existing unfiltered playlist service method so the backend returns all public playlists. The detail view calls the hydrated single-playlist endpoint and safely renders unavailable learning-object references. Link profile playlist cards to details and insert Browse Playlists between the existing Browse Curriculum and Browse Resources menu items.

Keep the existing profile behavior: observe the query parameter, load playlists whenever resolved profile data changes, and clean up subscriptions. Keep the tablist URL-backed and keyboard accessible.

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
- `/playlists` displays all public playlists and each card navigates to `/playlists/:playlistId`.
- `/playlits` redirects to the canonical public playlist page.
- Playlist details render hydrated learning-object cards while stale/unavailable CUIDs do not break the page.
- Profile playlist cards link to the same detail route.
- The secondary Browse menu orders Browse Playlists between Browse Curriculum and Browse Resources.

## Idempotence and Recovery

All changes are additive except bounded edits to the profile component and its route-backed UI. Existing `/users/:username` links remain valid. If validation fails, revert only the new profile playlist imports/template section and core playlist module files; no persisted data or migration is involved.

## Artifacts and Notes

- `npx prettier --write <changed files>`: passed.
- `npx ng lint clark`: passed with 0 errors and the repository's existing 259 warnings; no changed-file warning was reported.
- `npx ng build clark`: passed; one pre-existing CommonJS optimization warning was reported for the standard-guidelines service.
- Focused `npx tsc` configuration containing the playlist service, profile, browse, details, and card specs: passed.
- Focused `npx jest --runInBand ...` across those five specs: blocked in global setup by `TypeError: configSet.processWithEsbuild is not a function`; none of the suites were loaded.
- `git diff --check`: passed.

## Interfaces and Dependencies

The implementation uses existing Angular `HttpClient`, Router, RxJS, standalone component support, environment API URL configuration, profile resolver output, and existing SCSS variables. It adds no package or environment dependency and does not change authentication guards or interceptors.
