# SC-388324: Create child learning objects from the parent builder

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Authors currently build learning-object hierarchies primarily from the bottom up: they create smaller learning objects independently, open a larger parent, search for those existing objects, and attach them. This story adds a top-down workflow at `/onion/learning-object-builder`: an author can start from an unreleased parent, create a new child from the hierarchy panel, automatically attach it, and continue editing the child in a separate builder tab or window while leaving the parent builder open.

The existing add-existing-child search remains available, including released learning objects. A newly created child starts unreleased, receives an editable default name in the form `<parent name> Child #<current child count + 1>`, and defaults to the length immediately below its parent in this order: Course, Unit, Module, Micromodule, Nanomodule. The UI must distinguish creation, attachment, and hierarchy-refresh failures because these are separate frontend operations and a created child must never be silently lost.

## Progress

- [x] (2026-07-24 16:22Z) Read `AGENTS.md` and `PLANS.md`, reviewed the story and product clarifications, and identified the builder hierarchy components and existing service routes.
- [x] (2026-07-24 16:22Z) Recorded the initial implementation decisions and phased delivery strategy in this ExecPlan before changing application code.
- [x] (2026-07-24 16:24Z) Ran the focused Jest baseline for `ScaffoldComponent` and `AddChildComponent`; both suites are blocked before test execution by the repository's existing Jest/Angular transformer incompatibility.
- [x] (2026-07-24 16:43Z) Phase 1: made Add Child persistent, removed the Add/Delete toggle/edit state, rendered the panel for Nanomodules with an explained disabled action, moved reorder left, kept delete right, and added focused scaffold expectations.
- [ ] Phase 2: introduce Create New and Add Existing paths while preserving existing search/attachment behavior, then validate independently.
- [ ] Phase 3: implement successful create, attach, refresh, and child-builder opening behavior, then validate independently.
- [ ] Phase 4: implement duplicate-submit protection and recoverable create/attach/refresh failure states, then validate independently.
- [ ] Run final focused tests, lint/build validation, and manual acceptance checks.

## Surprises & Discoveries

- Observation: The Info, Outcomes, and Materials pages currently remove `clark-scaffold` entirely for Nanomodules.
  Evidence: Each page guards the component with `*ngIf="learningObject?.length !== 'nanomodule'"`. Meeting the disabled-action acceptance criterion requires keeping the hierarchy panel rendered for Nanomodules.

- Observation: `scaffold.component.html` contains a “Nanomodules cannot have children” message, but normal builder pages currently prevent that branch from rendering.
  Evidence: The parent-page guards remove the component before its internal Nanomodule branch can display.

- Observation: The existing add-child search performs two requests: a draft-only request and a broader request, then filters both result sets locally.
  Evidence: `add-child.component.ts` calls `SearchService.getUsersLearningObjects` once with `draftsOnly: true` and once without that flag. The released-object path must be preserved and duplicate results should be considered during implementation.

- Observation: The current hierarchy row uses the Add/Delete toggle to swap the hamburger and delete controls.
  Evidence: `scaffold.component.html` changes their display from `editContent`; this state can be removed when both controls become persistent.

- Observation: Repository test configuration is split between Jest and Karma.
  Evidence: `jest.config.js` and Jest dependencies exist, the `test:unit` script only targets unrelated suites, while `angular.json` still defines the Angular `test` target with Karma.

- Observation: The focused Jest baseline cannot currently initialize Angular tests.
  Evidence: Both nearby suites fail from `src/setup-jest.ts` with `TypeError: configSet.processWithEsbuild is not a function` inside `jest-preset-angular` before any test executes. This is repository test-tooling drift, not a story regression; story validation will use build/lint checks and focused tests once a safe local test configuration is identified.

- Observation: The declared Prettier version is not installed in the current local `node_modules`.
  Evidence: `npx prettier --check plans/sc-388324-create-children-from-parent-builder.execplan.md` attempted to reach the npm registry and failed with `ENOTFOUND`. `git diff --check` succeeds, so the plan has no whitespace errors; dependency installation was not attempted because it is not required for the planning checkpoint.

- Observation: The Angular application builder aborts in the current environment without a diagnostic after printing `Building...`.
  Evidence: Both `./node_modules/.bin/ng build clark` and a retry with `NG_BUILD_MAX_WORKERS=2` exit with code 134. Running the Angular compiler directly with `./node_modules/.bin/ngc -p src/tsconfig.app.json` succeeds, including template compilation for the Phase 1 changes.

