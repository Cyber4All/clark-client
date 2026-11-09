# Dashboard parent list popup

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

On the user dashboard, activating a learning object's parent count opens a popup listing its parents. Each parent name is a link that opens that parent's builder page in a new tab. An unnamed parent shows “Untitled Learning Object,” consistent with the dashboard row label.

## Progress

- [x] (2026-11-05 21:02Z) Inspected dashboard item, parent API result, popup pattern, and builder route.
- [x] (2026-11-05 21:04Z) Retained parent identities in dashboard item state and added the count button and list popup.
- [x] (2026-11-05 21:05Z) Angular build passed after the final template edit; checked route construction against the existing Edit action.

## Surprises & Discoveries

- Observation: Parent names are currently reduced to `string[]`, losing the CUID and version needed for builder links.
  Evidence: `src/app/onion/dashboard/components/dashboard-item/dashboard-item.component.ts`.
- Observation: The parent builder route is `/onion/learning-object-builder/:cuid/:version`, and the dashboard already uses it for Edit.
  Evidence: `src/app/onion/onion.routing.ts` and `src/app/onion/dashboard/components/dashboard-item/dashboard-item.component.html`.
- Observation: `LearningObjectService.getLearningObjectParents` returns `LearningObject` instances, so `displayName` supplies the untitled fallback.
  Evidence: `src/app/core/learning-object-module/learning-object/learning-object.service.ts` and `src/entity/learning-object/learning-object.ts`.
- Observation: The existing focused Jest runner is unavailable because `jest-preset-angular` fails before test collection with `configSet.processWithEsbuild is not a function` (observed in the preceding dashboard layout work).
  Evidence: Focused Jest run earlier in this session. The Angular build succeeds for the new popup.

## Decision Log

- Decision: Use the existing `clark-popup` and Angular `routerLink` on anchors with `target="_blank"` and `rel="noopener noreferrer"`.
  Rationale: This matches the dashboard's popup convention, preserves route generation, and gives native link behavior.
  Date/Author: 2026-11-05 / Codex
- Decision: Keep the change local to the dashboard item and its nearby tests.
  Rationale: No route, service, type, auth, or shared popup contract change is required. This modernizes the touched UI without a broad rewrite.
  Date/Author: 2026-11-05 / Codex

## Outcomes & Retrospective

The dashboard parent count now opens a popup containing one builder link per parent. It uses `displayName` for unnamed parents and opens links in a new tab. The parent count is a separate button, preserving the row name interaction. The Angular build passed. The shared Home pages do not expose the authenticated dashboard for manual verification; focused unit tests remain blocked by the existing Jest preset setup error.

## Context and Orientation

`src/app/onion/dashboard/components/dashboard-item/` renders each learning object in the dashboard. `LearningObjectService.getLearningObjectParents` fetches parent objects; the item currently stores names for a tooltip. `src/app/onion/onion.routing.ts` defines the guarded builder route. `src/app/shared/modules/popups/` supplies the existing modal behavior. This is a local dashboard UI change with routing consumption; it does not alter route definitions, guards, interceptors, shared UI contracts, service/API boundaries, state ownership, types/entities, environments, or build behavior. The app uses mixed legacy and modern Angular patterns, so the component's existing structure remains in place.

## Plan of Work

Store the fetched parent `LearningObject[]` so each row has a display label, CUID, and version. Replace the count tooltip with an explicit button. Open `clark-popup` with a list of parent anchors and a close action. Keep the child tooltip unchanged. Preserve the existing name click behavior without letting the count button trigger it.

## Concrete Steps

From the repository root, edit `src/app/onion/dashboard/components/dashboard-item/dashboard-item.component.{ts,html,scss}`. Run:

    node_modules/.bin/ng build clark

If the existing Jest setup permits, run:

    node_modules/.bin/jest --runInBand --runTestsByPath src/app/onion/dashboard/components/dashboard-item/dashboard-item.component.spec.ts

## Validation and Acceptance

On the user dashboard, an item with parents shows a count button. Activating it opens a popup with one link per parent. An empty name displays “Untitled Learning Object.” Each link opens the correct `/onion/learning-object-builder/:cuid/:version` URL in a new tab, without navigating the dashboard tab. Closing the popup returns focus to the count button. The item name's existing interaction still works. The Angular build passed. The shared browser exposes only Home pages, so the popup interaction could not be verified manually on an authenticated dashboard.

## Idempotence and Recovery

The component edits are local and repeatable. If validation is interrupted, inspect the dashboard item state, template, and styles together before rerunning the build. Existing test runner incompatibility should be distinguished from a new code failure.

## Artifacts and Notes

`node_modules/.bin/ng build clark` passed on 2026-11-05 after the final template edit. Focused Jest was not rerun because the same preset setup error has already been reproduced in this session.

## Interfaces and Dependencies

Affected: dashboard item component and local styles; existing `LearningObjectService`, `LearningObject.displayName`, `PopupComponent`, Angular `RouterLink`, and the existing guarded builder route. No new dependencies.
