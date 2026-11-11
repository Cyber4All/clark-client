# Redesign Agentic Builder Suggestion Review

## Purpose / Big Picture

Improve the existing right-side Agentic Builder suggestion review drawer for educators reviewing AI-generated learning-object content. The work preserves the existing Angular Material-adjacent CLARK visual language, generation contract, BuilderStore save path, and builder shell while replacing the form-like review presentation with a calmer editorial queue. Individual Accept and Reject actions must remove only the decided suggestion and keep the drawer open until the queue is empty or the user explicitly closes it.

This is a feature-local but multi-file UI/state interaction change in `src/app/onion/learning-object-builder`. It does not change routing, guards, interceptors, shared UI APIs, backend contracts, environment/build behavior, or the learning-outcome data structure.

## Progress

- [x] (2026-10-12) Read the repository instructions and `PLANS.md`.
- [x] (2026-10-12) Read the installed `design-taste-frontend` skill and the pasted task brief.
- [x] (2026-10-12) Audited the Agentic Builder panel, BuilderNavbar host, BuilderStore agentic methods, package dependencies, and existing SCSS tokens.
- [x] (2026-10-12) Determined redesign mode: preserve product behavior and CLARK identity, substantially overhaul the drawer presentation.
- [x] (2026-10-12) Confirmed the provided attachment directory contains the brief only, not the referenced screenshot.
- [x] (2026-10-12) Refactored panel review actions so individual decisions are isolated and Accept All is retry-safe item by item.
- [x] (2026-10-12) Redesigned review markup and styles as a content-first queue with a sticky footer.
- [ ] Add or update focused tests for individual decisions, failures, Accept All, and dismissal behavior.
- [x] (2026-10-12) Ran Prettier, `git diff --check`, lint, and production build checks.
- [x] (2026-10-12) Re-ran the production build after the reported Angular template/import errors; the current workspace builds successfully.
- [x] (2026-10-12) Added an explicit in-flight review-action guard so document dismissal cannot close the drawer during an individual Accept/Reject save interaction.
- [x] (2026-10-12) Replaced `ng-click-outside` for this panel with an explicit document click containment check, removing the third-party dismissal path from Accept interactions.
- [x] (2026-10-12) Added direct `stopPropagation()` handling to every individual decision button so Accept/Reject events cannot reach document or parent click listeners.

## Surprises & Discoveries

- The panel is standalone Angular 18 code inside an otherwise NgModule-oriented application, so the local component convention should be preserved.
- The panel is always present under `BuilderNavbarComponent` and hidden with `[hidden]`; it is not conditionally destroyed by each accept action.
- `acceptField` and `acceptOutcome` already call the existing store save mechanism, but the review state is mutated through a callback after a shared apply helper. This makes action/session coupling harder to reason about and needs explicit per-item success handling.
- `applyAgenticSuggestions` accepts outcome indexes relative to the passed suggestion array. This works for a single outcome because the array is narrowed to one item, but the behavior must remain explicit for Accept All and retries.
- The provided attachment has no screenshot file, so visual comparison against the screenshot cannot be performed from the workspace.
- The current SCSS contains earlier card-based rules and later overrides for the same selectors, which contributes to unclear visual intent and makes a focused rewrite safer than incremental tweaks.

## Decision Log

- Decision: Treat this as a preserve-the-product redesign with a significant drawer presentation change.
  Rationale: The brief explicitly preserves generation, learning-object updates, the builder shell, and dismissal behavior while asking for a substantially more polished review experience.
  Date/Author: 2026-10-12 / Codex

- Decision: Keep Angular Material/CLARK primitives and existing CSS tokens; do not add a styling or animation dependency.
  Rationale: The project already has Angular Material, local button conventions, Font Awesome, and stable SCSS variables. A new framework would expand scope and conflict with the request.
  Date/Author: 2026-10-12 / Codex

