# SC-40233: Build Hierarchy Tab and Tree Components in the Learning Object Builder

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Authors need a new **Hierarchy** tab inside the Learning Object Builder where they can see and manipulate a learning object's composed hierarchy as a folder/tree. This story delivers the **UI and interaction shell only, driven by mock/local data** — no backend integration. After this change, opening a non-nanomodule learning object in the Builder shows a Hierarchy tab that renders a tree of the object and its (mocked) descendants with:

- folder/tree-style display with expand/collapse per branch;
- a clear visual distinction between editable nodes and linked/read-only subtrees;
- drag-and-drop reordering/re-parenting for valid moves;
- prevention and visual indication of invalid drop targets (child must be shorter than parent; nanomodules cannot have children; nodes inside a linked/read-only subtree cannot be independently moved).

Success is observable in `clark-client` by navigating to a learning object Builder, clicking the Hierarchy tab, and interacting with the mock tree: expanding/collapsing, dragging a valid node to a valid parent (succeeds), dragging to an invalid target (blocked + indicated), and confirming read-only subtrees reject internal edits/moves.

This story is the frontend spine of epic 39262 (Builder - Hierarchy Manager). It intentionally does **not** call hierarchy APIs; later stories (sc-40236 wire new-child creation, sc-40237 wire existing-object linking) replace the mock data source with real persistence.

## Progress

