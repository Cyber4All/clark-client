# SC-39969: Add learning objects to playlists

This ExecPlan is maintained according to `PLANS.md`.

## Purpose / Big Picture

Authenticated users can add a learning object from its details page to an existing playlist or create a public/private playlist and add it in the same modal. Browse remains public-only; private playlists remain in the author's library.

## Progress

- [x] (2026-10-23) Reviewed the details action panel, playlist API, shared popup, and button conventions.
- [x] (2026-10-26) Implemented existing-playlist selection, inline creation, validation, cancellation, success, duplicate, empty, and error states.
- [x] (2026-10-28) Aligned with the owner-management service contract, added visibility labels, and ordered Browse newest first.
- [x] (2026-10-30) Kept Browse public-only with one request and preserved Browse/My Playlists return URL state.
- [x] (2026-10-30) Formatting, focused lint, Angular build, and diff checks pass; focused Jest remains blocked before discovery by the existing transformer mismatch.

## Surprises & Discoveries

- The gateway requires commit `f065df3` for the playlist-object PUT proxy.
- Focused Jest fails during setup with `configSet.processWithEsbuild is not a function`; no tests execute.

## Decision Log

- Decision: Keep modal state local and API/domain operations in `PlaylistService`.
  Rationale: The action panel stays thin and the workflow remains reusable without global state.
  Date/Author: 2026-10-26 / Codex
- Decision: Treat HTTP 409 as successful already-added behavior.
  Rationale: Duplicate additions should not appear as failures or create duplicate entries.
  Date/Author: 2026-10-26 / Codex
- Decision: Keep Browse public-only and owner libraries user-filtered.
  Rationale: One public request avoids client-side merging, deduplication, and ownership filtering.
  Date/Author: 2026-10-30 / Codex
- Decision: Carry optional owner-library return context in the details URL.
  Rationale: URL state survives refresh and distinguishes origin without relying on ownership or browser history.
  Date/Author: 2026-10-30 / Codex

## Outcomes & Retrospective

The details action opens an accessible playlist picker. Users can select or unselect an existing playlist, create a playlist and add the object in one retry-safe flow, and recover from API failures. Browse uses one public request sorted newest first; owner libraries retain private playlists. Playlist details return to the originating collection and direct links default to Browse.

## Context and Orientation

`ActionPanelComponent` opens `AddToPlaylistModalComponent`. The modal owns transient form/selection state and calls `PlaylistService`. `PlaylistsComponent` loads public Browse or a `userId` owner library. `PlaylistCardComponent` carries optional return context into playlist details. No route-table, guard, interceptor, environment, or build configuration changes are required.

## Plan of Work

Reuse the shared popup/button patterns, load the authenticated user's playlists, support existing-playlist PUT and create-then-add POST/PUT flows, keep Browse public-only, and retain collection origin in the details URL.

## Concrete Steps

    npx prettier --check <touched files>
    npx eslint <touched Angular files>
    npx jest --runInBand <focused playlist specs>
    npm run build

## Validation and Acceptance

- The authenticated action appears below downloads and above editorial controls.
- Existing and newly created playlists receive the current CUID.
- Creation validates nonblank name/description and public/private visibility.
- Selection, cancellation, loading, empty, success, duplicate, and API-error states are covered.
- Browse is public-only and ordered by `createdAt` descending; owner libraries retain private playlists.
- Cards show PUBLIC or gray PRIVATE, and details return to their originating collection.
- Formatting, lint, build, and diff checks pass; Jest remains blocked by existing configuration drift.

## Idempotence and Recovery

Validation commands are safe to repeat. Failed adds remain retryable, and a playlist created during that attempt is reused instead of recreated.

## Artifacts and Notes

PR #2350 is based on `feature/sc-39968/add-owner-playlist-management-to-the-user` until that dependency merges.

## Interfaces and Dependencies

Uses `AuthService`, `PlaylistService`, playlist types, reactive forms, `clark-popup`, existing button/icon/toaster patterns, and `AutofocusDirective`. No package or configuration dependency is added.
