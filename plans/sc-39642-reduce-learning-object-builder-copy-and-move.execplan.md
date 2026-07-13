# SC-39642: Reduce Learning Object Builder Copy

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

The Learning Object Builder should be easier for authors to scan. Visible labels, headings, helper text, and action text in `src/app/onion/learning-object-builder` will be shortened where they are wordy, while important supplemental guidance remains available through existing tooltip/help affordances. Submission reason must be explicitly marked optional wherever that field appears. Builder behavior, routes, backend contracts, review rules, release rules, and status workflow remain unchanged.

## Progress

- [x] (2026-07-13T15:16Z) Read `PLANS.md` and confirmed this Shortcut story requires an ExecPlan before implementation.
- [x] (2026-07-13T15:16Z) Started copy inventory under `src/app/onion/learning-object-builder`.
- [x] (2026-07-13T15:30Z) Reviewed builder templates/components for visible wordy copy and existing tooltip/help patterns.
- [x] (2026-07-13T15:50Z) Shortened visible copy and moved supplemental guidance into tooltips or existing note/help UI where appropriate.
- [x] (2026-07-13T15:50Z) Clearly marked submission reason as optional in the status-change modal.
- [x] (2026-07-13T16:05Z) Ran targeted validation attempts and documented repo/tooling blockers.
- [x] (2026-07-13T16:35Z) Restored friendlier Basic Info headings, removed subtitles, fixed info tooltip hosts, and reused shared search/dropdown controls.
- [x] (2026-07-13T16:45Z) Extracted Browse topic pill styling into a shared `clark-pill` component and reused it for builder academic levels.
- [x] (2026-07-13T17:05Z) Made the builder length dropdown non-clearable, hid the Children scaffold for nanomodules, and styled the description editor toolbar locally.
- [x] (2026-07-13T17:30Z) Restored the builder-native name input, added inline red underline validation, and suppressed duplicate name toaster feedback.
- [x] (2026-07-13T17:50Z) Kept inline current-page validation from duplicating as a toaster, fixed length selection while name is invalid, widened the description editor, and moved Basic Info out of internal column scrolling.
- [x] (2026-07-13T18:00Z) Reduced the description editor body height to keep the full Basic Info form visible after removing internal page scroll.
- [x] (2026-07-13T18:05Z) Restored the builder shell to a fixed navbar with a fixed page region below it, using the original calculated column height/offset behavior.
- [x] (2026-07-13T18:15Z) Added optimistic selected-length state so the length dropdown does not revert to nanomodule while store updates settle.
- [x] (2026-07-13T18:25Z) Deferred missing-name validation display until the name field is touched, submission begins, or a locked next-step link is clicked.
- [x] (2026-07-13T18:35Z) Prevented unsaveable early edits from leaving stale save cache/spinner state and included current local object state in the first create request.
- [x] (2026-07-13T18:45Z) Kept the Children scaffold visible for non-nano lengths while preventing child search/update calls before a new learning object has been created.
- [x] (2026-07-13T18:55Z) Preserved pre-name draft fields through first create by merging local draft state into the created object and immediately patching the server object.

## Surprises & Discoveries

- Observation: `package.json` lists Prettier, but the local `node_modules` does not contain `prettier` or `node_modules/.bin/prettier`.
  Evidence: `npx prettier --write ...` attempted to reach `registry.npmjs.org` and failed under restricted network; `ls node_modules/prettier` returned no match.

- Observation: Local build validation is blocked by the shell using unsupported Node `v25.8.2`.
  Evidence: `npm run build` reached `ng build clark`, then aborted with `Abort trap: 6`; `ng version` reports Node `25.8.2 (Unsupported)`, while `package.json` requires Node `^22.13.1`.

- Observation: Repo-wide TypeScript/Jest validation is currently affected by existing test/tooling drift outside this story.
  Evidence: `tsc --noEmit -p tsconfig.json` failed on unrelated missing modules/spec type errors; focused Jest specs failed before executing tests with `TypeError: configSet.processWithEsbuild is not a function`.

