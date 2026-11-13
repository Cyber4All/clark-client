# SC-40642: Remove and Reorganize Children in the Hierarchy Builder

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

Story: https://app.shortcut.com/clarkcan/story/40642 (epic 39262, Builder - Hierarchy Manager). Depends on SC-40640 (load and display; this branch is stacked on `feature/sc-40640/load-and-display-the-author-s-hierarchy-in-the`). Blocks SC-40239 (deprecate `hierarchy-service`).

## Purpose / Big Picture

Today the Builder Hierarchy tab loads the author's real hierarchy (SC-40640), but every change is local-only: moving a node with drag-and-drop or the Move picker changes the view and is lost on reload, and there is no way to remove a child.

After this story, in the Hierarchy tab:

- An author can remove a child from an editable parent. This only unlinks it; the learning object stays in the author's library.
- An author can re-parent a child (drag it onto another node, or use Move Object). The change is saved as soon as the drop or confirmation happens.
- Reordering children inside a parent is out of scope (decided 2026-11-12). A moved child is appended to the end of its new parent, and that is the order a reload shows.
- If saving fails, the tree goes back to what it was before the action and an error toast explains it.
- Invalid drops stay rejected: wrong length for the target, cycles, and any target inside a linked/read-only subtree.
- Linked/read-only nodes can be moved or removed as a whole; their internals cannot change.
- Reloading the page shows the persisted structure.

Permissions are unchanged: whatever the API allows today is what the author can do. The client keeps its existing editable heuristic from SC-40640 and relies on the API (403) as the real gate.

## Progress

- [x] (2026-11-11) Read `PLANS.md`, `AGENTS.md`, the Shortcut story, and the SC-40640 ExecPlan.
- [x] (2026-11-11) Created branch `feature/sc-40642/remove-and-reorganize-children-in-the` from `feature/sc-40640/load-and-display-the-author-s-hierarchy-in-the`. The unrelated uncommitted `package-lock.json` change in the working tree is not part of this story and must not be committed.
- [x] (2026-11-11) Traced the write paths in `clark-gateway` and `clark-service` (see Surprises & Discoveries). Found that persisted reorder has no supporting route.
- [x] (2026-11-11) Wrote this plan.
- [x] (2026-11-12) View service: added `getNode`, `getParent`, and `removeChild` (refuses the root, non-movable nodes, and anything inside a linked subtree).
- [x] (2026-11-12) `HierarchyEditService` (page-scoped): remove and re-parent with optimistic update, API call, rollback, compensation, and a single in-flight edit.
- [x] (2026-11-12) Tree component: drag-drop and Move picker go through the edit service; toasts and announcements follow the save; error toasts on failure; `canMove` is false while saving; the current parent is listed in the picker but cannot be chosen (new picker input `allowCurrentParent`).
- [x] (2026-11-12) Node component and types: "Remove from Hierarchy" Action Menu item (`NodeActionId` adds `"remove"`).
- [x] (2026-11-12) Specs: new `hierarchy-edit.service.spec.ts`; updated tree, node, and states specs. 161 tests in 17 hierarchy-tree suites pass. Mutation-checked: disabling rollback fails 12 tests; swapping add/remove order fails 4.
- [x] (2026-11-12) Browser check (Playwright, mocked gateway, desktop 1280px): Remove menu item; remove persists and reload shows it; failed remove rolls back with toast; pointer drag re-parent sends POST then PATCH; drop onto a linked root sends nothing; failed add rolls back with toast and sends no removal.
- [x] (2026-11-13) Removal confirmation dialog (component, tree wiring, specs; 168 tests pass; browser-checked: nothing sent before confirm, Escape returns focus, confirm sends one PATCH). Not yet checked at phone width.
- [ ] Phone width: the page has no horizontal overflow, but nested rows and their kebab menus are clipped at the right edge at 390px. This comes from the SC-40233 layout, not this story. Left as is.
- [ ] Run against the real gateway and clark-service (only the mocked gateway was used).

## Surprises & Discoveries

