# SC-39968: Add owner playlist management

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Extend the existing public playlist dashboard and detail page with owner management. Owners can edit playlist metadata and visibility, delete playlists, remove learning objects, and search released learning objects to add. Non-owners retain the existing public read-only dashboard and detail experience. The account menu also provides “My Playlist”, filtered by the authenticated owner's `userId` query parameter.

## Progress

- [x] (2026-10-23) Added a required description text box to playlist creation and restored the original required-description client type. Reverted the optional-description DTO, API tests, and service plan so clark-service has no changes from this task.
- [x] (2026-10-23) Added an owner-only Add playlist button at the right of the My Playlists header. The reactive dialog prompts for a title and required description, creates a private playlist, and opens its details. Owner gating, invalid titles, duplicate submissions, success, and failure are covered. Angular build and all 18 focused client tests passed with the temporary Jest configuration. Optional-description backend changes were reverted at the user's request; descriptions remain required by the existing API.
- [x] (2026-10-23) Search loading now keeps a centered spinner visible for at least 333ms before publishing results, then candidate cards fade and rise into place over 220ms. Reduced-motion preferences disable the card animation. Angular build passed; focused tests include the minimum spinner duration.
- [x] (2026-10-23 03:26Z) Search now loads four candidates per page, advances automatically after adding the last visible candidate, and skips pages containing only existing members. Angular build and all nine focused component tests passed with temporary Jest configuration; whitespace and formatting checks passed.
- [x] (2026-10-23) Moved owner Delete playlist to the right edge of the title row, with wrapping allowed on narrow screens.
- [x] (2026-10-23) Replaced visibility selection with the existing Angular Material slide toggle. On means Public; off means Private. It updates immediately, disables while saving, and restores the previous value on failure.
- [x] (2026-10-23 03:05Z) Applied shared action-card hover/focus behavior to owner playlist contents as well as search candidates, keeping badges unshifted on read-only cards. Preserved the current 200ms badge slide and 50ms button fade. Angular build, formatting, and whitespace checks passed; browser checks remain unverified.
- [x] (2026-10-23) Added the existing TipDirective to Add, Remove, and Edit controls for hover/focus tooltips; the edit tooltip changes to “Finish editing playlist” while active. Native title attributes were removed to avoid duplicate tooltips.
- [x] (2026-10-23) Reduced playlist search pages to three results, using one page-size constant for the request and Load more calculation.
- [x] (2026-10-23 02:49Z) Refined badge positioning to animate its right offset on search-card hover/focus over one second, keeping the badge near the right edge and revealing Add immediately on hover/focus. Angular build, style formatting, and whitespace checks passed. Browser animation checks remain unverified.
- [x] (2026-10-23 02:45Z) Added hover/focus visibility for Add, retaining it on touch and while adding. Playlist card image badges reserve room for action buttons through scoped CSS custom properties. Angular build, Prettier style checks, and whitespace checks passed; browser checks remain unavailable.
- [x] (2026-10-23 02:42Z) Added a wrapping search-candidate grid and shared circular Add/Remove icon styling. Add uses a plus icon, switches to a spinner while pending, and disables other Add controls during the request. Angular build and whitespace checks passed.
- [ ] Visually verify candidate wrapping, keyboard focus, add success, and failure recovery in a browser. The installed playwright-interactive skill requires `js_repl`, which is absent from this session's tool list; browser validation was not run.
- [x] (2026-10-23) Changed metadata editing to one pencil that makes the existing title and description editable in place without changing their layout. Each field saves on blur only when changed; labels and Save/Cancel controls are removed. Visibility now updates immediately on selection, preserves unsaved metadata, and restores its previous value on failure.
- [x] (2026-10-22) Inspected the backend contract and gateway proxy behavior for playlist CRUD and object membership.
- [x] (2026-10-23) Rebased the five commits from `feature/sc-40132/create-browse-playlists-dashboard` onto current `main` and fast-forwarded SC-39968 to that dashboard history. The dashboard worktree branch remains unchanged.
- [x] (2026-10-23 00:13Z) Extended the existing detail component and playlist service with owner metadata, visibility, delete, search/add, and remove operations.
- [x] (2026-10-23 00:13Z) Added desktop/mobile “My Playlist” links with `userId` query parameters and user-filtered dashboard requests.
- [x] (2026-10-23 00:13Z) Built the Angular client and checked formatting/diff whitespace.
- [ ] Validate end-to-end API behavior after backend and gateway deployment.

## Surprises & Discoveries

- Observation: Default Jest configuration mixes ts-jest and jest-preset-angular transformers, and ES5 test output depends on tslib helpers absent from the root installation. A temporary Jest configuration with one Angular transformer, source module paths, explicit RxJS mappings, and an ES2020 test target allowed all nine component tests to pass without changing repository-wide configuration.
  Evidence: Default run failed with `configSet.processWithEsbuild is not a function`; temporary test command passed.
