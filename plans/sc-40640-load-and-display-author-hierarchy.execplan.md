# SC-40640: Load and Display the Author's Hierarchy in the Builder Hierarchy Tab

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

Story: https://app.shortcut.com/clarkcan/story/40640 (epic 39262, Builder - Hierarchy Manager). Depends on SC-40233 (Hierarchy tab UI, already on this branch's history). Blocks SC-40236, SC-40237, SC-40641, SC-40642.

## Purpose / Big Picture

Today the Builder Hierarchy tab renders a hard-coded mock tree. After this change, opening the tab for a saved, non-nanomodule learning object fetches that object's real hierarchy through the existing gateway routes and renders it with:

- the current learning object as the root;
- editable children and linked/read-only children using the treatments already built in SC-40233;
- loading, empty (no children), and error (with retry) states;
- no mock service, mock fixtures, or seeded local state left in production code.

Success is observable by opening a Builder for an object that has children (for example one created through the legacy admin Hierarchy Builder), clicking Hierarchy, and seeing the real tree. Opening an object without children shows the empty state. A learning object that has more than one parent appears under each of its parents, and each appearance expands, moves, and receives drops independently. Taking the API offline shows the error state with a Retry button.

## Progress

- [x] (2026-11-04T00:00Z) Read `PLANS.md`, `AGENTS.md`, the Shortcut story, and the SC-40233 ExecPlan.
- [x] (2026-11-04T00:00Z) Traced gateway and clark-service routes for hierarchy reads (see Context and Orientation).
- [x] (2026-11-04T00:00Z) Created this plan. Branch `feature/sc-40640/load-and-display-the-author-s-hierarchy-in-the` is already checked out.
- [x] (2026-11-04T21:40Z) Added `GET_CHILDREN` route, `HierarchyChildPayload` type, and Observable `HierarchyService.getChildren()`. SUPERSEDED in PR review (2026-11-04T23:20Z): all three removed in favor of the existing `LearningObjectService.getLearningObjectChildren` (route `LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT_CHILDREN`) and the `LearningObject` entity.
- [x] (2026-11-04T21:40Z) Added `hierarchy-node.mapper.ts` (payload to `HierarchyNode`, editable rule).
- [x] (2026-11-04T21:42Z) Added page-scoped `HierarchyLoaderService` (load, retry, status, cycle/depth guards). Removed `seedMockData` and the mock tree from `HierarchyViewService`; the mock moved to `hierarchy-test-data.ts` as a test fixture.
- [x] (2026-11-04T21:45Z) Tree component and template now render loading, error (Retry), empty, and ready states; removed the mock root-rename hack.
- [x] (2026-11-04T21:50Z) Specs: new mapper, `HierarchyService`, loader, and tree-state specs; updated the tree integration spec to use a stubbed loader. All hierarchy specs pass (jest).
- [x] (2026-11-04T21:54Z) `tsc --noEmit`: 28 errors, all pre-existing, none in hierarchy files. `ng build clark` exits 0 under Node 22.19.
- [ ] Verify in the browser with Playwright (desktop + phone) against a running gateway/clark-service with a logged-in author. Not done: no dev server or gateway was running in this session.

## Surprises & Discoveries

- Observation: The gateway exposes NO dedicated "get hierarchy tree" route. The only hierarchy-named routes are `POST /hierarchy-object` (create, proxied to clark-service) and `PATCH /learning-objects/:learningObjectId/status` (proxied to hierarchy-service, status only). The hierarchy is read through the learning-object routes.
  Evidence: `clark-gateway/src/modules/clark/hierarchy-module/hierarchy.routes.ts`, `clark-gateway/src/modules/clark/learning-object-module/hierarchy.routes.ts`, `clark-gateway/src/modules/clark/learning-object-module/learning-objects.routes.ts`.
- Observation: `GET /learning-objects/:learningObjectId/children` returns DIRECT children only, as `FullLearningObject[]`. It performs one `getFullLearningObjectById` aggregation per child ID. Building the whole tree needs one request per non-leaf node.
  Evidence: `clark-service/src/modules/learning-object-module/learning-object/learning-object.component.ts` `getLearningObjectChildren` (reads `learningObject.children`, loops over IDs).