- Observation: No existing route can SET the order of a parent's children.
  Evidence: `clark-service/src/modules/learning-object-module/learning-object/learning-object.component.ts` `updateLearningObjectChildren` builds `uniqueChildrenIds` from the parent's current children and only pushes ids that are not already present. Passing a reordered list is a no-op. The datastore method `updateChildren` does `$set` the whole array, but only the append path calls it. No other gateway route touches `children` order.
- Observation: Remove is `PATCH /learning-objects/:learningObjectId/children` with body `{ childObjectId }`; add is `POST` to the same path with `{ childrenIds }`. Both are `auth: true` at the gateway, and clark-service requires write access to the PARENT. Remove only `$pull`s the id from the parent's `children` array; the child document is untouched.
  Evidence: `clark-gateway/.../learning-objects.routes.ts`, `clark-service/.../learning-object.routehandler.ts` (`removeChild`, `updateChildren`), `learning-object.datastore.ts` (`removeChild`, `updateChildren`).
- Observation: Re-parenting is two non-atomic calls (add to new parent, remove from old parent). The server does not validate length or cycles on add; it only checks that the child exists and that the requestor has write access to the parent. The client rules are therefore the only guard against invalid structure.
  Evidence: the `for (const childId of updateChildrenDto.childrenIds)` checks in `updateLearningObjectChildren`.
- Observation: The client already wraps both calls in `LearningObjectService.setChildren(parentId, childIds, remove)` (Promise-based, `toPromise()`, with a TODO noting the name is misleading). The remove branch only sends `children[0]`. Route constants `UPDATE_LEARNING_OBJECT_CHILDREN` and `REMOVE_LEARNING_OBJECT_CHILD` already exist.
  Evidence: `src/app/core/learning-object-module/learning-object/learning-object.service.ts` lines ~446-485 and `learning-object.routes.ts`.
- Observation: The tree's drag-and-drop only supports "drop ONTO a node, append as last child". There is no drop-between-siblings affordance, so DnD reorder needs new UI (an insertion indicator) in addition to the missing backend route.
  Evidence: `hierarchy-tree.component.ts` `onTreeDrop` calls `moveNode(dragged.id, targetId)` with no index; the Move picker's `confirm` event carries only `targetId`.
- Observation: `HierarchyViewService.validDestinations` includes the node's CURRENT parent (a reorder). Today that appends the node as the last child of its own parent locally. With persistence, that action cannot be saved, so it must not be offered until reorder persists.
- Observation: A parent-child link belongs to the PARENT learning object, not to a tree occurrence. If the edited parent appears more than once in the tree (a shared parent), the server changes every occurrence while the UI changed one. SC-40640 made occurrences independent for local-only moves; with persistence that no longer holds.
  Evidence: the API keys on parent and child learning object ids only. The edit service reports `reloadRecommended` when the old or new parent's learning object occurs more than once, and the tree reloads from the server in that case.
- Observation: `canDrop` already rules out cycles through shared children: a child must be strictly shorter than its parent, so a learning object can never sit under a descendant occurrence of itself. A planned learning-object-id cycle check was therefore dead code and was removed.
  Evidence: a unit-under-itself case in `hierarchy-edit.service.spec.ts` is refused by the existing length rule.
- Observation: The Font Awesome kit in use serves v5.15 icons, which have no `link-slash`. `far fa-unlink` is used.
  Evidence: CORS/404 for `regular/link-slash.svg` in the browser console.
- Observation (earlier, superseded): `canDrop` detects cycles with `isDescendant(node, target.id)`, which only sees the dragged OCCURRENCE's own subtree. With shared children a target can be a different occurrence of a descendant learning object. The strictly-shorter-child length rule makes true cycles impossible today, but the server will not catch a violation, so a learning-object-id check is cheap defense in depth.

## Decision Log

- Decision: Reuse `LearningObjectService.setChildren` (wrapped with `from(...)`) for add and remove instead of adding new routes or a new HTTP method.
  Rationale: Same reasoning as SC-40640 PR review round 1: the route constants and service method already exist, and duplicating them drifts the API layer. Trade-off: it is Promise-based (`toPromise()` inside); converting it to Observables is a wider change left out of scope.
  Date/Author: 2026-11-11 / Kiro

