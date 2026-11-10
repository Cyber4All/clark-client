# Reuse the playlist dialog from learning-object details

This ExecPlan follows `PLANS.md`.

## Purpose / Big Picture

Users adding a learning object to a playlist should get the same dialog presentation and creation form as My Playlist > Add Playlist, including optional description and spaced action buttons. Preserve adding to existing playlists and create-then-add behavior unless the user requests opening creation directly.

## Progress

- [x] (2026-11-03) Inspected action panel, legacy popup, add-to-playlist modal, shared metadata form, tests, and repository planning guidance.
- [x] (2026-11-03) Reused Material dialog sizing/presentation and shared metadata form in the details-page playlist flow, with private-by-default creation matching My Playlist.
- [x] (2026-11-03) Preserved selection, cancellation, retry without recreating playlists, duplicate handling, and automatic create-then-add behavior; blocked duplicate dialogs and dismissal during requests.
- [x] (2026-11-03) Passed 64 tests across six focused suites, Angular compilation/type checks, and git diff --check.

## Surprises & Discoveries

- A recently merged add-to-playlist component still has a separate required-description form and legacy clark-popup wrapper.
- The working tree was clean before this task. Existing client Jest requires the temporary transformer configuration documented in optional-playlist-description.execplan.md.
- Requested clarification on whether to retain the existing-playlist chooser; default recommendation preserves this existing capability.
- Merged baseline introduced a playlist-details spec without the MatDialog constructor mock. Added the missing mock to permit regression checks.
- Existing add-to-playlist error mocks used RxJS 7 factory syntax against installed RxJS 6. Corrected these to throw actual HttpErrorResponse values, restoring meaningful 409 duplicate coverage.

## Decision Log

- Decision: Reuse the existing feature-local metadata form and Material dialog pattern; keep service API responsibilities in PlaylistService and orchestration in the add-to-playlist component.
  Rationale: Aligns the requested UI while preserving playlist selection and adding the current learning object. Avoids rewriting unrelated details-page dialogs.
  Date/Author: 2026-11-03 / Codex

## Outcomes & Retrospective

Completed. The details action uses MatDialog rather than the legacy popup. Existing playlists remain selectable; Create new playlist renders the same PlaylistMetadataFormComponent as My Playlist, including optional description, shared title/length validation, and spaced Cancel/Create playlist actions. Creation automatically adds the learning object. Cancelling creation returns to the chooser. Pending request state controls dialog dismissal and form availability; subscriptions/dialogs clean up on destruction. No backend or API changes were needed.

## Context and Orientation

`src/app/cube/details/components/action-panel/action-panel.component.*` currently uses clark-popup to host `src/app/cube/playlists/components/add-to-playlist-modal/add-to-playlist-modal.component.*`. That component owns playlist selection and create-then-add requests with duplicate/retry handling. My Playlist uses a MatDialog template and `components/playlist-metadata-form/playlist-metadata-form.component.*` with a shared form factory. The details action panel is OnPush, so asynchronous updates must mark for check.

## Plan of Work

Replace only the playlist legacy wrapper in the action panel with MatDialog. Reuse the metadata form/factory instead of duplicating creation controls. Keep new playlists private by default, matching My Playlist creation. Preserve existing selection and add semantics, show request errors in the shared form, prevent duplicate submissions and closure during saving, and clean up subscriptions/dialogs with component lifetime. Keep download and other popups unchanged.

## Concrete Steps

Run the targeted add-to-playlist, action-panel, creation, details, shared form and playlist service Jest suites using the command-line configuration in `plans/optional-playlist-description.execplan.md`. Run `node node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js --noEmit -p src/tsconfig.app.json` and `git diff --check`.

## Validation and Acceptance

Verify that existing playlists remain selectable, already-added objects remain disabled, creation uses the shared form with optional description, title and length validation matches My Playlist, Cancel returns without creating, and create-then-add succeeds. Failure must permit retry without duplicate playlist creation, and pending requests must block duplicate submits/closing. Confirm authorization controls still restrict the details button to signed-in users with released objects. No routes/guards/interceptors/API contracts/state ownership/environment/build changes are planned.

## Idempotence and Recovery

Checks are repeatable and no data migration is needed. Preserve the merged baseline and previous commits; revert only this task's edits if required.

## Artifacts and Notes

Validation: six focused suites passed (64 tests): action-panel, add-to-playlist-modal, playlists, playlist-details, playlist-metadata-form, and playlist service. Used the temporary Jest configuration documented in `plans/optional-playlist-description.execplan.md`; repository test configuration remains unchanged.

`node node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js --noEmit -p src/tsconfig.app.json` and `git diff --check` passed. No browser/manual validation was performed. The shared creation template and Cancel/submit interactions are exercised by Angular component tests.

## Interfaces and Dependencies

Reuse MatDialog, PlaylistMetadataFormComponent, createPlaylistMetadataForm and existing PlaylistService create/add methods. Existing added/closed output events remain; introduce a pending-state output only if required to protect dialog closure during requests.