- [x] (2026-10-22T00:00Z) Read `PLANS.md` and `AGENTS.md`; confirmed this multi-area story (routing + navbar + new components + local state) requires an ExecPlan before implementation.
- [x] (2026-10-22T00:00Z) Scoped the Builder tab structure, existing hierarchy/scaffold patterns, domain model, and DnD/tree capabilities (see Context and Orientation).
- [x] (2026-10-22T00:00Z) Confirmed Angular 18 + NgModule reality and recorded skill-vs-repo adaptation decisions (see Decision Log).
- [x] (2026-10-22T01:00Z) Reviewed all three UX mocks from epic comment 40227 (`add_child_choice.png`, `add_new.png`, `add_existing.png`) and folded their layout, affordances, drag-drop treatment, and copy into this plan — see Surprises and Plan of Work.
- [x] (2026-10-22T02:40Z) Added `hierarchy` child route to `learning-object-builder.routing.ts` with `data: { state: 'hierarchy' }`.
- [x] (2026-10-22T02:40Z) Added Hierarchy nav item to `builder-navbar.component.html` + `canRoute('hierarchy')` gating (saved object + non-nanomodule) in `builder-navbar.component.ts`.
- [x] (2026-10-22T02:40Z) Created `pages/hierarchy-page/` mirroring sibling pages (column-wrapper: scaffold left, tree main); provides `HierarchyViewService` at page scope.
- [x] (2026-10-22T02:40Z) Defined `hierarchy-tree.types.ts` (HierarchyNode + editable flag) and `hierarchy-length.util.ts` (ordering/validity sourced from `LearningObject.Length`).
- [x] (2026-10-22T02:40Z) Created `hierarchy-view.service.ts` (BehaviorSubject mock/local state with seed data, expand/collapse, canDrop, moveNode).
- [x] (2026-10-22T02:40Z) Built the tree + recursive node components with expand/collapse.
- [x] (2026-10-22T02:40Z) Added editable vs linked/read-only visual treatment (root banner, length pills, drag handle/`+` vs link label/overflow) and disabled drag + actions on read-only nodes.
- [x] (2026-10-22T02:40Z) Added CDK drag-and-drop with per-node `cdkDropListEnterPredicate` gating invalid targets; read-only subtree relocates as a unit (node moved with its children array).
- [x] (2026-10-22T02:40Z) Applied initial ARIA tree semantics (role=tree, aria-expanded on toggles, labeled handles/buttons). Deeper keyboard operability (roving tabindex / arrow-key nav) noted as follow-up.
- [x] (2026-10-22T02:40Z) Registered the Hierarchy page in the Builder module imports and the route.
- [x] (2026-10-22T02:54Z) Verified under Node 22: scoped `tsc --noEmit` shows 0 errors in new files (28 pre-existing repo-wide errors unrelated to this story); fixed one build error (missing `AsyncPipe` import) caught by `ng build`; `ng build clark` now exits 0 with the builder module bundled.
- [x] (2026-10-23T16:30Z) Reworked the tree connector lines (child `└` / sibling `├` / spine `│`) from a fragile fixed-pixel/row-center scheme to a per-`.node-branch` elbow model drawn in the parent gutter (negative x). Robust to variable row heights; verified in a rendered Playwright harness against the target ASCII tree. Files: `hierarchy-node.component.{html,scss}`.
- [x] (2026-10-23T18:55Z) VERIFIED the single-`cdkDropList` rebuild end-to-end by driving the logged-in app with Playwright real mouse (press/step-move/release). In-browser DOM now shows exactly 1 `cdk-drop-list`, 18 `cdk-drag`, 0 drop-zones (was 36 lists). Confirmed: (a) drop onto a valid parent nests UNDER it (Integrity -> child of Threat Models); (b) invalid drop blocked (Nanomodule onto Nanomodule rejected); (c) linked descendants immutable (no handle, `cdk-drag-disabled`); (d) linked ROOT moves as a whole unit carrying its subtree (Incident Response (Linked) -> Foundations Unit with children). The intermittent "sometimes drops do nothing" is resolved (no group-registration race, no zero-height targets).
- [x] (2026-10-23T19:00Z) Re-added the "Move into <name>" drop indicator on top of the single-drop-list model, this time as a PURELY VISUAL element (no cdkDropList) so it can't reintroduce fragility. A dashed `.drop-indicator` row renders below a node's card only when `dropAffordance === 'valid'` (i.e. that node is the hovered, valid target, driven by `hoveredTargetId`). `.node-row` is `flex-wrap: wrap` and `.node-content` is `flex: 1 1 100%` so the indicator takes its own line. Verified live in the authed app via Playwright: mid-drag over "Threat Models" the indicator shows text "Move into Threat Models" and the target highlights; drop still nests correctly.
- [x] (2026-10-23T19:02Z) Per UX request, show the "Move into" indicator on ALL valid targets the moment a node is picked up (not only the hovered one), so the author sees every destination up front. Split the logic: `isValidDropTarget` (true for any node the dragged node can legally nest under, regardless of pointer) drives the indicator + a soft outline on every valid target; `isHoveredTarget` adds a stronger solid fill/outline + emphasized indicator on the node under the pointer. Verified live via Playwright: picking up the "Integrity" nanomodule immediately renders 9 indicators on exactly the valid targets (Course/Unit/Module/Micromodules) and correctly excludes nanomodule leaves, the linked subtree, linked leaves, and the dragged node itself.
- [x] (2026-10-24T00:00Z) REBUILT drag-and-drop on a SINGLE `cdkDropList` over the whole tree container, replacing the broken per-node dual-drop-list (`cdkDropListGroup` of 36 lists, `height:0` drop zones). New model: one `cdkDropList cdkDropListSortingDisabled` on `.hierarchy-tree`; every `.node-content` is a `cdkDrag` living anywhere inside it; no per-node drop lists, no `rejectPredicate`/`enterPredicate`. Target is resolved by POINTER HIT-TESTING on drop: `(cdkDropListDropped)` reads `event.dropPoint`, walks the `.node-row[data-node-id]` elements, finds the row whose bounding rect contains the pointer, maps it back to a node id, then validates with `viewService.canDrop(dragged, target)` + `viewService.canMove(dragged.id)` and calls `viewService.moveNode(dragged.id, targetId)` (append = make-child). No valid target under the pointer -> no-op/revert. Drag-time affordance via `cdkDragMoved` -> same hit-test -> `hoveredTargetId` pushed down so the hovered valid node highlights (reuses `.drop-valid`). All validity rules stay in the view service (unchanged). Visual tree, connectors, badges, linked treatment unchanged. Files: `hierarchy-tree.component.{ts,html,scss}`, `hierarchy-node.component.{ts,html,scss}`.
- [x] (2026-10-23T17:55Z) Properly fixed the "dropped node lands BESIDE the target, not under it" bug after `cdkDropListSortingDisabled` alone didn't resolve it (confirmed via a user screenshot: the dragged card's placeholder still rendered inline next to a target card, and every valid target's drop-zone lit up at once). Real root cause: the card (`cdkDrag`) and the drop target (`cdkDropList`) were the same flex `.node-row`, so CDK inserted the incoming placeholder inline. Restructure: (a) each card now lives in its own minimal origin `cdkDropList` whose enter predicate always refuses (`rejectPredicate`), so no foreign node can land beside it; (b) a SEPARATE dedicated `.drop-zone` element below the card is the only real drop target — collapsed to 0 height normally, expands into the dashed "Move into <name>" row while a valid drag is in flight, and only shows its label while the pointer is actually over it (`.cdk-drop-list-receiving`). Drop = re-parent/append via the view service. This also stops all valid targets lighting up simultaneously. Earlier in this pass: fixed FA6-only icon names (`fa-arrow-down-to-line`, `fa-file-lines`) that hit CORS SVG fallbacks on the FA5 Pro kit (now `far fa-arrow-down`, `fa-file-alt`). Compiles clean; final drop-under behavior needs live confirmation (authed tab not reachable headless).
- [x] (2026-10-23T17:45Z) Drop-indicator + linked-node polish: replaced the on-card "Move into <name>" overlay with a dashed insertion drop-zone row rendered BELOW the target (indented to the child gutter), shown only while the pointer is over a valid target — matches the requested mock. Removed the overflow (⋯) button from linked nodes (just the "Linked" label now) and dropped the unused `.overflow-button` style. `.node-row` now `flex-wrap: wrap` so the drop-zone takes its own line. Verified compiling on the dev server and rendered the drop-zone in a Playwright harness against the provided image.
- [x] (2026-10-23T17:37Z) Separated "movable" from "editable" so a LINKED ROOT can be moved as a whole unit while staying read-only, and its descendants stay fully immutable (epic "Linked subtree behavior"). Added `linkedRoot?: boolean` to `HierarchyNode`; added `HierarchyViewService.canMove(nodeId)` (editable OR linkedRoot, AND not inside a linked subtree via the new `isInsideLinkedSubtree` ancestor walk); `moveNode` now gates on `canMove`; node component takes a `canMovePredicate` and drives `cdkDragDisabled` + the drag handle off movability instead of `editable`. Mock "Incident Response (Linked)" is now a `linkedRoot` (movable between Units; its children remain immutable). Compiles clean on the dev server.
- [x] (2026-10-23T17:27Z) Fixed drag-and-drop that never actually moved nodes. Two root causes from the previous session: (1) each node's `cdkDropList` was isolated/unconnected, so CDK never delivered a drop from one node to another — fixed by wrapping the tree in `cdkDropListGroup` (the proven single-group pattern; the scaffold component's working DnD confirmed the approach). (2) The node template used `cdkDragHandle` but the standalone component never imported `CdkDragHandle`, so the grip handle was inert and drags couldn't start by the handle — fixed by importing it. Both verified compiling via the dev server; end-to-end drop still needs manual confirmation in the authed app (the Hierarchy tab is behind login + a saved object, not reachable headless here).
- [x] (2026-10-23T17:22Z) Drag-and-drop UX pass per the epic's "Drag-and-drop reorganization" rules. `moveNode` now accepts an optional insertion `index`, supporting reorder-within-a-parent (same-parent moves are allowed for editable nodes even though the re-parent `canDrop` check would reject the current parent) as well as precise re-parenting; added `parentIdOf`. Nodes emit `cdkDragStarted`/`cdkDragEnded`; the tree tracks the `draggingNode` and passes it down so every node computes a valid/invalid `dropAffordance`. Added drag-time CSS: dragged node fades, valid targets highlight (blue outline + panel fill, stronger when the pointer is over them) and show a solid "Move into <name>" drop hint, invalid targets dim + not-allowed. Files: `hierarchy-view.service.ts`, `hierarchy-tree.component.{html,ts}`, `hierarchy-node.component.{html,scss,ts}`. Verified: dev server hot-recompiles "Compiled successfully"; drag states rendered and confirmed in a Playwright harness (fixed one bug where the drop hint overlapped the row's own content).
- [ ] Add focused component tests for the view service + node predicate once the Jest/Angular preset drift is resolved (see Surprises); document coverage.
- [ ] Deeper tree keyboard navigation (arrow keys / roving tabindex) and manual UI walkthrough against the mocks.