- Decision: Put persistence orchestration in a new page-scoped `HierarchyEditService`, not in `HierarchyViewService` or the tree component.
  Rationale: Keeps `HierarchyViewService` free of HTTP (its many `new HierarchyViewService()` specs keep working) and keeps the tree component presentational, per AGENTS.md boundaries. Mirrors how `HierarchyLoaderService` was split out in SC-40640.
  Date/Author: 2026-11-11 / Kiro

- Decision: Optimistic update with snapshot rollback, and allow ONE mutation in flight. While one is saving, `canMove` returns false (drag handles and Move/Remove menu items disable) and the tree is `aria-busy`.
  Rationale: Rollback to a snapshot is only correct if nothing else changed the tree in between. Serializing mutations avoids stacked optimistic states and interleaved partial failures without building a queue. The save is a short request, so the lockout is brief.
  Date/Author: 2026-11-11 / Kiro

- Decision: Re-parent order is ADD to the new parent first, then REMOVE from the old parent. If the remove fails, try to remove the child from the new parent again (compensate), roll the UI back, and reload the hierarchy from the server when compensation also fails.
  Rationale: Add-then-remove can leave the child briefly in two parents but can never lose it. Remove-then-add could orphan a child if the second call fails. Reloading on a failed compensation shows the true persisted state instead of a guess.
  Date/Author: 2026-11-11 / Kiro

- Decision: Persist by `HierarchyNode.learningObjectId` (parent and child), never by the occurrence `id`. Removing or moving one occurrence unlinks only from THAT occurrence's parent; other occurrences of a shared child under other parents are untouched.
  Rationale: SC-40640 made `id` a path key. The API knows learning object ids only.
  Date/Author: 2026-11-11 / Kiro

- Decision: Reorder is out of scope (story owner, 2026-11-12). Do not expose it in the UI. In this story, hide the node's current parent from the Move picker's destination list (tree component filters `isCurrentParent`), and add no drop-between-siblings UI.
  Rationale: The story requires every change to persist and reload to show persisted order. Shipping a control that reorders locally but forgets on reload would violate that and mislead authors. Implemented as a picker input `allowCurrentParent` (default true, the tree passes false): the current parent still shows as "Current parent" but cannot be chosen. Remove the input override when reorder lands.
  Date/Author: 2026-11-11 / Kiro

- Decision: Do NOT add a learning-object-id cycle check to `canDrop`. Superseded the earlier plan to add one.
  Rationale: The strictly-shorter-child rule already makes cycles impossible, including through other occurrences of a shared object. Extra code with no reachable case.
  Date/Author: 2026-11-12 / Kiro

- Decision: After an edit whose old or new parent appears more than once in the tree, or whose compensation failed, reload the hierarchy from the server (`HierarchyLoaderService.retry`).
  Rationale: The server changes every occurrence of the parent, and a failed compensation leaves the server state unknown. Reloading shows the truth. The reload resets expand/collapse state, which is acceptable for these rare cases.
  Date/Author: 2026-11-12 / Kiro

- Decision (reversed 2026-11-13): Removal asks for confirmation. The Action Menu item "Remove from Hierarchy" opens a modal (`clark-hierarchy-remove-confirm`, a CDK overlay like the Move picker) naming the child and its parent, saying it only unlinks and the object stays in the library, and, when the child has contents, how many objects leave with it. Nothing is sent until the author presses Remove. Cancel is focused first; Cancel, Escape, and a backdrop click leave the tree untouched and return focus to the row's menu button. After a confirmed removal the success toast still states the object stays in the library.
  Rationale: Requested by the story owner. Removing a unit also takes its whole subtree out of this hierarchy, which is easy to do by accident from a kebab menu. This supersedes the earlier "toast only" decision, which had said the feature area had no confirm-dialog pattern to reuse; the Move picker is that pattern.
  Date/Author: 2026-11-13 / Kiro

## Outcomes & Retrospective

Done: removing a child and re-parenting (drag-and-drop and the Move picker) are saved immediately, roll back with an error toast on failure, refuse invalid drops without any request, and show the persisted structure after reload. Linked roots move and remove as a whole; their descendants cannot change. Verified with 161 Jest tests and a mocked-gateway browser run at desktop width.

