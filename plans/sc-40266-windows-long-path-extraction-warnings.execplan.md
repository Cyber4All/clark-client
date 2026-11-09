# SC-40266 Windows Long-Path Extraction Warnings

## Purpose / Big Picture

Warn learning-object authors when a material file's upload-relative `fullPath` exceeds 160 characters, because Windows File Explorer may fail to extract the resulting archive. The materials builder will show a reusable warning toast when affected files are loaded or selected, and the shared file-list row will show a warning icon with a concise tooltip. Material-note migration is handled in a separate repository.

## Progress

- [x] (2026-10-09) Read `AGENTS.md` and `PLANS.md`; confirmed this is story-scale multi-file work requiring an ExecPlan.
- [x] (2026-10-09) Traced the materials builder, upload, shared filesystem list, toaster, and material model paths.
- [x] (2026-10-09) Added the shared path-length helper and focused threshold/fallback tests.
- [x] (2026-10-09) Added upload/persisted-material warnings and the shared file-row warning affordance.
- [x] (2026-10-09) Confirmed material-note migration is handled by the separate data-maintenance repository.
- [x] (2026-10-09) Ran targeted ESLint, Prettier, `git diff --check`, and `npx tsc -p src/tsconfig.app.json --noEmit` successfully.
- [x] (2026-10-09) Attempted focused Jest and Angular experimental builds; both are blocked by pre-existing repository/toolchain issues documented below.

## Surprises & Discoveries

- The client uses a standalone component island inside an otherwise NgModule-oriented application; the materials upload and filesystem components are standalone.
- `ToastrOvenService.warning()` already exists and renders a warning icon, so no new toast component is needed.
- Persisted files already expose `LearningObject.Material.File.fullPath`, while newly selected files may expose `fullPath` or `webkitRelativePath`.
- Material-note migration is handled in a separate repository; this client change only owns detection and user-facing warnings.
- Test tooling is mixed: package scripts use Jest while Angular configuration still contains legacy Karma references; validation will report the exact checks that run.

## Decision Log

- Decision: Use a shared pure helper with the strict condition `fullPath.length > 160`.
  Rationale: It centralizes the acceptance threshold and makes both UI and script logic testable without browser state.
  Date/Author: 2026-10-09 / Codex
- Decision: Show both a page-level warning toast and a row-level warning tooltip/icon.
  Rationale: The toast gives an immediate actionable warning, while the icon remains discoverable while managing individual files.
  Date/Author: 2026-10-09 / Codex
- Decision: Make the note migration idempotent and preserve notes exactly, adding a separator only when existing content is non-empty.
  Rationale: Re-running a migration must not duplicate the notice or erase author-entered notes.
  Date/Author: 2026-10-09 / Codex
- Decision: Keep routes, guards, interceptors, environment files, API contracts, and state ownership unchanged.
  Rationale: The story is a materials UI/data-maintenance change and does not require navigation or cross-cutting HTTP changes.
  Date/Author: 2026-10-09 / Codex

## Outcomes & Retrospective

The frontend implementation is complete. Focused Jest remains blocked by the existing `configSet.processWithEsbuild is not a function` error in the repository's Jest transformer setup. The experimental Angular build reaches bundle generation but fails on the existing `environment.downtimeUrl` type mismatch in `src/app/core/utility-module/utility.routes.ts`.

## Context and Orientation

`src/app/onion/learning-object-builder/pages/materials-page/materials-page.component.*` owns the materials page and delegates file management to `components/content-upload/app/upload/upload.component.*`. The upload component receives the current `LearningObject`, watches `materials.files`, parses selected/dropped files, and calls the existing toaster for upload errors. The file manager builds a `DirectoryTree`; `src/app/shared/modules/filesystem/file-list-view/components/file-list-item/*` renders each persisted file row and is reused outside the builder. The material model is `LearningObject.Material.File` in `src/entity/learning-object/learning-object.ts`.

This work is cross-cutting within the materials/filesystem UI. It does not touch routing, guards/interceptors, API service boundaries, environment/build behavior, or state ownership. Existing filesystem/tree behavior and legacy subscription patterns outside touched code remain in place.

## Plan of Work

1. Add a pure path-length utility and tests covering the threshold, fallback paths, and missing paths.
2. Use it in the upload component to warn once per affected path when persisted materials load and when new files are selected/dropped, while retaining the existing upload flow.
3. Use it in the shared file-list item to render a warning icon and tooltip for persisted files with over-limit paths.
4. Run focused validation, then update this plan with outcomes and any limitations.

## Concrete Steps

- Create `src/app/shared/modules/filesystem/path-length.ts` with the 160-character limit, path resolution helper, and warning copy.
- Add utility specs and update upload/file-list specs where practical.
- Update `upload.component.ts` to inspect current files and upload candidates before/around the existing upload operation, deduplicating repeated toasts during observable refreshes.
- Update `file-list-item.component.*` to include an accessible warning icon with a tooltip and local styling.

## Validation and Acceptance

- Unit tests prove exactly 160 characters is allowed and 161 characters is warned, and that path fallback resolution works.
- Component/template validation proves an affected persisted file gets the warning affordance and an affected upload candidate triggers the warning toast.
- Run focused Jest tests for touched specs where the current harness permits; run targeted lint and Angular TypeScript/build validation. Record any existing Jest/configuration failure verbatim.
- Manual check: open Materials, load a learning object containing an over-limit file, verify the toast and row icon tooltip; select/drop another over-limit file and verify the warning before upload continues.

## Idempotence and Recovery

The UI warning is non-blocking and deduplicated per component instance/path. No data migration runs from this frontend repository.

## Artifacts and Notes

- Story plan: `plans/sc-40266-windows-long-path-extraction-warnings.execplan.md`
- UI threshold/copy: `src/app/shared/modules/filesystem/path-length.ts`
- Validation evidence: targeted ESLint, Prettier, TypeScript no-emit, and diff check passed; Jest and Angular build failures are existing tooling/configuration drift.

## Interfaces and Dependencies

- Angular standalone components and existing `ToastrOvenService`.
- `LearningObject.Material.File.fullPath` for persisted files.
- Browser `File.fullPath`, `webkitRelativePath`, and `name` for newly selected files.
- No route, guard, interceptor, environment, or external service changes.
