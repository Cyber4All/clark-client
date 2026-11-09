# Share downtime banner layout offset

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

The admin screen, learning object builder columns, and AI review sidebar should all move below a visible downtime message by the same offset defined in `src/globals.scss`. When the banner disappears, they should return to their usual positions without another API request or page reload.

## Progress

- [x] (2026-11-05 20:40Z) Inspected the root message, admin layout, builder columns, AI sidebar, and nearby specs.
- [x] (2026-11-05 20:42Z) Replaced admin's one-time banner measurement with the shared CSS offset.
- [x] (2026-11-05 20:42Z) Replaced builder columns' one-time banner measurement with CSS geometry and a resize based overflow check.
- [x] (2026-11-05 20:43Z) Angular build passed; editor diagnostics reported no errors. Focused Jest suites could not initialize because of existing preset incompatibility.

## Surprises & Discoveries

- Observation: Admin and column wrapper both make independent downtime requests after the root already requests it. Each measures the banner only once.
  Evidence: `src/app/admin/admin.component.ts` and `src/app/onion/learning-object-builder/components/column-wrapper/column-wrapper.component.ts`.
- Observation: The offset in `src/globals.scss` is currently 40px; the previous conversation used other values. Preserve the current value while consolidating consumers.
  Evidence: `body:has(clark-message .wrapper.warning)` in `src/globals.scss`.
- Observation: Both existing focused Jest suites fail before collecting tests with `TypeError: configSet.processWithEsbuild is not a function` from `jest-preset-angular`.
  Evidence: Focused Jest command on 2026-11-05. The Angular build succeeded after the same edits.

## Decision Log

- Decision: Modernize touched files only by making layout geometry CSS driven and removing duplicate banner requests; retain unrelated admin and builder behavior.
  Rationale: CSS custom properties update with banner visibility and avoid timing dependent DOM measurements. No service or API contract change is needed.
  Date/Author: 2026-11-05 / Codex

## Outcomes & Retrospective

Admin, builder columns, and AI review sidebar now consume the same CSS variable. Admin and column wrapper no longer make extra downtime requests. The builder columns' layout responds to banner visibility; `ResizeObserver` keeps its existing body overflow threshold in sync. The Angular build passed. Visual verification in admin/builder remains unavailable from the shared Home pages, and the existing Jest preset incompatibility prevented focused unit tests.

## Context and Orientation

`src/app/clark.component.html` renders `clark-message` before route content. `src/globals.scss` sets `--downtime-banner-offset` on `body` while that message is visible. The AI sidebar in `src/app/onion/learning-object-builder/components/agentic-builder-panel/agentic-builder-panel.component.scss` already consumes the variable. `src/app/admin/admin.component.ts` and its template currently measure the message and set an inline top. `src/app/onion/learning-object-builder/components/column-wrapper/column-wrapper.component.ts` and its template measure the message and set inline column height. Its SCSS holds the fixed column top. Nearby specs cover component creation only. This is cross-cutting UI work across admin and builder, with no routing, guard, interceptor, shared component contract, API contract, state ownership, type, environment, or build changes.

## Plan of Work

Use `--downtime-banner-offset` for admin top and available height and for builder column top and scroll height. Remove the independent downtime calls and banner measurements from those components. Retain the column wrapper's existing body overflow threshold, using `ResizeObserver` on its rendered scroll area to keep that threshold current. Do not change the root banner or AI sidebar behavior.

## Concrete Steps

From the repository root, edit `src/app/admin/admin.component.{ts,html,scss}` and `src/app/onion/learning-object-builder/components/column-wrapper/column-wrapper.component.{ts,html,scss}`. Then run focused validation such as:

    node_modules/.bin/jest --runInBand --runTestsByPath src/app/admin/admin.component.spec.ts src/app/onion/learning-object-builder/components/column-wrapper/column-wrapper.component.spec.ts

    node_modules/.bin/sass --no-source-map --load-path=src src/app/admin/admin.component.scss /tmp/admin-layout-check.css

    node_modules/.bin/sass --no-source-map --load-path=src src/app/onion/learning-object-builder/components/column-wrapper/column-wrapper.component.scss /tmp/column-layout-check.css

## Validation and Acceptance

With a downtime message visible, admin content and builder columns begin below it using the same 40px offset as the AI sidebar. Without the banner, each returns to its baseline position. If banner visibility changes while a view is open, CSS adjusts automatically. The Angular build passes. Focused component specs cannot run until the existing Jest preset incompatibility is resolved. Shared UI consumers outside admin and the builder are unchanged. The shared browser currently exposes only Home, so builder or admin visual verification is unavailable from those pages.

## Idempotence and Recovery

Edits are local and reversible. Re-run focused tests and Sass compilation after partial edits. If component tests fail because of existing test setup, distinguish that from new failures and use editor diagnostics and Sass compilation for the style changes.

## Artifacts and Notes

`node_modules/.bin/ng build clark` passed on 2026-11-05. Focused Jest command failed during setup before test collection. Editor diagnostics found no errors in the touched files.

## Interfaces and Dependencies

Affected: `src/globals.scss` custom property; admin component and styles; learning object builder column wrapper component and styles. Existing `UtilityService.getDowntime()` remains the root component's source of banner state. No new dependencies.
