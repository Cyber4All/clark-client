# SC-40236: Create a New Learning Object as a Child in the Hierarchy Builder

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

Story: https://app.shortcut.com/clarkcan/story/40236 (epic 39262, Builder - Hierarchy Manager, estimate 3). Branch: `feature/sc-40236/create-a-new-learning-object-as-a-child-in-the`, created from `feature/sc-40642/remove-and-reorganize-children-in-the`, so it contains the SC-40642 edit service and the SC-40640 loader. Related stories: SC-40237 (add an existing object from the library; not in this story), SC-40239 (deprecate `hierarchy-service`), SC-40641 (explicit link metadata).

## Purpose / Big Picture

Today the Hierarchy tab can load, move, and remove children, but an author cannot make a new learning object from it. The node Action Menu has only "Move Object" and "Remove from Hierarchy". `NodeActionId` already reserves `"add-child"` and `AddChildAction` reserves `"create-new" | "add-existing"`.

After this story, on the Builder Hierarchy tab:

- An editable parent (one that can hold children, so not a Nanomodule) has an "Add Child Object" item in its Action Menu.
- Choosing it opens a dialog where the author picks a valid child length and types a name.
- Confirming creates the learning object, attaches it to that parent, and shows it as the parent's last child. This is saved immediately.
- If the save fails, the tree is unchanged, the author sees an error, and nothing new is left behind in the library when we can avoid it.
- The new object appears in the author's library (the Dashboard list).
- Each editable node has an "Edit in Builder" action that opens that learning object's Builder in a new browser tab, so the author can fill in the new child there.
- If the child is later removed from the hierarchy (SC-40642), it stays in the library.

Permissions are unchanged. The client keeps the SC-40640 editable heuristic and treats the API (403) as the real gate. A new child is created by the signed-in author, so it is editable.

Out of scope: adding an existing library object (SC-40237), reorder, re-parenting changes, linked-object metadata (SC-40641), and any change to `LearningObjectService` beyond what is listed below.

## Progress

- [x] (2026-11-13) Read `PLANS.md`, `AGENTS.md`, the Shortcut story, and the SC-40642 ExecPlan.
- [x] (2026-11-13) Created branch `feature/sc-40236/create-a-new-learning-object-as-a-child-in-the` from the current branch `feature/sc-40642/remove-and-reorganize-children-in-the`.
- [x] (2026-11-13) Read the hierarchy tree, node, view service, edit service, loader, mapper, length util, builder store create flow, `LearningObjectService`, and the gateway and clark-service create/update/children routes (see Surprises & Discoveries).
- [x] (2026-11-13) Wrote this plan.
- [x] (2026-11-13) Baseline: 10 hierarchy-tree suites, 184 tests pass.
- [x] (2026-11-13) Story owner answered the open questions (see Decision Log). The uncommitted SC-40642 code (remove-confirmation dialog, tree component and spec edits) was committed to `feature/sc-40642/remove-and-reorganize-children-in-the` as `66fc9e9a5`, and this branch was fast-forwarded onto it. The SC-40642 plan edit and `package-lock.json` were left uncommitted on purpose.
- [ ] Types and mapper: carry `cuid` and `version` on `HierarchyNode` so a node can link to its Builder.
- [ ] Edit service: `create(parentNodeId, { name, length })`.
- [ ] View service: add a child node under a parent (`addChild`), reusing the occurrence key rule.
- [ ] Create dialog component (`hierarchy-add-child`), wired into the tree like the remove confirmation.
- [ ] Node component: "Add Child Object" and "Edit in Builder" menu items.
- [ ] Specs for each of the above.
- [ ] Browser check with Playwright against a mocked gateway (desktop and 390px), then a run against the real gateway and clark-service.

## Surprises & Discoveries

- Observation: The create route cannot set a length. `POST /learning-objects` reads only `req.body.object.name` and always creates a Nanomodule with an empty shell. A length change needs a second call, `PATCH /learning-objects/:id` with `updates.length`.
  Evidence: `clark-service/src/modules/learning-object-module/dtos/create-learning-object.dto.ts` (reads `name` and the requestor only) and `learning-object.component.ts` `createLearningObject` (hard-codes `length: LearningObjectLength.NANOMODULE`). The existing Builder does the same two steps: `BuilderStore.createLearningObject` calls `create` then `updateLearningObject(getPostCreateUpdatePayload(...))`, which sends `length`.
