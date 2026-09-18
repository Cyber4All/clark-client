# SC-40160: Update the existing builder for Agentic Builder

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Update the existing Angular learning-object builder so authors see the revised `Materials → Details → Learning Outcomes` navigation, can open an Agentic Builder generation panel, and can independently mark files/folders as agent context. Materials context must persist through the existing builder store without changing Bundle/packageable behavior. Success is observable in the lazy-loaded builder route and its Materials file explorer.

## Progress

- [x] (2026-09-17) Retrieved Shortcut story 40160 and reviewed its acceptance criteria.
- [x] (2026-09-17) Created branch `feature/sc-40160/agentic-builder-update-existing-builder`.
- [x] (2026-09-17) Read repository planning guidance and inspected builder, file explorer, entity, store, and test conventions.
- [x] (2026-09-17) Created the Agentic Builder panel and updated builder navigation.
- [x] (2026-09-17) Removed the Materials right-hand notes column while preserving the uploader Notes slide.
- [x] (2026-09-17) Added independent Context controls to file and folder rows and persisted them through the builder store.
- [x] (2026-09-17) Added the learning-object build route/service and wired Generate to POST selected fields for the current learning object.
- [x] (2026-09-17) Fixed Agentic Builder panel stacking at reduced viewport widths by giving it an independent fixed positioning context and higher z-index.
- [x] (2026-09-17) Corrected Materials-first tab order and aligned Context header/row grid columns for builder file rows.
- [x] (2026-09-17) Routed the exact new-object builder URL to Materials while retaining Details as the existing-object default route.
- [x] (2026-09-17) Ran formatting, lint, diff checks, and a network-independent production build.
- [x] (2026-09-17) Updated client name availability requests to use author-scoped, case-insensitive backend validation and exclude the current object during edits.
- [x] (2026-09-17) Re-ran the non-optimized client production build after the name-availability contract update.
- [x] (2026-09-17) Changed name validation so a title is required only for submission, not draft saves.
- [x] (2026-09-17) Removed the name-based Materials and Learning Outcomes navigation lock for unnamed drafts.
- [x] (2026-09-17) Eagerly create the blank unreleased draft so Materials receives its generated ID/CUID before uploads begin.
- [x] (2026-09-17) Added a display-only “Untitled Learning Object” fallback for blank draft names in builder labels and browser titles.
- [x] (2026-09-17) Applied the display-only untitled fallback to Onion dashboard learning-object cards and side-panel title bindings.
- [x] (2026-09-17) Persisted a newly created draft's CUID/version in the builder URL and refreshed builder state after Agentic Builder completes.
- [x] (2026-09-17) Disabled only the builder fields selected for Agentic Builder generation and added in-context loading indicators until generation and refresh complete.
- [x] (2026-09-17) Resolved the CI-only Prettier/ESLint brace-style conflict by assigning brace formatting exclusively to Prettier.
- [x] (2026-09-18) Extracted the Agentic Builder panel, generation state, and request orchestration into a dedicated standalone component.
- [x] (2026-09-18) Preserved Agentic Builder field selections when the panel is closed and reopened during the same builder session.
- [x] (2026-09-18) Made generation failures reset cleanly, removed dynamic Font Awesome icon duplication, and surfaced backend error messages in the panel and toaster.
- [ ] Add/execute focused component assertions once the repository Jest transformer dependency drift is resolved.

## Surprises & Discoveries

- Observation: The checkout is a linked Git worktree; branch refs are stored outside the workspace.
  Evidence: `git rev-parse --git-dir` returned `/Users/luis/Code/development-environment/.git/modules/clark-client`; branch creation required the approved Git escalation.
- Observation: Bundle state is represented by `LearningObject.Material.File.packageable`, while folders derive their display state recursively.
  Evidence: `src/entity/learning-object/learning-object.ts`, `folder-list-item.component.ts`, and `BuilderStore.toggleBundle()`.
- Observation: No Agentic Builder or file-context contract currently exists in the client.
  Evidence: repository search found only `packageable` and existing generic context-menu references.
- Observation: The optimized production build cannot inline Google Fonts in the restricted environment, but disabling optimization completes the full build.
  Evidence: `npx ng build clark --configuration=production` failed only at `fonts.googleapis.com`; `npx ng build clark --configuration=production --optimization=false` completed successfully.
- Observation: Focused Jest execution is blocked before tests load by an incompatible Jest preset/config API.
  Evidence: `configSet.processWithEsbuild is not a function` from `jest-preset-angular`.
- Observation: Learning-object API routes centralize the environment base URL in `environment.apiURL`.
  Evidence: `src/app/core/learning-object-module/learning-object/learning-object.routes.ts` and Angular environment replacements.
- Observation: The story explicitly excludes generation API/loading/failure work from this story.
  Evidence: Shortcut story 40160 description says those flows are tracked separately in the epic.