- Observation: `clark-service` main now contains and registers the playlist API handlers.
  Evidence: `src/config/express/express.config.ts` mounts `PlaylistRouteHandler`; it implements list/detail, create, update, delete, and playlist object membership operations.
- Observation: The dashboard branch already has the public `/playlists` browse page, `/playlists/:playlistId` detail page, playlist cards, and a read-only playlist service.
  Evidence: `src/app/cube/playlists/` and `src/app/core/playlist-module/` on `feature/sc-40132/create-browse-playlists-dashboard`.
- Observation: The scaffold's `AddChildComponent` is tied to author-owned objects and hierarchy length rules, while the requested playlist feature needs global released-object search.
  Evidence: `src/app/onion/learning-object-builder/components/scaffold/add-child/add-child.component.ts` uses `getUsersLearningObjects` and filters candidate lengths.
- Observation: The initial gateway proxy route list included CRUD but not object membership operations; authenticated `PUT` and `DELETE` membership routes have now been added in the gateway checkout.
  Evidence: `CLARK-Gateway/src/modules/clark/playlist-module/playlist.routes.ts` now declares both routes with `auth: true`.
- Observation: The backend requires a `userId` query parameter to return the current owner's complete playlist library, including private playlists.
  Evidence: `PlaylistComponent.getPlaylist` applies public-only visibility when no `userId` is requested; it permits all visibility when the requester owns the requested user profile.

## Decision Log

- Decision: Add optional CSS custom properties for image-badge placement in the shared learning-object card and set them only on playlist card lists. Search-result badges keep their normal right position until hover/focus, then shift 54px left over one second while Add fades in immediately over 50ms; touch devices reserve that space immediately. Honor reduced-motion preferences. Reveal Add through hover and focus-within on devices with a fine pointer; leave it visible on touch devices and while its request is pending.
  Rationale: This prevents badge/action overlap without changing badge positions in other consumers or requiring deep styling overrides.
  Date/Author: 2026-10-23 / Codex
- Decision: Extend the dashboard branch's existing playlist browse and detail components instead of adding a separate playlist UI.
  Rationale: The existing dashboard already owns the public playlist routes and visual patterns; owner behavior belongs in its selected-playlist detail page.
  Date/Author: 2026-10-22 / Codex
- Decision: Build a playlist-specific candidate search list modeled on the scaffold add-child interaction and use `SearchService.getLearningObjects` with released status.
  Rationale: The interaction is familiar, but the scaffold component includes author and hierarchy restrictions that do not apply to playlists.
  Date/Author: 2026-10-22 / Codex
- Decision: Treat visibility editing as in scope, per the story acceptance criteria.
  Rationale: The story explicitly requires switching between public and private; the user has not asked to remove that requirement.
  Date/Author: 2026-10-22 / Codex
- Decision: Keep the public browse route and add a user-filtered query for the signed-in owner's playlist list.
  Rationale: This preserves the existing public dashboard while letting “My Playlist” display the current user's playlists, including private playlists when the backend recognizes the owner.
  Date/Author: 2026-10-22 / Codex

## Outcomes & Retrospective

The public browse dashboard and detail page were brought onto the SC-39968 branch from SC-40132 by replaying its commits on current `main`. Owner controls now extend the existing detail page and use the existing dashboard cards. “My Playlist” filters the public dashboard by the current user's query parameter; owner-authenticated API requests can include private playlists. The original `playlist_dashboard` worktree remains unchanged. The backend routes exist on `clark-service` main and the gateway checkout has the authenticated membership proxy routes; runtime behavior still depends on deployment.

## Context and Orientation

`src/app/cube/playlists/playlists.component.ts` owns the existing public browse grid; `playlist-details/playlist-details.component.ts` owns the selected playlist. `src/app/core/playlist-module/playlist.service.ts` is the read-only API boundary and will be extended with owner mutations. The existing dashboard uses a lazy-loaded `PlaylistsModule`, standalone page components, and reusable playlist and learning-object cards. `clark-service` main registers CRUD and object membership handlers; the gateway feature checkout declares CRUD and authenticated membership proxy routes. The “My Playlist” account link will pass `userId` and the browse page will use that query filter.

The request flow will be route → playlist page component → playlist domain service → playlist API, while candidate search uses the existing search service → public learning-object search API. Route access remains public so public playlists can be viewed; API authorization and server-derived identity remain authoritative. The UI derives whether to display controls from the current user and playlist owner metadata returned by the API.

## Plan of Work

