# SC-40374 builder save and status regression specs

This ExecPlan is maintained under the requirements in `PLANS.md`.

## Purpose / Big Picture

Cover the three commits from `64700b7c1` through `43d44fb74`. Invalid learning outcome edits should produce persistent feedback, and administrators should regain access to status choices when the builder can save again.

## Progress

- [x] (2026-11-23 15:58Z) Identified the three commits and inspected the adjacent specs and Jest setup.
- [x] (2026-11-23 16:08Z) Updated the three adjacent suites and corrected their TestBed dependencies.
- [x] (2026-11-23 16:08Z) Ran the 17 focused tests, the Angular build, and the whitespace check.

## Surprises & Discoveries

The root Jest transformer fails while loading the setup file with `configSet.processWithEsbuild is not a function`. The ratings suites already have a working Angular transformer configuration that can be reused for a focused invocation. The existing builder and modal fixtures also needed test providers to instantiate their components.

## Decision Log

- Decision: Reuse the ratings Jest configuration with an inline test selection.
  Rationale: This keeps the regression work focused on the builder and leaves repository-wide Jest maintenance outside the task.
  Date/Author: 2026-11-23 / Codex

## Outcomes & Retrospective

All 17 focused tests passed. They cover the store's save state and persistent validation feedback, the builder's saving and saved messages, and the modal's disabled choices and recovery. The Angular build passed with a CommonJS warning for the existing `querystring` dependency. `git diff --check` passed.

## Context and Orientation

The affected files are under `src/app/onion/learning-object-builder/`. `builder-store.service.ts` owns outcome validation, save state, and persistent error toasts. `learning-object-builder.component.html` renders the save indicator. `components/editor-action-panel/change-status-modal/change-status-modal.component.html` consumes the store's save flag to control status choices in the admin workflow.

## Plan of Work

Stabilize the adjacent specs in place. Exercise the store's outcome actions, render the builder's save indicator, and activate a status choice before and after save recovery. Scope the edits to specs. Routing, guards, interceptors, shared UI, API boundaries, state ownership, models, build configuration, and environments are outside this work.

## Concrete Steps

Run these commands from the repository root.

    ./node_modules/.bin/jest --runInBand \
      --config "$(node -e 'const {testMatch, ...config} = require("./jest.ratings.config.js"); console.log(JSON.stringify(config))')" \
      --runTestsByPath \
      src/app/onion/learning-object-builder/builder-store.service.spec.ts \
      src/app/onion/learning-object-builder/learning-object-builder.component.spec.ts \
      src/app/onion/learning-object-builder/components/editor-action-panel/change-status-modal/change-status-modal.component.spec.ts
    npm run build
    git diff --check

## Validation and Acceptance

The tests should prove that invalid edits block saving and produce persistent feedback, successful correction restores the save flag, the status chooser responds to that flag, and the builder displays saving and saved messages without the previous inline validation error.

## Idempotence and Recovery

The focused Jest command and build can be repeated from the repository root. If the root Jest setup prevents execution, use the ratings preset configuration above.

## Artifacts and Notes

The comparison range is `HEAD~3..HEAD` at `43d44fb74`, authored by Emma.

## Interfaces and Dependencies

Tests exercise `BuilderStore`, `LearningObjectBuilderComponent`, and `ChangeStatusModalComponent` with Jest, Angular TestBed, and RxJS.