- Observation: The route is unauthenticated at the gateway (`auth` not set) but clark-service reads the bearer token if present. With a token, it checks `authLearningObjectReadAccess` (403 otherwise) and returns children of any status. Without a token it returns only RELEASED children. The client must send credentials so drafts appear.
  Evidence: gateway `LEARNING_OBJECTS_ROUTES` entry has no `auth: true`; `getTokenFromBearer(req)` in `learning-object.routehandler.ts`.
- Observation: The backend has no concept of a "linked" child yet. Linking is introduced by SC-40641. Today every child is just an ID in the parent's `children` array, and edit rights come from existing author/contributor/admin rules.
  Evidence: no `linked`/`readOnly` field in `full-learning-object.builder.ts` or `learning-object.type.ts`.
- Observation: The existing client `LearningObjectService.getLearningObjectChildren` is Promise-based (`toPromise()`), and `HierarchyService` only has `addHierarchyObject` (also `toPromise()`). `AGENTS.md` forbids new `toPromise()` usage.
  Evidence: `src/app/core/learning-object-module/learning-object/learning-object.service.ts`, `src/app/core/learning-object-module/hierarchy/hierarchy.service.ts`.
- Observation: `seedMockData` is called by `HierarchyTreeComponent.ngOnInit` and by one test in `hierarchy-tree.component.spec.ts` (line ~649). `buildHierarchyTestFixture` in `hierarchy-test-data.ts` is test-only and stays.
  Evidence: grep of `seedMockData` in `src/app`.

- Observation: The cube details page shows children as a flat, one-level list. It reads `object.resourceUris.children` (the same `/children` route) via `LearningObjectService.fetchLearningObjectResources`, then filters client-side to RELEASED/REVIEW/WAITING (marked FIXME). It has no deeper tree to reuse, and its status filter must not be copied because authors need drafts.
  Evidence: `src/app/cube/details/details.component.ts` `fetchReleasedLearningObject`; `learning-object.service.ts` `fetchLearningObjectResources`.
- Observation: `learning-object.service.ts` imports `app/core/user-module/user.service` (bare path). Jest cannot resolve it, so specs that load it must `jest.mock` the module.
  Evidence: "Cannot find module 'app/core/user-module/user.service'" in the loader and tree specs.
- Observation (PR review round 2): the first loader used ONE `visited` Set for the whole load. A learning object reachable through two parents was kept only under whichever parent's response was processed first, so the result depended on request timing and silently dropped a valid parent-child relationship. The backend stores `children` as a list of ids per parent, so the same child id can appear under many parents.
  Evidence: `hierarchy-loader.service.ts` `fetchChildren$` (before this change) added every placed id to a shared `visited` set. clark-service `getLearningObjectChildren` reads `learningObject.children` per parent with no uniqueness across parents.
- Observation (PR review round 2): the whole tree UI treats `HierarchyNode.id` as the identity of one rendered occurrence, not of a learning object. Audit result: `HierarchyViewService` (`findNode`, `removeNode`, `parentIdOf`, `toggleExpanded`, `moveNode`, `validDestinations`, `isInsideLinkedSubtree`), `hierarchy-node` (`data-node-id`, `trackById`, `toggleExpanded`/`menuAction` emits, drag affordance via `draggingNode?.id` and `hoveredTargetId`), `hierarchy-tree` (DOM hit-testing on `.node-row[data-node-id]`, focus restoration), and `hierarchy-move-picker` (destination ids, `trackById`). With duplicate ids these would toggle, move, highlight, and hit-test every occurrence at once or the wrong one.
  Evidence: grep of `.id`, `data-node-id`, `nodeId`, `targetId`, `trackBy` across `components/hierarchy-tree/**`.
- Observation: The repo's rxjs has no `firstValueFrom`.
  Evidence: TS2305 when first writing the loader spec.