On the current user's filtered playlist library, add a right-aligned Add playlist action and a local title-and-description creation dialog. Reuse PlaylistService.createPlaylist; require a nonblank title and description and default visibility to private. Optional descriptions are deferred to another ticket; this client change uses the existing backend contract. Navigate to the returned playlist's details on success; preserve the form with a recoverable error on failure and prevent duplicate submits. This extends the existing page without changing routing definitions, guards, types, service contracts, environment configuration, or shared UI contracts.

For the search-result UI refinement, keep using the existing learning-object card component. Share the circular overlay button's position, size, border, shadow, and focus rules between Add and Remove, with blue Add and red Remove variants. Use an auto-filling grid with 250px minimum card widths (capped at the container width) and 24px gaps. Disable all Add controls while one request runs and show a spinner on that object's button. This is local to the detail template and styles; API calls and state ownership remain unchanged.

Extend the existing typed playlist service and route helper with create, update, delete, add, remove, and user-filtered list operations. Add owner-only management controls to the existing details page while preserving the public dashboard's current cards, layout, and missing-object behavior. Reuse the existing learning-object listing component and `SearchService` with released status. Add the “My Playlist” account-menu link with `userId` in its query. Backend and gateway API routes are in place in the inspected checkouts; end-to-end behavior requires deployment.

Add the account-menu link to desktop and mobile navigation. Keep existing dashboard visual patterns. The search flow is playlist-specific while reusing `SearchService` and the established scaffold candidate-list interaction; do not modify the shared Browse component or scaffold component.

## Concrete Steps

From the repository root:

1. Extend playlist API types, route helper, and service using the backend DTO contract.
2. Add owner management and released-object search controls to the existing playlist details page.
3. Add the user-filtered “My Playlist” navigation link and make the existing browse page honor its query parameter.
4. Build and review the changed files.

Expect: public visitors retain public browse/detail access; authenticated owners see rename, description, visibility, delete, search/add, and remove controls for their own playlists; “My Playlist” passes `userId` and filters the dashboard result set. API behavior depends on the backend and gateway changes being deployed.

## Validation and Acceptance

- Confirm `/playlists?userId=<id>` displays only that user's playlists, including private playlists for the authenticated owner, while the unfiltered route remains the public browse dashboard.
- Confirm `/playlists/:playlistId` shows public playlist contents to visitors and private contents only to the owner, subject to API authorization.
- Confirm owner controls cover rename, description, visibility, deletion confirmation, add released object, and remove object without deleting the object itself.
- Confirm empty, loading, API failure, stale learning-object, duplicate-add, and unauthorized states are visible and recoverable.
- Inspect desktop and mobile account navigation and responsive layouts.
- Focused component coverage now includes automatic candidate paging, skipping excluded pages, stopping at the final page, and preserving additions when subsequent search fails. Existing component constructor mocks were updated for the current dependencies.
- Validation run: `./node_modules/.bin/ng build clark` passed on 2026-10-23; `git diff --check` passed. Tests were not run.

## Idempotence and Recovery

Keep the dashboard's existing public read behavior intact. Keep owner mutations behind the playlist service and report recoverable errors. The dashboard source branch remains available in its original worktree; its commits were replayed onto current `main` for this feature branch.

## Artifacts and Notes

- Pagination validation: `./node_modules/.bin/jest --config /tmp/clark-playlist-pagination-jest.cjs --runInBand --no-cache --runTestsByPath src/app/cube/playlists/playlist-details/playlist-details.component.spec.ts` passed 9/9 tests. The temporary config loads the repository Jest settings but replaces transforms with `jest-preset-angular`, adds `<rootDir>/src` to module paths, maps RxJS to its root CommonJS entry points, and uses `/tmp/clark-playlist-pagination-tsconfig.json` extending tsconfig.spec.json with target ES2020. These temporary files are local validation artifacts, not repository changes.
- Shortcut story: `sc-39968`, “Add owner playlist management to the user experience”.
- Related user-requested capability: search for released learning objects from a playlist and add a result using an interaction modeled on scaffold's add-child candidate list.

## Interfaces and Dependencies

- Routes: `/playlists` and `/playlists/:playlistId` in `src/app/cube/cube.routing.ts`.
- Navigation: `src/app/components/primary-navbar/primary-navbar.component.html`.
- Search: `src/app/core/learning-object-module/search/search.service.ts` and the existing `Query` / `LearningObject` types.
- Playlist API: `clark-service` main has playlist handlers for CRUD and `PUT`/`DELETE /playlists/:playlistId/objects/:cuid`; the checked-out gateway branch now proxies those authenticated membership operations. End-to-end behavior needs both services deployed.
- Playlist library navigation: “My Playlist” passes the signed-in `userId` as a query parameter; the library uses it to load only playlists belonging to that user.
- No interceptor, environment, build, or shared public component contract changes are planned.
