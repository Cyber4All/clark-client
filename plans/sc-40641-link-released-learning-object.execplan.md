# SC-40641: Link a Released Learning Object as a Read-Only Child in the Hierarchy Builder

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

Story: https://app.shortcut.com/clarkcan/story/40641 (epic 39262, Builder - Hierarchy Manager). Branch: `feature/sc-40641/link-a-released-learning-object-as-a-read-only`, created from `feature/sc-40236/create-a-new-learning-object-as-a-child-in-the`, so it contains SC-40233 (tree), SC-40640 (loader), SC-40642 (remove and move), and SC-40236 (create child). Backend parts live in `clark-service` (branch of the same name, built on the SC-40235 candidate search branch; plan `clark-service/plans/sc-40641-validate-hierarchy-links.execplan.md`) and `clark-gateway` (one proxy route). Related stories: SC-40235 (search, in development), SC-40237 (add own object as an editable child; reuses the drawer built here later), SC-40239.

Decisions from the story owner (2026-11-20): backend validation is in scope; build on the SC-40235 branch; the drawer is link-only for now (SC-40237 will extend it); the author's own released objects show as linked, because a released object can only change through a revision.

## Purpose / Big Picture

An author can open a node's Action Menu on the Hierarchy tab, choose "Link Released Object", and search all released learning objects (their own and other authors') with a text query and length and topic filters. Choosing a result attaches it immediately as a linked, read-only child of that node. The linked node shows its inherited subtree. Its internals cannot be edited from the consuming parent, but the linked node can be moved or removed as a whole (already built in SC-40642).

If saving fails, the new row disappears again and an error is shown. Permissions are unchanged. A link resolves to the object's current revision by id; nothing special is needed on the client when a revision is created.

Also required by the story, now done on the backend: reject the parent itself, its ancestors (cycles), objects already in the hierarchy, and lengths invalid for the parent. The client mirrors these so invalid choices are not offered.

Out of scope: adding the author's own unreleased objects (SC-40237), reorder, linked-object revisions, the legacy scaffold `AddChildComponent`.

## Progress

- [x] (2026-11-20) Read story 40641 and its dependencies (40640, 40235, 40233, 40236, 40232 discovery), the SC-40236 ExecPlan, and the hierarchy-tree code.
- [x] (2026-11-20) Branches created in `clark-service`, `clark-gateway`, `clark-client`.
- [x] (2026-11-20) Backend: attach validation, `hierarchyRootId`, tests (see the service plan). Committed in `clark-service` (`6fb23b7f`).
- [x] (2026-11-20) Gateway: proxy `GET /learning-objects/:learningObjectId/hierarchy-candidates` (auth). Committed in `clark-gateway` (`cf46998`).
- [x] (2026-11-20) Client services: `HierarchyService.searchLinkCandidates` (Observable) and `HIERARCHY_ROUTES.GET_HIERARCHY_CANDIDATES`; `LearningObjectService.setChildren` takes an optional `hierarchyRootId`.
- [x] (2026-11-20) Mapper: a released object is always a read-only linked root (author, contributor, admin, or editor alike).
- [x] (2026-11-20) Loader: `loadLinkedSubtree`.
- [x] (2026-11-20) View service: `containsLearningObject`, `setChildrenOf`.
- [x] (2026-11-20) Edit service: `link` (optimistic, rollback, subtree attach, reload fallback). It now takes the loader as a third constructor argument.
- [x] (2026-11-20) Types: `NodeActionId` adds `"link-existing"`.
- [x] (2026-11-20) Node component: "Link Released Object" menu item; tooltip text for released and inherited objects.
- [x] (2026-11-20) Link drawer component (CDK overlay side panel, reactive form, debounced search, length and topic filters, paging, loading/empty/error states).
- [x] (2026-11-20) Tree component: opens the drawer, calls `link`, toasts, announces, restores focus.
- [x] (2026-11-20) Specs: mapper, loader, view service, edit service, node, drawer (32 tests), tree integration, and `hierarchy.service.spec.ts`. The hierarchy-tree and hierarchy service suites pass (393 passing across the wider run; see Outcomes for the unrelated failures). `tsc --noEmit -p src/tsconfig.app.json` is clean and Prettier passes on every changed file.
- [x] (2026-11-20) Browser check against the real gateway and `clark-service` (Playwright, a non-admin author, local `onion` database) at 1280px and 390px; see Outcomes.

- [x] (2026-11-20 21:40Z) Review follow-up: after a successful link the drawer asks the server again for as many results as were showing, so its list, total, and paging offset match the server. Specs: 8 new/changed drawer specs, tree spec mock now leaves out a linked object like the API. Checked against the real API: linking a released Unit with six Modules took the Module candidate count from 639 to 633, and a retried link returned 200 without a duplicate.