Not done: a run against the real gateway and clark-service, and phone-width layout of nested rows (pre-existing).

Limits: re-parenting is two non-atomic calls with a best-effort undo; one edit can be saving at a time; the reload after an edit on a shared parent resets expand state.

Lessons: Playwright runs each script in its own scope, so mock state needs control endpoints; an on-save formatter rewrote the mock file and broke it with a trailing semicolon.

## Context and Orientation

Scope: local to the Builder Hierarchy feature. Touches `src/app/onion/learning-object-builder/components/hierarchy-tree/**` and the hierarchy page provider list. Does NOT touch routing, guards, interceptors, shared UI modules, environment, or build config. No service/API contract change: it calls existing gateway routes through the existing `LearningObjectService`.

Interaction flow after this story:

1. Route `.../learning-object-builder/hierarchy` renders `pages/hierarchy-page/hierarchy-page.component.ts`, which provides the page-scoped `HierarchyViewService`, `HierarchyLoaderService`, and (new) `HierarchyEditService`.
2. `HierarchyLoaderService` loads the tree (SC-40640).
3. The author drops a node onto another node, confirms the Move picker, or picks "Remove from hierarchy". `HierarchyTreeComponent` validates through `HierarchyViewService.canMove`/`canDrop` and hands the intent to `HierarchyEditService`.
4. `HierarchyEditService` snapshots the tree, applies the change through `HierarchyViewService`, calls `LearningObjectService.setChildren`, and on failure restores the snapshot (and reloads if the server state is uncertain).
5. The tree component shows a success or error toast and a screen-reader announcement.

API calls used (all existing, via `LearningObjectService.setChildren`):

- Add child: `POST ${apiURL}/learning-objects/{parentId}/children` body `{ childrenIds: [childId] }`.
- Remove child: `PATCH ${apiURL}/learning-objects/{parentId}/children` body `{ childObjectId }`.

Affected files (planned):

- `components/hierarchy-tree/hierarchy-view.service.ts` (`getNode`, `getParent`, and `removeChild`)
- `components/hierarchy-tree/hierarchy-edit.service.ts` (new)
- `components/hierarchy-tree/hierarchy-tree.component.{ts,html}` (use the edit service; error handling; busy gating; picker destination filter; removal confirmation overlay)
- `components/hierarchy-tree/hierarchy-remove-confirm/` (new; the removal confirmation dialog)
- `components/hierarchy-tree/hierarchy-node/hierarchy-node.component.{ts,html}` (Remove menu item)
- `components/hierarchy-tree/hierarchy-tree.types.ts` (`NodeActionId` adds `"remove"`)
- `pages/hierarchy-page/hierarchy-page.component.ts` (provide `HierarchyEditService`)
- Specs: `hierarchy-edit.service.spec.ts` (new), `hierarchy-view.service*.spec.ts`, `hierarchy-tree.component.spec.ts`, `hierarchy-node.component.spec.ts`.

Legacy and drift to name:

- `LearningObjectService.setChildren` is Promise-based and its remove branch sends only the first child id. Both are left as they are.
- The editable/linked heuristic (author, contributor, admin/editor) is an interim assumption from SC-40640 until SC-40641 adds an explicit link field.
- Jest cannot resolve the bare `app/...` imports in `learning-object.service.ts`, so specs `jest.mock` it (same as the loader spec).

Technical debt intentionally left in place: Promise-based `LearningObjectService`; no atomic "move" endpoint (two calls); no server-side length or cycle validation (the client enforces it).

## Plan of Work

1. View service: make a node lookup and `removeChild` available (`removeChild` rejects the root and non-movable nodes). `canDrop` is unchanged: its existing rules already cover cycles.
2. Edit service: `remove(nodeId)` and `move(nodeId, targetId)` returning Observables that complete on success and error on failure. Implements snapshot, optimistic apply, API calls, compensation, rollback, and the single in-flight lock with a `saving$` stream. Failure outcome carries whether the server state is uncertain so the caller can trigger a reload.
3. Tree component: replace direct `moveNode` calls (drag-drop and picker) with `edit.move`; add the remove handler; toasts and live-region announcements only after the API succeeds (the existing "Object moved" toast currently fires on local success); error toasts on failure; `canMove` returns false while saving; hide the current parent from the picker.
4. Node component: add the "Remove from hierarchy" item (disabled when `canMove` is false; never on the root).
5. Specs and browser verification.