- Observation: Many sibling builder specs (contributor-pill, outcome, scaffold, etc.) already fail `should create`; unrelated to this story.
  Evidence: `npx jest src/app/onion/learning-object-builder` output.

## Decision Log

- Decision (PR review round 2): Track cycles per branch, not globally. While descending, pass the set of learning object ids on the path from the root to the parent (ancestors). A child whose learning object id is in that set is skipped (cycle). A learning object that is not an ancestor is kept under every parent that lists it. Within one parent's response, a duplicated child id is kept once (a parent cannot contain the same child twice).
  Rationale: Preserves every valid parent-child relationship and makes the result independent of request resolution order, while still stopping real cycles. The depth cap stays as a second guard.
  Date/Author: 2026-11-04 / Kiro

- Decision (PR review round 2): Make `HierarchyNode.id` the unique key of one tree OCCURRENCE (the path of learning object ids from the root, joined with `/`, assigned at load and never recomputed on moves), and add `learningObjectId` for the real learning object. The root keeps its learning object id as `id`.
  Rationale: Every consumer already keys on `node.id` as occurrence identity (see Surprises), so unique occurrence keys fix toggle, drag/drop, hit-testing, focus, and move targeting with no changes to those components. A path key is deterministic (independent of request order) and unique because siblings are deduplicated and branches differ by path. The alternative, switching every consumer to a new key field, touches about 10 files for the same result. `learningObjectId` is optional in the type so existing fixtures stay valid; it is always set for loaded data and is what later persistence stories (SC-40642, SC-40236, SC-40237) must send to the API.
  Date/Author: 2026-11-04 / Kiro

- Decision (PR review round 2): `HierarchyViewService.canDrop` also rejects a target that already has a child with the same learning object id (compared via `learningObjectId ?? id`), unless the move is a reorder within the same parent.
  Rationale: With shared children, moving one occurrence under a parent that already contains that learning object would create a duplicate child entry, which the backend list cannot represent meaningfully. `validDestinations` reuses `canDrop`, so the picker never offers such a parent.
  Date/Author: 2026-11-04 / Kiro

- Decision (PR review round 2): Memoize `getLearningObjectChildren` per learning object id within one load (a `Map` of Promises created per `load`), so a shared child that appears under N parents costs one request, not N.
  Rationale: Keeps request count proportional to distinct learning objects. The cache is per load, so Retry and reload always fetch fresh data.
  Date/Author: 2026-11-04 / Kiro

- Decision: Reuse `LearningObjectService.getLearningObjectChildren` (existing route constant, existing `LearningObject` entity) instead of adding `HierarchyService.getChildren`, a new route, and a payload type. Supersedes the first two decisions below about `HierarchyService`.
  Rationale: PR review. The route and service already exist; duplicating them drifts the API layer. Trade-off: the existing method is Promise-based (`toPromise()` inside), so the loader wraps it with `from(...)`. Converting it to an Observable is a separate, wider change.
  Date/Author: 2026-11-04 / Kiro

- Decision: Read the hierarchy with the existing `GET /learning-objects/:id/children` route and assemble the tree client-side by walking children recursively.
  Rationale: The story says to use existing gateway routes and preserve the API contract. No tree-shaped route exists. The move picker and `validDestinations` need the whole tree in memory, so lazy per-expand loading would break them.
  Date/Author: 2026-11-04 / Kiro

- Decision: Put the new read method in the existing `HierarchyService` (`src/app/core/learning-object-module/hierarchy/`) as an `Observable`, with its URL built in `hierarchy.routes.ts`. Do not touch the Promise-based `LearningObjectService`.
  Rationale: One domain service per API area, typed Observable returns, URL construction in the routes helper, no new `toPromise()` (AGENTS.md). Leaves the legacy `addHierarchyObject` untouched.
  Date/Author: 2026-11-04 / Kiro

