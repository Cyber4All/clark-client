# Learning Object Builder entry animation and description width

This ExecPlan is a living document and follows `PLANS.md`.

## Purpose / Big Picture

Make the Learning Object Builder's Materials/Details/Learning Outcomes navigation bar animate once when opened from the dashboard, and let the Details page description editor fill its available content width.

## Progress

- [x] (2026-11-06) Inspected the nested Onion/Builder route animations and description editor layout.
- [ ] Investigate and fix the builder tab bar's double animation; the first transition adjustment did not resolve the recorded behavior.
- [x] (2026-11-06) Stretched the description editor host across the stacked field width.
- [x] (2026-11-06) Reviewed the description fix and documented validation limits.

## Surprises & Discoveries

- Observation: Onion's builder entry transition fades the entering route and then explicitly starts `builderTransition`, which also animates the entering navbar opacity and vertical position.
  Evidence: `src/app/onion/onion.component.ts` and `src/app/onion/learning-object-builder/learning-object-builder.component.ts`.
- Observation: The stacked description field sets `align-items: flex-start`, so the custom editor host does not stretch; only descendants inside that host have `width: 100%`.
  Evidence: `src/app/onion/learning-object-builder/pages/info-page/info-page.component.scss` and the element context supplied by the user.

## Decision Log

- Decision: Preserve the builder's child transitions and dashboard leave transition, but remove the parent route fade from the entering builder.
  Rationale: The builder transition already owns its navbar and page-column entrance; having both parent and child animate opacity makes the tab bar appear to enter twice.
  Date/Author: 2026-11-06 / Codex
- Decision: Set the editor component host to stretch to the stacked field width.
  Rationale: The current inner editor width rule cannot make the flex item host wider than its shrink-wrapped intrinsic size.
  Date/Author: 2026-11-06 / Codex

## Outcomes & Retrospective

The description component host now stretches across its stacked field. The first parent/child animation adjustment did not resolve the double animation and remains under investigation.

## Context and Orientation

The dashboard button routes into the lazy-loaded Learning Object Builder under `src/app/onion`. Onion owns the outer route transition; the builder component owns an inner transition for its fixed navbar and columns. The Info page uses `ColumnWrapperComponent`, projects a metadata form into the main column, and renders the description with `LearningObjectDescriptionComponent` wrapping `ngx-simple-text-editor`. No route definitions, guards, services, models, or APIs need changes.

## Plan of Work

Keep the description component host full width in the info page styles. Continue investigating the tab-bar animation from the supplied recording and reproduce it in the shared browser before changing the transition sequence again. The attempted parent-fade removal is not considered a completed fix and should remain uncommitted until proven or replaced.

## Concrete Steps

From the repository root:

1. Update `src/app/onion/onion.component.ts` to delegate builder entry to `builderTransition` without also fading the whole entering builder.
2. Update `src/app/onion/learning-object-builder/pages/info-page/info-page.component.scss` to stretch the description component host.
3. Reproduce and inspect the recorded builder navigation animation.
4. Review the diff for limited, local changes.

## Validation and Acceptance

Acceptance: the description editor host takes the full width of the stacked field. The animation remains open until the recorded behavior is reproduced and its source is corrected. The user has asked to test the animation, so perform focused browser reproduction; do not add or run automated tests/builds unless separately needed and authorized.

## Idempotence and Recovery

These are isolated style/animation edits and are safe to repeat. Revert only the affected hunks if animation behavior or responsive layout regresses.

## Artifacts and Notes

The supplied browser context shows the editor host at approximately 347px despite a full-width inner style. The supplied screen recording must be reviewed to identify the remaining animation behavior.

## Interfaces and Dependencies

Affected files: `src/app/onion/onion.component.ts` and `src/app/onion/learning-object-builder/pages/info-page/info-page.component.scss`. The code uses Angular animations and existing component CSS; no public inputs/outputs or third-party dependencies change.