Out of scope: persisted reorder and any drop-between-siblings UI (decided out of scope), creating or linking children (SC-40236, SC-40237), explicit link metadata (SC-40641), new gateway routes, converting `LearningObjectService` to Observables, keyboard-navigation redesign.

## Concrete Steps

From `/Users/josuemorales/secured/development-environment/clark-client`:

    node -v

Expect Node 22.x.

    ./node_modules/.bin/jest --runInBand src/app/onion/learning-object-builder/components/hierarchy-tree

Expect all hierarchy-tree suites to pass.

    ./node_modules/.bin/ng build clark

Expect exit 0. Then the user runs `npm start` and the app is checked in the browser.

## Validation and Acceptance

Automated (Jest):

- Edit service, remove: success calls the remove route once with the PARENT's learning object id and the CHILD's learning object id, and the node is gone; failure restores the exact prior tree and errors.
- Edit service, move: success calls add (new parent) then remove (old parent) in that order and the node sits under the new parent; add failure restores the tree and makes no remove call; remove failure triggers the compensating remove on the new parent, restores the tree, and flags a reload when compensation fails.
- Edit service, shared child: removing or moving one occurrence sends the correct parent id and leaves the other occurrence in place.
- Edit service, lock: a second mutation while one is in flight is rejected without any API call; `saving$` is true during the call and false after.
- View service: all existing `canDrop` rules still hold (the edit service spec re-checks cycle, length, and linked-subtree refusals end to end); `removeChild` rejects the root, a descendant of a linked root, and an unknown id; a linked root is removable as a whole.
- Tree/node components: Remove item appears and is disabled for the root and linked-subtree descendants; choosing it opens a confirmation and sends nothing until Remove is pressed; Cancel, Escape, and a backdrop click change nothing and return focus; the dialog states how many objects leave with the child; an open dialog closes when the tree is destroyed; a failed persist shows an error toast and the tree is unchanged; the current parent is absent from picker destinations.

Manual (Playwright, gateway mocked, desktop and phone width): remove a child (confirmation shown first, request body correct only after Remove, node disappears, toast); drag a child to another editable parent (add then remove requests, tree updates); failing add and failing remove each roll back with an error toast; invalid drop onto a read-only subtree, a too-short parent, and a descendant is refused with no request; reload via a fresh `/children` mock shows the persisted structure.

Access: no route, guard, or interceptor changes. A 403 from the API appears as the error path (rollback and toast).

## Idempotence and Recovery

All steps are additive. To roll back, revert the commits on this branch; no data or environment changes are involved. A failed re-parent that cannot be compensated leaves the child under two parents on the server until the author removes one; the UI reloads the real structure in that case so the author sees it.

## Artifacts and Notes

- Backend write path: `clark-service/src/modules/learning-object-module/learning-object/learning-object.component.ts` (`removeChild`, `updateLearningObjectChildren`).
- Tooling fragility from earlier plans (Node 25 aborts `ng build`, repo-wide `tsc` drift, many unrelated builder specs failing `should create`) still applies.
- Uncommitted `package-lock.json` in the working tree predates this story; do not stage it.

## Interfaces and Dependencies

- Services: `LearningObjectService.setChildren` (existing, root-provided), `HierarchyViewService`, `HierarchyLoaderService`, new `HierarchyEditService` (page-scoped), `ToastrOvenService`, `LiveAnnouncer`.
- Types: `HierarchyNode` (uses `learningObjectId`), `NodeActionId` (adds `"remove"`).
- API: existing gateway `POST` and `PATCH /learning-objects/:learningObjectId/children`; no contract change.
- No new npm dependencies, no environment changes.

## Open Questions

- Reorder inside a parent: out of scope per the story owner (2026-11-12). The API has no route that sets child order, so if it is ever wanted it needs a backend route first.
- The editable heuristic is carried over from SC-40640 and should be confirmed with product/backend (reviewers, and what "linked" means before SC-40641).