- Decision: Walk levels with `forkJoin` fan-out per level, skip leaves by length (nanomodules have no children), and cap depth at the number of lengths (5). SUPERSEDED in part (2026-11-04, PR review round 2): the cycle guard is per branch (ancestor ids), not a global already-visited set; see the round 2 decisions above.
  Rationale: Bounds request count and keeps load time proportional to depth rather than node count.
  Date/Author: 2026-11-04 / Kiro

- Decision: Classify a child as editable when the current user is its author or a contributor, or is an admin/editor. Otherwise mark it `editable: false, linkedRoot: true`. Descendants of a read-only root stay immutable through the existing `isInsideLinkedSubtree` rule.
  Rationale: The story says permissions are unchanged and the backend has no link flag yet. Author/contributor/admin is the existing edit rule the Builder already applies. This is an ASSUMPTION to confirm with product/backend (see Open Questions); SC-40641 will replace it with an explicit link field.
  Date/Author: 2026-11-04 / Kiro

- Decision: The root node is always `editable: true` in the view model; the tab is only reachable by users who can open the Builder for that object.
  Rationale: Matches the existing root treatment and keeps Builder access rules in one place (routing/navbar gating from SC-40233).
  Date/Author: 2026-11-04 / Kiro

- Decision: Put loading in a new page-scoped `HierarchyLoaderService` rather than in `HierarchyViewService`. The loader owns `status$` and publishes the tree through `HierarchyViewService.setTree`.
  Rationale: Keeps `HierarchyViewService` free of HTTP and auth dependencies, so its ~12 existing specs that call `new HierarchyViewService()` keep working unchanged. Supersedes the earlier "add `load` to the view service" wording.
  Date/Author: 2026-11-04 / Kiro

- Decision: Add an `empty` status alongside `ready`.
  Rationale: Lets the template pick the empty message without inspecting the tree.
  Date/Author: 2026-11-04 / Kiro

- Decision: Keep the page-scoped `HierarchyViewService` and BehaviorSubject state. Add a `status$` stream (`loading | ready | error`) next to `tree$` rather than a new store.
  Rationale: Smallest change that matches the existing state ownership. Moves stay local-only in this story; persistence is SC-40642 / SC-40236 / SC-40237.
  Date/Author: 2026-11-04 / Kiro

## Outcomes & Retrospective

Implemented and unit tested; browser verification pending (see Progress). Known limits: one failed `/children` request fails the whole load (no partial tree); every non-nanomodule node costs one request; the editable rule is the author/contributor/admin assumption confirmed on 2026-11-04, and reviewers are treated as not editable until a per-object reviewer signal exists. SC-40641 should replace the editable rule with an explicit link field.

## Context and Orientation

Scope: local to the Builder Hierarchy feature plus one core domain service. Does not touch routing, guards, interceptors, shared UI, environment, or build config.

Current flow (before this story):

1. Route `.../learning-object-builder/hierarchy` (`learning-object-builder.routing.ts`) renders `pages/hierarchy-page/hierarchy-page.component.ts`.
2. The page subscribes to `BuilderStore.learningObjectEvent` and passes the object to `components/hierarchy-tree/hierarchy-tree.component.ts` via `[learningObject]`.
3. The tree component calls `HierarchyViewService.seedMockData()` in `ngOnInit`, then renames the mock root with the real object's name.
4. `components/hierarchy-tree/hierarchy-view.service.ts` (page-scoped, `BehaviorSubject<HierarchyNode[]>`) owns the tree, `canDrop`, `canMove`, `moveNode`, `validDestinations`.
5. `hierarchy-node/hierarchy-node.component.*` renders each node from `HierarchyNode` (`hierarchy-tree.types.ts`).

Target flow:

1. Page passes the `LearningObject` as before.
2. Tree component asks `HierarchyLoaderService` to `load(learningObject)`.
3. `HierarchyLoaderService` calls `LearningObjectService.getLearningObjectChildren(id)` level by level (one memoized request per distinct learning object), maps each `LearningObject` with the mapper, publishes the tree through `HierarchyViewService.setTree`, and exposes `status$`.
4. Template renders loading, error (Retry), empty (root only, zero children), or the tree.

API contract (verified in local repos under `~/secured/development-environment`):

