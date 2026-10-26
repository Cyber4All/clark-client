# SC-39969: Add the learning-object details playlist action

## Purpose / Big Picture

Add an “Add to Playlist” action to the learning-object details action panel. It must sit below the existing download controls and above editorial actions such as “Create a Revision,” open a playlist picker containing the signed-in user's available playlists, and save the learning object to the selected playlist through the established playlist API contract. The UI reuses CLARK's popup, button, notification, and activation conventions.

## Progress

- [x] (2026-10-23 14:15Z) Reviewed repository guidance, Angular version, the details action panel, editorial actions, playlist service, and shared button conventions.
- [x] (2026-10-23 14:28Z) Added the accessible playlist action and reusable output event in the requested action-stack position.
- [x] (2026-10-23 14:32Z) Confirmed Prettier compliance, a clean `git diff --check`, and a successful Angular build.
- [x] (2026-10-23 14:43Z) Refined the action icon to the supplied list-plus reference.
- [x] (2026-10-23 14:48Z) Matched the playlist action's bottom spacing to the existing 15px vertical button rhythm.
- [x] (2026-10-23 15:05Z) Restored the established user-filter and add-object playlist service operations.
- [x] (2026-10-23 15:12Z) Added and wired the reusable playlist-picker modal.
- [x] (2026-10-23 15:18Z) Added focused service and modal coverage; Jest is blocked before discovery by the existing transformer mismatch.
- [x] (2026-10-23 15:25Z) Confirmed Prettier compliance and a successful Angular build.
- [x] (2026-10-23 15:30Z) Ran repository lint successfully with 260 pre-existing warnings and no errors.
- [x] (2026-10-23 15:45Z) Positioned the playlist icon independently so the action label remains optically centered.
- [x] (2026-10-23 15:49Z) Shifted the playlist icon 5px farther left for additional breathing room.
- [x] (2026-10-23 15:58Z) Marked the modal for change detection after asynchronous playlist loading so results render without search-field interaction.
- [x] (2026-10-23 16:05Z) Removed modal search and now render the signed-in user's available playlists directly.
- [x] (2026-10-26 14:20Z) Made playlist selection toggleable and traced failed saves to missing nested PUT/DELETE proxy routes in CLARK Gateway.
- [x] (2026-10-26 14:42Z) Audited feature scope, removed redundant activation/icon code, and made save-error rendering reliable beneath the OnPush parent.

## Surprises & Discoveries

- Observation: The application has no `clark-button` component; reusable buttons use the global `.button` variants and the shared `(activate)` directive.
- Observation: The current base removed playlist mutations, but commit `10cd8f0fe` contains the established backend contract for `PUT /playlists/:playlistId/objects/:cuid` and `GET /playlists?userId=...`.
- Observation: Focused Jest execution fails in `jest-preset-angular` setup with `configSet.processWithEsbuild is not a function`, matching the pre-existing test-tooling drift documented by the base playlist plans.
- Observation: `tsconfig.spec.json` reports TS18003 because its configured include glob finds no inputs, so it cannot provide a fallback spec compilation path.
- Observation: Repository lint completes with no errors and 260 existing warnings in unrelated files.
- Observation: The modal is rendered beneath the OnPush details action panel, so its asynchronous playlist response required an explicit check; focusing and blurring search had previously supplied that check indirectly.
- Observation: `clark-service` implements and tests `PUT /playlists/:playlistId/objects/:cuid`. The initially missing gateway proxy was added upstream in CLARK Gateway commit `f065df3` and is not part of this client change.

## Decision Log

- Decision: Add the control directly to `ActionPanelComponent` between the reusable download template and `EditorialActionPadComponent`.
  Rationale: This is the only location that guarantees the requested ordering for both ordinary users and editors without duplicating the action in multiple components.
  Date/Author: 2026-10-23 / Codex

- Decision: Reuse `.button.neutral` and `ActivateDirective` rather than introduce a new shared component.
  Rationale: These are the established CLARK primitives in the surrounding UI and require the fewest lines while preserving keyboard activation behavior.
  Date/Author: 2026-10-23 / Codex

