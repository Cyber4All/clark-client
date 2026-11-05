# Reuse the playlist creation dialog for editing

This ExecPlan follows `PLANS.md`.

## Purpose / Big Picture

The playlist pencil opens the same metadata dialog as creation, prefilled with current title and description. Editing uses Save; cancellation discards drafts. Both modes show Description (optional) and spaced action buttons.

## Progress

- [x] (2026-11-03) Read planning instructions and inspected creation, details, styles, service and specs.
- [x] (2026-11-03) Extracted shared metadata form UI/validation and reused it in creation and editing dialogs; actions have a 12px gap.
- [x] (2026-11-03) Replaced inline autosave with prefilled explicit save/cancel; added owner, validation, cancel, retry, and pending-save regression coverage.
- [x] (2026-11-03) Passed 35 client tests across creation/details/shared form/service suites, TypeScript app check, Angular template compilation, and diff whitespace check. Backend passed 57 playlist API tests and TypeScript check.
- [x] (2026-11-03) Fixed edit tooltip reopening on dialog focus restoration using MatTooltip and explicit activation hide. All 21 details tests pass, including a real template/dialog regression verifying focus returns to the pencil with the tooltip hidden.

## Surprises & Discoveries

- Follow-up: the custom TipDirective shows on every focus event, including MatDialog restoring focus to the edit button. Replace only the edit button tooltip with MatTooltip, which monitors focus origin, and explicitly hide it on activation. Validate the real details template with a dialog open/close regression test.
- Existing playlist components are standalone despite the broader repository's NgModule default; preserve their local pattern.
- Client Jest requires the temporary transform override recorded in optional-playlist-description.execplan.md.
- Service creation allows blank descriptions but update DTO still rejects them. Clearing an optional description requires aligning that validation.

## Decision Log

- Decision: Extract only the shared form component and form factory; retain API orchestration in parent views and existing PlaylistService.
  Rationale: Both dialogs stay identical without expanding state ownership or changing unrelated playlist operations.
  Date/Author: 2026-11-03 / Codex

## Outcomes & Retrospective

Completed. Both modes render the same form component. Editing preserves drafts on request failure, prevents duplicate saves, and updates metadata only on success. Cancel discards changes on reopening. The service update DTO now accepts empty strings so users can clear the optional description. Existing owner restrictions, visibility controls and content operations remain intact. No dependency/config changes were needed; existing Jest drift remains a separate follow-up.

## Context and Orientation

`src/app/cube/playlists/playlists.component.*` owns a MatDialog template, reactive form and create request. `playlist-details/playlist-details.component.*` uses contenteditable title/description with per-field blur saves. The core PlaylistService already provides creation and metadata patch methods. Visibility editing, search, content operations, auth guards and routing stay unchanged.

## Plan of Work

Add feature-local `components/playlist-metadata-form/playlist-metadata-form.component.*` with shared controls, validation, labels and spacing. Parent components host their MatDialog templates, own pending/error state, and call existing domain service methods. Remove contenteditable bindings, toggle state, per-field autosave and related styles. Populate edit form each time opened. Keep dialog open with drafts and error on failed save, disable duplicate submits and closing while pending, and update visible metadata only after successful save. Align service update validation to allow clearing description, with API coverage and a companion service plan update.

## Concrete Steps

Run focused Jest suites for creation, details, shared form and playlist service using the temporary configuration in `plans/optional-playlist-description.execplan.md`. Run `node node_modules/typescript/bin/tsc --noEmit -p src/tsconfig.app.json` and Angular template compilation if available. Run the service playlist API suite if update validation changes.

## Validation and Acceptance

Verify prefill (including absent descriptions), edit button owner restriction, cancellation without API calls, explicit trimmed save, optional description, required title, duplicate prevention, failed save retry, and successful header update. Existing creation and visibility/content tests must still pass. Manual flow: create with spaced Cancel/Create playlist actions; click pencil on an owned playlist, edit fields, Cancel to discard, reopen and Save to update the header.

## Idempotence and Recovery

Checks are repeatable; no migration/dependency/config changes are planned. Preserve prior optional-description work and unrelated user edits.

## Artifacts and Notes

No deployment or production data changes. Companion service plan: `../clark-service/plans/playlist-edit-description.execplan.md`.

Validation completed:

- Focused Jest invocation from `plans/optional-playlist-description.execplan.md`, extended with `src/app/cube/playlists/playlist-details/playlist-details.component.spec.ts` and `src/app/cube/playlists/components/playlist-metadata-form/playlist-metadata-form.component.spec.ts`: 4 suites, 35 tests pass.
- `node node_modules/typescript/bin/tsc --noEmit -p src/tsconfig.app.json`: passes.
- `node node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js --noEmit -p src/tsconfig.app.json`: passes, including Angular template checks.
- Service playlist e2e suite: 57 tests pass, including clearing descriptions and rejecting non-string update values. Backend TypeScript check passes.
- `git diff --check`: passes in both repositories.

Manual browser validation was not performed. The shared form template is exercised by its Angular component test.

## Interfaces and Dependencies

Shared form takes a typed FormGroup, mode, pending/error inputs, and emits submit/cancel. Existing MatDialog and PlaylistService own dialog lifecycle and HTTP requests. No routing, guard, interceptor, environment, or build changes.
