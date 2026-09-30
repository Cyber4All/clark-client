# Add a Cyber Awareness homepage banner

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Replace the homepage splash with the supplied CyberAware banner at the same desktop height and two browse buttons. The first opens all learning objects; the second opens browse with the Cyber Awareness tag selected.

## Progress

- [x] (2026-09-30) Inspected homepage splash, browse query parsing, tag service, and existing tests.
- [x] (2026-09-30) Added the banner component and replaced the homepage splash reference.
- [x] (2026-09-30) Verified TypeScript and Angular template compilation and checked the homepage diff.
- [x] (2026-09-30) Changed the SVG background to `contain` so the full artwork remains visible at every viewport ratio.
- [x] (2026-09-30) Widened the SVG's intrinsic ratio and enabled full banner scaling so the artwork fills the available width without cropping.
- [x] (2026-09-30) Inspected the new layer SVGs and mapped their artwork to left and right banner anchors.
- [x] (2026-09-30) Composed the stretched background and eight anchored decorative layers; Angular template, Sass, SVG XML, and formatting checks passed.
- [x] (2026-09-30) Added `Text.svg` as a proportional, left-anchored layer above the decorations.
- [x] (2026-09-30) Added left-aligned campaign heading and paragraph between `Text.svg` and the buttons, using the SVG's `#002866` blue.
- [x] (2026-09-30) Adjusted `Text.svg` upward above 950px and aligned both buttons with the campaign copy's left edge.
- [x] (2026-09-30) Centered only `Text.svg` and the copy/button column; retained left-aligned copy and buttons inside that column.
- [x] (2026-09-30) Corrected the text layer's horizontal offset to center its visible lettering, rather than its transparent 5184-wide canvas.
- [x] (2026-09-30) Grouped `Text.svg`, the campaign copy, and both buttons in a single `campaign-content` wrapper while preserving their proportions and alignment.
- [x] (2026-09-30) Removed the banner's redundant tag lookup and linked directly to browse using the supplied Cyber Awareness tag ID.

## Surprises & Discoveries

- Observation: Browse accepts `tags` as a query parameter containing tag IDs, not names. The supplied SVG is an untracked asset and must be preserved.
  Evidence: `browse.component.ts`, `filter.component.ts`, and `git status --short`.
- Observation: `angular.json` references missing `src/env.js`; the build may need local setup outside this change.
  Evidence: `angular.json` and file listing.
- Observation: The cutout SVGs retain the original 5184×2592 viewBox, with transparent space around each visible object.
  Evidence: XML inspection of `src/assets/images/cyber-awareness/*.svg`.
- Observation: Angular compilation, lint, Sass, and a full build pass, but the previous click handler could silently fail when its extra tag request failed.
  Evidence: `cyber-awareness-banner.component.ts` made a `getTag` request and the working template had removed the error message.

## Decision Log

- Decision: Replace the homepage splash reference with the new feature-local component and use a 535px minimum height.
  Rationale: The user requested replacement and a banner height close to the original desktop splash, whose video and vertical padding total about 535px.
  Date/Author: 2026-09-30 / Codex
- Decision: Resolve the exact Cyber Awareness tag by name and navigate using its ID.
  Rationale: Browse searches and marks selected filters by tag ID.
  Date/Author: 2026-09-30 / Codex
- Decision: Use `background-size: contain` instead of rewriting the supplied SVG's 2:1 viewBox.
  Rationale: The banner's viewport ratio varies by screen width; containing the SVG preserves all artwork at every width without changing the asset.
  Date/Author: 2026-09-30 / Codex
- Decision: Revise the earlier `contain` choice by setting the SVG root to a wider 6912:2568 ratio with `preserveAspectRatio="none"`, and render it at 100% width and height.
  Rationale: The user specifically requested a wider SVG that fills the banner width. This keeps all artwork visible at different viewport ratios, with some stretching as the tradeoff.
  Date/Author: 2026-09-30 / Codex
- Decision: Replace the single stretched banner with the new SVG layers. Stretch only `ORG BGD CAB.svg`; size all decorative layers from the original 2:1 artboard and anchor them by edge.
  Rationale: Every cutout retains the original full-size transparent viewBox. Keeping each image at a 2:1 displayed ratio preserves its circles, webs, and mummy while edge anchoring lets the background expand on wider screens.
  Date/Author: 2026-09-30 / Codex
- Decision: Pin `Text.svg` to the upper left of the proportional artboard and layer it above the ornaments.
  Rationale: Its visible content begins near the left side of the original canvas, and the text should remain readable without stretching.
  Date/Author: 2026-09-30 / Codex