- Observation: Creating a child is therefore three non-atomic calls: create (name), save (length), then attach (`POST /learning-objects/:parentId/children` with `{ childrenIds: [id] }`). If any later call fails, the library holds a learning object the author never saw in the tree.
  Evidence: the routes above. The gateway lists all three as `auth: true`.
- Observation: The server validates the name on create: `@IsValidLearningObjectName()`, a regex rejecting `\ / " * |`, and a per-author uniqueness check (`validateLearningObjectNameUniqueness`). Requests also fail when the requestor's email is not verified (403). The client already has `LearningObjectService.checkNameAvailability` (used by the Info page) for an up-front duplicate check.
  Evidence: `create-learning-object.dto.ts`, `learning-object.component.ts` lines ~1360-1400, `learning-object.routes.ts` `CHECK_NAME_AVAILABILITY`, `info-page.component.ts` line ~164.
- Observation: The server does not validate length against children on add. It only checks that the child exists and that the requestor can write to the parent. The client rules (`canHaveChildren`, `isValidChildLength`) are the only guard, as noted in SC-40642.
- Observation: `LearningObjectService.create` resolves with a `LearningObject` (it maps `_id` to `id`) and also fires an un-awaited `userService.getUser` to fill in the author. The returned object has `id`, `cuid`, and `version` (0), which is all the tree needs.
  Evidence: `learning-object.service.ts` lines ~499-523.
- Observation: The Builder URL is `/onion/learning-object-builder/:cuid/:version` (`onion.routing.ts`; `EditorialService` builds the same string). `HierarchyNode` has no `cuid` or `version` today, so there is nothing to build a link from. `toHierarchyNode` drops both.
- Observation: The Dashboard "New" button (`dashboard/components/list/list.component.html`) only does `routerLink="/onion/learning-object-builder"`. The Builder component then calls `createAndRouteToNewLearningObject()`, which calls `BuilderStore.makeNew()`. That builds a blank `LearningObject`, calls `LearningObjectService.create(object)` (`POST /learning-objects`, status `UNRELEASED`), merges the response, and sends any remaining fields (`name`, `length`, ...) with `updateLearningObject` -> `LearningObjectService.save`. It then routes to `/onion/learning-object-builder/:cuid/:version/materials`. Errors: 400 maps to the special-character name message, anything else to `BUILDER_ERRORS.CREATE_OBJECT`.
  Evidence: `learning-object-builder.component.ts` lines ~248-275, `builder-store.service.ts` `makeNew`, `createLearningObject`, `getPostCreateUpdatePayload`.
- Observation: The tree has no create or "open in Builder" affordance yet, and the old scaffold "Add child" (`components/scaffold/add-child`) is the library search flow for SC-40237, not a create flow. It also keeps its own copy of the length ladder (`lengths` array), which the plan does not touch.
- Observation: When this branch was created, the SC-40642 removal-confirmation dialog was still uncommitted. It is now committed on the SC-40642 branch (`66fc9e9a5`) and this branch sits on top of it. `package-lock.json` and the SC-40642 plan edit remain uncommitted and unrelated to this story.

## Decision Log

- Decision: Create the learning object, set its length, and attach it in one orchestrated flow inside `HierarchyEditService.create`, reusing `LearningObjectService.create`, `.save`, and `.setChildren`. No new routes and no new HTTP methods.
  Rationale: The routes and service methods exist and are what the Builder already uses. Matches the SC-40642 decision to wrap the Promise-based service with `from(...)` rather than modernize it here.
  Date/Author: 2026-11-13 / Kiro

- Decision: Create the object the same way the Dashboard does, by calling `LearningObjectService.create` then `LearningObjectService.save` (as `BuilderStore` does), but NOT through `BuilderStore`.
  Rationale: Story owner asked to reuse the existing Dashboard create path. The Dashboard path is `BuilderStore.makeNew()`, which writes the new object into the open Builder's state (`learningObject`, `learningObjectEvent`, validator errors) and is tied to the Builder route. Calling it from the Hierarchy tab would replace the object being edited. The shared piece is the service call, so this flow reuses that and keeps the same payload shape (`status: UNRELEASED`, name, then `length` in the follow-up `save`).
  Date/Author: 2026-11-13 / Kiro