- Observation: Opening a new window only after asynchronous create and attach calls may trigger browser popup blocking.
  Evidence: The new browsing context is no longer directly opened during the user's activation event. Implementation should reserve or otherwise open the context during the submit activation and navigate it after success, while keeping failure recovery usable.

## Decision Log

- Decision: Deliver the story in independently testable phases instead of one broad implementation pass.
  Rationale: The hierarchy panel, add-child choice UI, successful orchestration, and partial-failure recovery each have separable behavior and risk.
  Date/Author: 2026-07-24 / Codex

- Decision: Keep the `clark-scaffold` name and stabilize/modernize only the touched hierarchy behavior.
  Rationale: Renaming is explicitly out of scope and would create unrelated template/import churn.
  Date/Author: 2026-07-24 / Codex

- Decision: Present Create New and Add Existing as distinct paths within the existing add-child component.
  Rationale: This preserves the current search workflow while giving the top-down workflow a clear entry point in the same popup.
  Date/Author: 2026-07-24 / Codex

- Decision: Use an editable default name of `<parent name> Child #<current child count + 1>`.
  Rationale: This is the product-approved format and gives each creation attempt a useful starting name. Existing name-availability behavior will be reused so collisions are not submitted silently.
  Date/Author: 2026-07-24 / Codex

- Decision: Default child length according to Course → Unit → Module → Micromodule → Nanomodule.
  Rationale: This is the confirmed learning-object length sequence. The default does not impose an exact-length hierarchy restriction; the author may change it later in the child builder.
  Date/Author: 2026-07-24 / Codex

- Decision: After removing the Add/Delete toggle, keep the reorder handle permanently visible to the left of the child name and the delete action permanently visible on the right.
  Rationale: This preserves reorder and deletion capabilities and satisfies the new handle-position criterion.
  Date/Author: 2026-07-24 / Codex

- Decision: Do not add backend routes or new client-side hierarchy validation beyond preventing Nanomodules from adding children.
  Rationale: Existing create and attach routes are sufficient, and backend hierarchy validation and release rules are explicitly out of scope.
  Date/Author: 2026-07-24 / Codex

## Outcomes & Retrospective

Phase 1 is complete. The hierarchy panel now remains present for Nanomodules, Add Child is persistent and explains both Nanomodule and unsaved-parent disabled states, the toggle-specific component state/imports are removed, and each child row permanently exposes reorder on the left and delete on the right. Existing loading, search-popup, reorder, and deletion operations remain in place.

Validation at this checkpoint:

- Focused ESLint over all touched TypeScript and Angular templates passes.
- Angular compilation via `ngc -p src/tsconfig.app.json` passes.
- `git diff --check` passes.
- Focused Jest remains blocked before execution by the recorded `jest-preset-angular` transformer incompatibility.
- Repository-wide spec type-check remains blocked by unrelated legacy spec errors and reports no Phase 1 file errors.
- The Angular application builder aborts with exit 134 in this environment, as recorded above.

## Context and Orientation

The lazy-loaded builder is registered in `src/app/onion/onion.routing.ts` at `learning-object-builder` for a new object and `learning-object-builder/:cuid/:version` for an existing object. `src/app/onion/learning-object-builder/learning-object-builder.component.ts` owns the builder-scoped `BuilderStore`. Its child routes render the Info, Outcomes, and Materials pages.

The left hierarchy panel is `ScaffoldComponent` in:

- `src/app/onion/learning-object-builder/components/scaffold/scaffold.component.ts`
- `src/app/onion/learning-object-builder/components/scaffold/scaffold.component.html`
- `src/app/onion/learning-object-builder/components/scaffold/scaffold.component.scss`

It receives the current `LearningObject`, loads children through `BuilderStore.getChildren()`, attaches/reorders through `BuilderStore.setChildren()`, and opens the teleported `AddChildComponent`. The Info, Outcomes, and Materials page templates host this panel; all three currently suppress it for Nanomodules.

The existing add-child search is implemented in:

- `src/app/onion/learning-object-builder/components/scaffold/add-child/add-child.component.ts`
- `src/app/onion/learning-object-builder/components/scaffold/add-child/add-child.component.html`
- `src/app/onion/learning-object-builder/components/scaffold/add-child/add-child.component.scss`

