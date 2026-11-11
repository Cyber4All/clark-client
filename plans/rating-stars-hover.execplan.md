# Connect shared rating star hover previews

This ExecPlan is maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Hovering a shared rating star previews the whole-star value through that position. Leaving the stars restores the fractional average without changing the input rating.

## Progress

- [x] (2026-11-03) Inspected the component, existing user edits, popup reference, consumers, and test configuration.
- [x] (2026-11-03) Connected the template, mask width, and styles; all three focused component tests passed.

## Surprises & Discoveries

- The user has partial changes in all three component files. The template calls an absent `rate()` and the copied styles do not match its classes.
- Jest is available, while Angular's test target still references Karma.

## Decision Log

- Decision: Stabilize the existing mask rendering and implement hover previews only.
  Rationale: Preserve fractional averages, sizing, colors, and the shared input contract without adding review submission behavior.
  Date/Author: 2026-11-03 / Codex

## Outcomes & Retrospective

Hover previews now update the existing fill mask, reset to the fractional average on leaving the stars, and leave the input rating unchanged. Template bindings and styling classes agree. All three component tests pass; browser visual validation remains manual.

## Context and Orientation

`src/app/shared/components/rating-stars/` owns the standalone display component and spec. Consumers include the cube details splash and review list, learning-object cards, collection cards, and onion metrics. Inputs supply average rating, count, color, size, and review count. Hover state is local presentation state. No routing, guards, interceptors, services, API boundaries, shared types, environments, or builds change.

## Plan of Work

Keep the existing fractional mask at rest. Use the hovered index plus one for mask width during hover. Restore matching empty-star, full-star, and mask class names, remove the nonexistent selection binding, disable overlay pointer events, and scope reset/color to the star wrapper. Remove copied dead styles and the unused visibility method. Add DOM interaction coverage to the existing spec.

## Concrete Steps

From the repository root, edit the component TS, HTML, SCSS, and spec. Run `npx jest --config jest.ratings.config.js --runInBand --runTestsByPath src/app/shared/components/rating-stars/rating-stars.component.spec.ts --testMatch '**/rating-stars.component.spec.ts'` and `git diff --check`. The testMatch override includes this shared spec in the existing ratings test configuration without changing that configuration.

## Validation and Acceptance

Tests must verify moving between stars updates the mask, leaving restores a fractional rating, input rating is unchanged, and unrated objects can preview stars. Manually inspect the cube detail splash and cards for preserved sizing/colors and overlay alignment. No API calls or selection/submission are introduced.

## Idempotence and Recovery

Tests are repeatable. Preserve the user's preexisting edits; if recovery is necessary, selectively undo this task's patch instead of resetting whole files.

## Artifacts and Notes

Jest: 1 suite, 3 tests passed (creation, hover movement/reset with fractional average, and hover without an existing rating). Browser visual validation is separate from DOM unit coverage and has not been performed.

## Interfaces and Dependencies

Existing Angular inputs and TipDirective remain unchanged. No dependencies or outputs are added. Legacy tooltip semantics and the existing mask's two-pixel correction remain in place.