- Observation: `clark-search-input` and `clark-dropdown-filter` are already standalone shared components under `src/app/shared/components`.
  Evidence: `src/app/shared/components/search-input/search-input.component.ts` and `src/app/shared/components/dropdown-filter/dropdown-filter.component.ts`.

## Decision Log

- Decision: Treat this as a UI-copy-only story inside the existing builder structure.
  Rationale: Acceptance criteria explicitly exclude backend/API, status workflow, review/release rules, and full redesign changes.
  Date/Author: 2026-07-13 / Codex

- Decision: Stabilize in place and avoid form or component architecture refactors.
  Rationale: The builder has mixed legacy and modern patterns; changing copy should not expand into state, routing, or form modernization.
  Date/Author: 2026-07-13 / Codex

- Decision: Add a small shared `clark-pill` component and update Browse to consume it before using it in the builder.
  Rationale: The requested builder academic-level pills should match the Browse topic pills without duplicating style rules.
  Date/Author: 2026-07-13 / Codex

## Outcomes & Retrospective

Implemented concise Learning Object Builder copy without changing routes, services, API contracts, review/release rules, or status workflow. Visible Basic Info labels now use the friendlier requested question-style headings while subtitles were removed. Key requirements remain marked with red asterisks. Supplemental explanations for contributors, attribution collection name, outcomes, materials notes, and submission reason are available through the existing `tip` directive or collapsed note content. Materials, URL, upload, child deletion, outcome deletion, standard-outcome, disabled-nav, and editor status modal copy were tightened while preserving existing actions. Contributor search now uses `clark-search-input`, length uses `clark-dropdown-filter`, and academic level pills use the shared pill styling extracted from Browse.

Follow-up refinements: required Basic Info fields now use small red asterisks instead of Required badges, name/description info icons were removed, academic level labels are display-title-cased while stored values remain lowercase, the builder length dropdown cannot clear the current selection, length changes remain visually selected while store updates and other inline validation settle, first-create preserves and then patches local length/level/description/material/contributor edits made before naming, Children is visible for non-nano lengths but only searches after a learning object exists, nanomodules hide the Children scaffold, the description rich-text editor has local styling for its toolbar/buttons/editor area, full-width layout, and a shorter body, the builder pages remain fixed below the fixed navbar using the original calculated sizing behavior, missing-name validation waits until the user touches the name field or attempts to continue, and duplicate/current-page validation is shown inline without a duplicate toaster.

## Context and Orientation

This work is local to the Angular Learning Object Builder under `src/app/onion/learning-object-builder`. The builder is routed through `src/app/onion/learning-object-builder/learning-object-builder.routing.ts` and rendered by `src/app/onion/learning-object-builder/learning-object-builder.component.*`, with page-level UI in:

- `src/app/onion/learning-object-builder/pages/info-page`
- `src/app/onion/learning-object-builder/pages/materials-page`
- `src/app/onion/learning-object-builder/pages/outcome-page`
- `src/app/onion/learning-object-builder/components/editor-action-panel`
- `src/app/onion/learning-object-builder/components/content-upload/app`
- `src/app/shared/components/search-input`
- `src/app/shared/components/dropdown-filter`
- `src/app/shared/components/pill`
- `src/app/cube/browse/components/filter`

The current flow uses builder components and `BuilderStore` for state/API interactions. This story should not change `BuilderStore`, route guards, API services, request/response types, environment files, or backend routes. Existing copy appears in Angular templates, component string constants, and editor/status modal templates. Shared UI reuse is limited to standalone components and does not change API behavior.

## Plan of Work

Inspect visible copy in builder templates and component constants. Prefer concise visible copy for field labels, helper text, empty states, buttons, and action labels. Preserve meaning by moving secondary details into existing tooltip or help UI when a user needs context but not constant on-screen instruction. Mark optional fields directly in their label or nearby visual affordance, especially the submission reason field in the status-change modal. Keep edits scoped to copy/templates/styles only unless a tiny component property is necessary to support tooltip text.

For the Basic Info page, preserve the friendlier question-style headings requested by the user while removing the subtitles. Use stable wrapper elements for `tip` so FontAwesome icon replacement does not interfere with tooltip hover behavior.

