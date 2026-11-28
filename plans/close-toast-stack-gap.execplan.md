# Close gaps when notifications are dismissed

This ExecPlan is a living document maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Closing a toast should move older toasts above it down by its rendered height plus the 25px spacing. Existing CSS animates the movement.

## Progress

- [x] (2026-10-21) Inspected notification component, styles, service, and Jest/Angular configuration.
- [x] (2026-10-21) Implemented bounded position adjustment in the shared close path, preserving user edits.
- [x] (2026-10-21) Validated dismissal and expiry: seven focused Jest tests pass using a command-line transform override.

## Surprises & Discoveries

- Closed notifications remain in the render array until every notification is closed. Preserve indices rather than splicing the array.
- Jest is configured, but `angular.json` still points to Karma and the npm unit script selects unrelated suites.
- User edits already implement persistent error dismissal; preserve these and unrelated working tree edits.

## Decision Log

- Decision: Stabilize in place by adjusting live older notifications in `close()` and ignoring repeated closure.
  Rationale: Manual dismissal and automatic expiry already share this method; no stack or service rewrite is necessary.
  Date/Author: 2026-10-21 / Codex

## Outcomes & Retrospective

Completed the shared close-path adjustment and seven regression tests. Manual browser verification remains recommended to confirm the visual transition. No service or stylesheet changes were needed.

## Context and Orientation

`src/app/shared/modules/toaster/notification.service.ts` emits notifications to `src/app/shared/modules/toaster/notification/notification.component.ts`. The component positions fixed elements from the configured vertical edge and keeps newest notifications nearest that edge. `notification.component.scss` supplies 200ms transitions. The shared UI affects all toaster consumers, including the learning object builder. Routes, guards, APIs, state ownership, types, and build/environment behavior are unchanged.

## Plan of Work

Update only the component close path to measure the departing notification, shift older live entries toward the configured edge, and reject duplicate closure. Preserve persistence, animation, array indexing, and cleanup. Add a component unit spec using mocked element heights and fake timers. Broader subscription and stack lifecycle modernization is deferred.

## Concrete Steps

From the repository root, edit the component and add its adjacent spec. Run:

    ./node_modules/.bin/jest --runInBand --runTestsByPath src/app/shared/modules/toaster/notification/notification.component.spec.ts

## Validation and Acceptance

Verify different toast heights, middle/bottom/top dismissal, repeated clicks, automatic expiry, and new notifications after dismissal. Check configured top positioning as well as default bottom positioning. Manual follow-up: trigger several persistent upload errors, dismiss one, and observe the remaining stack animate into the gap.

## Idempotence and Recovery

Tests are repeatable. Revert only this task's changes if necessary; retain existing user changes in the component and elsewhere.

## Artifacts and Notes

Seven tests pass for different heights, middle/bottom/top closure, repeated dismissal, expired notifications, additions after closure, and top positioning. `git diff --check` passes. No browser validation performed.

The default Jest command fails before executing tests with `configSet.processWithEsbuild is not a function`, caused by the repository's conflicting transforms. The passing command, without changing repository test configuration, was:

    ./node_modules/.bin/jest --runInBand --runTestsByPath src/app/shared/modules/toaster/notification/notification.component.spec.ts --config '{"preset":"jest-preset-angular","roots":["src"],"setupFilesAfterEnv":["<rootDir>/src/setup-jest.ts"],"transform":{"^.+\\.(ts|js|mjs|html|svg)$":["jest-preset-angular",{"tsconfig":"src/tsconfig.spec.json","stringifyContentPathRegex":"\\.(html|svg)$"}]}}'

The existing Jest setup also emits a deprecation warning. Aligning Jest configuration is deferred.

## Interfaces and Dependencies

Uses existing `ToastrOvenComponent`, `ToastrOvenService`, Angular ElementRef, Jest, and the existing CSS transition. No new dependency or public service contract.