## Surprises & Discoveries

- Observation: The repo has the two halves of this story but never combined: flat-list CDK drag-drop in `scaffold.component.ts`, and a non-DnD Material `mat-tree` in the admin `hierarchy-builder`. There is no existing nested-tree DnD with invalid-drop gating to copy wholesale.
  Evidence: `src/app/onion/learning-object-builder/components/scaffold/scaffold.component.ts` (CdkDropList/CdkDrag/moveItemInArray); `src/app/admin/components/hierarchy-builder/hierarchy-builder.component.ts` + `tree-datasource.ts` (MatTree/NestedTreeControl, no DnD).
- Observation: Length ordering is duplicated in three places rather than a single shared constant.
  Evidence: the `LearningObject.Length` enum in `src/entity/learning-object/learning-object.ts`; the hard-coded `lengths = ["nanomodule","micromodule","module","unit","course"]` array in `add-child.component.ts`; and the if-ladder in admin `hierarchy-builder.component.ts addLearningObject`.
- Observation: Builder tabs are not config-driven; they are hard-coded routed children plus a hard-coded navbar list.
  Evidence: `learning-object-builder.routing.ts` children (`info`/`outcomes`/`materials`); `builder-navbar.component.html` `ngTemplateOutlet` list + `canRoute()` in the paired `.ts`.
- Observation: (carried from sc-39642) local build/test validation is fragile — unsupported Node 25 aborts `ng build`, and repo-wide `tsc --noEmit` / Jest have pre-existing drift unrelated to any one story.
  Evidence: `plans/sc-39642-reduce-learning-object-builder-copy-and-move.execplan.md` Surprises section.
- Observation: All three UX mocks from epic comment 40227 have now been reviewed. `add_child_choice.png` was retrieved via the `files-read` tool; `add_new.png` and `add_existing.png` returned HTTP 400 from the Shortcut CDN via that tool and were instead provided directly by the author. All three are reflected in this plan.
  Evidence: `shortcut::files-read` returned base64 for `add_child_choice.png`; the other two returned `HTTP 400` and were supplied as image attachments in the session. Mocks are "inspirational only" per the epic; existing route/label/pill conventions take precedence where they differ.
- Observation (from `add_new.png`, 4 panels): confirms create-child and drag-drop UX. Panel 01 "Choose a child length": inline editor row under the parent with a "Child length" dropdown listing length + duration hints (`Unit · 10+ hours`, `Module · 4–10 hours`, `Micromodule · 1–4 hours`, `Nanomodule · <1 hour`) plus confirm/delete. Panel 02 "Name and create": inline name field + confirm check + delete, helper "Confirm to create this child learning object." Panel 03 "Edit name/length": inline edit flips a node to a name field + length dropdown that **disables invalid lengths** (`Course · 15 weeks` greyed with "Must be smaller than parent") and notes "Move or remove children before choosing a shorter length." Panel 04 "Drag and drop": dashed drop zone labeled "Move into &lt;parent&gt;" with footer "Drag to reorder or move. Only valid destinations are enabled." Panels 01–03 are sc-40236; panel 04 is the drag-drop behavior this story (40233) delivers.
  Evidence: `add_new.png` (provided in session 2026-10-22).