## Surprises & Discoveries

- Observation (review): linking an object also takes everything inside it out of the candidate results, because the server leaves out the whole hierarchy. The first version removed only the linked object from the drawer's list and computed the next page from the list length. With 20 of 31 results loaded, linking a Unit whose six Modules were among them left the list 7 shorter than the server's, so the offset was wrong and "Show more" could disappear with unseen results left.

- Observation: The gateway has no `hierarchy-candidates` route (not on main and not on the SC-40234 branch). Added in this story.
- Observation: `POST /learning-objects/:id/children` validated almost nothing. SC-40235 only adds search. Server-side link validation was therefore added in `clark-service` here (see the service plan). One consequence for the client: re-parenting (SC-40642) adds under the new parent before removing from the old one, so "already in the hierarchy" is only enforced when the client sends `hierarchyRootId`, which only the link flow does.
- Observation: `canViewerEdit` in `hierarchy-node.mapper.ts` ignores status. Today an author's own released child, or any child when the viewer is an admin or editor, would show as editable. The story says a released object is always linked.
- Observation: The old `HierarchyViewService.addChild` already accepts a read-only child (`editable: false, linkedRoot: true`) and refuses a duplicate under the same parent, so linking can reuse it.
- Observation: Candidate results come from the search index, so they have `id`, `cuid`, `version`, `name`, `length`, `description`, `author`, `topics` (ids), `status`; `new LearningObject(object)` maps them, as `SearchService` does for other searches.

- Observation: Text search returns 500 on the local stack. The existing public search does too (`GET /learning-objects?text=...`). The local `objects-index` collection has no text index (`text index required for $text query`); production and staging use Atlas `$search`. So text search is verified by unit tests and by the drawer's error state, not against real data. This is the same Atlas smoke test the SC-40235 plan lists as outstanding.
- Observation: The local gateway and `clark-service` bind-mount `src`, and `nodemon` crashed with `EADDRINUSE` when the branches were switched underneath it. Both containers were restarted once to pick up the SC-40641 branches.
- Observation: After a link, the server's own `updateReadme` step logs "Collection not found" on the local stack. It is inside the existing try/catch around the README rebuild and the request still returns 200. It is not caused by this change.
- Observation: Candidate descriptions are stored as HTML (`<p>`, `&nbsp;`). The drawer shows them as plain text through `DOMParser`.

## Decision Log

- Decision: Add the candidate search to the existing `HierarchyService` (`core/learning-object-module/hierarchy/`) as an Observable method, with its route in `hierarchy.routes.ts`.
  Rationale: One domain service per API area; no new `toPromise()`. `HierarchyService` currently only has a legacy admin method, and this is the natural home.
  Date/Author: 2026-11-20 / Kiro
- Decision: Extend `LearningObjectService.setChildren` with an optional fourth argument `hierarchyRootId` that is sent in the body of the add call only.
  Rationale: Smallest change that lets the server enforce "already in the hierarchy". Existing callers are unchanged.
  Date/Author: 2026-11-20 / Kiro
- Decision: Linking is optimistic. The linked node is added to the tree first, then the API is called; on failure the previous tree is restored. After success the node's inherited subtree is fetched and attached; if that fetch fails, the tree is reloaded from the server.
  Rationale: Matches "attaches immediately ... on failure, roll back the UI" and the SC-40642 pattern. The subtree is not needed to roll back, so it does not delay the row.
  Date/Author: 2026-11-20 / Kiro
- Decision: The edit service gets the loader as a third constructor argument and calls a new `HierarchyLoaderService.loadLinkedSubtree`.
  Rationale: The loader already owns "fetch children recursively and map to nodes with the viewer's rules"; duplicating that in the edit service would copy the cycle guard and shared-child cache. Both services are page-scoped providers in `HierarchyPageComponent`.
  Date/Author: 2026-11-20 / Kiro
- Decision: A node whose status is `released` is `editable: false, linkedRoot: true` regardless of the viewer. Everything under it is read-only (existing rule for descendants of a read-only node).
  Rationale: Story notes and owner decision. The server already denies write access to released objects.
  Date/Author: 2026-11-20 / Kiro
- Decision: The drawer stays open after a successful link so several objects can be linked in a row; the linked result is removed from the list. It closes on Escape, the close button, or a backdrop click, and focus returns to the node's menu button.
  Rationale: The story says selecting attaches immediately; keeping the drawer open avoids reopening for each object. Linked results are removed locally because the server only excludes them on the next search.
  Date/Author: 2026-11-20 / Kiro
