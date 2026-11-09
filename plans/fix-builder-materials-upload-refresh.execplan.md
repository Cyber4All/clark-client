# Fix builder materials refresh after upload

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

After a file or folder upload completes in the learning-object-builder Materials tab, the Files and Folders view should immediately show the uploaded entries without requiring a tab switch or page refresh.

## Progress

- [x] (2026-11-02) Read `PLANS.md` and inspected the Materials page, upload component, builder store, and filesystem components.
- [x] (2026-11-02) Investigated the nested file-browser wiring; that attempted change did not address the observed runtime failure and was removed.
- [x] (2026-11-02) Editor problem validation reports no errors in the changed component, template, or regression spec.
- [x] (2026-11-02) Focused editor diagnostics pass for the upload helper; no dedicated upload-component spec exists in the touched area.
- [x] (2026-11-02) Located the runtime failure in `UploadComponent.warnForLongPaths`, where an undefined file list reached `.filter()`.
- [x] (2026-11-02) Made the helper tolerate an omitted file list; regression test coverage remains pending because the focused test controller is unavailable.

## Surprises & Discoveries

- Observation: The builder store mutates `learningObject.materials.files`, emits the same `LearningObject` instance, and the upload component forwards the resulting files through a `BehaviorSubject`.
  Evidence: `src/app/onion/learning-object-builder/builder-store.service.ts`, `src/app/onion/learning-object-builder/components/content-upload/app/upload/upload.component.ts`.
- Observation: The file manager builds its `DirectoryTree` from the files subject once per emission, so the failure is in the upload/state path rather than route navigation.
  Evidence: `src/app/onion/learning-object-builder/components/content-upload/app/file-manager/file-manager.component.ts`.
- Observation: The actual runtime exception occurs before the file tree can finish updating: `warnForLongPaths` calls `.filter()` on its input without guarding against undefined.
  Evidence: `src/app/onion/learning-object-builder/components/content-upload/app/upload/upload.component.ts`.

## Decision Log

- Decision: Stabilize the existing RxJS store/component flow in place and avoid a broader state-management or standalone-component refactor.
  Rationale: The requested behavior is local to the upload refresh path and the repository uses this legacy/custom RxJS architecture.
  Date/Author: 2026-11-02 / Codex

## Outcomes & Retrospective

Made the upload path resilient when no file list is available while materials state is initializing. The earlier file-manager wiring attempt was removed after the runtime stack identified the actual failure in `warnForLongPaths`. Changed-file diagnostics are clean.

## Context and Orientation

`MaterialsPageComponent` passes `BuilderStore.learningObjectEvent` to `UploadComponent`. The upload component maintains `files$` and `folderMeta$` subjects, while `FileManagerComponent` subscribes to `files$` and rebuilds its `DirectoryTree`. Upload completion emits metadata to the page, which invokes `BuilderStore` action `ADD_FILE_META`; the store persists metadata and must publish the updated materials state back through `learningObjectEvent`.

This change does not touch routing, guards, interceptors, environment/build behavior, or external API contracts. It may touch the learning-object entity only if the investigation confirms an entity setter/type issue contributes to the stale view. Shared filesystem UI is involved through the existing file-manager contract, so downstream behavior must remain unchanged for initial load and deletion.

## Plan of Work

Trace the post-upload event sequence and compare it with the initial materials load. Fix the first point where the updated files/folders fail to reach the file manager or Angular view. Prefer an explicit new-state emission or a narrowly scoped change-detection-safe update over broad refactoring. Add focused coverage at the store/component boundary if the existing test setup supports it; otherwise document manual verification.

## Concrete Steps

From the repository root, run:

    rg -n "ADD_FILE_META|filesUploaded|learningObjectEvent|files\$|DirectoryTree" src/app/onion/learning-object-builder src/entity

Then edit only the affected implementation and tests. Validate with the nearest configured test command or focused test runner available in the repository.

## Validation and Acceptance

- Upload a file in the Materials > Files and Folders view and verify it appears immediately after upload completion.
- Upload a folder and verify its folder hierarchy appears immediately.
- Confirm initial materials loading, deletion, and switching between Materials tabs still work.
- Run focused unit tests for the changed upload component where available.
- Run editor problem validation on changed files; distinguish pre-existing repository errors from regressions.

Current result: changed-file diagnostics pass. VS Code reported no discovered test item for the new spec, so the test body was not executed in this environment.

## Idempotence and Recovery

The implementation should be safe to repeat because it only changes local state propagation and test fixtures. If validation fails, revert only the changed implementation/test hunks; do not reset unrelated work in the working tree. The ExecPlan can be resumed from the Progress checklist.

## Artifacts and Notes

No screenshots or external artifacts yet.

## Interfaces and Dependencies

- `src/app/onion/learning-object-builder/pages/materials-page/materials-page.component.ts`
- `src/app/onion/learning-object-builder/components/content-upload/app/upload/upload.component.ts`
- `src/app/onion/learning-object-builder/components/content-upload/app/upload/upload.component.ts`
- `src/app/onion/learning-object-builder/builder-store.service.ts`
- `src/entity/learning-object/learning-object.ts`
- `src/shared/modules/filesystem/DirectoryTree.ts` and `DirectoryNode.ts`