- Observation: The shared `clark-column-wrapper` does not render usable content in its single-column (`[columns]="'m'"`) configuration. The builder positions tab content with `position: fixed; top: 160px` and the wrapper's `.columns` grid uses `minmax(675px, 100vw)`; with `no-left no-right` the fixed grid has no `left`/`width` and the content, though fully present in the DOM, is effectively invisible/off-screen. The other tabs only work because their left+right columns constrain the fixed grid.
  Evidence: With the column-wrapper + `[columns]="'m'"`, the full hierarchy tree was present in the DOM (all nodes/pills/linked treatment) but not visible; `.columns.no-left.no-right` had `style="top:160px"` and 458px-tall scroll-wrappers yet showed nothing. Resolution: the Hierarchy page no longer uses `clark-column-wrapper`; it renders its own `position: fixed; top:160px; left/right/bottom:0; overflow-y:auto` region with the tree centered in a `max-width:1100px` card. This also satisfies the product request to drop the left "Children" scaffold and go full-width.
  Date/Author: 2026-10-22 / Kiro
- Observation (from `add_existing.png`): the link-existing drawer is sc-40237, not 40233. Right-side drawer "Add existing child" / "Add to: Intro to Cybersecurity", search box, Filters button, result count, checkbox multi-select rows showing length pill + author ("By Alex Morgan"), footer "N selected" + "Add selected (N)", hints "Showing objects that fit this hierarchy" and "Links to the original. Name and length cannot be edited here." Background tree is dimmed with an "Adding to this course" badge on the root. For 40233, only the `+` menu entry that would open this drawer is in scope (as an inert/stub); the drawer itself is sc-40237.
  Evidence: `add_existing.png` (provided in session 2026-10-22).
- Observation (from `add_child_choice.png`): the mock pins down node anatomy and the read-only treatment this story must render. Each editable child row = drag handle (⠿) + type icon + colored length pill + name, indented with connector lines. Length pills are color-coded (Course/Micromodule blue, Nanomodule orange). The root is a distinct dark banner row with the length pill, a "Current learning object" badge, and a `+` action. A linked/read-only node (e.g. "Network Security Lab") shows a link icon + "Linked" label + a `...` overflow menu instead of the editable drag handle / `+`. The `+` on editable nodes opens a menu with "Create new child" and "Add existing learning object". Heading is "Hierarchy", subtitle "Add and organize child learning objects.", footer hint "Linked objects keep their original name and length."
  Evidence: `add_child_choice.png` from epic comment 40227 (viewed 2026-10-22).
- Observation: The mock's tab bar labels ("Materials | Details | Hierarchy | Learning Outcomes") differ from the live Builder routes (`info`, `outcomes`, `materials`). Mocks are inspirational-only, so this plan keeps existing route paths and label conventions and does not rename tabs.
  Evidence: `add_child_choice.png` tab bar vs. `learning-object-builder.routing.ts` children.

## Decision Log

- Decision: Treat this as a mock/local-data UI+interaction story; do not call `HierarchyService`, `LearningObjectService`, `SearchService`, or `BuilderStore.setChildren`.
  Rationale: sc-40233 is explicitly component/interaction only; persistence is sc-40236/sc-40237. Keeps scope bounded and avoids backend coupling before the backend migration (sc-40234) lands.
  Date/Author: 2026-10-22 / Kiro

- Decision: Reuse existing repo patterns — Material `mat-tree`/`NestedTreeControl` for rendering (from admin hierarchy-builder) and CDK drag-drop (from scaffold) — rather than adding a new tree/DnD library.
  Rationale: `@angular/cdk` and `@angular/material` 18 are already dependencies and already used for both halves; AGENTS.md says prefer local conventions and avoid new patterns without strong reason.
  Date/Author: 2026-10-22 / Kiro

- Decision: Use the official `angular-developer` skill as a reference (especially `references/angular-aria.md` for the accessible Tree pattern), but follow the repo's Angular 18 / NgModule / Jest reality where the skill's defaults (signals-first state, Signal Forms, Vitest, `ng build` as the sole gate) conflict.
  Rationale: `AGENTS.md` is a workspace rule and takes precedence; clark-client is NgModule-based with BehaviorSubject state and Jest. The skill itself instructs analyzing the project's Angular version first.
  Date/Author: 2026-10-22 / Kiro

- Decision: Introduce a single feature-local length-ordering helper sourced from the `LearningObject.Length` enum rather than adding a fourth copy of the length array.
  Rationale: AGENTS.md discourages duplicating the same shape; the drop-validation rule (child must be shorter than parent) needs one trustworthy ordering source.
  Date/Author: 2026-10-22 / Kiro

- Decision: Keep the hierarchy tree state in a new feature-local BehaviorSubject service; read the root object from `BuilderStore.learningObjectEvent` but keep the mock tree separate.
  Rationale: Mirrors the existing Builder state pattern, keeps clear ownership, and leaves a clean seam to swap mock data for real APIs in sc-40236/sc-40237 without reworking the component.
  Date/Author: 2026-10-22 / Kiro

- Decision: The Hierarchy tab removes the legacy left "Children" scaffold and renders full-width, and does NOT use the shared `clark-column-wrapper` (its single-column path was non-functional at the time — see Surprises). The page owns a fixed, scrollable, full-width region with the tree centered in a capped-width card.
  Rationale: Product request to drop the now-redundant Children panel and use the full page width; the hierarchy tree supersedes the scaffold.
  Date/Author: 2026-10-22 / Kiro

