# Restore review popup interactions

This ExecPlan is maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Restore the Write a review popup and let signed-in users open it with a selected splash star. Keep the consolidated shared stars component.

## Progress

- [x] (2026-11-09) Corrected filled-row sizing to remain independent of its clipping mask, removed its extra flex spacer, and configured the same light-blue color for all popup star states.
- [x] (2026-11-09) Inspected working changes, component consumers, and test configuration; found undefined-rating rendering and disconnected selection events.
- [x] (2026-11-09) Fixed rendering and connected selection through the splash and review editor.
- [x] (2026-11-09) Ran focused regression tests (7 passing), existing ratings tests (33 passing), and Angular compilation (passing).

## Surprises & Discoveries

- Follow-up visual report: `width: 100%` on the filled row resolves against its partially filled mask, shrinking star spacing. The filled row now uses the same configured 200px width as the outline row (intrinsic width for other consumers). Its legacy `:after` spacer also introduced an extra flex gap and was removed. Popup blue now overrides both normal and hover states.
- `roundedReview` calls `toFixed` on the undefined value deliberately supplied when creating a review.
- Shared stars emit `selectedRating`, while the editor listens for `ratingSelected` and omits the required `loggedIn` flag. Splash does not forward the output.
- Existing hover specs predate the interactive/login gates. The focused ratings Jest config excludes star and new-rating specs; Angular CLI still configures Karma.

## Decision Log

- Decision: Stabilize the existing component contracts and forward events to DetailsComponent.
  Rationale: Details already owns popup state and email verification. Keep authorization there and reuse the existing interactive and loggedIn inputs.
  Date/Author: 2026-11-09 / Codex

## Outcomes & Retrospective

Follow-up: restore the popup's original centered 200px star row and light-blue hover. The consolidated child no longer matched the old parent selectors. Popup-local CSS variables now configure the shared row width and hover color, leaving other consumers at their existing defaults. Removed obsolete popup star-markup selectors. Visual browser verification remains manual.

Restored blank-review rendering, editor selection, and splash event forwarding with an optional initial value accepted by the existing popup handler. Existing login, owner, and email-verification restrictions are preserved. Browser validation of popup positioning, close/cancel, and native rich text remains manual; no browser session was available in this run.

## Context and Orientation

`src/app/shared/components/rating-stars` renders both read-only averages and interactive stars. `src/app/cube/details/components/new-rating` edits the selected value and comment. `components/splash` displays the header average; `details.component.ts` owns `showAddRating` and `userRating`. The button opens a blank rating, whose value is initially undefined. Existing working-tree changes must be preserved.

## Plan of Work

Make the average getter tolerate missing values. Wire the editor to `selectedRating` and enable its already-authorized stars. Forward splash selections to Details, opening the existing popup with the selected value. Keep signed-out/owner gating and email verification. Add regressions for blank initialization, editor selection, and read-only gating. No routing, guards, APIs, state ownership, models, environments, or build changes; shared UI public contracts remain the same. Defer unrelated legacy cleanup.

## Concrete Steps

From the repository root, edit the affected templates and components, then run:

    npx jest --config jest.ratings.config.js --runInBand --testMatch '**/rating-stars.component.spec.ts' '**/new-rating.component.spec.ts'
    npx jest --config jest.ratings.config.js --runInBand
    npx ngc -p src/tsconfig.app.json --noEmit

## Validation and Acceptance

Blank stars render without throwing; selecting a star in the editor sets the value and reveals comments. Read-only and signed-out stars do not emit. Manually check the details route: verified non-owner users can open a blank popup using the button or a preselected popup using a splash star; close/cancel releases the backdrop; edits preserve the previous value. Signed-out users and object owners cannot initiate via splash; unverified users remain blocked. Native rich text/browser layout remains a manual check.

## Idempotence and Recovery

Checks are repeatable. Preserve all pre-existing working changes; revert only this fix if necessary. No data migrations or external mutations.

## Artifacts and Notes

The two targeted component suites pass all 7 tests; the existing ratings config passes all 33 tests across 3 suites. `npx ngc -p src/tsconfig.app.json --noEmit` and `git diff --check` pass. Popup initialization adds `no-scroll` before projecting its content, explaining why a rendering exception can leave the page apparently frozen. No popup lifecycle rewrite was necessary.

## Interfaces and Dependencies

Angular standalone components within the existing NgModule application, ActivateDirective, TipDirective, existing rich text editor, and jest-preset-angular. No dependency changes.