- Decision: Do not insert the new row optimistically. The dialog stays open in a saving state until all calls succeed; then the tree gets the new node. On failure the tree was never changed.
  Rationale: The node needs the server-assigned id and cuid, so an optimistic row would have to be a placeholder with no id that could not be opened or moved. Waiting makes the result match the story's intent (the UI shows only what was saved; a failure leaves the tree as it was) with less state. The cost is a short wait with a disabled button and busy label. This is a deliberate reading of "roll back the UI". Approved by the story owner on 2026-11-13, who will test it later.
  Date/Author: 2026-11-13 / Kiro

- Decision: On a partial failure (created, but length or attach failed), try to delete the object we just created, and show an error either way. If the delete also fails, tell the author the object was created and is in their library, and reload the hierarchy only when attach may have succeeded.
  Rationale: Leaving an unnamed-length orphan in the library for every failed attempt is worse than a best-effort delete of an object the author made seconds ago and never saw. This is the same "undo, else tell the truth" approach as the SC-40642 re-parent. Deleting a just-created, unattached, empty object is the only destructive call here, so it is limited to the id returned by this flow's own create call. Approved by the story owner on 2026-11-13.
  Date/Author: 2026-11-13 / Kiro

- Decision: Reuse the single in-flight lock of `HierarchyEditService` (`saving$`, `busy` refusal) for create, so a create, a move, and a remove never overlap.
  Rationale: Same reasoning as SC-40642. The tree is only changed after the API calls succeed, but a concurrent move could change or remove the parent while the create is in flight.
  Date/Author: 2026-11-13 / Kiro

- Decision: Offer only lengths strictly shorter than the parent, taken from `LENGTH_ORDER` and `isValidChildLength` in `hierarchy-length.util.ts`. The default selection is the longest valid length. "Add Child Object" is disabled for a parent that cannot have children (Nanomodule) and for non-editable parents.
  Rationale: One source of truth for the hierarchy length rule, already used by `canDrop`. No new hard-coded ladder.
  Date/Author: 2026-11-13 / Kiro

- Decision: Name rules in the dialog: required after trimming; reject `\ / " * |` with the same message the server uses; check duplicates with `LearningObjectService.checkNameAvailability` on confirm, and still handle a 400 or 409 from create as an inline error.
  Rationale: Server rules are the authority, so the client mirrors them only to give a fast, specific message. The up-front check avoids creating then failing on a duplicate name.
  Date/Author: 2026-11-13 / Kiro

- Decision: Build the dialog as a standalone component opened in a CDK overlay from the tree, exactly like `HierarchyRemoveConfirmComponent`, and use a reactive form (a `FormControl` for the name and one for the length).
  Rationale: Follows the repo's established pattern in this feature and the AGENTS.md preference for reactive forms in new work. No Angular Material dialog is used elsewhere in these files.
  Date/Author: 2026-11-13 / Kiro

- Decision: The "Edit in Builder" action (confirmed in the Action Menu by the story owner, 2026-11-13) opens `/onion/learning-object-builder/:cuid/:version` in a new tab (`window.open(url, "_blank", "noopener")`), only for editable nodes. It is added to the Action Menu rather than as a separate row control.
  Rationale: The story says "open the new child in the Builder in a separate tab from its node". A menu item reuses the existing row affordance. Read-only (linked) nodes are not editable, so the item is disabled for them, matching "Permissions are unchanged".
  Date/Author: 2026-11-13 / Kiro

## Outcomes & Retrospective

Not started.

## Context and Orientation

Scope: local to the Builder Hierarchy feature. Touches `src/app/onion/learning-object-builder/components/hierarchy-tree/**`. Does NOT touch routing modules, guards, interceptors, shared UI modules, environment, or build config. No API contract change: it calls existing gateway routes through the existing `LearningObjectService`. It does change types (`HierarchyNode` gains `cuid` and `version`) and state ownership stays the same (`HierarchyViewService` holds the tree; `HierarchyEditService` owns persistence).

