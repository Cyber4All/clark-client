# Show shared parsing progress in builder files and folders

This ExecPlan is maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Add a Parsing column to the builder's files and folders list. Files show Ready, Parsing, Failed, or Status unavailable from the existing five-second polling. Folder rows summarize their descendant files. Ready files remain excluded from subsequent requests until Include in download changes.

## Progress

- [x] (2026-10-12) Reviewed the navbar poll, file service, filesystem list and row components, and existing spinner styles.
- [x] (2026-10-12) Published polling results through a shared observable without adding polling subscriptions.
- [x] (2026-10-12) Added a reusable indicator and aligned header, file, and folder columns inside the builder.
- [x] (2026-10-12) Both focused suites passed (10 tests) with a temporary Jest configuration; app TypeScript, Angular templates, and all four changed SCSS files compile.
- [x] (2026-10-12) Changed the completed status label to Ready as requested, including folder summaries and assertions.
- [x] (2026-10-12) Restricted animation to explicit `processing` statuses. Queued, not_started, and missing statuses now use static indicators; folder animation requires an actively processing descendant. All eight indicator cases, Angular compilation, and formatting checks pass.
- [x] (2026-10-12) Rendered separate icon subtrees for each status to handle Font Awesome's SVG replacement. Nine indicator tests pass, including a DOM regression that replaces the queued icon with an SVG and transitions to ready and processing. Angular compilation passes.

## Surprises & Discoveries

The existing readiness cache is private to the navbar. Filesystem rows also appear outside the builder, so the new column must be conditional on `inBuilder`. Grid definitions are duplicated across header/file/folder styles. Backend status values are queued, processing, ready, failed, and not_started.

The default Jest configuration mixes ts-jest and Angular preset transforms. Passing a complete temporary configuration using the Angular transformer, `stringifyContentPathRegex`, and app/alias mappings allows the focused suites to execute without editing repository test configuration. The deprecated setup-jest import still emits a warning. Sass also reports existing shared-variable/import deprecations.

`src/index.html` loads a Font Awesome kit that can replace icon elements with SVGs. Updating classes on a single Angular icon can leave stale artwork. Status icons now use separate structural branches with stable wrapper elements, ensuring the entire old SVG subtree is removed when the status changes.

## Decision Log

- Decision: Only supported extensions count toward folder progress and AI readiness; unsupported files show Not parseable and make no status requests.
  Rationale: See `plans/unsupported-material-parsing.execplan.md` for the shared extension helper, updated acceptance criteria, and 34 passing focused tests. This supersedes earlier references to counting every file in a folder.
  Date/Author: 2026-10-12 / Codex

- Decision: Publish the navbar's existing status snapshot through `FileService` and let the indicator observe it.
  Rationale: API and reusable status state stay in the service layer; there is still one poll and shared filesystem components do not depend on BuilderStore.
  Date/Author: 2026-10-12 / Codex
- Decision: Use one indicator component for files and folder summaries, displaying a spinner for pending work and a checkmark for parsed files.
  Rationale: Shared markup keeps accessible status labels and visuals consistent.
  Date/Author: 2026-10-12 / Codex

## Outcomes & Retrospective

Added a builder-only Parsing column showing file states and recursive folder counts from the same polling snapshot that controls Generate with AI. The indicator makes no API calls. Ready statuses remain cached across normal updates and new uploads; Include in download resets only affected files. Non-builder file list columns are preserved. Tests, template compilation, and scoped style compilation passed; live browser visual verification was not available.

## Context and Orientation

The builder navbar currently polls FileService and owns readiness. `src/app/core/learning-object-module/file/file.service.ts` will publish a readonly observable status map. Filesystem list rows under `src/app/shared/modules/filesystem/file-list-view` render both builder and public file lists. Add a feature-local indicator under that directory and gate it with `inBuilder`. Folder membership comes from DirectoryNode and includes descendants. No routes, guards, interceptors, environment, build configuration, or entity/API contract changes are needed. State publication is added while polling lifetime stays with the navbar. Existing unrelated user edits must be preserved.

## Plan of Work

Replace the ready-only navbar cache with per-file processing statuses and publish immutable snapshots after resets and responses. Continue polling only files whose status is not ready. Expose snapshots via FileService without triggering requests. Add an indicator that reads this stream and derives file or recursive folder progress. Add a conditional Parsing header and corresponding cells with consistent grid tracks; keep other consumers' layout intact. Update polling tests and add summary tests.

## Concrete Steps

From the repository root, implement service state, navbar publication, the indicator component, and three list templates/styles. Run:

    ./node_modules/.bin/ngc --noEmit -p src/tsconfig.app.json
    ./node_modules/.bin/tsc --noEmit -p src/tsconfig.app.json
    ./node_modules/.bin/sass --load-path=src --no-source-map <changed.scss>
    git diff --check

The focused Jest suites passed with this temporary configuration (the repository config remains unchanged):

    ./node_modules/.bin/jest --runInBand --runTestsByPath src/app/onion/learning-object-builder/components/builder-navbar/builder-navbar.component.spec.ts src/app/shared/modules/filesystem/file-list-view/file-processing-indicator/file-processing-indicator.component.spec.ts --config '{"rootDir":"/Users/luis/Code/development-environment/clark-client","preset":"jest-preset-angular","roots":["<rootDir>/src"],"setupFilesAfterEnv":["<rootDir>/src/setup-jest.ts"],"moduleNameMapper":{"^app/(.*)$":"<rootDir>/src/app/$1","^@entity(.*)$":"<rootDir>/src/entity/$1","^@env(.*)$":"<rootDir>/src/environments/$1"},"transform":{"^.+\\.(ts|js|mjs|html|svg)$":["jest-preset-angular",{"tsconfig":"<rootDir>/src/tsconfig.spec.json","stringifyContentPathRegex":"\\.(html|svg)$"}]}}'

## Validation and Acceptance

Every builder file row displays a spinner only while processing, a Ready label and checkmark after ready, and static Queued, Not started, Failed, or Status unavailable labels for other states. A folder shows ready count over total files, including nested folders, spins only when a descendant is actively processing, and becomes Ready only when all are ready. Empty folders show No files. Include in download resets only the affected statuses. Button gating requires all files ready, regardless of ZIP inclusion. No new GET requests come from the indicator. Non-builder list headers/rows retain their existing columns. Angular/template and Sass compilation must pass; test summary and polling publication with focused specs where tooling permits.

## Idempotence and Recovery

Compilation and scoped diff checks are safe to repeat. Keep the navbar as the sole polling owner and cancel on destruction. Revert only this task's edits if recovery is needed; preserve earlier polling/layout changes and unrelated agentic panel work.

## Artifacts and Notes

10 focused tests passed across two suites: polling requests and status publication, readiness, included-material gating, failures/retries, teardown, file labels, nested-folder summaries, and empty folders. TypeScript, Angular templates, and all four affected SCSS files compile. Formatting and whitespace checks passed. Browser verification should cover files, nested folders, upload/removal, toggle invalidation, and public file lists.

## Interfaces and Dependencies

FileService gains `fileProcessingStatuses$` and `setFileProcessingStatuses`. The new standalone indicator accepts a file or DirectoryNode as `item`. Existing row inputs remain compatible. RxJS BehaviorSubject, Angular AsyncPipe, and existing Font Awesome icons provide state and display.
