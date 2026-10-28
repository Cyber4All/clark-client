# SC-39969: Add learning objects to playlists

This ExecPlan is maintained according to `PLANS.md`.

## Purpose / Big Picture

Authenticated users can add the learning object on its details page to an existing playlist or create a public/private playlist and add it in the same modal. Browse Playlists includes public playlists plus the signed-in author's private playlists, while private playlists remain hidden from everyone else.

## Progress

- [x] (2026-10-23 14:15Z) Reviewed the details action panel, playlist API client, shared popup, and button conventions.
- [x] (2026-10-26 14:35Z) Reduced the implementation and plan to ticket-specific behavior and validated the result.
- [x] (2026-10-26 14:48Z) Replaced the redundant Playlist pill with visibility and preserved author-only private playlists.
- [x] (2026-10-26 15:05Z) Ordered Browse Playlists by creation date, newest first.
- [x] (2026-10-26 15:15Z) Labeled playlist detail headers as public or private.
- [x] (2026-10-26 15:20Z) Completed existing-playlist selection, inline creation, validation, success, empty, duplicate, and error states.
- [x] (2026-10-26 15:35Z) Aligned modal types and playlist queries with the merged owner-management service contract.
- [x] (2026-10-28 14:48Z) Merged public playlists with the signed-in author's playlists on Browse Playlists without exposing another author's private playlists.
- [x] (2026-10-28 14:49Z) Added focused coverage; lint and the Angular build pass, while Jest remains blocked before discovery by the existing transformer mismatch.
- [x] (2026-10-28 15:00Z) Applied created-date descending ordering to both authenticated and public-only Browse Playlists results.

## Surprises & Discoveries

- Observation: The gateway must include commit `f065df3` for the playlist-object PUT proxy.
- Observation: Focused Jest fails before discovery because the repository's `jest-preset-angular` transformer versions are incompatible.

## Decision Log

- Decision: Keep state in one standalone modal and API operations in `PlaylistService`.
  Rationale: This keeps the action panel thin and the workflow reusable without adding global state or routes.
  Date/Author: 2026-10-26 / Codex

- Decision: Treat HTTP 409 as successful already-added behavior.
  Rationale: Duplicate additions must not appear as failures or create duplicate entries.
  Date/Author: 2026-10-26 / Codex

- Decision: Compose public and current-user playlist requests in `PlaylistService` for Browse Playlists.
  Rationale: The existing API contracts separate public browsing from owner playlists; central service composition is reusable and lets the client explicitly exclude private playlists not owned by the signed-in user.
  Date/Author: 2026-10-28 / Codex

## Outcomes & Retrospective

The details action opens an accessible picker for the current user's playlists. Users can select, unselect, create, add, cancel, retry failures, and return from creation without premature validation. Public browse and owner-library cards identify visibility. `PlaylistService` now composes and deduplicates the public and current-user collections so signed-in authors see their own private playlists in Browse Playlists while private records belonging to other users are filtered out. The Angular build and focused lint pass; Jest configuration remains out of scope.

## Context and Orientation

`ActionPanelComponent` opens `AddToPlaylistModalComponent`. The modal owns transient UI/form state and calls the typed methods in `src/app/core/playlist-module/playlist.service.ts`. `PlaylistsComponent` uses a `userId` query for an explicit owner library and a service-composed public-plus-current-user collection for Browse Playlists; `PlaylistCardComponent` displays visibility. This work does not change routing, guards, interceptors, environments, or build configuration.

## Plan of Work

Place the action below downloads and above editorial controls, use the shared popup and button styles, load the authenticated user's playlists, and support either an existing-playlist PUT or a create-then-add POST/PUT flow.

## Concrete Steps

From the repository root:

    node_modules/.bin/prettier --check <touched files>
    node_modules/.bin/eslint <touched Angular files>
    node_modules/.bin/jest src/app/cube/playlists/components/add-to-playlist-modal/add-to-playlist-modal.component.spec.ts --runInBand
    npm run build

## Validation and Acceptance

- The authenticated-user action appears in the requested details-page position.
- Current-user playlists show name and object count and can be selected or unselected.
- Existing and newly created playlists receive the current CUID.
- Creation requires nonblank name/description and public/private visibility.
- Loading, empty, validation, success, duplicate, and API-error behavior is covered.
- Cancel, close, and back navigation do not trigger validation.
- Public-browse and owner-library cards show PUBLIC or gray PRIVATE; private playlists appear in Browse Playlists and the owner library only for their signed-in author.
- Browse Playlists orders cards by `createdAt` descending, with missing dates last.
- Playlist details identify the loaded playlist as PUBLIC PLAYLIST or PRIVATE PLAYLIST.
- Build, formatting, lint, and diff checks pass; focused Jest remains blocked by the existing transformer mismatch.

## Idempotence and Recovery

Build and static checks are safe to repeat. A failed add leaves the modal retryable; a playlist created during that attempt is reused instead of recreated.

## Artifacts and Notes

PR #2350 is based on `feature/sc-39968/add-owner-playlist-management-to-the-user`; no rebase is required.

## Interfaces and Dependencies

Uses `AuthService`, `PlaylistService`, `Playlist` types, reactive forms, `clark-popup`, existing global button styles, Font Awesome, `AutofocusDirective`, and `ToastrOvenService`. No package or configuration dependency is added.