- Decision: Keep campaign copy as HTML between the artwork and browse actions, aligned with the SVG's left-side text.
  Rationale: The new copy remains readable and responsive while matching the `#002866` blue used in `Text.svg`.
  Date/Author: 2026-09-30 / Codex
- Decision: Shift the text artwork up gradually between 950px and about 1083px viewport width, up to 40px, and share one left indent between the copy and buttons.
  Rationale: The user observed overlap past 950px; a gradual offset prevents a visible jump at the breakpoint while keeping the top of the SVG in view.
  Date/Author: 2026-09-30 / Codex
- Decision: Center `Text.svg` by its image box and center a shared 760px column for the copy and buttons.
  Rationale: The user clarified that only the lettering and content should move; the decorative layers keep their edge anchors, and the copy and buttons retain their shared left edge.
  Date/Author: 2026-09-30 / Codex
- Decision: Revise the text SVG offset from 50% to 35.9% of its displayed width.
  Rationale: The visible lettering spans approximately x=180 to x=3540 in the 5184-unit viewBox, placing its center at 35.9% of the full canvas. Aligning that point with the banner center also aligns it with the centered copy and buttons column.
  Date/Author: 2026-09-30 / Codex
- Decision: Move `Text.svg` into the same positioned content wrapper as the copy and buttons, keeping the decorations in their separate layer.
  Rationale: The campaign content now has one layout owner, while the established SVG size and visible center remain stable.
  Date/Author: 2026-09-30 / Codex
- Decision: Use the supplied tag ID directly in the browse link and remove the prerequisite `getTag` request.
  Rationale: Browse accepts tag IDs in its `tags` query parameter, so an extra request introduces a failure point without changing the destination.
  Date/Author: 2026-09-30 / Codex

## Outcomes & Retrospective

The Cyber Awareness banner replaces the old homepage splash reference. `ORG BGD CAB.svg` fills the banner, while the eight decorative cutout SVGs retain their original proportions and edge anchors. `Text.svg`, the campaign copy, and both buttons share a centered content wrapper. The copy and buttons remain left-aligned within that wrapper. The SVG lettering moves upward as the viewport grows past 950px to avoid the reported overlap. The Cyber Awareness link now navigates directly with its tag ID. No tests were added, per user request. Angular template, Sass, SVG XML, lint, formatting, and a full build passed. Visual review in a running browser remains unverified.

## Context and Orientation

`src/app/cube/home/home.component.html` previously rendered the existing `splash` component. `src/app/cube/browse/browse.component.ts` reads URL query parameters and `src/app/cube/browse/components/filter/filter.component.ts` displays tag selections. The new component lives under `src/app/cube/home/` and uses the supplied layers in `src/assets/images/cyber-awareness/`.

## Plan of Work

Create a standalone home component with a stretched background, proportional decorative layers, and the two buttons. Reuse the existing learning object count and Google event pattern. Link to the Cyber Awareness tag ID through the browse query parameter. Replace the splash reference in `HomeComponent` and `HomeModule`. Scope is local to homepage UI and navigation; routing, guards, shared UI, API boundaries, state ownership, types, and environment behavior do not change. Leave the original splash component files untouched.

## Concrete Steps

From the repository root, create the component files and update home component files. Run `./node_modules/.bin/tsc -p src/tsconfig.app.json --noEmit --incremental false`, `./node_modules/.bin/ngc -p src/tsconfig.app.json --noEmit`, and `git diff --check`.

## Validation and Acceptance

Homepage shows the supplied banner in place of the old splash and two visible browse buttons at desktop and mobile widths. The general button goes to `/browse`; the Cyber Awareness button goes to `/browse?tags=<matching tag ID>` and the filter is selected. No tests will be added per user request. Build validation should account for the pre-existing missing `src/env.js`.

## Idempotence and Recovery

Component registration and validation are safe to rerun. The browse link no longer depends on a tag lookup. Do not alter or delete the supplied asset. Resume from checked progress above if interrupted.

## Artifacts and Notes

`tsc --noEmit`, `ngc --noEmit`, lint, `git diff --check`, Sass compilation, SVG XML validation, Prettier checks, and `ng build clark` passed on 2026-09-30. Sass reported deprecations from the existing `_vars.scss` import. No test file was created. The supplied SVG layers are part of the working tree.

## Interfaces and Dependencies

Affected: `HomeComponent`, new homepage banner component, `SearchService`, `GoogleTagService`, Angular Router, and supplied SVG assets. No guard, interceptor, model, build, or external API contract changes.
