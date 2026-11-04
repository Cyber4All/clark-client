# SC-40640: Load and Display the Author's Hierarchy in the Builder Hierarchy Tab

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

Story: https://app.shortcut.com/clarkcan/story/40640 (epic 39262, Builder - Hierarchy Manager). Depends on SC-40233 (Hierarchy tab UI, already on this branch's history). Blocks SC-40236, SC-40237, SC-40641, SC-40642.

## Purpose / Big Picture

Today the Builder Hierarchy tab renders a hard-coded mock tree. After this change, opening the tab for a saved, non-nanomodule learning object fetches that object's real hierarchy through the existing gateway routes and renders it with:

- the current learning object as the root;
- editable children and linked/read-only children using the treatments already built in SC-40233;
- loading, empty (no children), and error (with retry) states;
- no mock service, mock fixtures, or seeded local state left in production code.

Success is observable by opening a Builder for an object that has children (for example one created through the legacy admin Hierarchy Builder), clicking Hierarchy, and seeing the real tree. Opening an object without children shows the empty state. Taking the API offline shows the error state with a Retry button.

## Progress

- [x] (2026-11-04T00:00Z) Read `PLANS.md`, `AGENTS.md`, the Shortcut story, and the SC-40233 ExecPlan.
- [x] (2026-11-04T00:00Z) Traced gateway and clark-service routes for hierarchy reads (see Context and Orientation).
- [x] (2026-11-04T00:00Z) Created this plan. Branch `feature/sc-40640/load-and-display-the-author-s-hierarchy-in-the` is already checked out.
- [x] (2026-11-04T21:40Z) Added `GET_CHILDREN` route, `HierarchyChildPayload` type, and Observable `HierarchyService.getChildren()`.
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
- Observation: The repo's rxjs has no `firstValueFrom`.
  Evidence: TS2305 when first writing the loader spec.
- Observation: Many sibling builder specs (contributor-pill, outcome, scaffold, etc.) already fail `should create`; unrelated to this story.
  Evidence: `npx jest src/app/onion/learning-object-builder` output.

## Decision Log

- Decision: Read the hierarchy with the existing `GET /learning-objects/:id/children` route and assemble the tree client-side by walking children recursively.
  Rationale: The story says to use existing gateway routes and preserve the API contract. No tree-shaped route exists. The move picker and `validDestinations` need the whole tree in memory, so lazy per-expand loading would break them.
  Date/Author: 2026-11-04 / Kiro

- Decision: Put the new read method in the existing `HierarchyService` (`src/app/core/learning-object-module/hierarchy/`) as an `Observable`, with its URL built in `hierarchy.routes.ts`. Do not touch the Promise-based `LearningObjectService`.
  Rationale: One domain service per API area, typed Observable returns, URL construction in the routes helper, no new `toPromise()` (AGENTS.md). Leaves the legacy `addHierarchyObject` untouched.
  Date/Author: 2026-11-04 / Kiro

- Decision: Walk levels breadth-first with `expand`/`forkJoin`-style fan-out per level, skip leaves by length (nanomodules have no children) and by an already-visited ID set, and cap depth at the number of lengths (5).
  Rationale: Bounds request count, avoids cycles from bad data, and keeps load time proportional to depth rather than node count.
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
2. Tree component asks the view service to `load(learningObject)`.
3. View service calls `HierarchyService.getChildren(id)` level by level, maps each payload with the new mapper, and publishes `tree$` and `status$`.
4. Template renders loading, error (Retry), empty (root only, zero children), or the tree.

API contract (verified in local repos under `~/secured/development-environment`):

- Client: `GET ${environment.apiURL}/learning-objects/{id}/children` with credentials.
- Gateway: `clark-gateway/src/modules/clark/learning-object-module/learning-objects.routes.ts`, proxied to clark-service.
- clark-service: `getLearningObjectChildren` returns `FullLearningObject[]` for direct children. 404 when the parent is missing, 403 when the token lacks read access. Fields used by the mapper: `id`, `name`, `length`, `author.username`, `contributors[].username`, `status`, `children` (resource URI object, not IDs, so child presence is discovered by fetching).

Affected files:

- `src/app/core/learning-object-module/hierarchy/hierarchy.routes.ts` (add `GET_CHILDREN`)
- `src/app/core/learning-object-module/hierarchy/hierarchy.service.ts` (add `getChildren`)
- `src/app/onion/learning-object-builder/components/hierarchy-tree/hierarchy-tree.types.ts` (add `HierarchyLoadStatus`, API payload type)
- `src/app/onion/learning-object-builder/components/hierarchy-tree/hierarchy-node.mapper.ts` (new)
- `src/app/onion/learning-object-builder/components/hierarchy-tree/hierarchy-view.service.ts` (add `load`, `status$`; remove mock)
- `src/app/onion/learning-object-builder/components/hierarchy-tree/hierarchy-tree.component.{ts,html,scss}` (states; remove seeding)
- `src/app/onion/learning-object-builder/pages/hierarchy-page/hierarchy-page.component.ts` (only if inputs change)
- Specs: `hierarchy-tree.component.spec.ts`, `hierarchy-view.service.spec.ts`, new specs for the mapper and `HierarchyService`.