- Observation: Prettier 3.8 wraps long class `implements` declarations with the opening brace on a new line, while ESLint's configured `brace-style: 1tbs` rejected that formatter-owned output in CI.
  Evidence: `learning-object-builder.component.ts:127` was stable under `prettier --write` but failed ESLint's `brace-style` rule until that formatting-only rule was disabled.
- Observation: The builder already checks names through an authenticated API endpoint, but that endpoint previously used a global search-index lookup.
  Evidence: `InfoPageComponent` calls `LearningObjectService.checkNameAvailability`, which calls `GET /learning-objects/name/check/:name`.

## Decision Log

- Decision: Preserve the `info` route and rename only its user-facing navigation label to `Details`.
  Rationale: This is explicitly allowed by the story and avoids unnecessary route compatibility risk.
  Date/Author: 2026-09-17 / Codex
- Decision: Redirect only `/onion/learning-object-builder` to `/onion/learning-object-builder/materials`; retain the existing-object `:cuid/:version` route and its Details default.
  Rationale: New and existing builders have distinct parent route shapes, which lets the upload-first experience change without unexpectedly changing edit entry behavior.
  Date/Author: 2026-09-17 / Codex
- Decision: Store Agentic context as a separate optional boolean on file metadata and use a dedicated builder action/event.
  Rationale: The current API/store path already saves `materials` and Bundle uses `packageable`; conflating the fields would violate the acceptance criteria.
  Date/Author: 2026-09-17 / Codex
- Decision: Apply folder Context toggles recursively to descendant files while retaining per-file controls.
  Rationale: This matches the existing folder Bundle interaction pattern and the story’s stated directory behavior.
  Date/Author: 2026-09-17 / Codex
- Decision: Implement Generate as a typed POST to the learning-object build endpoint with the selected supported fields.
  Rationale: The follow-up requirement explicitly requires the endpoint call; generation result/loading UX remains outside this client change.
  Date/Author: 2026-09-17 / Codex
- Decision: Send `{ fields: ["name", "description", "learningOutcomes"] }` as the build request body.
  Rationale: The panel now allows the user to select supported fields, and this keeps the service contract explicit and narrow.
  Date/Author: 2026-09-17 / Codex
- Decision: Modernize only touched interfaces and event types; do not perform a broad standalone, RxJS, or shared-filesystem rewrite.
  Rationale: The repository is NgModule-oriented with mixed legacy patterns, and wider cleanup would expand risk without advancing this story.
  Date/Author: 2026-09-17 / Codex
- Decision: Pass the saved learning-object ID as an optional query parameter during name checks.
  Rationale: The backend can exclude the current document, allowing a case-only self-rename while still rejecting another object owned by the same author.
  Date/Author: 2026-09-17 / Codex
- Decision: Replace the transient new-builder URL only after the eager draft-create response supplies the persisted CUID and version.
  Rationale: The draft must exist before uploads, and the persisted route makes a browser refresh reopen that same draft instead of creating another one.
  Date/Author: 2026-09-17 / Codex
- Decision: Refetch the current learning object after a successful build request.
  Rationale: The build endpoint performs server-side updates but does not return the updated learning object; the existing store fetch path already updates all dependent builder views.
  Date/Author: 2026-09-17 / Codex
- Decision: Publish the active Agentic Builder fields through `BuilderStore` for the duration of the request.
  Rationale: Generation starts in the navbar while the affected controls live on sibling routed pages; shared builder-scoped state lets each page disable only the fields included in the request and restore them on success or failure.
  Date/Author: 2026-09-17 / Codex

## Outcomes & Retrospective

Implemented the requested builder shell, Materials/file-context UX, build API handoff, author-scoped name availability handoff, and field-specific generation pending state on the feature branch. Context is intentionally separate from Bundle and is persisted in the existing materials payload. Generate now POSTs selected fields for the current learning object ID, publishes those fields as transient builder state, and keeps only their matching controls disabled with accessible loading feedback until the generated object has been refreshed. Name checks include the current object ID when present, allowing backend self-exclusion. The non-optimized production build passes after this contract update. Automated Jest assertions remain deferred because the configured transformer cannot run in the current dependency/tooling state.

## Context and Orientation

The builder is a lazy-loaded NgModule feature under `src/app/onion/learning-object-builder`. `learning-object-builder.routing.ts` routes `info`, `outcomes`, and `materials` beneath `LearningObjectBuilderComponent`; `info` remains the compatibility route for the renamed Details tab. `BuilderNavbarComponent` owns navigation, save status, submission, and builder actions.

The Materials page composes `UploadComponent`, which composes `FileManagerComponent`, `FileBrowserComponent`, and the shared `FileListViewComponent`. File and folder row components currently expose Bundle toggles backed by `packageable`. Events bubble to `MaterialsPageComponent`, then dispatch `BUILDER_ACTIONS` to `BuilderStore`, which invokes the file service or saves the learning object. `LearningObject.Material.File` in `src/entity/learning-object/learning-object.ts` is the shared metadata type.

