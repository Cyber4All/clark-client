# Hierarchy menu review fixes

This ExecPlan is maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Complete the five reviewed gaps in Kiro's hierarchy-node-menu-actions feature: keyboard focus entry/trapping, overlay lifetime, focus after reparenting, position selection, and omission of the future Add Child item.

## Progress

- [x] (2026-10-30) Reviewed requirements/design/tasks, Angular 18 implementation, and 59 passing hierarchy tests.
- [x] (2026-10-30) Implemented all five fixes and focused interaction regressions.
- [x] (2026-10-30) All 12 hierarchy suites / 69 tests pass; Angular build and git diff --check pass.

## Surprises & Discoveries

- Existing tests manually close overlays and call picker methods, hiding lifecycle and interaction defects.
- Sibling indices in moveNode are interpreted after removing the source node.
- The repository is outside the chat's writable root; apply edits through approved commands.

## Decision Log

- Decision: Stabilize the existing standalone components and CDK Overlay pattern in place.
  Rationale: Preserve local architecture and service-owned move rules without adding routing or API changes.
  Date/Author: 2026-10-30 / Codex
- Decision: Use CDK focus trapping with automatic capture and a native position select. Restore focus by node ID after rendering a successful move.
  Rationale: Reuse existing dependencies and ensure focus targets the newly rendered row.
  Date/Author: 2026-10-30 / Codex

## Outcomes & Retrospective

Implemented the five review fixes. Focus restoration also reveals collapsed destination ancestors and excludes old rows retained by leave animations. All 12 hierarchy suites / 69 tests and the Angular build pass. git diff --check is clean. Browser-native Tab traversal was represented in jsdom by focusing the actual CDK trap boundary sentinels; no manual browser session was performed.

## Context and Orientation

The feature lives under src/app/onion/learning-object-builder/components/hierarchy-tree. HierarchyNodeComponent emits menu intent to HierarchyTreeComponent, which owns a CDK Overlay hosting HierarchyMovePickerComponent. HierarchyViewService owns destinations and move application. All data remains mock/local.

## Plan of Work

Add a focus trap and initial focus to the picker, expose optional sibling position with append as the default, and hide Add Child. Cancel deferred opening and dispose overlays on tree destruction; handle external detachments. On successful moves, render the changed tree before finding the moved node's trigger. Add DOM keyboard/position, lifecycle, and focus regression coverage. Preserve existing user edits and drag/drop.

## Concrete Steps

From clark-client, run node_modules/.bin/jest --runInBand --testPathPattern=hierarchy-tree, node_modules/.bin/ng build clark --output-path=/private/tmp/clark-hierarchy-review-build --no-progress, and git diff --check.

## Validation and Acceptance

Verify focus enters the picker and wraps at boundaries, Arrow/Enter selects destinations, position changes reach moveNode, changing parents resets append, reparenting focuses the new row, Cancel/Escape/backdrop restore focus, destroy cancels queued opening and removes overlays/scroll lock, and Add Child is absent. Existing hierarchy property tests must pass.

## Idempotence and Recovery

Changes are local and reversible. Do not reset the working tree because it contains Kiro and user changes. Repeat targeted tests/build as needed; build output goes to /private/tmp.

## Artifacts and Notes

Baseline: 12 hierarchy suites / 59 tests passed. Initial verification after fixes: 3 component suites / 41 tests passed; added two more focus edge-case regressions before final validation. npm run test:unit only targets unrelated older suites, so use Jest directly. Existing Jest setup deprecation is outside scope.

## Interfaces and Dependencies

Touched components/templates/styles/tests are feature-local. No route, guard, interceptor, shared UI contract, API/service boundary, state ownership, domain type, environment, build, or dependency changes are planned. Existing NodeActionId keeps the reserved add-child identifier; only the rendered action is omitted.

Final validation: `jest --runInBand --testPathPattern=hierarchy-tree --silent`: 12 suites / 69 tests passed. `ng build clark --output-path=/private/tmp/clark-hierarchy-review-build --no-progress`: passed. No service rules or dependencies changed.