- Decision: Use a restrained visual system: one blue accent, quiet neutral surfaces, no nested suggestion cards, and a single rounded-radius language for controls only.
  Rationale: The audience needs readable content and fast decisions, not dashboard decoration. This follows the brief and the taste audit without changing CLARK’s identity.
  Date/Author: 2026-10-12 / Codex

- Decision: Keep motion limited to a short opacity/translation removal transition, guarded by reduced-motion CSS.
  Rationale: The interaction is a queue transition, so a subtle removal can clarify state, but dramatic motion is explicitly out of scope.
  Date/Author: 2026-10-12 / Codex

## Outcomes & Retrospective

The panel now uses a content-first review queue with a minimal header count, plain prose sections, quiet Bloom metadata, and a footer action bar. Individual decisions use native button events and only mutate local review state after a successful store operation. Accept All processes each remaining item independently so a failed item remains available without repeating earlier successful saves.

Automated build and lint validation passed for the changed code. The repository lint command reports 271 pre-existing warnings and no errors. No focused panel spec existed before this change, so interaction behavior remains a follow-up test opportunity. The supplied screenshot was used for the visual audit, but no running browser session was available for live screenshot verification in this turn.

## Context and Orientation

The review flow begins in `BuilderNavbarComponent`, which toggles `AgenticBuilderPanelComponent`. The panel calls `LearningObjectService.buildLearningObject` to generate typed `AgenticBuilderSuggestions`, then renders name, description, and `AgenticOutcomeSuggestion` items. Accepted changes are delegated to `BuilderStore.applyAgenticSuggestions`, which mutates the learning object and creates/appends outcomes through existing builder actions. The store emits normal learning-object and outcome events used by the rest of the builder.

Primary files:

- `src/app/onion/learning-object-builder/components/agentic-builder-panel/agentic-builder-panel.component.ts`
- `src/app/onion/learning-object-builder/components/agentic-builder-panel/agentic-builder-panel.component.html`
- `src/app/onion/learning-object-builder/components/agentic-builder-panel/agentic-builder-panel.component.scss`
- `src/app/onion/learning-object-builder/components/builder-navbar/builder-navbar.component.html`
- `src/app/onion/learning-object-builder/builder-store.service.ts`
- `src/app/core/learning-object-module/learning-object/learning-object.types.ts`

The relevant current UI is a fixed panel near the top-right of the builder with a header, scrollable content, per-section bordered containers, and a footer containing Close and Accept all. The target is still a right-side overlay, but with a narrower editorial hierarchy: a minimal header and count, plain grouped content, outcome rows separated by whitespace/hairlines, compact actions, and a footer that stays usable while the content scrolls.

## Plan of Work

1. Stabilize review state and action boundaries in the panel. A single item action will save only that item, remove it only after success, and leave all other items untouched. Reject will be local and immediate. Accept All will snapshot the current queue, apply all items through the existing store path, close only after success, and preserve the queue on failure.
2. Rewrite the review template around the queue model. Keep the generation-entry state intact, but redesign only the review state. Use a subtle remaining count, readable name/description prose, individual outcome rows with a quiet Bloom label, and explicit accessible button labels.
3. Replace duplicated/overridden review SCSS with a focused drawer layout. Preserve responsive full-screen behavior on small screens, scrollable content, a sticky footer, visible keyboard focus, button contrast, and reduced-motion behavior.
4. Add focused tests if the local test setup can instantiate the standalone component without disproportionate fixture work. At minimum, test state changes on reject, successful individual accept, failed accept retention, Accept All close semantics, and outcome append invocation. Use existing Jest/Angular patterns discovered in the nearest specs.
5. Validate with formatting, targeted tests, lint/build checks, and manual/browser inspection if a usable browser session is available. Report the unavailable screenshot comparison honestly.

## Concrete Steps

- Inspect nearby component spec patterns before adding tests.
- Update `agentic-builder-panel.component.ts` with typed action helpers and explicit queue mutation.
- Update `agentic-builder-panel.component.html` only for the review state and accessibility copy; do not alter backend fields or generation request shape.
- Replace `agentic-builder-panel.component.scss` review styles while retaining entry-state styles and existing token imports.
- Consider a small store helper only if it makes outcome index semantics safer without changing the public generation contract.
- Run Prettier on touched files.
- Run the nearest targeted Jest spec(s), then `npm run lint` or the narrowest supported lint command, and `npm run build` if time/dependencies permit.
- Inspect the git diff for accidental changes and update this plan’s Progress, Validation, and Retrospective sections.

