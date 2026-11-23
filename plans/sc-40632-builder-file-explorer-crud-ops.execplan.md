# SC-40632 Builder File Explorer CRUD Operations

## Purpose / Big Picture

Add builder file-explorer actions that let an author rename files and folders and move files to another existing folder. The UI must prevent invalid or ineffective requests, show progress and failures, call the matching authenticated `clark-service` endpoints, and rebuild the file tree and breadcrumbs from updated learning-object material state after success.

This is cross-layer work within the existing builder materials feature: shared file-browser presentation emits the selected item, the builder file manager owns the dialogs and interaction state, `FileService` owns HTTP calls, and `BuilderStore` owns mutation of the current learning-object state. It does not change routing, guards, interceptors, environments, or build configuration.

## Progress

- [x] (2026-11-09 14:53Z) Fast-forwarded local `main` from GitHub and created `chore/sc-40632/builder-file-explorer-crud-ops`.
- [x] (2026-11-09 14:53Z) Inspected the file browser, file manager, upload/materials event chain, builder store, file service, tests, and adjacent `clark-service` endpoint contracts.
- [x] (2026-11-09 15:02Z) Added typed route helpers and `FileService` rename/move methods with focused request tests.
- [x] (2026-11-09 15:02Z) Added file-manager rename and folder-selection dialogs, validation, loading state, cancellation, and inline error feedback.
- [x] (2026-11-09 15:02Z) Refresh the existing material subjects after success so the derived file explorer and breadcrumbs rebuild from updated metadata.
- [x] (2026-11-09 15:02Z) Added focused tests for rename, move, validation, cancellation, loading, success, and service failures.
- [x] (2026-11-09 15:04Z) Formatted touched files, passed 46 focused Jest tests, linted with zero new errors, and completed `npm run build` successfully.
- [x] (2026-11-09 15:08Z) Removed duplicated dialog state/markup and consolidated repeated file-operation HTTP configuration without changing behavior.
- [x] (2026-11-23 15:18Z) Guarded the operation boundary against repeated submissions and replaced the stretched Font Awesome loading icon with a fixed-size local spinner; 16 focused component tests and the Angular build passed.

## Surprises & Discoveries

- The shared list item already contains a TODO for rename and move, but the actionable menu is owned by builder-only `FileManagerComponent`; this permits the feature to stay builder-scoped without changing the shared file browser's public contract.
- The adjacent `clark-service` already defines exact contracts: `PATCH .../files/:fileId/rename` with `{ name }`, `PATCH .../files/:fileId/move` with `{ destinationPath }`, and `PATCH .../folders/rename` with `{ path, name }`; all return `204`.
- The backend intentionally treats unchanged destinations as no-ops. The story requires client validation, so the client will reject unchanged rename/move requests before calling the service.
- Folder nodes are derived from file `fullPath` values and folder descriptions rather than persisted as independent client entities. Re-emitting updated learning-object materials is therefore the safest refresh mechanism.
- Test tooling is mixed: Angular config still references Karma, while current focused specs use Jest. Validation will use Jest for touched specs and Angular CLI for compilation.
- The pulled dependency graph installed `ts-jest@29.4.6`, which is incompatible with this repo's `jest-preset-angular` configuration (`processWithEsbuild is not a function`). Focused tests run after a temporary no-save local alignment to `ts-jest@29.2.5`; no package manifest or lockfile was changed.
- Jest lacked mappings for existing absolute `app/...` and `getUserAgentBrowser` imports. `jest.config.js` now maps both so component specs can resolve the same paths Angular resolves.
- The global Font Awesome animation rendered the loading icon across the flex-sized submit button in some browsers. A component-local, fixed-size CSS spinner avoids that rendering interaction.

## Decision Log

- Decision: Keep dialogs and operation feedback in the builder `FileManagerComponent`, while keeping HTTP and learning-object state changes in `FileService` and `BuilderStore`.
  Rationale: The menu is builder-specific, but API access and domain state belong outside presentation components.
  Date/Author: 2026-11-09 / Codex

- Decision: Use reactive form controls for the new dialogs.
  Rationale: Rename and destination selection have cross-field/path validation and submission/loading states; reactive controls keep those rules explicit in Angular 18.
  Date/Author: 2026-11-09 / Codex

- Decision: Refresh from locally updated material metadata after a successful `204`, preserving file IDs and all unrelated fields.
  Rationale: The service endpoints return no body, the backend contract preserves existing metadata, and the existing builder store is the single owner that feeds the file tree and breadcrumbs.
  Date/Author: 2026-11-09 / Codex

- Decision: Let the builder-only file manager orchestrate `FileService` calls and update its existing material subjects after success rather than add new pass-through outputs and store actions.
  Rationale: The component still delegates all HTTP behavior to the domain service, while the existing subjects reference the builder learning object's material metadata and already drive the derived filesystem. This keeps the change bounded and avoids a callback-like event chain solely to communicate loading and failure state back to the dialog.
  Date/Author: 2026-11-09 / Codex

- Decision: Modernize touched files only and leave the broader legacy upload/event architecture intact.
  Rationale: Replacing the builder's event chain or filesystem model would expand the story without reducing delivery risk.
  Date/Author: 2026-11-09 / Codex

- Decision: Use one parameterized operation dialog and one shared service request helper for Rename and Move.
  Rationale: Both flows have the same lifecycle and feedback UI; consolidating them removes duplicate state, markup, and authenticated PATCH configuration while keeping operation-specific validation explicit.
  Date/Author: 2026-11-09 / Codex

## Outcomes & Retrospective

Implementation is complete. Rename is available for files and folders; Move is available for files. Successful operations update preserved file metadata in place and re-emit the material list, causing the existing file browser to rebuild and reset stale breadcrumbs. The broader legacy upload/event architecture remains unchanged.

