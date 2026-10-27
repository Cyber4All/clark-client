# Poll material processing before AI generation

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

The Learning Object Builder enables Generate with AI after at least one supported material exists and every supported material reports `ready` from `GET /learning-objects/:learningObjectId/materials/files/:fileId/processing-status`, regardless of ZIP inclusion. Unsupported uploads are neither polled nor included in the readiness check, as specified in `plans/unsupported-material-parsing.execplan.md`. The button updates without a page refresh as parsing finishes. A ready file is no longer polled; its status is checked again only when its Include in download setting changes.

## Progress

- [x] (2026-10-12) Read `PLANS.md`, inspected the builder navbar, `BuilderStore` material events, `FileService`, and test configuration.
- [x] (2026-10-12) Added the typed API method and route helper.
- [x] (2026-10-12) Added polling for the current material files, button gating, and pending guidance.
- [x] (2026-10-12) Added focused cases for all-ready, changing files, failures, and teardown; ran compile and attempted Jest.
- [x] (2026-10-12) Kept readiness per file and stopped polling each ready file. Wired successful Include in download changes to recheck affected file IDs, including files inside a toggled folder.
- [x] (2026-10-12) Updated focused polling cases and reran app TypeScript and Angular template compilation.
- [x] (2026-10-12) Disabled Generate with AI when no file has `packageable: true`, updated its tooltip, added a focused toggle case, and reran app TypeScript and Angular template compilation.
- [x] (2026-10-12) Exposed full polling states for the Parsing column, replacing the ready-only cache with a per-file status map. The focused polling suite now passes with a temporary Angular Jest configuration; see `plans/material-parsing-status-column.execplan.md`.

## Surprises & Discoveries

- Observation: `BuilderStore.fetchMaterials()` emits `learningObjectEvent` after upload, and deletion emits the same event. File metadata currently contains no parsing state.
  Evidence: `src/app/onion/learning-object-builder/builder-store.service.ts` and `src/entity/learning-object/learning-object.ts`.
- Observation: Jest exists, but `angular.json` still configures Karma and `test:unit` selects unrelated tests.
  Evidence: `package.json`, `angular.json`, and `jest.config.js`.
- Observation: The focused Jest suite cannot start because the installed `jest-preset-angular` transformer calls a missing `configSet.processWithEsbuild` function. The full spec TypeScript check also finds errors in unrelated older specs.
  Evidence: `jest --runInBand --runTestsByPath ...builder-navbar.component.spec.ts` and `tsc --noEmit -p src/tsconfig.spec.json` output.

## Decision Log

- Decision: Apply the seven-extension eligibility rule from `plans/unsupported-material-parsing.execplan.md` to every polling/readiness step in this plan.
  Rationale: Unsupported files never become ready and must not block supported AI sources. This supersedes historical references below to checking every uploaded file.
  Date/Author: 2026-10-12 / Codex

- Decision: Remove the ZIP-inclusion requirement for AI availability, superseding the earlier packageable requirement below.
  Rationale: Include in download controls ZIP contents, and the backend's AI source selection does not check that setting. The user requested reverting only this availability restriction.
  Date/Author: 2026-10-12 / Codex

- Decision: Keep polling in the builder navbar and the HTTP call in `FileService`.
  Rationale: The navbar owns the button while the service owns file API requests; store events provide file list changes.
  Date/Author: 2026-10-12 / Codex
- Decision: Treat missing, failed, or unknown status responses as pending and retry at the next interval.
  Rationale: The button must become available only on explicit `ready` responses for every current file.
  Date/Author: 2026-10-12 / Codex
- Decision: Keep ready file IDs in the navbar until that file's Include in download setting changes or the learning object changes.
  Rationale: Ordinary builder updates and other file polls must not request a ready file's status again. `BuilderStore.toggleBundle` knows the exact changed IDs after the save succeeds.
  Date/Author: 2026-10-12 / Codex
