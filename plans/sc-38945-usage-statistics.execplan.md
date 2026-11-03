# SC-38945: Remove the Quality-Assured Collections counter

This ExecPlan follows `PLANS.md`.

## Purpose / Big Picture

Remove the Quality-Assured Collections card from `/system/usage`. Keep the Downloads card and its total unchanged. The four-week CSV report is a separate task.

## Progress

- [x] (2026-10-20) Confirmed the ticket branch is clean and inspected the counter array and responsive grid.
- [x] (2026-10-20) Removed the collections entry; TypeScript compilation and whitespace checks passed.

## Surprises & Discoveries

The template iterates over `counterStats`, and the grid uses auto-fit, so removing the array entry needs no template or styling changes. There is no parent usage-statistics component spec.

## Decision Log

- Decision: Stabilize in place by removing only the counter entry.
  Rationale: The user explicitly separated this task from downloads reporting.
  Date/Author: 2026-10-20 / Codex

## Outcomes & Retrospective

Removed the single counter entry. All five remaining counter definitions, including Downloads, are unchanged. TypeScript validation passed; browser verification has not been performed.

## Context and Orientation

`src/app/cube/usage-stats/usage-stats.component.ts` builds `counterStats` from loaded usage data. Its sibling HTML iterates over that array to render counter blocks, and its SCSS uses a responsive auto-fit grid.

## Plan of Work

Remove the Quality-Assured Collections object from `buildCounterStats()`. Preserve other counters and the API contract. Routing, guards, shared UI, state ownership, types, environment, and build behavior remain unchanged. Existing service and chart patterns are outside this task.

## Concrete Steps

From `clark-client`, inspect the component diff and run `git diff --check`. Use the installed TypeScript compiler to check the application with its existing configuration if available.

## Validation and Acceptance

Verify the final counter array contains the five remaining cards with unchanged values, including total Downloads. Manual browser acceptance: visit `/system/usage` and confirm the collections card is absent and the remaining cards fit desktop and mobile widths.

## Idempotence and Recovery

The edit is local and reversible. Restore only the removed counter object to undo it; preserve unrelated changes.

## Artifacts and Notes

`git diff --check` passed. `./node_modules/.bin/tsc --project src/tsconfig.app.json --noEmit` passed. No backend files were modified.

## Interfaces and Dependencies

Only the usage-statistics component's counter configuration changes. No backend changes or new dependencies are required.