- Decision: Per follow-up product request, also remove the "Children" scaffold from the other three builder tabs (Basic Information, Learning Outcomes, Materials) and reclaim that space. Implemented by fixing the shared `clark-column-wrapper`'s multi-column paths rather than per-page custom layouts.
  Rationale: Consistency across tabs; the scaffold is redundant now that hierarchy is managed in its own tab.
  Date/Author: 2026-10-22 / Kiro

- Decision: Fix `clark-column-wrapper` by always keeping THREE grid tracks (matching the three always-rendered scroll-wrappers) and collapsing unused tracks to `0`, never `display:none`. Two-column (main+right) = `0 minmax(675px,1fr) <right>`; single-column = `0 minmax(675px,1fr) 0`. Also anchor the fixed `.columns` element with `left:25px; right:25px; margin:0` in the no-left cases so the `1fr` main track has a real width to fill.
  Rationale: The template always renders three `scroll-wrapper` divs in order; grid tracks map to them positionally. Reducing the track count, or hiding the left wrapper with `display:none`, removes it from grid flow and shifts main/right one track left (confirmed via live DOM: main computed to 40px, right to 1400px). The `.columns` element is `position:fixed` with no width, so it only spanned the page via the old `100vw` middle track; `1fr` needs explicit anchoring to have width. The 3-column (`lmr`) path and its `$middle-column`/`no-right` rules are left untouched, so existing consumers are unaffected.
  Date/Author: 2026-10-22 / Kiro

- Decision: Apply the `angular-developer` skill to all clark-client work, but do NOT adopt the skill's headless `@angular/aria` Tree directives (`ngTree`/`ngTreeItem`/`ngTreeItemGroup`); keep the hand-rolled recursive tree + CDK, and use the skill only for ARIA-attribute and styling guidance and manual keyboard-nav design.
  Rationale: The skill's own first rule is to analyze the project's Angular version. `@angular/aria` requires Angular v20+; clark-client is Angular 18 and does not (and cannot) have the package installed. Adopting it would require an Angular upgrade, which is out of scope and contrary to AGENTS.md's "do not introduce new patterns without strong reason." The skill's `[aria-expanded]`/`padding-left`/`:focus-visible` styling strategy and ARIA attribute guidance still apply to the CDK-based tree. Roving-tabindex keyboard nav (which `ngTree` would have provided for free) remains a manual follow-up.
  Date/Author: 2026-10-22 / Kiro

- Decision: Model "movable" separately from "editable" rather than overloading the single `editable` flag. Added `linkedRoot?: boolean`; a linked root is `editable:false, linkedRoot:true` (read-only but relocatable as a unit), its descendants are `editable:false` with no flag (fully immutable), derived structurally via an ancestor walk (`isInsideLinkedSubtree`). Drag enablement and the drag handle are driven by a `canMove` predicate, not editability.
  Rationale: The epic's "Linked subtree behavior" requires the linked child to be movable/removable as a whole by the owning parent while its internal relationships stay immutable. A single `editable` flag conflated "can modify" with "can relocate"; splitting them is the minimal faithful model and keeps the read-only visual treatment unchanged (moving ≠ editing).
  Date/Author: 2026-10-23 / Kiro

- Verification (2026-10-24): `npx tsc --noEmit -p tsconfig.json` under Node 22 reports 0 errors in any `hierarchy-tree` file; the 28 remaining errors are the pre-existing, unrelated ones (spec files + a few unrelated modules) documented earlier. Dev server left running externally (not started by this session). End-to-end drag behavior to be confirmed in-browser separately.

- Decision: Replace the per-node dual-`cdkDropList` drag-and-drop with a SINGLE `cdkDropList` on the tree container and resolve the drop target by pointer hit-testing (`event.dropPoint` against `.node-row` bounding rects), rather than by CDK's own drop-list-entered mechanics. Keep `cdkDropListSortingDisabled`. Drop onto a node = append the dragged node as that node's child.
  Rationale: Empirically confirmed the old model was unworkable — 36 connected lists in one group caused a registration race (intermittent silent no-op drops) and the drop-zone targets were `height:0` at the moment CDK snapshots geometry. One always-present, full-size drop list removes both race and zero-height-target failure modes; hit-testing the visible `.node-row` rects is deterministic and does not depend on nested drop-list geometry. All validity rules stay in `HierarchyViewService` (unchanged). The recursive visual node component is retained purely for rendering.
  Date/Author: 2026-10-24 / Kiro

## Outcomes & Retrospective

Shipped the Hierarchy tab UI shell in the Learning Object Builder, driven entirely by mock/local data (no API calls). A new `hierarchy` routed child + navbar entry (gated on a saved, non-nanomodule object) renders a `pages/hierarchy-page` that mirrors the sibling pages' column-wrapper layout, with the shared children scaffold on the left and the new `clark-hierarchy-tree` in the main slot. The tree is a recursive `clark-hierarchy-node` with expand/collapse, a distinct root banner ("Current learning object" badge), color-coded length pills, an editable `+` menu shell ("Create new child" / "Add existing learning object", intentionally inert), and a linked/read-only treatment (link label + overflow, no drag handle / `+`). Drag-and-drop uses per-node CDK drop lists with a `cdkDropListEnterPredicate` that enforces the length rules and read-only constraints via the shared `hierarchy-length.util`; read-only nodes are not independently draggable and relocate with their whole subtree. State lives in a page-scoped `HierarchyViewService` (BehaviorSubject), which is the swap seam for sc-40236 (create-new-child + reorder/re-parent persistence) and sc-40237 (link-existing drawer) to replace mock data with real hierarchy APIs.