## Validation and Acceptance

Functional acceptance:

- Accepting name updates only the name, removes only the name suggestion, and leaves the drawer open when other suggestions remain.
- Accepting description has the same behavior.
- Accepting one outcome appends one structured outcome and leaves all other generated outcomes available.
- Rejecting any item does not call the learning-object update path and removes only that item.
- A failed individual save leaves the affected suggestion available and reports an error.
- Accept All applies all current items, appends all outcomes without overwriting existing outcomes, and closes only after success.
- Close button, outside click, and Escape still dismiss the drawer; an individual decision does not.
- The empty queue renders a minimal completed state without broken controls.

Visual/accessibility acceptance:

- Review content reads as prose rather than nested forms/cards.
- Drawer remains readable at desktop and small viewport widths and keeps footer actions usable.
- No new dependency or unrelated branding change is introduced.
- Focus-visible states and sufficient contrast remain present.
- Reduced-motion users receive no removal animation.

Validation performed:

- `npx prettier --write` on the three panel files and this plan: passed.
- `git diff --check`: passed.
- `npm run lint`: passed with 0 errors and 271 existing warnings across the repository.
- `npm run build`: passed. Angular reported the repository’s existing CommonJS warning for `querystring`.
- Reproduced the reported compile path after confirming `agentic-builder-panel.component.html` exists at the exact `templateUrl` path; a fresh `npm run build` now passes, so the reported errors were stale/transient compiler state rather than a remaining source error.
- After the reported Accept dismissal, traced `ng-click-outside` and confirmed it is document-level. The panel now blocks outside-click and Escape dismissal while `applySuggestions` is saving, preventing an action event from tearing down the review session.
- The reported behavior persisted, so the panel no longer uses `ng-click-outside`. Its document click handler closes only when the event target is outside the component host; clicks on Accept, Reject, and Close remain inside the host and cannot trigger outside dismissal.
- Added a final event-boundary guard directly on decision buttons because the user continued to observe dismissal after the containment rewrite. The build passes with this guard in place.
- Visual reference audit: screenshot reviewed; live browser verification unavailable.

## Idempotence and Recovery

All edits are limited to the feature-local panel and, if needed, a narrowly scoped store helper. If implementation is interrupted, the panel may be restored from the git diff without affecting backend contracts. Save failure must not remove the item from the local queue. Accept All must not close or clear the queue before the store promise resolves successfully. Do not use destructive git commands or reset unrelated work.

## Artifacts and Notes

- Design Read: preserve-the-product redesign for educators, calm editorial review language, existing Angular Material/CLARK system.
- Dials: `DESIGN_VARIANCE: 5`, `MOTION_INTENSITY: 3`, `VISUAL_DENSITY: 3`. The low motion and density reflect a focused product workflow rather than a marketing page.
- The skill’s landing-page-specific rules are applied only where relevant. This is an in-product workflow, so no new hero, bento, marquee, image generation, or marketing sections are appropriate.
- Screenshot reference unavailable in the provided attachment directory; live code audit is the visual baseline.
- The user supplied the screenshot in chat after the initial workspace audit; it confirmed the bordered-container repetition and excessive vertical density described above.

## Interfaces and Dependencies

No new package dependencies are planned. Existing interfaces remain the source of truth:

- `AgenticBuilderSuggestions`
- `AgenticOutcomeSuggestion`
- `BuilderStore.applyAgenticSuggestions`
- `LearningObjectService.buildLearningObject`

The component continues to use existing `ActivateDirective`, `ClickOutsideModule`, local button classes, Font Awesome close icon, and CLARK SCSS variables. No routing, guard, interceptor, environment, or API contract changes are expected.