Focused Jest validation passed 46 tests across the file service and file manager. ESLint completed with no errors and four pre-existing naming warnings in image-preview code within `file.service.ts`. `npm run build` completed successfully with the existing `querystring` CommonJS optimization warning. The full spec TypeScript project remains red because of unrelated stale legacy specs documented in Surprises & Discoveries.

## Context and Orientation

`src/app/onion/learning-object-builder/pages/materials-page/` is the route-level materials page. It delegates to `UploadComponent`, which projects the current learning object's files into `BehaviorSubject`s and renders `FileManagerComponent`.

`src/app/onion/learning-object-builder/components/content-upload/app/file-manager/` owns the builder item context menu. It passes files and a derived `DirectoryTree` into the shared `FileBrowserComponent`. The current item menu contains only Delete.

`src/app/shared/modules/filesystem/` contains `DirectoryTree`, `DirectoryNode`, breadcrumbs, and list rendering. Folder nodes expose a name and relative path. File metadata supplies `_id`, `name`, `extension`, and optional `fullPath`.

`src/app/core/learning-object-module/file/file.routes.ts` and `file.service.ts` own file HTTP access. `src/app/onion/learning-object-builder/builder-store.service.ts` owns the active learning object and emits `learningObjectEvent`, which causes upload/file-manager state and the derived tree to refresh.

The matching service endpoints are implemented in adjacent `clark-service/src/modules/file-module/metadata/file-metadata.routehandler.ts`. Rename-file and move-file identify a file by Mongo ID; rename-folder identifies a relative folder path.

## Plan of Work

First add explicit route helpers, request types, and `Observable<void>` methods to `FileService`. Cover their URLs, bodies, credentials, and error propagation with focused Jest tests.

Next extend `FileManagerComponent` with Rename and Move menu options. Rename applies to files and folders; Move applies to files. Add accessible popup dialogs using the existing `clark-popup` pattern, reactive controls, cancel actions, disabled/loading submit buttons, and inline validation/error text. Build destination choices from the current `DirectoryTree`, including root. Validate trimmed non-empty names, the backend-invalid character/path rules, unchanged paths, duplicate destinations, and file-extension changes.

Then provide the learning-object ID to the builder file manager and let it orchestrate typed `FileService` calls. After a successful endpoint response, update the matching file name/full path or all affected folder prefixes (including folder descriptions), then re-emit the existing material subjects so current subscriptions rebuild the tree and breadcrumbs.

Finally add focused component/store/service tests for menu actions, validation, cancel, loading, successful refresh, and rejected requests. Format touched files, run focused Jest tests, lint touched code if practical, and run `npm run build` as required by the Angular skill.

## Concrete Steps

1. Edit `src/app/core/learning-object-module/file/file.routes.ts`, `file.service.ts`, and `file.service.spec.ts` for the three `PATCH` calls.
2. Add operation types/validation helpers near the builder file manager when they are feature-local; avoid duplicating broadly shared domain shapes.
3. Edit the file manager TypeScript/template/SCSS and add a focused component spec.
4. Pass the learning-object ID from upload to file manager and refresh the existing builder material subjects after successful operations.
5. Run Prettier on touched files, focused Jest specs, lint/TypeScript checks as supported, and `npm run build`.
6. Update this plan's progress, discoveries, and retrospective with exact results.

## Validation and Acceptance

Acceptance requires the item menu to show Rename for files/folders and Move for files; dialogs must cancel without calls; invalid empty names, invalid characters, unchanged destinations, duplicates, and extension changes must block submission with useful messages; valid operations must show a busy state, call exactly the matching endpoint, close on success, and show an error while retaining the dialog on failure.

After success, the visible file explorer must reflect updated names/locations and breadcrumbs must remain valid, including a folder renamed while it or a descendant is open. Existing Delete and upload behavior must remain intact.

Automated proof will include request-level `FileService` tests, validation/dialog component tests, and builder-store state tests. `npm run build` must compile the Angular application. Manual verification should exercise file rename, nested folder rename, move to root/nested folder, cancel, duplicate rejection, and a simulated service failure.

## Idempotence and Recovery

Repository inspection and tests are repeatable. Client validation prevents repeated completed operations from sending unchanged requests. The UI mutates local state only after the endpoint completes successfully, so service failures leave the tree untouched. If implementation pauses, use the Progress checklist and `git diff` to resume. Reverting the touched client files and this plan restores prior behavior; no database or environment migration is involved.

## Artifacts and Notes

- Branch: `chore/sc-40632/builder-file-explorer-crud-ops`
- Backend reference: `../clark-service/plans/sc-40632-builder-file-explorer-crud-ops.execplan.md`
- Backend routes return `204 No Content`; duplicate destinations return `409` and invalid paths return `400`.
- Validation evidence: `npx jest --runInBand src/app/core/learning-object-module/file/file.service.spec.ts src/app/onion/learning-object-builder/components/content-upload/app/file-manager/file-manager.component.spec.ts` (46 passing); focused ESLint (0 errors); `npm run build` (success).

## Interfaces and Dependencies

Add client methods equivalent to:

    renameFile(learningObjectId: string, fileId: string, name: string): Observable<void>
    moveFile(learningObjectId: string, fileId: string, destinationPath: string): Observable<void>
    renameFolder(learningObjectId: string, path: string, name: string): Observable<void>

Add a feature-local discriminated operation payload passed from file manager to the builder store, containing the target kind, operation kind, stable file ID or folder path, and requested name/destination. Continue using Angular `HttpClient`, RxJS, existing `DirectoryTree`/`DirectoryNode`, reactive forms, `clark-popup`, and `ToastrOvenService`; introduce no new package dependency.