- Decision: Require an explicitly `packageable: true` file for the AI action.
  Rationale: The existing Include in download control treats false or missing `packageable` as off, and the user wants the button greyed out when all are off.
  Date/Author: 2026-10-12 / Codex

## Outcomes & Retrospective

Implemented the processing status request and five-second polling of pending files. The navbar enables Generate with AI when every current file explicitly reports `ready`, regardless of ZIP inclusion; each ready file drops out of polling. Adding a file polls the new file while retaining existing ready states. A successful Include in download change rechecks only the affected files. Failed requests retry, and polling stops on completion or teardown. The app TypeScript and Angular template compilers pass. All six navbar tests pass using the temporary Angular Jest configuration documented in the status-column plan, including the regression for ready files excluded from the ZIP.

## Context and Orientation

This is local to the lazy-loaded Onion learning object builder. `src/app/onion/learning-object-builder/components/builder-navbar/builder-navbar.component.ts` receives learning object updates from `BuilderStore`; its template contains Generate with AI. `BuilderStore.toggleBundle` saves Include in download changes and emits affected file IDs for polling invalidation. `src/app/core/learning-object-module/file/file.service.ts` and `file.routes.ts` own file API calls. The entity file IDs come from `LearningObject.materials.files`. No route, guard, interceptor, shared UI, environment, or build changes are planned. The legacy builder mixes mutable store objects and event emissions; this change adds a focused event without refactoring the store.

## Plan of Work

Add a typed processing status GET method to `FileService`. Start a bounded-interval poll for pending file IDs when the builder store emits them. Keep ready IDs in the navbar and exclude them from later requests. Cancel the previous poll on file list or learning object changes and on navbar destruction. After `BuilderStore.toggleBundle` saves an Include in download change, emit the changed file IDs and invalidate only those ready states. Disable Generate with AI until all current files explicitly report ready. Preserve existing button behavior for an empty material list.

## Concrete Steps

From the repository root, edit the route helper, service, navbar component, and navbar template. Then run:

    ./node_modules/.bin/tsc --noEmit -p src/tsconfig.app.json
    ./node_modules/.bin/jest --runInBand --runTestsByPath src/app/onion/learning-object-builder/components/builder-navbar/builder-navbar.component.spec.ts

App TypeScript and Angular template compilation passed with `tsc --noEmit -p src/tsconfig.app.json` and `ngc --noEmit -p src/tsconfig.app.json`. The focused Jest suite stops during setup with `TypeError: configSet.processWithEsbuild is not a function`, before executing tests. `tsc --noEmit -p src/tsconfig.spec.json` reports existing errors in unrelated specs; it reports none in the changed navbar spec.

## Validation and Acceptance

With one or more material files, the button is disabled while any status is pending or unavailable, then enables when all return `ready`, even when no files are included in the ZIP. Its tooltip does not require ZIP inclusion. A ready file is not requested again on later ticks or ordinary store updates. With no files, the button remains disabled and prompts upload. Uploading another file disables it until the new file is ready; deleting a pending file recalculates readiness. A successful Include in download toggle restarts checks for the changed file or every file in a changed folder. Polling ends on navigation away. The GET uses credentials like neighboring file methods. Existing routing and auth behavior are unchanged.

## Idempotence and Recovery

All edits are safe to reapply after inspecting `git diff`. A partial service method without the navbar change leaves current UI behavior intact; finish the navbar change before release. Restart the focused validation after any edit.

## Artifacts and Notes

`git diff --check` passed. App `tsc` and `ngc` passed after the inclusion gate change. No browser session or backend was available for a live status transition check.

## Interfaces and Dependencies

Affected: `BuilderNavbarComponent`, `BuilderStore.toggleBundle`, `FileService`, `FILE_METADATA_ROUTES`, and a typed processing status response. External dependency: the specified GET endpoint returning `processingStatus: "ready"` when parsing completes.