- Client: the existing `LearningObjectService.getLearningObjectChildren(id)` (route constant `LEARNING_OBJECT_ROUTES.GET_LEARNING_OBJECT_CHILDREN`), which issues `GET ${environment.apiURL}/learning-objects/{id}/children` with credentials and returns `LearningObject[]` entities.
- Gateway: `clark-gateway/src/modules/clark/learning-object-module/learning-objects.routes.ts`, proxied to clark-service.
- clark-service: `getLearningObjectChildren` returns `FullLearningObject[]` for direct children. 404 when the parent is missing, 403 when the token lacks read access. Fields used by the mapper: `id`, `name`, `length`, `author.username`, `contributors[].username`, `status`, `children` (resource URI object, not IDs, so child presence is discovered by fetching).

Affected files (final implementation):

- `src/app/onion/learning-object-builder/components/hierarchy-tree/hierarchy-loader.service.ts` (new; page-scoped; builds the tree, per-branch cycle guard, per-load request memoization, `status$`, `retry()`)
- `src/app/onion/learning-object-builder/components/hierarchy-tree/hierarchy-node.mapper.ts` (new; `LearningObject` to `HierarchyNode`, editable rule, occurrence key)
- `src/app/onion/learning-object-builder/components/hierarchy-tree/hierarchy-tree.types.ts` (adds `HierarchyLoadStatus`, `HierarchyViewer`, and `HierarchyNode.learningObjectId`)
- `src/app/onion/learning-object-builder/components/hierarchy-tree/hierarchy-view.service.ts` (mock removed; `canDrop` duplicate-child rule)
- `src/app/onion/learning-object-builder/components/hierarchy-tree/hierarchy-tree.component.{ts,html,scss}` (loading, error, empty, ready states)
- `src/app/onion/learning-object-builder/pages/hierarchy-page/hierarchy-page.component.ts` (provides the loader)
- Specs: `hierarchy-loader.service.spec.ts`, `hierarchy-node.mapper.spec.ts`, `hierarchy-tree.states.spec.ts`, `hierarchy-view.service.spec.ts`, `hierarchy-tree.component.spec.ts`.

NOT changed (an earlier draft of this plan added them, then PR review removed them): `src/app/core/learning-object-module/hierarchy/hierarchy.routes.ts`, `hierarchy.service.ts` (no `getChildren`, no `GET_CHILDREN`), and no `HierarchyChildPayload` type. The mapper and loader use the existing `LearningObject` entity.

Legacy and drift to name:

- The Promise-based `LearningObjectService.getLearningObjectChildren` stays as is. It is not reused because of `toPromise()`.
- The `LearningObject` entity and `HierarchyNode` are separate shapes. This story keeps `HierarchyNode` as the view model and maps into it; it does not merge them.
- Jest vs Karma tooling drift (see SC-39642 and SC-40233 plans). Use the nearest spec patterns in `hierarchy-tree/`.

## Plan of Work

Final implementation (after PR review rounds 1 and 2):

1. Reuse the existing `LearningObjectService.getLearningObjectChildren` (Promise-based; wrapped with `from()` in the loader). No new route, service method, or API type.
2. `hierarchy-node.mapper.ts`: `toHierarchyNode(learningObject, viewer, insideReadOnly, key)` builds a `HierarchyNode` with `id` = occurrence key, `learningObjectId` = the learning object id, and `editable` per the Decision Log (author, contributor, or admin/editor; otherwise a linked read-only root; everything under a read-only node is immutable).
3. `HierarchyLoaderService.load(root)`: sets `loading`; builds the tree level by level; for each parent passes the ancestor id set and the parent's occurrence key; skips nanomodules, children whose id is an ancestor (cycle), duplicate ids within one parent's response, and anything deeper than five levels; memoizes one children request per learning object id for this load; publishes the tree through `HierarchyViewService.setTree` and sets `ready`, `empty`, or `error`. A newer `load` supersedes an older one. `retry()` re-runs the last load.
4. `HierarchyViewService.canDrop` rejects a target that already holds the same learning object (except same-parent reorder).
5. Tree component and template render the four states.
6. Tests and browser verification (see Validation).

