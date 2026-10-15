# Exclude unsupported files from AI readiness

This ExecPlan follows `PLANS.md`.

## Purpose / Big Picture

Unsupported uploads must show Not parseable and must not prevent AI generation from ready supported materials. The Parsing header explains that only docx, html, md, pdf, pptx, txt, and xlsx are supported.

## Progress

- [x] (2026-10-12) Reviewed polling, list indicators, tooltips, and focused specs.
- [x] (2026-10-12) Centralized extension eligibility and applied it to polling, readiness, and folder summaries.
- [x] (2026-10-12) Added focusable Parsing-header guidance and focused regression cases.
- [x] (2026-10-12) All three focused suites passed (34 tests), and Angular template compilation passed.
- [x] (2026-10-12) Replaced nested status/tooltip ternaries with named functions and sequential conditions at the user's request. All 34 existing tests and Angular compilation still pass.

## Surprises & Discoveries

Polling currently includes all uploads, so unsupported files can remain not_started forever. The indicator and button must use the same extension rule. ZIP inclusion remains unrelated to eligibility.

## Decision Log

- Decision: Use a shared file helper with the user's exact seven extensions, normalizing case and leading dots, with a filename fallback.
  Rationale: Polling, row status, and tooltip cannot drift independently.
  Date/Author: 2026-10-12 / Codex
- Decision: Require at least one supported file, all supported files ready, and exclude unsupported files from folder progress totals.
  Rationale: Unsupported files provide no AI context and must neither block nor count as ready.
  Date/Author: 2026-10-12 / Codex

## Outcomes & Retrospective

Unsupported uploads show Not parseable, are not polled, and do not block ready supported materials. All-unsupported lists remain ineligible for AI. Folder totals include only parseable descendants. One shared seven-extension list governs polling, indicators, and header help. All 34 focused tests and Angular compilation pass, using the existing temporary Jest transformer configuration.

## Context and Orientation

The builder navbar owns polling and publishes status through FileService. A shared filesystem indicator displays file/folder status. This is a bounded cross-component change to `src/app/core/learning-object-module/file`, the builder navbar, and `src/app/shared/modules/filesystem/file-list-view`. No routes, guards, interceptors, models, environment/build configuration, or API contract changes are needed. State ownership and polling lifetime stay in place.

## Plan of Work

Add a shared supported-extension constant and helper. Poll only eligible file IDs while publishing unsupported status for others. Compute AI readiness only over eligible files, requiring a nonempty set. Show Not parseable without animation for unsupported rows and summarize only supported descendants in folders. Add a keyboard-accessible tooltip by the Parsing heading. Update existing fixtures to represent supported PDFs and add regressions for mixed uploads, all-unsupported uploads, normalization, and folder progress.

## Concrete Steps

From the repository root, run the focused navbar and indicator suites with the temporary Angular Jest configuration in `plans/material-parsing-status-column.execplan.md`, plus the helper spec. Run `./node_modules/.bin/ngc --noEmit -p src/tsconfig.app.json`, scoped Prettier checks, and `git diff --check`.

## Validation and Acceptance

A ready PDF alongside a ZIP enables AI and only the PDF is polled. Unsupported-only uploads disable AI without ongoing requests. Unsupported rows show Not parseable and never spin. Folder totals exclude unsupported descendants. All seven supported extensions, uppercase, leading dots, and filename fallback are covered. The header tooltip lists exactly the supported formats. Existing per-file ready caching and ZIP-independent availability remain intact.

## Idempotence and Recovery

Checks are safe to repeat. Preserve earlier layout and generation edits. Restore only this scoped helper/filter change if necessary; avoid reverting unrelated user work.

## Artifacts and Notes

Three focused suites passed with 34 tests covering extension eligibility, normalization, polling/readiness, mixed and unsupported-only uploads, nested folder summaries, and SVG status-icon replacement. Angular compilation passed. The existing deprecated Jest setup import still warns. Live browser verification remains desirable for tooltip appearance.

## Interfaces and Dependencies

Introduce a supported-extension helper and tooltip constant under the existing file API/domain directory. Reuse TipDirective, the current shared polling observable, and existing indicator icons.