Interaction flow after this story:

1. Route `.../learning-object-builder/hierarchy` renders `pages/hierarchy-page/hierarchy-page.component.ts`, which already provides `HierarchyViewService`, `HierarchyLoaderService`, and `HierarchyEditService` (no change needed).
2. The author opens a node's Action Menu and chooses "Add Child Object". `HierarchyNodeComponent` emits `menuAction { actionId: "add-child", nodeId }`; `HierarchyTreeComponent.onMenuAction` opens `HierarchyAddChildComponent` in a CDK overlay (same mechanism as the remove confirmation).
3. The dialog collects `{ name, length }` and emits `confirm`. The tree calls `HierarchyEditService.create(nodeId, request)`.
4. `HierarchyEditService.create` checks the lock, checks the parent can take the length, then: `checkNameAvailability` (when the name is not blank), `create(name)`, `save(id, { length })`, `setChildren(parentLearningObjectId, [id], false)`. On success it asks `HierarchyViewService.addChild` to append the node under the parent and expands the parent.
5. The tree shows a success toast and announcement, closes the dialog, and moves focus to the new row. On failure the dialog stays open with an inline error and a toast.
6. "Edit in Builder" on a row opens the Builder for that object in a new tab.

API calls used (all existing):

- Check name: `GET ${apiURL}/learning-objects/name/check/{name}` (`LearningObjectService.checkNameAvailability`).
- Create shell: `POST ${apiURL}/learning-objects` body `{ object: { name } }` (`LearningObjectService.create`). Always a Nanomodule on the server.
- Set length: `PATCH ${apiURL}/learning-objects/{id}` body `{ updates: { length } }` (`LearningObjectService.save`).
- Attach: `POST ${apiURL}/learning-objects/{parentId}/children` body `{ childrenIds: [id] }` (`LearningObjectService.setChildren(..., false)`).
- Compensation: `DELETE ${apiURL}/learning-objects/{id}` (`LearningObjectService.delete`), only for the object this flow created.

Affected files (planned):

- `components/hierarchy-tree/hierarchy-tree.types.ts` (`HierarchyNode.cuid?`, `HierarchyNode.version?`; remove the stale "mock/local data" wording if touched; `AddChildAction` stays for SC-40237)
- `components/hierarchy-tree/hierarchy-node.mapper.ts` (carry `cuid` and `version`)
- `components/hierarchy-tree/hierarchy-loader.service.ts` (root node gets `cuid` and `version` from the loaded object)
- `components/hierarchy-tree/hierarchy-view.service.ts` (`addChild`)
- `components/hierarchy-tree/hierarchy-edit.service.ts` (`create`; extends `HierarchyEditOutcome` or adds a sibling outcome type for the created node)
- `components/hierarchy-tree/hierarchy-add-child/` (new: component, template, styles, spec)
- `components/hierarchy-tree/hierarchy-tree.component.ts` (open the dialog, call `create`, toasts, focus, "Edit in Builder" handler)
- `components/hierarchy-tree/hierarchy-node/hierarchy-node.component.{ts,html}` (two menu items)
- Specs: `hierarchy-edit.service.spec.ts`, `hierarchy-view.service.spec.ts`, `hierarchy-node.mapper.spec.ts`, `hierarchy-loader.service.spec.ts`, `hierarchy-tree.component.spec.ts`, `hierarchy-node.component.spec.ts`, and the new dialog spec. Test data helpers in `hierarchy-test-data.ts` and `hierarchy-arbitraries.ts` need the two new optional fields only if a spec uses them.

Library visibility: the Dashboard lists the author's objects from the API, so no client change is needed for "appears in the library". The Playwright check confirms the create request and a fresh dashboard load; the real-gateway run confirms the object actually shows up.

Legacy and drift to name:

- `LearningObjectService` is Promise-based (`toPromise()` inside) and `create` returns before its author lookup finishes. Left as is; wrapped with `from(...)` like SC-40642.
- The create route cannot set length, so creation is three calls. A server-side "create with length" would be better but is a backend change outside this story.
- The scaffold `AddChildComponent` (`components/scaffold/add-child`) has its own length ladder and is the SC-40237 library flow. Untouched.
- Jest cannot resolve the bare `app/...` imports in `learning-object.service.ts`, so specs `jest.mock` it (same as the loader and edit specs).

