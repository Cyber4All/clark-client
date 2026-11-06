# Learning Object Builder entry animation and description width

This ExecPlan is a living document and follows `PLANS.md`.

## Purpose / Big Picture

Make the Learning Object Builder's Materials/Details/Learning Outcomes navigation bar animate once when opened from the dashboard, and let the Details page description editor fill its available content width.

## Progress

- [x] (2026-11-06) Inspected the nested Onion/Builder route animations and description editor layout.
- [x] (2026-11-06) Reproduced the double navbar instance and fixed the transient no-ID builder route rendering a second navbar.
- [x] (2026-11-06) Repeated browser navigation; navbar count stayed at zero on the transient route and one after the canonical route loaded.
- [x] (2026-11-06) Stretched the description editor host across the stacked field width.
- [x] (2026-11-06) Reviewed the description fix and documented validation limits.

## Surprises & Discoveries

- Observation: The navbar host is briefly duplicated because creating a new draft navigates from the no-ID builder route to a CUID/version route, which recreates the builder.
  Evidence: Browser sampling counted two `.builder-navbar-wrapper` nodes 45ms after clicking New and one at approximately 1.1 seconds; `createAndRouteToNewLearningObject()` navigates from the transient route after creation.
- Observation: The stacked description field sets `align-items: flex-start`, so the custom editor host does not stretch; only descendants inside that host have `width: 100%`.
  Evidence: `src/app/onion/learning-object-builder/pages/info-page/info-page.component.scss` and the element context supplied by the user.

## Decision Log

- Decision: Render the builder navbar only after a new draft has its canonical CUID/version route.
  Rationale: The recording and runtime sample point to duplicate component instances during the route replacement, not a second opacity effect on one navbar.
  Date/Author: 2026-11-06 / Codex
- Decision: Set the editor component host to stretch to the stacked field width.
  Rationale: The current inner editor width rule cannot make the flex item host wider than its shrink-wrapped intrinsic size.
  Date/Author: 2026-11-06 / Codex

## Outcomes & Retrospective

The description component host now stretches across its stacked field. Runtime sampling found two `.builder-navbar-wrapper` nodes 45ms after New was clicked and one node at approximately 1.1 seconds. The no-ID route creates a draft and then navigates to the CUID/version route, recreating the builder; the navbar now renders only on the canonical route. The earlier parent-fade adjustment was reverted.

## Context and Orientation

The dashboard button routes into the lazy-loaded Learning Object Builder under `src/app/onion`. Onion owns the outer route transition; the builder component owns an inner transition for its fixed navbar and columns. The Info page uses `ColumnWrapperComponent`, projects a metadata form into the main column, and renders the description with `LearningObjectDescriptionComponent` wrapping `ngx-simple-text-editor`. No route definitions, guards, services, models, or APIs need changes.

## Plan of Work

Keep the description component host full width in the info page styles. The transient new-object builder route should not render the builder navbar; the canonical CUID/version route renders and animates it once. Preserve the existing Onion parent fade and builder child transition definitions.

## Concrete Steps

From the repository root:

1. Update the builder component and template so the navbar renders only on the canonical CUID/version route.
2. Update `src/app/onion/learning-object-builder/pages/info-page/info-page.component.scss` to stretch the description component host.
3. Reproduce the dashboard-to-new-object navigation and sample navbar instance count.
4. Review the diff for limited, local changes.

## Validation and Acceptance

Acceptance: the description editor host takes the full width of the stacked field, and exactly one builder navbar is rendered during the final CUID/version route. The user asked to test the animation; focused browser reproduction and runtime DOM sampling are appropriate. Do not add or run automated tests/builds unless separately needed and authorized.

## Idempotence and Recovery

These are isolated style/animation edits and are safe to repeat. Revert only the affected hunks if animation behavior or responsive layout regresses.

## Artifacts and Notes

The supplied browser context showed the editor host at approximately 347px despite a full-width inner style. The recording and browser sampling showed the navbar host duplication follows draft creation's transient-to-persistent route change.

## Interfaces and Dependencies

Affected files: `src/app/onion/learning-object-builder/learning-object-builder.component.ts`, its template, and the info-page styles. The code uses the existing Angular route parameters and animations; no public inputs/outputs or third-party dependencies change.