- Decision: Compose the icon from Font Awesome's existing list and plus glyphs.
  Rationale: Font Awesome Free does not provide a single list-plus glyph, and composing the two installed glyphs matches the reference without adding an image asset or dependency.
  Date/Author: 2026-10-23 / Codex

- Decision: Restore only `getPlaylists(userId)` and `addLearningObject()` from the earlier playlist client contract.
  Rationale: The modal needs only the signed-in user's playlists and one mutation; restoring create, rename, delete, and remove operations would expand this story unnecessarily.
  Date/Author: 2026-10-23 / Codex

- Decision: Own loading, selection, and saving inside a standalone `AddToPlaylistModalComponent`.
  Rationale: The details action panel remains a thin opener, while the domain interaction can be reused from other learning-object surfaces. Search was removed because the intended modal should directly show the user's current playlists.
  Date/Author: 2026-10-23 / Codex

## Outcomes & Retrospective

The details action panel renders a full-width “Add to Playlist” control immediately after downloads and before any revision/editorial actions. The control opens a reusable modal that loads the signed-in user's playlists, excludes playlists already containing the object, and adds the object to the selected playlist. The Angular build and formatting checks pass. Focused tests were added but cannot execute because of the repository's existing Jest transformer mismatch.

## Context and Orientation

`src/app/cube/details/components/action-panel/action-panel.component.html` renders the download controls through `libraryButtonsTemplate`, then renders `clark-editorial-action-pad`, whose first eligible action is “Create a Revision.” The action panel's SCSS already makes `.button` elements full-width and spaces them consistently. `src/app/core/playlist-module` owns playlist reads and the focused add-object mutation.

This is a cross-feature UI/service change between details and playlists. It does not alter routing, guards, interceptors, environment configuration, or build configuration. Modal state remains local and short-lived; no new application store is introduced.

## Plan of Work

Keep the semantic action button after the download template and before the editorial action pad. Open a standalone playlist modal in the existing `clark-popup`, load the signed-in user's playlists, provide radio selection, and use the established PUT route to save. Emit close/added events so the modal remains reusable.

## Concrete Steps

1. Edit `src/app/cube/details/components/action-panel/action-panel.component.html` at the action-stack boundary.
2. Add the reusable modal under the playlist feature and restore the two required typed service operations.
3. Add focused service and modal tests.
4. Run focused Jest, formatting, and `npm run build`; inspect generated-file drift.

## Validation and Acceptance

- On a learning-object details page, “Add to Playlist” appears below Download and above Create a Revision/Edit/Tag actions.
- The action matches the width and spacing of adjacent CLARK buttons.
- The control has a semantic button element and an accessible label.
- Clicking the control opens the shared CLARK popup and lists only the signed-in user's playlists that do not already contain the object.
- Selection enables submission, and submission calls the encoded add-object route.
- Successful saves show confirmation and close the modal; failures leave it open and allow retry.
- The Angular build completes without template or TypeScript errors.

Validation completed with `npx prettier --check` on the touched source and plan files, `git diff --check`, and `npm run build`. The build succeeded with only the repository's pre-existing `querystring` CommonJS optimization warning.

## Idempotence and Recovery

The changes are additive and safe to reapply after checking for the modal component and `add-to-playlist-button` id. If validation changes generated `src/commit-hash.ts`, inspect it separately and do not mix unrelated generated drift into the story.

## Artifacts and Notes

- Visual reference: `Screenshot 2026-10-23 at 10.04.20 AM.png`, supplied by the user.
- Existing action surface: `src/app/cube/details/components/action-panel/action-panel.component.html`.

## Interfaces and Dependencies

The implementation uses the existing global button CSS contract, Font Awesome icons, `clark-popup`, `ToastrOvenService`, and the existing standalone `ActivateDirective` in `ActionPanelComponent`. It extends the typed `PlaylistService` with the established user-filtered GET and add-object PUT operations. It adds no package, route, environment, or build dependency.