This is cross-cutting UI/state work. It touches shared UI (`file-list-view` and its row components), builder feature components, the entity contract, and store action routing. It does not touch guards, interceptors, environments, build configuration, or API endpoint methods beyond using the existing typed materials save path. Existing classic navigation, upload/edit/delete, preview/download, Bundle, and Notes-slide behavior are explicitly preserved.

## Plan of Work

1. Add an Agentic Builder action in the navbar and a compact accessible popup/panel listing selectable Name, Description, and Learning Outcomes with Generate. POST the selected fields through `LearningObjectService` to the build endpoint.
2. Reorder navbar tabs and rename Basic Information to Details while retaining `info`; adjust builder/column spacing in the touched SCSS so content clears the fixed header intentionally.
3. Remove only the Materials page right-hand `Notes on Materials` column and its now-unused component state/imports. Leave the uploader’s Notes slide unchanged.
4. Add a separate context flag and event path through file manager/browser/list view to file/folder rows. Implement recursive folder propagation for context, individual file changes, tooltip text, and a distinct Context column/control. Do not reuse Bundle events or fields.
5. Persist context updates through `BuilderStore`’s existing learning-object materials update mechanism, maintaining optimistic UI behavior and restoring safe defaults for older files.
6. Pass the optional saved object ID through the name-check route/service so the authenticated backend can enforce the same author-scoped case-insensitive rule as create/update while excluding the current object.
7. Add focused component/store tests where the existing test setup supports them, then run formatting/lint/build or targeted tests and document tooling drift.
8. Expose the fields currently being generated as transient builder state, disable their corresponding controls, and show accessible loading status beside the affected fields until the build request and refresh settle.

## Concrete Steps

From the repository root `/Users/luis/Code/development-environment/clark-client`:

    git status --short --branch
    git diff --check
    npx prettier --check <changed-files>
    npx ng lint clark
    npx jest --runInBand src/app/onion/learning-object-builder/components/builder-navbar/builder-navbar.component.spec.ts src/app/onion/learning-object-builder/pages/materials-page/materials-page.component.spec.ts
    npm run build
    npx ng build clark --configuration=production --optimization=false

Expect the requested branch to be checked out, no whitespace errors, lint to report no new violations, and the non-optimized Angular production build to complete. In this environment the focused Jest command fails before test execution with `configSet.processWithEsbuild is not a function`; optimized build fails only because font inlining cannot resolve `fonts.googleapis.com`.

## Validation and Acceptance

Automated validation should cover navbar labels/order and Agentic panel visibility/action where practical; Materials page rendering should confirm the right-hand notes column is absent; file/folder context events should verify independent file changes, recursive folder changes, and that Bundle events/`packageable` remain separate; store tests should verify materials save payloads include context metadata.

Manual validation on the builder route should verify:

- tabs appear in order Materials, Details, Learning Outcomes; Details navigates to `/info`;
- Agentic Builder has an accessible label/icon, opens a usable panel, exposes Generate and the three supported fields;
- content has visible breathing room below the fixed header at supported desktop/mobile widths;
- Materials has no right-side Notes on Materials box, while the uploader Notes slide still works;
- Context toggles and tooltip are visible in File Explorer, folder selection applies to descendants, individual files can be adjusted afterward, and Bundle remains independently functional;
- existing upload, URL, Notes, file actions, and navigation continue to work.

No guard/access behavior changes are expected. No environment or deploy validation is required beyond the normal production build.

## Idempotence and Recovery

All source edits and plan updates are repeatable. Re-run focused formatting, tests, and build after each logical group. If a partial context implementation fails, preserve the current `packageable` path and remove only the new context event wiring before retrying. Do not reset or discard unrelated worktree changes. The `info` route is retained so navigation can be reverted independently from visible tab labels.

## Artifacts and Notes

- Shortcut story: `https://app.shortcut.com/clarkcan/story/40160`
- Branch: `feature/sc-40160/agentic-builder-update-existing-builder`
- Initial repository state: clean worktree on `main`.
- Backend contract note: the client has no existing Agentic context field or generation endpoint in this feature; the implementation must remain compatible with the existing materials save flow and separate generation stories.

## Interfaces and Dependencies

- `BuilderNavbarComponent` and its standalone imports/template/styles.
- `LearningObjectService` and `LEARNING_OBJECT_ROUTES` build/name-availability route helpers.
- `learning-object-builder.routing.ts` (`info` route retained).
- `MaterialsPageComponent`, `UploadComponent`, `FileManagerComponent`, and `FileBrowserComponent` event chain.
- Shared `FileListViewComponent`, `FileListItemComponent`, and `FolderListItemComponent`.
- `BuilderStore` / `BUILDER_ACTIONS` and existing learning-object save flow.
- `LearningObject.Material.File` entity interface.
- Existing `ToggleSwitchComponent`, `TipDirective`, Angular Material tooltip support, Font Awesome icons, and current Angular/Jest/lint/build tooling.
