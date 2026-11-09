# Modernize the `/playlists` Page

## Purpose / Big Picture

Modernize the public `/playlists` route and `/playlists/:playlistId` detail route into a restrained, typography-first SaaS-style interface. The playlist grid will use responsive three/two/one-column behavior, equal-height white cards, subtle borders, and bottom-aligned metadata without image or gradient decoration. The detail route will use a neutral text header while retaining its learning-object cards and content behavior. The shared primary navbar will hide its desktop search field only while the current route is exactly `/playlists`; search behavior on every other route, including playlist details and mobile search, remains intact. Playlist owner names will be resolved through the existing `UserService.getUser()`/`USER_ROUTES.GET_USER()` flow.

The work is local to the playlists feature plus the shared primary navbar's route-aware presentation state. It does not change playlist routing, guards, HTTP requests, API URLs, backend behavior, or environment/build configuration.

## Progress

- [x] (2026-09-22) Read `PLANS.md`, the pasted request, and the repository instructions.
- [x] (2026-09-22) Inspected playlist components, types, service, routing, tests, navbar, and style variables.
- [x] (2026-09-22) Confirmed the current playlist type exposes `userId` but no typed author object; no author field was found in the playlist feature.
- [x] (2026-09-22) Created route-aware navbar search visibility behavior.
- [x] (2026-09-22) Redesigned the playlists page and playlist cards.
- [x] (2026-09-22) Preserved existing focused tests; no API behavior tests required changes.
- [x] (2026-09-22) Formatted files, ran focused Jest, and completed an Angular build validation.
- [x] (2026-09-22) Resolve playlist owner names through `UserService.getUser()` and verify the updated page build/flow.
- [x] (2026-09-22) Restyled the playlist detail header without changing the learning-object card rendering.

## Surprises & Discoveries

- The playlists page and card already contain some accessibility and loading/error handling, but the card still renders a large gradient/image section and the page still has legacy five-column breakpoints.
- `Playlist` currently contains `userId`, `name`, `description`, visibility, and learning-object IDs, but no `author`, `displayName`, or avatar property. The requested author display cannot be implemented from a typed existing author property without changing the API contract or inventing data.
- The primary navbar is standalone and owns its own route subscription for SSO redirect capture, so route-aware search visibility can be added there without changing the app shell or route configuration.
- The detail page's blue playlist block is isolated in `playlist-details.component.html`/`.scss`; learning-object cards are rendered by existing shared components and can remain unchanged.
- The repository uses Angular 18 with mixed standalone/NgModule patterns and Jest-focused tests, while `angular.json` still contains some Karma-era configuration; validation must stay explicit about that drift.

## Decision Log

- Decision: Keep playlist routing, service calls, and the existing `Playlist` data contract unchanged.
  Rationale: The request is visual and explicitly forbids API/backend changes unless required. The current service already returns the collection needed for the page.
  Date/Author: 2026-09-22 / Codex

- Decision: Implement navbar search visibility in `PrimaryNavbarComponent` from Angular router navigation state.
  Rationale: The requirement is route-specific and the shared navbar already has router access. This avoids hardcoded page coupling or global CSS that would affect other routes.
  Date/Author: 2026-09-22 / Codex

- Decision: Do not invent an author name or add a new API call. Preserve the available `userId` only as a fallback label if metadata needs an author slot; prefer a neutral unavailable state over misleading identity data.
  Rationale: The current frontend model has no author display field, and the request forbids duplicating or inventing author data.
  Date/Author: 2026-09-22 / Codex

- Decision: Resolve owner display names in `PlaylistsComponent` using the existing `UserService.getUser(userId)` method and pass the result to `PlaylistCardComponent`.
  Rationale: `UserService` already owns the `GET_USER` route and maps responses to the `User` entity. Keeping this orchestration in the page avoids one HTTP request per card component instance and preserves the service boundary.
  Date/Author: 2026-09-22 / Codex

## Outcomes & Retrospective

The list and detail pages now use the requested neutral, responsive treatment. Playlist owner names are fetched through the existing user service and passed into cards, with `userId` fallback when a lookup fails. The detail route no longer has a blue playlist card/header block; its existing learning-object cards and loading/error behavior remain intact. Jest is currently blocked before test execution by the repository's existing `jest-preset-angular`/TypeScript transformer mismatch (`processWithEsbuild is not a function`). The Angular build succeeds. No backend contract or playlist API request behavior was changed.

## Context and Orientation

The lazy-loaded playlist feature is under `src/app/cube/playlists`. `PlaylistsComponent` loads public playlists through `src/app/core/playlist-module/playlist.service.ts`, renders the header/status states, and delegates each item to `components/playlist-card/PlaylistCardComponent`. The card links to `/playlists/:playlistId` and currently contains a gradient/icon image area. The data shape is `src/app/core/playlist-module/playlist.types.ts`.

The global shell renders `PrimaryNavbarComponent` from `src/app/clark.component.html`. Its desktop template always renders `<clark-search>` inside `.search-bar`; its mobile template uses a separate search toggle. The navbar already injects `Router`, so route-aware desktop visibility can remain encapsulated in that component.