It searches the current author's objects through `src/app/core/learning-object-module/search/search.service.ts` and emits a selected `LearningObject` to `ScaffoldComponent`, which appends the child ID through the store.

Existing API operations are exposed by `src/app/core/learning-object-module/learning-object/learning-object.service.ts`:

- `create(learningObject)` posts to the existing create-learning-object route and returns a `LearningObject`.
- `setChildren(parentId, childrenIds, false)` posts child IDs to the existing attach route.

`src/app/onion/learning-object-builder/builder-store.service.ts` currently wraps child loading and attachment, but its object-creation method is private and coupled to autosave state. The implementation must use a service/store boundary that makes create → attach → refresh explicit and observable to the add-child UI without duplicating HTTP calls inside a component.

`src/entity/learning-object/learning-object.ts` supplies defaults, including unreleased status and Nanomodule length. New-child payload construction should use the existing entity/type rather than an untyped duplicate shape where practical.

This work is local to the learning-object builder and its existing learning-object service boundary. It changes feature UI and builder state orchestration, but does not change application routing, guards, interceptors, shared UI contracts, environments, build behavior, backend APIs, release workflow, or full-hierarchy release behavior.

## Plan of Work

Phase 0 establishes the plan and baseline. Run the two nearby component suites directly with Jest because the repository `test:unit` script does not include them. Record pre-existing failures rather than conflating them with story regressions.

Phase 1 changes only the hierarchy panel. Render it on all three builder pages regardless of length. Remove the Add/Delete toggle and its edit state, display Add Child persistently, and disable it for Nanomodules with accessible explanatory text. Rework each child row so the drag handle precedes the learning-object information and the delete button remains at the right. Preserve loading, drag/drop, deletion confirmation, and click-away behavior. Add focused component tests for persistent controls, Nanomodule disabled behavior, and row layout/operations.

Phase 2 changes the existing `AddChildComponent` into a two-path UI without adding create orchestration yet. Add clear Create New and Add Existing choices. Preserve the current existing-object search and attachment event, including released results. Keep current permissible smaller-length behavior; do not narrow existing attachment to exactly one level below the parent. Add focused tests for path switching, search result behavior, and existing-child emission.

Phase 3 implements creation success behavior through the existing learning-object service/API. Construct an unreleased child with the approved editable default name and one-level-lower default length. Validate the name using the existing availability method before allowing submission. Prevent Nanomodule parents from entering this path. On submit, establish a child browsing context in a popup-safe way, create the child, attach its ID to the current parent, reload the authoritative parent hierarchy, update the displayed children, and navigate the separate context to `/onion/learning-object-builder/:cuid/:version`. Keep the parent builder interactive after completion.

Phase 4 models the operation as explicit stages so failures cannot erase a successfully created child. Disable duplicate submission while an operation is active. A create failure must stop before attachment. An attach failure must retain the created child object/ID and expose Open Child and Retry Attach actions. A refresh failure after successful attachment must explain that attachment succeeded and expose Retry Refresh. Successful retries must converge on the same final hierarchy without creating another child or attaching duplicates. Add unit tests for each transition.

After all phases, run focused Jest suites, lint touched files or the supported project lint target, and a development build if the local environment supports it. Perform manual browser checks for the complete acceptance list, especially popup behavior and parent/child tab independence.

## Concrete Steps

From the repository root, establish the component-test baseline:

    npx jest --no-watchman --runInBand \
      src/app/onion/learning-object-builder/components/scaffold/scaffold.component.spec.ts \
      src/app/onion/learning-object-builder/components/scaffold/add-child/add-child.component.spec.ts

Expect the suites either to pass or to reveal existing dependency/setup gaps that are recorded under Surprises & Discoveries before application changes.

After each phase, rerun those focused suites. Add any new orchestration/store spec path to the command once the implementation location is selected.

Format only touched story files:

    npx prettier --check \
      plans/sc-388324-create-children-from-parent-builder.execplan.md \
      src/app/onion/learning-object-builder/components/scaffold

Run project lint after implementation:

    npm run lint

Run a development build after implementation:

    npm run build

The build script regenerates `src/commit-hash.ts`; inspect `git status` afterward and do not overwrite unrelated user work.

## Validation and Acceptance

Automated hierarchy-panel tests must prove:

