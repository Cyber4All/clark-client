# Builder AI suggestions and layout improvements

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Improve the learning object builder's Details, Materials, and Learning Outcomes spacing and make AI generation/review easier to understand. Users should see a full-width description, useful tooltip text, an anchored generation popover, compact review controls, and suggestions that disappear after accept/reject. Regenerating a name should produce a different candidate when the backend provides alternatives, while malformed suggestion payloads should not crash the builder.

## Progress

- [x] (2026-10-30) Read `PLANS.md`, repo guidance, and identify builder UI and screenshots.
- [x] (2026-10-30) Inspected screenshots and traced the builder, panel, and scaffold API flow.
- [x] (2026-10-30) Implemented feature-local layout, suggestion lifecycle, tooltip, and malformed-response fixes.
- [x] (2026-10-30) Reviewed the diff and ran `git diff --check`.

## Surprises & Discoveries

- Observation: The builder already has a dedicated agentic panel and focused specs; current panel supports description carousel and tracks applied markers.
  Evidence: `agentic-builder-panel.component.html` and `.spec.ts`.
- Observation: A staging screenshot shows the entry panel obscuring nearby builder controls.
  Evidence: `Desktop/UAT/Screenshot 2026-10-30 at 9.51.38 AM.png`.
- Observation: Scaffold search assumes `learningObjects` is always an array, matching the reported undefined `.filter` failure.
  Evidence: `components/scaffold/add-child/add-child.component.ts` filtered both search responses without a fallback.

## Decision Log

- Decision: Stabilize the existing NgModule-based builder and panel in place; do not change API/service boundaries unless validation reveals the reported malformed-payload crash crosses that boundary.
  Rationale: The request centers on builder UX and suggestion lifecycle; a broader architecture change would add risk without benefit.
  Date/Author: 2026-10-30 / Codex

## Outcomes & Retrospective

Implemented the requested builder spacing and review interaction changes. Updated legacy applied suggestion restoration to discard already-applied name and description candidates. Hardened scaffold search responses against missing `learningObjects`. Automated tests were not run in this session; the agent-level instruction prohibits running tests unless explicitly requested.

## Context and Orientation

The routeable builder is in `src/app/onion/learning-object-builder`. `builder-navbar` owns the tab navigation and Generate with AI trigger. `agentic-builder-panel` owns the entry/review panel and accepts/rejects candidates through `builder-store.service`. The Materials, Details, and Outcomes pages contain the tab content and relevant form layout. This is a feature-local UI change; no routing, guards, environment, or build behavior is expected to change.

## Plan of Work

Inspect the screenshots and nearby component styles/tests. Adjust the builder navbar/panel positioning so the entry panel is anchored below the trigger, refine tooltip text/overflow, remove the unused Materials notes UI, add tab/content separation, and correct Details description sizing. Fix candidate lifecycle so accepted/rejected values are removed and cannot subsequently be rejected; make name regeneration avoid returning the current candidate when alternatives are available. Guard array assumptions at the risky API boundary implicated by the reported `.filter` error. Await material refresh and rebuild the file tree when refreshed metadata arrives. Keep edits scoped to the builder and its API contract.

## Concrete Steps

From the repository root:

    git diff --check

Expect no whitespace errors. Automated tests and builds are not run unless explicitly requested.

## Validation and Acceptance

- Verify Details description uses the available content width and all three tab pages have visible separation from the tab navigation.
- Verify Materials no longer renders Notes on Materials.
- Verify entry panel opens below Generate with AI; close icon and outside click dismiss it.
- Verify tooltip messages fit and use professional language.
- Verify accepted/rejected name, description, and outcome suggestions are removed and do not offer an opposite stale action.
- Verify name regeneration refreshes the candidate when alternatives are returned and malformed outcome responses do not call `.filter` on undefined.
- Run focused existing tests only when requested; manually inspect the builder in browser if the local environment is available.

## Idempotence and Recovery

UI and state edits are safe to repeat. If a style adjustment causes layout regressions, revert the feature-local style declaration and retain the state lifecycle fixes independently. Avoid changing generated files.

## Artifacts and Notes

Staging screenshots are in `/Users/christopherwagner/Desktop/UAT` and illustrate entry/review overlays and tooltip truncation.

## Interfaces and Dependencies

Expected files include builder navbar and agentic panel component/template/styles/specs, Details and Materials page component/template/styles/specs, and possibly builder-store/types if the malformed response boundary is located there. The service DTO validation correction preserves the existing nested PDF request contract; no request payload change is intended.

## Follow-up: initial save validation and presentation refinements (2026-10-30)

Follow-up feedback: the updatedPDF error persisted, the Materials file explorer width was wrong, and folder uploads did not refresh its visible contents. Inspection of the adjacent `clark-service` repository located the actual defect: its update DTO validates the nested PDF object with `@IsString()`. The client-side root `updatedPDF` field was unrelated and has been removed. The DTO fix is tracked in that repository’s own ExecPlan.

Progress:
- [x] Locate the API DTO validation mismatch for nested `materials.pdf`.
- [x] Await material refetch after metadata insertion and rebuild the file tree on refreshed file lists.
- [x] Constrain the no-notes Materials layout to a fixed, centered 900px panel with a balancing track.
- [x] Run whitespace validation and inspect changed files; tests/build remain user-directed.


## Follow-up: AI terminology, refresh controls, and Materials width (2026-10-30)

- [x] Rename the entry action to “Build with AI” and use “Build” / “Draft” in user-facing panel copy.
- [x] Render the refresh action with the Font Awesome 6 solid icon class and position its tooltips on the inward side of the review drawer.
- [x] Explain that Ready material can be used to Build with AI in the Parsing tooltip.
- [x] Tighten accept/reject button spacing.
- [x] Remove the 675px Materials width breakpoint; let the content column use available space up to 900px.
- [x] Run `git diff --check`; no test or build run (not requested).


## Follow-up: refresh icon and review terminology (2026-10-30)

- [x] Remove redundant accept/reject tooltips.
- [x] Restore “Review Suggestions” and “Suggest another…” language.
- [x] Use explicit class bindings for the description refresh icon, matching the visible icon classes used by the other review sections.
- [ ] Inspect computed Materials layout in the running browser. The required browser-control JavaScript tool was not available in this session; source-only inspection cannot confirm the live computed widths.


- [x] Make the refresh icon unconditional across all three Review Suggestions actions, including the initial state.


- [x] Use the supplied live dimensions to identify the 280px left grid track as the cause of the Materials card offset; render Materials without that unused track and center a 900px content card in the viewport. Remove absent left/right scroll wrappers so they cannot create implicit grid tracks.

- [x] Widen the centered Materials card to 1100px maximum while preserving responsive viewport gutters.

- [x] Constrain the include-in-download column to 120px, reserve a 28px meatball slot, tighten file-row grid gaps, and size toggle hosts to 40px.

- [x] After screenshot comparison showed the first column adjustment changed neighboring proportions, restore Name/Size/Action/Parsing proportions and narrow only Include in download to a 100px minimum / 0.8fr track.

- [x] Align description accept/reject controls with description pagination, widen the review drawer to 760px, and match the supplied staging Materials content width (635px at the reported viewport).

- [x] Set the centered Materials content card to 50vw (the grid track includes 40px of wrapper padding), so a 1440px viewport yields 720px of visible content.

- [x] Increase the centered Materials content card to two-thirds of the viewport for visual comparison.

- [x] Constrain the Name grid track, reserve a right inset for the meatball menu, and keep its track aligned across the file-list header and rows.