No guards, interceptors, shared design-system component APIs, service/API boundaries, state ownership, entities, environments, or build behavior need to change for this visual work. The intentional technical debt left in place is the existing mixed Angular architecture, legacy navbar styling, and missing typed playlist author data.

## Plan of Work

1. Add a small route-derived boolean to the primary navbar and conditionally render only the desktop search field on the exact `/playlists` route. Keep the skip link and mobile search behavior coherent and preserve all other navbar content.
2. Update the playlists page spacing, max-width, header alignment, background/status treatments, and grid breakpoints to match the requested responsive layout.
3. Replace the playlist card image section with a flex column card containing the label, title, clamped description, divider/spacing, and bottom metadata row. Use the existing object count and accessible router link.
4. Add or adjust focused tests for route-specific navbar rendering and card metadata/layout text where the current test setup supports it.
5. Format changed files and run the nearest Jest tests plus a build/lint check as practical. Verify the route behavior manually if template rendering coverage is insufficient.

## Concrete Steps

- Edit `src/app/components/primary-navbar/primary-navbar.component.ts` and `.html` for route-aware desktop search visibility. Avoid changing the mobile search toggle or unrelated navigation items.
- Edit `src/app/cube/playlists/playlists.component.scss` for centered page layout, header whitespace, responsive 3/2/1 grid, and neutral status styling. Preserve existing loading/error/empty semantics.
- Edit `src/app/cube/playlists/components/playlist-card/playlist-card.component.html` and `.scss` to remove image/gradient/icon markup and implement the requested card hierarchy, focus state, hover transition, clamped text, and metadata row.
- Edit `src/app/cube/playlists/playlist-details/playlist-details.component.html` and `.scss` to remove the blue playlist header block and apply the same neutral spacing, typography, borders, and responsive layout while leaving the learning-object card section in place.
- Resolve each unique playlist `userId` through `UserService.getUser()` and keep the page usable if an individual lookup returns no user.
- Update focused playlist specs to verify owner lookup and preserve existing behavior tests.

## Validation and Acceptance

Acceptance checks:

- `/playlists` shows no desktop search field while `/playlists/<id>` and unrelated routes retain it; mobile search remains available through its existing toggle.
- The page header retains “DISCOVER”, “Browse Playlists”, the existing description, and the playlist count, with count aligned to the right on wide screens.
- The grid renders three columns on desktop, two on tablet, and one on mobile with consistent gaps.
- Cards have no image/header region or gradient, use neutral white surfaces with subtle borders, equal-height flex layout, bottom metadata, graceful title/description clamping, keyboard-visible focus, and 150–200ms hover motion.
- Learning-object counts are singular/plural correct and no longer a large standalone blue link.
- Existing loading, error, empty, and playlist-detail navigation behavior remains unchanged.
- `/playlists/:playlistId` has no blue playlist image/card area, while learning-object cards remain visible below the playlist header.

Tests/validation:

- Run the focused playlist card, playlists page, and primary navbar Jest specs.
- Run Prettier on changed files and inspect the diff for unrelated churn.
- Run the repository lint or Angular build if available; report any existing tooling drift or unrelated failure.
- Manually inspect `/playlists`, `/playlists/:playlistId`, an unrelated searchable route, and mobile viewport behavior if browser execution is available.

Validation result (2026-09-22): `npx ng build clark` passes. Focused Jest still fails before executing tests with `configSet.processWithEsbuild is not a function`, an existing `jest-preset-angular`/TypeScript tooling mismatch.

## Idempotence and Recovery

The changes are additive/replace-in-place and can be reapplied safely. If validation fails, revert only the files listed in the implementation steps or use the working-tree diff to restore the last focused change; do not alter generated build files or backend code. The route/service contract remains unchanged, so recovery does not require data migration.

## Artifacts and Notes

- ExecPlan: `plans/modernize-playlists-page.execplan.md`
- Main UI files: `src/app/cube/playlists/playlists.component.scss`, `src/app/cube/playlists/components/playlist-card/playlist-card.component.html`, `src/app/cube/playlists/components/playlist-card/playlist-card.component.scss`, and `src/app/cube/playlists/playlist-details/playlist-details.component.scss`
- Shared navigation files: `src/app/components/primary-navbar/primary-navbar.component.ts` and `.html`
- Playlist model limitation: `src/app/core/playlist-module/playlist.types.ts` has `userId` only; no author display field is currently defined or referenced by the playlist API client.

## Interfaces and Dependencies

- `PlaylistService.getPlaylists(): Observable<Playlist[]>` remains the source of page data.
- `PlaylistCardComponent` continues to accept `Playlist` and `showVisibility`, and its router link remains `/playlists/:id`.
- `PrimaryNavbarComponent` continues to depend on `Router`, auth, user, notification, and dropdown services; only its presentation state gains route-specific search visibility.
- Existing Sass variables in `_vars.scss` should be reused for CLARK blue, neutral colors, borders, and typography. No new icon library, image asset, or external dependency is needed.
