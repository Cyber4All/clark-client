# SC-38945: Remove the Quality-Assured Collections counter

This ExecPlan follows `PLANS.md`.

## Purpose / Big Picture

Remove the Quality-Assured Collections card from `/system/usage`. Keep the Downloads card and its total unchanged. The four-week CSV report is a separate task.

## Progress

- [x] (2026-10-20) Confirmed the ticket branch is clean and inspected the counter array and responsive grid.
- [x] (2026-10-20) Removed the collections entry; TypeScript compilation and whitespace checks passed.
- [x] (2026-11-09) Re-reviewed the implementation and identified stale collections-only icon and styling branches in the counter component.
- [x] (2026-11-09) Removed the stale collections icon branch and collections-only counter styling without changing collections functionality elsewhere.
- [x] (2026-11-09) Updated the downloads icon condition and removed empty lifecycle boilerplate from the counter component.
- [x] (2026-11-09) Editor diagnostics report no errors in the touched Angular files; the existing usage-statistics spec was not discovered by the VS Code test runner.
- [x] (2026-11-09) Inlined the counter markup and styles into the usage-statistics component and removed the standalone counter component references.
- [x] (2026-11-09) Deleted the obsolete counter-block files and verified no references remain.

## Surprises & Discoveries

The template iterates over `counterStats`, and the grid uses auto-fit, so removing the array entry needs no template or styling changes. There is no parent usage-statistics component spec.

The first implementation removed only the `counterStats` entry. The counter template and SCSS still contained collections-specific branches, but the usage-statistics page no longer created a `CounterStat` with that title. The shared `LearningObjectStats.collections` field must remain because the About CLARK component still consumes it. The follow-up showed the counter component had only one consumer, so its presentation can be owned directly by the usage-statistics component.

## Decision Log

- Decision: Stabilize in place by removing only the counter entry.
  Rationale: The user explicitly separated this task from downloads reporting.
  Date/Author: 2026-10-20 / Codex
- Decision: Complete the counter-specific cleanup while preserving the shared collections metric contract.
  Rationale: The stale icon and CSS branches are unreachable in the counter component, but `LearningObjectStats.collections` is still used by `AboutClarkComponent` and is outside the counter-removal scope.
  Date/Author: 2026-11-09 / Codex
- Decision: Inline the counter card instead of retaining a one-consumer child component.
  Rationale: The child has no business logic or independent behavior; its markup, styles, and input type are local to the usage-statistics page.
  Date/Author: 2026-11-09 / Codex

## Outcomes & Retrospective

The initial implementation removed the single counter entry. This follow-up completes the counter-specific cleanup by removing unreachable collections presentation code and inlining the remaining counter cards while retaining the shared API/type data used by the About CLARK page.

## Context and Orientation

`src/app/cube/usage-stats/usage-stats.component.ts` builds `counterStats` from loaded usage data. Its sibling HTML iterates over that array to render counter blocks, and its SCSS uses a responsive auto-fit grid.

## Plan of Work

Remove the Quality-Assured Collections object from `buildCounterStats()`, remove the corresponding unreachable icon branch and `.collections` counter styling, then inline the remaining counter markup and styles into `UsageStatsComponent`. Preserve the shared collections metric in `LearningObjectStats` and `AboutClarkComponent`, because those are still active outside the usage counter. Routing, guards, shared UI, state ownership, environment, and build behavior remain unchanged. Existing service and chart patterns are outside this task.

## Concrete Steps

From `clark-client`, inspect the counter and usage-statistics files, remove only counter-specific collections presentation code, run `git diff --check`, and use the repository's available Angular/TypeScript validation. Confirm no active usage-statistics counter references the removed title.

## Validation and Acceptance

Verify the final counter array contains the five remaining cards with unchanged values, including Weekly Downloads. Verify the usage-statistics template has the counter markup inline, no collections-specific icon branch, and no remaining counter component references or files. Confirm shared collections data remains available to About CLARK. Manual browser acceptance: visit `/system/usage` and confirm the collections card is absent and the remaining cards fit desktop and mobile widths.

## Idempotence and Recovery

The edit is local and reversible. Restore only the removed counter object to undo it; preserve unrelated changes.

## Artifacts and Notes

Editor diagnostics report no errors in the touched Angular files after inlining. The focused usage-statistics spec exists but was not discovered by the VS Code test runner, and CLI validation could not be run because the sandbox blocks the repository's Node/Git runtime dependencies. No backend files changed.

## Interfaces and Dependencies

Only the usage-statistics component's counter configuration changes. No backend changes or new dependencies are required.
