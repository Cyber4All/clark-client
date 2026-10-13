# Expand builder content into unused sidebar space

This ExecPlan is maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

The builder main content should fill the available horizontal space after removal of side components. Keep the scaffold where it is still used and remove empty column reservations.

## Progress

- [x] (2026-10-12) Inspected the column wrapper and all three builder pages.
- [x] (2026-10-12) Adjusted grid sizing and render only enabled side columns.
- [x] (2026-10-12) Configured all three pages for main-only nanomodules or scaffold plus main.
- [x] (2026-10-12) Angular template compilation, Sass compilation, and diff whitespace checks passed.

## Surprises & Discoveries

All three pages default to `lmr` even though none projects right-column content. Scaffold content is conditional on a non-nanomodule learning object. The wrapper currently always renders three scroll containers, including disabled ones.

## Decision Log

- Decision: Keep the existing scaffold and fixed vertical scrolling layout, while expanding the horizontal grid and explicitly selecting populated columns.
  Rationale: The request concerns unused horizontal space; existing scaffold behavior remains useful.
  Date/Author: 2026-10-12 / Codex

## Outcomes & Retrospective

The main panel fills the grid between the existing outer gutters. All three builder pages omit the empty right column; nanomodules also omit the unused left column. Scaffold content remains visible for other learning object lengths. The fixed vertical scrolling logic was preserved.

## Context and Orientation

`src/app/onion/learning-object-builder/components/column-wrapper/column-wrapper.component.*` owns the fixed grid, scroll wrappers, and `.content` panels. The info, outcome, and materials templates under `src/app/onion/learning-object-builder/pages/` project main and optional scaffold content. This is a local builder layout change spanning its three pages. Routing, guards, API services, state ownership, models, environments, and build configuration are unaffected. Existing legacy viewport height calculations remain in place.

## Plan of Work

Anchor the grid to both horizontal edges with the existing outer gutter. Let the middle track consume remaining space. Render side scroll containers only when their columns are enabled. Select `m` for nanomodules and `lm` otherwise in each page.

## Concrete Steps

From the repository root, edit the wrapper SCSS/template and the three page templates. Run:

    ./node_modules/.bin/ngc --noEmit -p src/tsconfig.app.json
    ./node_modules/.bin/sass --load-path=src --no-source-map src/app/onion/learning-object-builder/components/column-wrapper/column-wrapper.component.scss
    git diff --check

## Validation and Acceptance

Angular template and Sass compilation should pass. On each builder page, the main white content panel should extend to the right gutter without an empty sidebar. A nanomodule should have no scaffold gutter. Non-nanomodules should keep the scaffold beside the expanded main panel. Verify the existing vertical scroll behavior manually when a browser is available. This style change needs no new unit test; existing Jest setup has a known transformer failure.

## Idempotence and Recovery

Edits and compile commands are safe to repeat. Inspect the scoped diff before recovery and preserve unrelated polling changes and user work.

## Artifacts and Notes

`ngc --noEmit -p src/tsconfig.app.json`, the scoped Sass compilation command, and `git diff --check` passed. No live browser layout check was available. Existing minimum column width behavior still allows horizontal overflow on small screens; responsive redesign is outside this change.

## Interfaces and Dependencies

Uses the existing `ColumnWrapperComponent.columns` input and SCSS grid layout. No new dependency or public input is introduced.