- Decision: The drawer is a right-side panel opened in a CDK overlay from the tree, the same mechanism as the other dialogs, with a `mode`-free, link-only API. SC-40237 will add a mode.
  Rationale: Owner decision. Keeps the SC-40237 change additive.
  Date/Author: 2026-11-20 / Kiro

- Decision (review): after a link, refresh the active search instead of patching the list. `markLinked` still removes the linked result at once, then repeats the search from page 1 asking for as many results as were showing, rounded up to whole pages. The old list stays on screen until the answer arrives (no skeleton), "Show more" waits while the refresh runs, a newer search the author starts replaces it, and a failed refresh shows the error state with Try again because the list may no longer match the server. Because the list then holds whole pages (or everything that is left), the next page is `floor(shown / 10) + 1` and lines up with the server again.
  Date/Author: 2026-11-20 / Kiro

## Outcomes & Retrospective

Linking works end to end. In the browser, as a non-admin author on the real stack: the drawer lists released objects from all authors, filters by length, and paged results update as objects are linked; choosing "Software Static Analysis" (another author's released Module) added it at once as "Linked · Read only" with a drag handle and its own menu, and the API returned 200 for `POST .../children` with the hierarchy root; choosing "Advanced Data Science" (a released Unit with six Modules) showed all six as "Inherited · Read only"; a blocked `POST` rolled the row back, showed the error in the drawer and as a toast, and left the Link button enabled; Escape returned focus to the row's menu button; the drawer is full width at 390px with no horizontal overflow; the console had no errors from this feature. Direct API calls through the gateway confirmed the server rejects: a link already in the hierarchy (400), the parent itself (400), an ancestor (400), a course under a module (400), another author's draft (403), and a child added under a released object (403).

Not verified against real data: text search (see Surprises), the topic filter (the local `topics` collection is empty, so the select only offers "All topics"; the request shape is unit tested), and the Atlas search path. The unit and e2e tests cover the server rules. Unrelated builder specs still fail with `Cannot find module 'app/...'` (existing Jest path-resolution drift noted in earlier plans); no hierarchy spec is affected.

Limits and follow-ups:
- "Already in the hierarchy" is enforced by the server only when `hierarchyRootId` is sent (the link flow does). A client that omits it can still attach a shared child to two branches of one root. Cycles, lengths, and draft ownership are always enforced.
- A newly linked branch starts collapsed unless it was expanded by the author; its inherited objects load when the link is saved.
- The Go bundling service has no cycle or missing-child handling (see the service plan); recommended as a separate story.
- SC-40237 should extend the drawer with an editable mode (its own unreleased objects) rather than add a second panel.
- The test data created locally: `SC40641 Test Course/Unit/Module <timestamp>` and `SC40641 UI Course`, authored by the test account, in the local `onion` database.

## Context and Orientation

Scope: `src/app/onion/learning-object-builder/components/hierarchy-tree/**`, `src/app/core/learning-object-module/hierarchy/**` (service and routes), and `LearningObjectService.setChildren`. No routing, guard, interceptor, environment, or build change.

Today's flow for SC-40236, which this follows: node Action Menu -> `HierarchyNodeComponent` emits `menuAction` -> `HierarchyTreeComponent.onMenuAction` opens a CDK overlay component -> a confirm event calls `HierarchyEditService` -> the tree is changed -> toast, announcement, focus.

Linking flow after this story:

1. "Link Released Object" in a node's menu (enabled for the same nodes as "Add Child Object": editable, can hold children, not saving).
2. The tree opens `HierarchyLinkDrawerComponent` with the parent's id, name, length, and the hierarchy root id.
3. The drawer loads topics once and searches `GET /learning-objects/:parentId/hierarchy-candidates?mode=link&hierarchyRootId=&length=&topics=&text=&currPage=&limit=` (debounced; text only when empty or at least 3 characters, the server minimum). Lengths offered are only those shorter than the parent.
4. Choosing a result emits `link` with the candidate. The tree calls `HierarchyEditService.link(parentNodeId, candidate)`.
5. `link` checks the rules, adds the linked node, calls `setChildren(parentId, [candidate.id], false, rootId)`, then loads the inherited subtree and sets it on the node. On failure it restores the tree.

API calls used: the new candidates route (GET, auth) and the existing `POST /learning-objects/:id/children` with an extra optional `hierarchyRootId`.

Legacy and drift to name: `LearningObjectService` is Promise-based and wrapped with `from(...)`; `HierarchyService` is a root-provided legacy service with a Promise method; the old scaffold `AddChildComponent` has its own length list and is unrelated; Jest cannot resolve the bare `app/...` imports in `learning-object.service.ts`, so specs `jest.mock` it.

## Plan of Work

1. Services: `HIERARCHY_ROUTES.GET_HIERARCHY_CANDIDATES`, `HierarchyService.searchCandidates` (typed params and result), `setChildren(..., hierarchyRootId?)`.
2. Mapper: released -> read-only linked root; tooltip wording for released objects.
3. Loader: `loadLinkedSubtree(candidate)` returns the fetched, read-only descendants as nodes.
4. View service: `containsLearningObject(id)`, `setChildrenOf(nodeId, children)`.
5. Edit service: `link`.
6. Node component: "Link Released Object".
7. Drawer component.
8. Tree component wiring.
9. Specs, then browser verification.

## Concrete Steps

From `/Users/josuemorales/secured/development-environment/clark-client`:

    node -v
    ./node_modules/.bin/jest --runInBand src/app/onion/learning-object-builder/components/hierarchy-tree src/app/core/learning-object-module/hierarchy
    ./node_modules/.bin/tsc --noEmit -p src/tsconfig.app.json
    npx prettier --check <changed files>

Then run the stack (`docker compose` in the workspace root, gateway pointing at the SC-40641 `clark-service` build) and check the Hierarchy tab in the browser with Playwright at 1280px and 390px.

## Validation and Acceptance

Jest:

- Mapper: a released child is `editable: false, linkedRoot: true` for its author, a contributor, and an admin; an unreleased child keeps the old rule; a child under a read-only parent is never a linked root.
- Loader: `loadLinkedSubtree` returns read-only nodes for the whole subtree, requests each child once, stops at Nanomodules and the depth cap, and errors when a request fails.
- View service: `containsLearningObject` finds occurrences at any depth; `setChildrenOf` replaces only the target node's children.
- Edit service, link: success calls `setChildren(parentId, [id], false, rootId)` once, adds a linked read-only node as the parent's last child with its subtree, and releases the lock; an API failure restores the exact previous tree and errors `failed`; a failed subtree load keeps the link and reports `reloadRecommended`; guards refuse (no API call) for a non-editable parent, a Nanomodule parent, a length that is not shorter, the parent itself, an object already in the tree, and a second call while saving.
- Node component: "Link Released Object" is enabled only where "Add Child Object" is.
- Drawer: only lengths shorter than the parent are offered; search runs after the debounce, not for 1 or 2 characters; filters change the request; loading, empty, error with retry, and "Load more" paging; a click on a result emits `link`; a linked result is removed; Escape and close emit `close`.
- Tree: the menu item opens the drawer; `link` success shows a toast and focuses the row; failure shows an error toast and keeps the tree as it was; the overlay is disposed on destroy.

Browser (Playwright, real gateway and `clark-service`): link another author's released Module under a Course; the row appears with the Linked label and its subtree; no edit actions on it or its descendants; move it to another parent and remove it; a forced failure (stopped service) rolls the row back and shows an error; searching with length and topic filters; own released object shows as Linked; invalid choices (the parent, an ancestor, an object already in the tree) are not in the results; reload shows the link; the server rejects the same calls made directly with curl. Check at 1280px and 390px and read the console.

## Idempotence and Recovery

All steps are additive. Revert the commits on this branch to roll back. The branch sits on `feature/sc-40236/...`; revert only commits after `4ac6c06b7`. The `clark-service` and `clark-gateway` branches are separate and must ship before the client uses the new route and body field; the client sends `hierarchyRootId` only on the link call, and an older server ignores the extra body field. A link that is saved but whose subtree could not be loaded is repaired by the reload the tree runs on `reloadRecommended`.

## Artifacts and Notes

- Backend validation, tests, and the bundling finding: `clark-service/plans/sc-40641-validate-hierarchy-links.execplan.md`.
- The uncommitted `package-lock.json` change predates this story; do not stage it.
- The SC-40235 search sits in an unmerged `clark-service` branch with no PR; this story's `clark-service` branch includes its commits.
- Tooling fragility from earlier plans (Node 25 aborts `ng build`, repo-wide `tsc` drift, many unrelated builder specs failing `should create`) still applies.

## Interfaces and Dependencies

- Services: `HierarchyService.searchCandidates` (new, Observable), `LearningObjectService.setChildren` (+ optional `hierarchyRootId`), `HierarchyLoaderService.loadLinkedSubtree` (new), `HierarchyViewService` (+ `containsLearningObject`, `setChildrenOf`), `HierarchyEditService` (+ `link`, + loader dependency), `TopicsService.getTopics` (existing, for the filter).
- Types: `NodeActionId` (+ `"link-existing"`), `HierarchyCandidateQuery`, `HierarchyCandidatePage`, `HierarchyLinkOutcome`.
- UI: new `HierarchyLinkDrawerComponent`; changes to `HierarchyNodeComponent` and `HierarchyTreeComponent`.
- API: new gateway route and the extra optional body field described above.
- No new npm dependencies and no environment changes.
