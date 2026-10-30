# SC-39969: Add learning objects to playlists

This ExecPlan is maintained according to `PLANS.md`.

## Purpose / Big Picture

Authenticated users can add the learning object on its details page to an existing playlist or create a public/private playlist and add it in the same modal. Browse Playlists remains a public-only collection, while private playlists are available through the author's library.

## Progress

- [x] (2026-10-28) Rebased onto the cleaned SC-39968 branch, removed duplicated dashboard/owner ancestry, and preserved the parent branch's newer fixes.
- [x] (2026-10-28) Angular compilation (`ngc --noEmit`), focused ESLint, and diff checks passed. Three focused Jest suites failed during setup with the existing `configSet.processWithEsbuild is not a function` transformer error; no tests executed.
- [x] (2026-10-23 14:15Z) Reviewed the details action panel, playlist API client, shared popup, and button conventions.
- [x] (2026-10-26 14:35Z) Reduced the implementation and plan to ticket-specific behavior and validated the result.
- [x] (2026-10-26 14:48Z) Replaced the redundant Playlist pill with visibility and preserved author-only private playlists.
- [x] (2026-10-26 15:05Z) Ordered Browse Playlists by creation date, newest first.
- [x] (2026-10-26 15:15Z) Labeled playlist detail headers as public or private.
- [x] (2026-10-26 15:20Z) Completed existing-playlist selection, inline creation, validation, success, empty, duplicate, and error states.
- [x] (2026-10-26 15:35Z) Aligned modal types and playlist queries with the merged owner-management service contract.
- [x] (2026-10-28 14:48Z) Temporarily merged public and author playlists in Browse; this behavior was removed on 2026-10-30 after the collection boundary was clarified.
- [x] (2026-10-28 14:49Z) Added focused coverage; lint and the Angular build pass, while Jest remains blocked before discovery by the existing transformer mismatch.
- [x] (2026-10-28 15:00Z) Applied created-date descending ordering to Browse Playlists results.
- [x] (2026-10-30) Removed the public-plus-owner request composition so Browse Playlists uses one public request while retaining created-date descending order.
- [x] (2026-10-30) Preserved Browse versus My Playlists URL context when opening, leaving, or deleting from playlist details; focused lint and the Angular build pass.

## Surprises & Discoveries

- Observation: The gateway must include commit `f065df3` for the playlist-object PUT proxy.
- Observation: Focused Jest fails before discovery because the repository's `jest-preset-angular` transformer versions are incompatible.

## Decision Log

- Decision: Replay feature commits onto SC-39968, retaining its service contract and replacing the remaining `currentUserId` reference with `auth.user?.userId`.
  Rationale: The latest parent deliberately removed that redundant getter. Omit old base-formatting changes and intermediate browse/header changes superseded by the original owner-management merge and final browse implementation.
  Date/Author: 2026-10-28 / Codex

- Decision: Keep state in one standalone modal and API operations in `PlaylistService`.
  Rationale: This keeps the action panel thin and the workflow reusable without adding global state or routes.
  Date/Author: 2026-10-26 / Codex

- Decision: Treat HTTP 409 as successful already-added behavior.
  Rationale: Duplicate additions must not appear as failures or create duplicate entries.
  Date/Author: 2026-10-26 / Codex

- Decision: Keep Browse Playlists public-only and use the user-filtered request only for owner libraries.
  Rationale: This preserves the API's collection boundaries and removes a second request, client-side merging, deduplication, and ownership filtering from Browse.
  Date/Author: 2026-10-30 / Codex

- Decision: Carry an optional owner-library return ID in the playlist-details URL instead of inferring origin from ownership or using browser history.
  Rationale: URL state survives refresh and direct navigation, while ownership cannot distinguish an author's public playlist opened from Browse from the same playlist opened from My Playlists.
  Date/Author: 2026-10-30 / Codex

## Outcomes & Retrospective

The branch now descends directly from the cleaned SC-39968 tip (`f39c9c84c`). Fifteen feature commits were replayed; four obsolete formatting/intermediate commits and inherited dashboard/owner commits were omitted. Existing owner-management fixes remain intact. The rebase compatibility change uses `auth.user?.userId` in browse composition. Angular compilation and focused lint passed; Jest remains blocked at setup by the known transformer mismatch.

The details action opens an accessible picker for the current user's playlists. Users can select, unselect, create, add, cancel, retry failures, and return from creation without premature validation. Browse Playlists uses one public request and sorts it newest first; owner libraries continue to use the user-filtered request and display private playlists. Jest configuration remains out of scope.

## Context and Orientation

`ActionPanelComponent` opens `AddToPlaylistModalComponent`. The modal owns transient UI/form state and calls the typed methods in `src/app/core/playlist-module/playlist.service.ts`. `PlaylistsComponent` uses a `userId` query for an explicit owner library and one unfiltered request for public Browse Playlists. `PlaylistCardComponent` displays visibility and carries optional owner-library return context into playlist details. This work does not change the route table, guards, interceptors, environments, or build configuration.

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
- Public Browse cards show PUBLIC; owner-library cards show PUBLIC or gray PRIVATE, with private playlists available only through the author's library.
- Browse Playlists orders cards by `createdAt` descending, with missing dates last.
- Playlist details identify the loaded playlist as PUBLIC PLAYLIST or PRIVATE PLAYLIST.
- Playlist details return to the collection they were opened from; direct links default to Browse Playlists.
- Build, formatting, lint, and diff checks pass; focused Jest remains blocked by the existing transformer mismatch.

## Idempotence and Recovery

Build and static checks are safe to repeat. A failed add leaves the modal retryable; a playlist created during that attempt is reused instead of recreated.

## Artifacts and Notes

PR #2350 is based on `feature/sc-39968/add-owner-playlist-management-to-the-user`. The branch has been rebased onto that branch's cleaned history. Recovery point: `backup/sc-39969-before-parent-rebase-20261028`. No remote history was changed.

## Interfaces and Dependencies

Uses `AuthService`, `PlaylistService`, `Playlist` types, reactive forms, `clark-popup`, existing global button styles, Font Awesome, `AutofocusDirective`, and `ToastrOvenService`. No package or configuration dependency is added.