Verification: built under Node 22; `tsc --noEmit` reports zero errors in the new files (28 pre-existing repo-wide errors are unrelated). `ng build clark` exits 0 after fixing one issue the build caught (missing `AsyncPipe` import in the standalone tree component).

Remaining: focused Jest specs for `HierarchyViewService.canDrop/moveNode` and the node predicate are blocked by the repo's pre-existing Jest/Angular-preset drift (documented in Surprises) and are left as follow-up; deeper tree keyboard navigation (arrow-key/roving-tabindex) and a manual UI walkthrough against the mocks are also follow-ups. The `+` menu is deliberately inert pending sc-40236/sc-40237.

## Context and Orientation

This work is local to the Angular Learning Object Builder under `src/app/onion/learning-object-builder`, plus new feature-local files. Relevant repository layout and current flow:

**Builder shell + tabs (where the tab is added)**

- `src/app/onion/learning-object-builder/learning-object-builder.component.*` — shell (`clark-learning-object-builder`); provides `BuilderStore` at component level, renders `<onion-builder-navbar>` + `<router-outlet>`, drives the `builderTransitions` route animation off `data.state`.
- `src/app/onion/learning-object-builder/learning-object-builder.routing.ts` — tabs as routed children (`info`, `outcomes`, `outcomes/:id`, `materials`), each with `data: { state }`; empty path redirects to `info`. **Add the `hierarchy` route here.**
- `src/app/onion/learning-object-builder/learning-object-builder.module.ts` — NgModule wiring (pages/components are standalone and imported).
- `src/app/onion/learning-object-builder/components/builder-navbar/builder-navbar.component.html` + `.ts` — hard-coded nav list via `ngTemplateOutlet` + `canRoute()` gating. **Add the Hierarchy nav item + gating here.**
- `src/app/onion/learning-object-builder/pages/{info-page,outcome-page,materials-page}/` — page components using `<clark-column-wrapper>` (left slot `<clark-scaffold>`, main slot page content). **New `pages/hierarchy-page/` mirrors these.**

**Existing patterns to model after**

- `src/app/onion/learning-object-builder/components/scaffold/scaffold.component.ts` — in-builder children list; already uses `@angular/cdk/drag-drop` (`CdkDropList`, `CdkDrag`, `CdkDragHandle`, `moveItemInArray`) with `drop(event: CdkDragDrop<...>)`. Model for DnD + state wiring.
- `src/app/onion/learning-object-builder/components/scaffold/add-child/add-child.component.ts` — computes valid child lengths by slicing the length array below the parent's length. Model for valid-move/invalid-drop rule.
- `src/app/admin/components/hierarchy-builder/hierarchy-builder.component.*` — Material `mat-tree` + CDK `NestedTreeControl`; model for tree rendering + expand/collapse.
- `src/app/admin/components/hierarchy-builder/tree-datasource.ts` — `interface LearningObjectNode {...}` + `TreeDataSource extends MatTreeNestedDataSource` with add/remove/update/moveExpansionState helpers; closest existing tree view-model.
- `src/app/admin/components/hierarchy-builder/hierarchy-object/hierarchy-object.component.ts` — per-node UI; model for a node component.

**Domain model**

- `src/entity/learning-object/learning-object.ts` — class `LearningObject` (`@entity`). `children` getter/setter; `addChild`/`removeChild`. The `LearningObject.Length` enum (`NANOMODULE < MICROMODULE < MODULE < UNIT < COURSE`, declaration order = smallest→largest) is the source of truth for ordering. Nanomodules cannot have children (guarded throughout as `length !== 'nanomodule'`).

**State**

- `src/app/onion/learning-object-builder/builder-store.service.ts` — `BuilderStore`, provided at shell level; BehaviorSubject pattern (`learningObjectEvent`, etc.), with `getChildren()`/`setChildren()` persistence. Read the root object from `learningObjectEvent`; do NOT use `setChildren` in this story.

**Capabilities**

- `package.json` — `@angular/cdk ^18.2.14` (drag-drop + tree) and `@angular/material ^18.2.14` (mat-tree) already present.

**Reference skill**

- `~/.agents/skills/angular-developer/references/angular-aria.md` — accessible Tree pattern (roles, keyboard, aria-expanded). Use for the a11y layer; adapt to Angular 18 / NgModule.

## Plan of Work

Build the Hierarchy tab by composing existing repo patterns against a mock/local data source, in safe increments that each leave the app building.