- Add/Delete toggle is absent.
- Add Child is always present for a saved parent.
- Add Child is disabled for a Nanomodule and communicates why.
- Reorder handle renders before the child name/information.
- Delete remains available and retains confirmation/removal behavior.
- Drag/drop still sends the ordered child IDs.

Automated add-child tests must prove:

- Create New and Add Existing paths are both reachable.
- Existing search still returns/accepts eligible draft and released objects.
- Selecting an existing child still attaches it without invoking create.
- New child name defaults to `<parent name> Child #<current child count + 1>` and is editable.
- New child length defaults one level below its parent across all four creatable parent lengths.
- Create is called once and attach is not called until create resolves.
- Successful attach triggers authoritative hierarchy refresh.
- Successful completion opens the returned child CUID/version in a separate builder context.
- Loading disables repeated submission.
- Create failure does not attach.
- Attach failure retains the created object and supports Open Child and Retry Attach.
- Refresh failure retains successful attachment state and supports Retry Refresh.
- Retries do not create an additional child or silently discard the child ID.

Manual browser validation at `/onion/learning-object-builder/:cuid/:version/info` must cover:

- Course, Unit, Module, and Micromodule parents.
- Nanomodule disabled Add Child explanation.
- Existing draft and released child attachment.
- New-child default name and length.
- Parent hierarchy refresh after successful attachment.
- New child opening separately while the parent remains usable.
- Simulated create, attach, and refresh failures where feasible through request interception or mocked local responses.
- Info, Outcomes, and Materials pages continuing to show a consistent hierarchy panel.

No routing or auth behavior should change: the existing `AuthGuard` continues to protect both builder routes.

## Idempotence and Recovery

UI and test edits are safe to rerun. Keep each phase in a coherent state and update Progress before pausing.

Creation recovery must be idempotent at the UI level:

- Before create succeeds, retry may issue a new create request.
- After create succeeds, retain the returned `LearningObject` and retry only attachment.
- After attachment succeeds, retry only hierarchy refresh.
- Never return to the initial create action unless the user explicitly starts a separate new-child flow.

If a reserved child window cannot be used, the parent UI must still retain an explicit Open Child action with the known CUID/version. If popup blocking prevents automatic opening, display recoverable guidance rather than treating the create/attach result as failed.

If implementation stops mid-phase, consult Progress and Decision Log, inspect `git diff`, and resume at the first unchecked item. Do not rename `clark-scaffold`, migrate unrelated builder architecture, or modify backend/environment files as recovery shortcuts.

## Artifacts and Notes

Story: Shortcut SC-388324, “create a new child learning object directly from the parent builder hierarchy panel.”

Confirmed product decisions:

- Length sequence: Course, Unit, Module, Micromodule, Nanomodule.
- Default child length: one level below parent.
- Default editable name: `<parent name> Child #<current child count + 1>`.
- New child opens in a separate builder window/tab.
- Existing-child search remains available.
- Released learning objects remain attachable to unreleased parents.
- The story does not restrict children to exactly one level below the parent.
- Reorder is always visible on the left; delete remains visible on the right.

Out of scope:

- Backend routes or validation changes.
- Release validation or content-status workflow changes.
- Hiding accepted/proofing statuses.
- Full-hierarchy release changes.
- Renaming `clark-scaffold`.
- Unrelated builder UI cleanup.

## Interfaces and Dependencies

Expected touched components and tests:

- `src/app/onion/learning-object-builder/components/scaffold/scaffold.component.{ts,html,scss,spec.ts}`
- `src/app/onion/learning-object-builder/components/scaffold/add-child/add-child.component.{ts,html,scss,spec.ts}`
- `src/app/onion/learning-object-builder/pages/info-page/info-page.component.html`
- `src/app/onion/learning-object-builder/pages/outcome-page/outcome-page.component.html`
- `src/app/onion/learning-object-builder/pages/materials-page/materials-page.component.html`

Expected service/store dependencies:

- `src/app/onion/learning-object-builder/builder-store.service.ts`
- `src/app/core/learning-object-module/learning-object/learning-object.service.ts`
- `src/app/core/learning-object-module/search/search.service.ts`
- `src/entity/learning-object/learning-object.ts`

Routing context, not expected to change:

- `src/app/onion/onion.routing.ts`
- `src/app/onion/learning-object-builder/learning-object-builder.routing.ts`

No guards, interceptors, shared UI components, environment files, build configuration, or external packages are expected to change.