In scope:

- Concise wording in builder page labels, helper text, empty states, and status/modal copy.
- Tooltip/help text tied to relevant fields/actions.
- Optional/required visibility improvements where fields already exist.
- Shared component reuse for contributor search, length dropdown, and pill styling.
- Targeted tests or build validation.

Out of scope:

- Routing changes.
- Guard/interceptor changes.
- Backend route or API contract changes.
- Builder state, review/release workflow, or status workflow changes.
- Broad UI redesign or form migration.

## Concrete Steps

From the repository root, run:

    rg -n "[A-Za-z][A-Za-z ,.'!?;:()/-]{35,}" src/app/onion/learning-object-builder

Expect: A copy inventory that identifies long visible strings and ignores code comments/imports unless they are user-facing.

From the repository root, run:

    rg -n "reason|optional|required|tooltip|matTooltip|tip=|placeholder|Please|Select|Enter|provide|explain" src/app/onion/learning-object-builder

Expect: Candidate fields/actions where optional/required language and tooltip placement should be reviewed.

After edits, run the most focused available validation for touched specs, then a broader build/test command if practical after inspecting `package.json`.

Validation attempts run:

    npm run build

Result: blocked by unsupported Node `v25.8.2` and `ng build clark` aborting.

    ./node_modules/.bin/tsc --noEmit -p tsconfig.json

    ./node_modules/.bin/tsc --noEmit -p tsconfig.json --pretty false

Result: blocked by pre-existing repo-wide type/spec drift outside this story.

    ./node_modules/.bin/jest --runInBand src/app/onion/learning-object-builder/pages/info-page/info-page.component.spec.ts src/app/onion/learning-object-builder/pages/outcome-page/outcome-page.component.spec.ts src/app/onion/learning-object-builder/components/material-notes/material-notes.component.spec.ts src/app/onion/learning-object-builder/components/editor-action-panel/change-status-modal/change-status-modal.component.spec.ts

Result: blocked before tests execute by Jest/Angular preset drift.

## Validation and Acceptance

Automated validation should prove the Angular templates still compile and affected component tests still pass where local specs exist. Manual validation should review the Learning Object Builder screens for:

- Shorter visible Basic Info labels/helper text.
- Materials guidance still available without crowding the page.
- Outcome empty-state copy remains clear.
- Submission reason is visibly optional.
- Required and optional fields are visually distinguishable where touched.
- Buttons/actions remain understandable.
- No changes to save/submit/status behavior.

No backend, route, guard, interceptor, environment, or API contract validation is expected because those layers are intentionally untouched.

## Idempotence and Recovery

Copy/template edits are safe to repeat. If validation fails, inspect the relevant template and module imports first, especially if adding a tooltip directive requires an existing module import. Recover by reverting only the story-specific copy changes in touched files, preserving unrelated user changes in the worktree.

## Artifacts and Notes

Initial likely hotspots:

- `src/app/onion/learning-object-builder/pages/info-page/info-page.copy.ts`
- `src/app/onion/learning-object-builder/pages/info-page/info-page.component.html`
- `src/app/onion/learning-object-builder/pages/materials-page/materials-page.component.ts`
- `src/app/onion/learning-object-builder/pages/outcome-page/outcome-page.component.html`
- `src/app/onion/learning-object-builder/components/editor-action-panel/change-status-modal/change-status-modal.component.html`
- `src/app/onion/learning-object-builder/components/content-upload/app/upload/upload.component.*`
- `src/app/onion/learning-object-builder/components/user-dropdown/user-dropdown.component.*`
- `src/app/shared/components/pill/pill.component.*`
- `src/app/cube/browse/components/filter/filter.component.*`

Validation note: Re-run build/tests in a Node 22 environment with dependencies restored, especially Prettier and the Jest/Angular preset pairing.

## Interfaces and Dependencies

Affected interfaces are Angular component templates, string constants, and standalone shared UI components only. No service/API interfaces, guards, interceptors, entities, route definitions, environment files, or external dependencies should change.
