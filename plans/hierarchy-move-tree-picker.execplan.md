# Show hierarchy context in the move picker

This ExecPlan is maintained in accordance with PLANS.md.

## Purpose / Big Picture

Replace the flat destination list with a full visual hierarchy, showing where the source and each destination sit. Preserve move rules, keyboard selection, focus trapping/restoration, optional position, and cancellation.

## Progress

- [x] (2026-10-30) Added destination availability markers and success feedback for menu and drag moves; verified notification guards and responsive layout.

- [x] (2026-10-30) Reviewed the existing picker, hierarchy model, service, tests, and frontend/Angular skill guidance.
- [x] (2026-10-30) Implemented full hierarchy context, branch guides, source and destination paths, and responsive modal styling.
- [x] (2026-10-30) Verified all 73 tests across 12 hierarchy suites, Angular build, diff checks, and browser layouts.

## Surprises & Discoveries

- A list of valid destinations alone loses source nodes, unavailable branches, and ancestry.
- All hierarchy relationships already exist in HierarchyViewService.tree; no API or domain model changes are needed.
- The local app is available at localhost:4200 but the isolated verification browser is signed out; use an isolated component preview for visual checks.

## Decision Log

- Decision: Keep the existing CDK listbox selection semantics and render it as a fully expanded visual tree with ancestry in accessible labels.
  Rationale: Disabled context rows retain the real structure while keyboard navigation continues to skip invalid destinations; no custom tree keyboard implementation is needed.
  Date/Author: 2026-10-30 / Codex
- Decision: Use the framed-sheet direction (seed 1854529630), preserving CLARK typography and blue hierarchy palette. A pale frame contains the white hierarchy surface; source/destination paths carry the context.
  Rationale: This is a local builder dialog, not a replacement app shell. The main question is: where will this object sit in the current hierarchy?
  Date/Author: 2026-10-30 / Codex

## Outcomes & Retrospective

Completed the visual hierarchy picker with disabled context rows, source/current-parent markers, accessible ancestry labels, and current/selected paths. All 73 tests in 12 suites pass; Angular build and git diff --check pass. Browser verification used the real component and service mock data in an isolated preview at 1440x900, 768x1024, and 390x844, plus a short 390x600 viewport. Keyboard Home navigation and nested selection were exercised in the browser. The full builder route requires an authenticated session; no auth changes were made.

## Context and Orientation

Feature directory: src/app/onion/learning-object-builder/components/hierarchy-tree. HierarchyTreeComponent owns the CDK Overlay and passes a snapshot plus valid destinations to the presentation-only HierarchyMovePickerComponent. HierarchyViewService remains the source of truth for eligibility and moves. Existing mock data includes Course, Unit, Module, Micromodule, Nanomodule, linked objects, and linked subtrees.

## Plan of Work

Pass hierarchy and source ID to the picker. Derive preorder display rows and ancestry without changing the tree. Show all nodes with branch guides, type labels, a Moving marker, current-parent label and unavailable states. Keep selectable IDs restricted to the service's destinations. Add current and selected parent paths and widen the modal; use one scrollable hierarchy region and a stable footer. Extend component/integration tests and verify desktop/tablet/mobile layout.

## Concrete Steps

Run node_modules/.bin/jest --runInBand --testPathPattern=hierarchy-tree --silent, node_modules/.bin/ng build clark --output-path=/private/tmp/clark-move-tree-build --no-progress, and git diff --check from clark-client. Build an isolated preview from the real component in /private/tmp for browser verification without auth or production route changes.

## Validation and Acceptance

Source and all descendants are visible but cannot be selected; only supplied destination IDs can be chosen. Real parent/child ordering, depth and paths are preserved; duplicate names are distinguishable by path. Keyboard Arrow/Enter/Space selection, focus capture/cancel, indexed confirmation and drag/drop regressions pass. At phone width, names and paths wrap, controls remain usable and the footer stays reachable.

## Idempotence and Recovery

Preserve the existing dirty working tree. Edits are local and reversible; no API/state migration is involved. Preview artifacts/build outputs live in /private/tmp.

## Artifacts and Notes

Data inventory: one course root, five length levels, editable and linked nodes, linked roots and descendants, current parent, moving subtree, valid target IDs, child counts and insertion positions. Source of all displayed data is the existing hierarchy snapshot. No invented metrics/assets. Style uses the existing font and CLARK blue on selected hierarchy data; no redraws.

## Interfaces and Dependencies

Add presentation inputs for hierarchy and movingNodeId and a feature-local display-row interface. No routing, guards, interceptors, shared UI contracts, API/service boundaries, persisted state, entities, environment, build configuration, or dependencies change.

Visual critique: the hierarchy is the largest region and answers where a destination sits; the source and current parent remain identifiable. Paths and row names wrap at phone width, and the destination/position/action regions remain reachable. Frontend lint: 0 failures; one justified warning for the floating modal shadow. No style redraws.

Follow-up scope: display a textual availability marker and a pale highlight on valid picker rows, retain the selected state, and announce confirmed moves through the existing ToastrOvenService and CDK LiveAnnouncer. Notification is emitted only when moveNode returns true, for both menu and drag paths. No shared toaster changes, API requests, or dependencies are introduced.

Follow-up validation: all 75 tests in 12 hierarchy suites pass, Angular build passes, and git diff --check is clean. Desktop and 390x844 browser previews confirm available/selected badges remain legible. The shared toaster is called with the moved object and target names only after a successful move; cancellation and rejection tests verify no success notification. CDK LiveAnnouncer also announces the completed move politely.

## Simplified confirmation follow-up

The author requested removing the Move into summary and position control. Remove their presentation state and emit only the selected target ID; the coordinator calls moveNode without an index so it appends. Keep hierarchy selection, notifications, keyboard behavior, and the service's independent index support. Validation: update existing picker/coordinator tests, run hierarchy suites/build/diff checks, and inspect the simplified footer.

- [x] (2026-10-30) Removed summary/position UI and unused state; verified append-only confirmation, notifications, and focus restoration. All 74 tests in 12 hierarchy suites pass; Angular build and diff checks pass. Browser preview confirms the footer contains only Cancel and Move here.