Technical debt intentionally left in place: Promise-based `LearningObjectService`; no atomic create-and-attach endpoint; client-side length rules only.

## Plan of Work

1. Types and mapper. Add optional `cuid` and `version` to `HierarchyNode`. Fill them in `toHierarchyNode` and for the root in the loader. Optional so small test trees keep working.
2. View service. Add `addChild(parentNodeId, child)`: appends a node built by the caller under the parent, expands the parent, and refuses an unknown parent, a non-editable parent, a parent that cannot hold the child's length (`canDrop`-style rule through `canHaveChildren` and `isValidChildLength`), and a parent that already holds that learning object. The new node's occurrence `id` is `${parent.id}/${learningObjectId}`, matching the loader's path key.
3. Edit service. Add `create(parentNodeId, { name, length })` returning an Observable of the created node plus the parent name. Order: validate and take the lock, check the name, create, set length, attach, then `addChild`. Map failures to `HierarchyEditError` with reason `failed`, plus an extra reason or field for "name taken" so the dialog can show a field error instead of a generic one. Run the compensating delete on a partial failure and set `reloadRequired` only when attach may have succeeded and the delete failed. After a successful attach, if the parent appears more than once in the tree, flag `reloadRecommended` (the server added the child to every occurrence of that parent), same as SC-40642.
4. Dialog component. A standalone `clark-hierarchy-add-child` with a reactive form: a name input (autofocused) and a radio group of valid lengths from `LENGTH_ORDER` and `isValidChildLength`. Inputs: `parentName`, `parentLength`, `saving`, `errorMessage`. Outputs: `confirm` with `{ name, length }` and `cancel`. Escape, backdrop click, and Cancel close it unless a save is in flight. Labels, focus trap, error text tied to the field with `aria-describedby`, and a busy label on the primary button.
5. Tree component. Handle `"add-child"` in `onMenuAction` (and the new "Edit in Builder" id), open the overlay, call `editService.create`, show success and error toasts, announce through `LiveAnnouncer`, reveal and focus the new row, and keep the overlay open with an inline error on failure. Dispose the overlay in `ngOnDestroy`, as the other overlays do.
6. Node component. Add "Add Child Object" (enabled for editable nodes whose length can have children, and not while saving) and "Edit in Builder" (enabled for editable nodes that have a `cuid` and `version`). Keep action ids stable and `trackBy` as is. The `NodeActionId` union gains `"edit-in-builder"`.
7. Specs and browser verification.

Out of scope: the SC-40237 library picker, the old scaffold, persisted order, creating more than one child per dialog, setting description or other metadata at creation.

## Concrete Steps

From `/Users/josuemorales/secured/development-environment/clark-client`:

    node -v

Expect Node 22.x (22.19.0 here).

    ./node_modules/.bin/jest --runInBand src/app/onion/learning-object-builder/components/hierarchy-tree

Expect every hierarchy-tree suite to pass. Baseline on 2026-11-13, before any SC-40236 code and with the uncommitted SC-40642 files on disk: 10 suites, 184 tests, all passing (the log also prints a harmless `setup-jest` warning). The SC-40642 plan quotes a different count (168 tests in 17 suites); the matched path is the same, so treat 184 as the current baseline.

    ./node_modules/.bin/ng build clark

Expect exit 0. Then run `npm start` and check the Hierarchy tab in the browser (Playwright, mocked gateway), at 1280px and 390px.

## Validation and Acceptance

Automated (Jest):