Out of scope: persistence of moves (SC-40642), create-child (SC-40236), link-existing (SC-40237), explicit linking (SC-40641), new gateway routes, backend changes, converting `LearningObjectService` to Observables, keyboard-navigation work.

## Concrete Steps

From `/Users/josuemorales/secured/development-environment/clark-client`:

    node -v
    ./node_modules/.bin/ng version

Expect Node 22.x (repo requires `^22.13.1`).

    ./node_modules/.bin/jest --runInBand src/app/onion/learning-object-builder/components/hierarchy-tree src/app/core/learning-object-module/hierarchy

Expect the hierarchy specs to pass, or documented Jest preset drift if not.

    ./node_modules/.bin/ng build clark

Expect exit 0. Then run the app (`npm start`, run by the user) and verify in the browser.

## Validation and Acceptance

Automated (Jest; `npx jest --runInBand src/app/onion/learning-object-builder/components/hierarchy-tree`):

- Mapper: author, contributor, and admin map to editable; others map to `editable: false, linkedRoot: true`; descendants of a read-only node are immutable; `id` is the occurrence key and `learningObjectId` is the learning object id.
- Loader: success builds a nested tree; empty parent yields `empty`; failure yields `error` and `retry()` recovers; a nanomodule is never queried; a stale response from a superseded load is ignored.
- Loader, shared children (regression for PR review round 2): two units that both contain the same module render that module under BOTH units, whichever unit's request resolves first; each occurrence has a distinct `id` and the same `learningObjectId`; the shared module's children request is made once; a child repeated within one parent's response appears once; a cycle (a descendant that lists an ancestor) is cut at the repeat while the rest of the tree loads.
- View service, occurrence targeting: toggling one occurrence expands only that occurrence; `moveNode` moves only the occurrence it names and leaves the other occurrence in place; `validDestinations` and `canDrop` exclude a parent that already contains the same learning object.
- Component: loading, error (Retry), empty, and ready states render; `data-node-id` values are unique when a learning object appears under two parents.
- No `seedMockData` or mock tree in non-spec source.

Manual (Playwright; gateway mocked): ready, loading, error + Retry, and empty states (done at desktop width in round 1); a shared child shown under two parents, expanded and collapsed independently, and moved from one parent only (round 2).

Access: no route, guard, or interceptor changes. A 403 from the API shows the error state.

## Idempotence and Recovery

All steps are additive until the mock removal in step 4. If the work stops halfway, the tree component still compiles as long as `seedMockData` is removed in the same commit as the `load` wiring. To roll back, revert the commit; no data or environment changes are involved.

## Artifacts and Notes

- Backend read path: `clark-service/src/modules/learning-object-module/learning-object/learning-object.component.ts` (`getLearningObjectChildren`).
- Tooling fragility from earlier plans (Node 25 aborts `ng build`, repo-wide `tsc` drift) still applies.

## Interfaces and Dependencies

- Services: `LearningObjectService.getLearningObjectChildren` (existing, root-provided, Promise-based), `AuthService` (username, `isAdminOrEditor()`), `HierarchyLoaderService` and `HierarchyViewService` (page-scoped).
- Types: `HierarchyNode` (now with `learningObjectId`), `HierarchyLoadStatus`, `HierarchyViewer`; the `LearningObject` entity. No new API payload type.
- API: existing gateway `GET /learning-objects/:learningObjectId/children`; no contract change.
- Test tooling note: `learning-object.service.ts` imports via a bare `app/...` path that Jest cannot resolve, so specs that load it `jest.mock` the module.
- No new npm dependencies, no environment changes.

## Open Questions

- How should "linked/read-only" be determined before SC-40641 adds an explicit link field? This plan assumes "not author, not contributor, not admin/editor". Confirm with product/backend.
- Reviewers: the story says they can edit exactly when they can today. Confirm whether reviewer status should be treated as editable for children; the client currently has no per-object reviewer signal.