1. **Routing + nav (thin, reversible):** add the `hierarchy` routed child and the navbar entry with gating consistent with `canRoute()` (gate on learning object existing + non-nanomodule, matching how Outcomes/Materials unlock). Wire the `hierarchy` `data.state` into the existing route animation.
2. **Page shell:** create `pages/hierarchy-page/` mirroring sibling pages' column-wrapper layout so the tab visually belongs in the Builder.
3. **View-model + ordering helper:** define the tree node type (id, name, length, `editable`/`readOnly`, `children`) close to the feature, and one length-ordering helper derived from `LearningObject.Length` (no fourth copy of the array).
4. **Local state service:** a feature-local BehaviorSubject service seeded with mock hierarchy data (including at least one linked/read-only subtree and mixed lengths to exercise all rules). This is the swap seam for later real-data stories.
5. **Tree rendering:** Material `mat-tree` + `NestedTreeControl` with expand/collapse, modeled on the admin builder and its `TreeDataSource`.
6. **Editable vs read-only treatment:** per-node styling and disabled affordances for read-only subtrees; read-only nodes do not expose rename/add/remove/open-builder and are not independently draggable. Per `add_child_choice.png`: editable child rows show a drag handle (⠿) + type icon + colored length pill + name (indented with connector lines) and a `+` action; the root renders as a distinct dark banner with its length pill, a "Current learning object" badge, and the `+` action; a linked/read-only node shows a link icon + "Linked" label + a `...` overflow menu in place of the editable drag handle / `+`. Match length-pill coloring to existing pill styling (mock: Course/Micromodule blue, Nanomodule orange). Copy: heading "Hierarchy", subtitle "Add and organize child learning objects.", footer hint "Linked objects keep their original name and length."
7. **Add affordance (menu shell only):** render the `+` contextual menu on the root/editable nodes with "Create new child" and "Add existing learning object" entries (per the mock). In this story the entries open no real flow — they are inert or open a stubbed panel; wiring is sc-40236 (create new child) and sc-40237 (link existing). This keeps the mock's affordance visible without pulling backend scope in.
8. **Drag-and-drop with validation:** CDK drag-drop with `cdkDropListEnterPredicate` enforcing length rules (child shorter than parent, nanomodule has no children) and read-only constraints; invalid targets are non-droppable and visually indicated; a read-only child moves as a whole unit. Per `add_new.png` panel 04: dragging shows a dashed drop zone with a "Move into &lt;parent&gt;" label on valid targets, and a footer hint "Drag to reorder or move. Only valid destinations are enabled." (only valid destinations are enabled/highlighted). The inline length-edit control (panel 03) disables invalid lengths with the message "Must be smaller than parent" and the note "Move or remove children before choosing a shorter length." — in 40233 the length-edit control may be rendered but its disabled-length messaging is the same validity rule used by the drop predicate (shared via the length-ordering helper).
9. **Accessibility:** ARIA tree semantics and keyboard operability per `angular-aria.md`.

In scope:

- New Hierarchy tab route + navbar entry + page component.
- New tree + node components (mock/local data only), with node anatomy, root banner, and linked/read-only treatment following `add_child_choice.png`.
- The `+` contextual menu shell ("Create new child" / "Add existing learning object") as inert/stubbed entries.
- Drag-and-drop with the drop-zone treatment and "only valid destinations enabled" behavior from `add_new.png` panel 04.
- New feature-local view-model type, length-ordering helper, and BehaviorSubject state service.
- Expand/collapse, read-only visual treatment, DnD with invalid-drop gating, ARIA/keyboard.
- Focused component tests where practical.

Out of scope:

- Any hierarchy/learning-object/search API calls or `BuilderStore.setChildren` usage.
- The functional behavior behind the `+` menu — the create-new-child inline flow (`add_new.png` panels 01–03) wired to real creation is sc-40236; the add-existing search drawer (`add_existing.png`) is sc-40237. This story renders affordances, not their backend behavior.
- Backend validation, bundling, revision migration (separate backend stories).
- Removing the legacy admin hierarchy-builder or deprecating hierarchy-service (sc-40239).
- Broad Builder refactor, state-framework change, or standalone migration.

## Concrete Steps

From the repository root (`development-environment/clark-client`):

Confirm Node version before building (repo requires `^22.13.1`):

    node -v
    ./node_modules/.bin/ng version

Expect: Node 22.x. If Node 25.x, switch to Node 22 before building (sc-39642 documented `ng build` aborting under Node 25).

Inspect the exact tab wiring before editing:

    rg -n "state:|path:|redirectTo" src/app/onion/learning-object-builder/learning-object-builder.routing.ts
    rg -n "canRoute|navItemTemplate|routerLink" src/app/onion/learning-object-builder/components/builder-navbar/builder-navbar.component.ts src/app/onion/learning-object-builder/components/builder-navbar/builder-navbar.component.html

Expect: the three existing children/nav entries and the `canRoute` switch, to mirror for `hierarchy`.

Confirm CDK/Material tree + drag-drop imports already used in-repo:

    rg -n "@angular/material/tree|@angular/cdk/tree|@angular/cdk/drag-drop|NestedTreeControl|cdkDropListEnterPredicate" src/app

Expect: existing usages in `admin/components/hierarchy-builder` and `onion/.../scaffold` to model after (and no existing `cdkDropListEnterPredicate`, which this story introduces).

After implementation, run the most focused available validation, then broader checks if practical (inspect `package.json` scripts first):

    ./node_modules/.bin/jest --runInBand <new hierarchy spec paths>
    ./node_modules/.bin/ng build clark

Expect: focused specs for the new components pass; build succeeds under Node 22. If Jest/Angular preset drift or repo-wide `tsc` drift blocks a clean run (as in sc-39642), record it here and fall back to targeted specs + manual UI verification rather than claiming broad confidence.

## Validation and Acceptance