- Edit service, create: success calls `checkNameAvailability`, then `create` with the trimmed name, then `save` with `{ length }`, then `setChildren` with the PARENT's learning object id and the new id, in that order, and the tree has the new editable node as the parent's last child.
- Edit service, failures: a taken name makes no create call; a failing create leaves the tree unchanged and makes no delete call; a failing length save or attach deletes the created object and leaves the tree unchanged; a failing delete reports the object was left in the library; the lock is released after every outcome.
- Edit service, guards: a non-editable parent, a Nanomodule parent, a length that is not strictly shorter than the parent, an unknown parent, and a second call while saving are refused with no API call.
- Edit service, shared parent: creating under a parent that appears twice reports `reloadRecommended`.
- View service: `addChild` appends, expands the parent, keys the node as `${parent.id}/${learningObjectId}`, and refuses the cases above and a duplicate learning object under the same parent.
- Mapper and loader: `cuid` and `version` are carried for children and the root.
- Dialog: lists only lengths shorter than the parent, preselects the longest, blocks submit for a blank name or a name with `\ / " * |`, shows the inline error and the busy label, and emits `cancel` on Escape and Cancel.
- Tree and node components: the "Add Child Object" item is enabled only for editable parents that can have children; confirming calls the edit service once; a failed create keeps the dialog open with the error and leaves the tree unchanged; "Edit in Builder" opens the Builder URL in a new tab only for an editable node; the overlay is disposed when the tree is destroyed.

Manual (Playwright, gateway mocked, 1280px and 390px): add a child under a Course; the length list shows only shorter lengths; a blank name and a name with a slash show errors with no request; submit sends check, create, PATCH length, then POST children, and the row appears under the parent with focus; a failing create and a failing attach each leave the tree as it was and show an error (the failing attach also sends DELETE); "Edit in Builder" opens the expected URL in a new tab; reload with a refreshed children mock shows the new child. Console shows no errors.

Real services: run `clark-gateway` and `clark-service` locally, create a child, confirm it in the Dashboard list, open it from its node, then remove it from the hierarchy and confirm it is still in the Dashboard.

Access: no route, guard, or interceptor changes. A 403 (unverified email or no write access to the parent) shows as the error path.

## Idempotence and Recovery

All code steps are additive and can be repeated. To roll back, revert the commits on this branch; there are no data, environment, or build changes. A failed create may leave an unattached learning object in the author's library when the compensating delete fails; the author can delete it from the Dashboard, and the error message says so. This branch is stacked on `feature/sc-40642/remove-and-reorganize-children-in-the` (commit `66fc9e9a5` and earlier), so revert only commits made after that point.

## Artifacts and Notes

- Backend create path: `clark-service/src/modules/learning-object-module/learning-object/learning-object.component.ts` (`createLearningObject`, `updateLearningObject`, `updateLearningObjectChildren`); gateway routes in `clark-gateway/src/modules/clark/learning-object-module/learning-objects.routes.ts`.
- Existing Builder create flow for reference: `src/app/onion/learning-object-builder/builder-store.service.ts` (`createLearningObject`, `getPostCreateUpdatePayload`).
- Tooling fragility from earlier plans (Node 25 aborts `ng build`, repo-wide `tsc` drift, many unrelated builder specs failing `should create`) still applies.
- The uncommitted `package-lock.json` change predates this story; do not stage it.

## Interfaces and Dependencies

- Services: `LearningObjectService` (`create`, `save`, `setChildren`, `delete`, `checkNameAvailability`; root-provided, unchanged), `HierarchyViewService` (+`addChild`), `HierarchyEditService` (+`create`), `HierarchyLoaderService` (root node fields), `ToastrOvenService`, `LiveAnnouncer`.
- Types: `HierarchyNode` (+`cuid?`, +`version?`), `NodeActionId` (+`"edit-in-builder"`), new request type `{ name: string; length: LearningObject.Length }`.
- UI: new `HierarchyAddChildComponent` (CDK overlay), existing `HierarchyNodeComponent` menu.
- API: existing gateway routes only; no contract change.
- No new npm dependencies, no environment changes.

## Open Questions

None open. Resolved on 2026-11-13 by the story owner:

1. Branch base: commit the SC-40642 code to its branch first and rebase this one on it; one plan per story, so the SC-40642 plan edit is not committed with it. Done.
2. UI rollback: waiting for the API before showing the row is fine; to be tested later.
3. Compensating delete of the just-created object: approved.
4. "Edit in Builder" belongs in the Action Menu.
5. Creation: reuse the existing create path the Dashboard uses (see the Decision Log). The create route still ignores length, so the flow stays three calls; a backend change is out of scope.
