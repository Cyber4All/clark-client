# Consistent Agentic Review Actions

## Purpose / Big Picture

Use matching green check and red X buttons for all AI suggestion review sections. Add dismiss actions for name and description suggestions.

## Progress

- [x] (2026-10-27) Inspect panel template, styles, and review state handling.
- [x] (2026-10-27) Implement matching controls and persist dismissed suggestions, including carousel index and applied marker adjustments.
- [x] (2026-10-27) Inspect template bindings; editor diagnostics report no errors in the component, HTML, or SCSS. Automated tests and browser preview were not run.

## Surprises & Discoveries

Name and description retain applied suggestions; outcomes disappear after acceptance. Dismissing a suggestion must not undo content already applied to the learning object.

## Decision Log

- Decision: Dismiss only the selected description and preserve the applied marker when removing an earlier option.
  Rationale: Carousel positions shift after deletion; the applied marker must follow the same remaining suggestion.
  Date/Author: 2026-10-27 / Codex

## Outcomes & Retrospective

All suggestion sections use matching circular green check and red X controls with labels and tooltips. Name and description dismissal persists in session storage and leaves applied learning-object content intact. Editor diagnostics pass; browser appearance and interaction remain unverified.

## Context and Orientation

Local changes to the agentic builder panel component, template, and SCSS under `src/app/onion/learning-object-builder/components/agentic-builder-panel/`. Existing component methods own review state and persist it through the session storage service. No route, guard, shared UI, API, type, environment, or state ownership changes.

## Plan of Work

Reuse circular accept-button styling with a red reject modifier. Add name dismissal and selected-description dismissal methods. Clamp the carousel index, adjust applied indices, and persist changes.

## Concrete Steps

1. Add component dismissal methods.
2. Update template actions and local button styles.
3. Inspect resulting handlers and diagnostics.

## Validation and Acceptance

Each section has accessible icon buttons with tooltips: red X to reject and green check to accept. Rejection removes only the suggestion and persists across reopening. Removing a description keeps carousel bounds and applied markers correct. Buttons are disabled during apply.

## Idempotence and Recovery

Changes affect session suggestions only. Dismissal never changes persisted learning-object content. Reopen the panel or generate more suggestions to continue review.

## Artifacts and Notes

This plan and the panel's component, template, and SCSS.

## Interfaces and Dependencies

Reuse existing icon fonts, tooltip directive, session persistence, and local color variables.