Automated: focused component tests for the tree/node components and the local state service where the preset allows — covering expand/collapse state, the drop-predicate validity rule (valid vs invalid length relationships, nanomodule rejects children), and read-only nodes rejecting internal moves. Template compiles via `ng build clark` under Node 22.

Manual UI validation (navigate to a non-nanomodule learning object Builder → Hierarchy tab), cross-checked against the `add_child_choice.png` / `add_new.png` mocks:

- Hierarchy tab appears for eligible objects and is gated (locked) consistently with Outcomes/Materials when no object exists / for nanomodules.
- Heading "Hierarchy" + subtitle "Add and organize child learning objects." + footer hint "Linked objects keep their original name and length." render.
- Root renders as the distinct banner row with length pill + "Current learning object" badge + `+` action; child rows show drag handle + type icon + colored length pill + name with connector-line indentation.
- Tree renders the mock root and descendants; branches expand/collapse.
- The `+` menu opens with "Create new child" and "Add existing learning object" entries (inert/stub in this story).
- Linked/read-only subtrees are visually distinct (link icon + "Linked" + `...` overflow, no drag handle / `+`) and do not expose rename/add/remove/open-builder.
- Dragging an editable node to a valid parent succeeds and reorders/re-parents in the view, showing the "Move into &lt;parent&gt;" drop zone; only valid destinations are enabled/highlighted.
- Dragging to an invalid target (longer-or-equal child under parent, any child under a nanomodule, a node out of a read-only subtree) is blocked and visually indicated (destination not enabled).
- A read-only child drags as a whole unit; nodes inside it cannot be independently dragged.
- Keyboard: tree is focusable/operable and exposes `role=tree`/`treeitem` with `aria-expanded`.

No backend, route-guard-auth, interceptor, environment, or API-contract validation is expected — those layers are intentionally untouched. State is mock/local only.

## Idempotence and Recovery

Adding the route, navbar entry, page, components, view-model, helper, and local state service are additive and safe to repeat; re-running leaves a single set of files. If a half-complete state leaves the Builder failing to compile, the fastest recovery is to remove the `hierarchy` child route and navbar entry (which fully detaches the new tab) while keeping the new component files, then re-wire once they compile in isolation. No data migrations or destructive operations are involved. If local build is blocked by Node version or preset drift, recover by switching to Node 22 and restoring dependencies rather than editing build config.

## Artifacts and Notes

Likely new files (final names to match sibling conventions on inspection):

- `src/app/onion/learning-object-builder/pages/hierarchy-page/hierarchy-page.component.{ts,html,scss}`
- `src/app/onion/learning-object-builder/components/hierarchy-tree/hierarchy-tree.component.{ts,html,scss}`
- `src/app/onion/learning-object-builder/components/hierarchy-tree/hierarchy-node/hierarchy-node.component.{ts,html,scss}`
- `src/app/onion/learning-object-builder/components/hierarchy-tree/hierarchy-tree.types.ts` (node view-model + editable/read-only flag)
- `src/app/onion/learning-object-builder/components/hierarchy-tree/hierarchy-length.util.ts` (ordering helper from `LearningObject.Length`)
- a feature-local hierarchy state service (BehaviorSubject) for mock data
- `*.spec.ts` for the above where the preset supports it

Likely edited files:

- `learning-object-builder.routing.ts` (new child route)
- `components/builder-navbar/builder-navbar.component.html` + `.ts` (nav item + `canRoute('hierarchy')`)
- `learning-object-builder.module.ts` (register new components if not standalone-imported)
- `learning-object-builder.component.ts` (optional: add `hierarchy` to route animation states)

Validation note: re-run build/tests in a Node 22 environment with dependencies restored; expect pre-existing Jest/Angular-preset and repo-wide `tsc` drift independent of this story (documented in sc-39642).

Reference note: the official `angular-developer` skill (`~/.agents/skills/angular-developer`) is used as guidance — primarily `references/angular-aria.md` (accessible Tree), `references/components.md`, `references/component-styling.md`, `references/naming-conventions.md`. Its signals-first / Signal Forms / Vitest defaults are intentionally NOT adopted here because clark-client is Angular 18, NgModule-based, BehaviorSubject-stated, and Jest-tested; `AGENTS.md` takes precedence on any conflict.

## Interfaces and Dependencies

- Routing: `learning-object-builder.routing.ts` (new `hierarchy` child route; preserves lazy-loading and existing guard/auth behavior — no guard changes).
- Components: new hierarchy page/tree/node components; edited `builder-navbar` (nav entry + gating).
- State: new feature-local BehaviorSubject hierarchy service; reads `BuilderStore.learningObjectEvent` (no writes to `BuilderStore`).
- Types/entities: consumes `LearningObject` + `LearningObject.Length` from `src/entity/learning-object/learning-object.ts`; new feature-local node view-model type.
- Shared UI: may reuse existing shared components (e.g. column-wrapper, pill) consistent with sibling pages; no changes to shared-component public contracts.
- External dependencies: `@angular/cdk` (drag-drop + tree) and `@angular/material` (mat-tree) — already present; no new dependencies added.
- Environment/build: none changed. Build requires Node `^22.13.1`.
- Downstream: leaves a clean mock-data seam for sc-40236 (wire new-child creation) and sc-40237 (wire existing-object linking) to attach real persistence.