Legacy and drift to name:

- The Promise-based `LearningObjectService.getLearningObjectChildren` stays as is. It is not reused because of `toPromise()`.
- The `LearningObject` entity and `HierarchyNode` are separate shapes. This story keeps `HierarchyNode` as the view model and maps into it; it does not merge them.
- Jest vs Karma tooling drift (see SC-39642 and SC-40233 plans). Use the nearest spec patterns in `hierarchy-tree/`.

## Plan of Work

1. Service layer: add `GET_CHILDREN(learningObjectId)` to `hierarchy.routes.ts`. Add `getChildren(learningObjectId: string): Observable<HierarchyChildPayload[]>` to `HierarchyService` using `HttpClient.get` with `withCredentials: true`. No error swallowing; callers handle errors.
2. Mapper: `toHierarchyNode(payload, currentUser)` builds a `HierarchyNode` with `editable` per the Decision Log, `children: []`, `expanded: false`. Pure function, unit tested.
3. View service: add `load(root: LearningObject)` that sets `status$` to `loading`, builds the root node, fetches children by level with cycle and depth guards, then publishes the tree and `ready`. On failure publish `error` and keep the previous tree empty. Add `retry()` that re-runs the last load. Use `switchMap`-style cancellation so a second `load` cancels the first, and tie the stream to the service lifetime (page scoped, `ngOnDestroy` completes it).
4. Remove `seedMockData` and `buildMockHierarchy` from the view service and the `LearningObject.Length` destructuring they needed.
5. Tree component: call `load` in `ngOnInit`/`ngOnChanges` when the learning object has an `id`. Drop `applyRootName`. Template: `status$ | async` switch for loading (skeleton rows with `aria-busy`), error (message + Retry button, `role="alert"`), empty (message under the root banner), ready (existing tree). Keep the footer hint.
6. Tests: update the one `seedMockData` test; add specs for the mapper, `HierarchyService.getChildren`, and `HierarchyViewService.load` (success, empty, error, cycle guard, cancel on reload).
7. Visual verification with the Playwright loop.

Out of scope: persistence of moves (SC-40642), create-child (SC-40236), link-existing (SC-40237), linking read-only children (SC-40641), new gateway routes, backend changes, keyboard-navigation work, converting the `LearningObjectService` to Observables.

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

Automated:

- `HierarchyService.getChildren` issues `GET {apiURL}/learning-objects/{id}/children` with credentials and returns the typed payload.
- Mapper: author, contributor, and admin map to editable; others map to `editable: false, linkedRoot: true`.
- View service `load`: success builds a nested tree; empty parent yields root with no children and `ready`; failure yields `error` and `retry()` recovers; a repeated ID does not recurse; a second `load` cancels the first; nanomodules are not queried.
- Component: loading, error (Retry), empty, and ready states render.
- No `seedMockData` or `buildMockHierarchy` in non-spec source (`grep` returns nothing).

Manual (Playwright, desktop 1440 and phone 390 widths):

- Object with a multi-level hierarchy shows the real nested tree, with expand/collapse working.
- Object with a child the user does not own shows the linked/read-only treatment, with no drag handle.
- Object without children shows the empty state.
- Blocking `/children` requests shows the error state; Retry loads the tree.
- No console errors; network shows one `/children` request per non-leaf node.

Access: no route, guard, or interceptor changes. Hierarchy tab gating from SC-40233 is unchanged. A 403 from the API shows the error state.

## Idempotence and Recovery

All steps are additive until the mock removal in step 4. If the work stops halfway, the tree component still compiles as long as `seedMockData` is removed in the same commit as the `load` wiring. To roll back, revert the commit; no data or environment changes are involved.

## Artifacts and Notes

- Backend read path: `clark-service/src/modules/learning-object-module/learning-object/learning-object.component.ts` (`getLearningObjectChildren`).
- Tooling fragility from earlier plans (Node 25 aborts `ng build`, repo-wide `tsc` drift) still applies.

## Interfaces and Dependencies

- Services: `HierarchyService` (core, root-provided), `HierarchyViewService` (page-scoped), `AuthService` (current username / admin check).
- Types: `HierarchyNode`, new `HierarchyChildPayload`, `HierarchyLoadStatus`; `LearningObject` entity for the root.
- API: existing gateway `GET /learning-objects/:learningObjectId/children`; no contract change.
- No new npm dependencies, no environment changes.

## Open Questions

- How should "linked/read-only" be determined before SC-40641 adds an explicit link field? This plan assumes "not author, not contributor, not admin/editor". Confirm with product/backend.
- Reviewers: the story says they can edit exactly when they can today. Confirm whether reviewer status should be treated as editable for children; the client currently has no per-object reviewer signal.
