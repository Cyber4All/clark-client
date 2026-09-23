# Rating Comments Rich Text Editor

## Purpose / Big Picture
Replace the plain-text comment inputs used for learning-object ratings and rating responses with the existing builder rich-text editor. The editor will use formatting controls and heading sizes, omit undo/redo controls because keyboard shortcuts provide those actions, and preserve the existing submit/cancel and validation flows.

## Progress
- [x] 2026-09-14: Identified plain-text rating and response inputs and the existing builder/shared editor implementation.
- [x] 2026-09-14: Updated the shared editor toolbar to remove undo/redo and add paragraph/heading-size controls.
- [x] 2026-09-14: Replaced rating and response textareas and wired rich-text output and display rendering.
- [x] 2026-09-14: Rolled back the unsuccessful review-layout adjustment and restored the original 2048-character review limit and 150-character read-more threshold.
- [x] 2026-09-14: Validated the Angular build and checked the final diff for whitespace errors and scope.
## Surprises & Discoveries
- The builder uses `ngx-simple-text-editor` through `<st-editor>`.
- The package has no built-in named heading selector, so the shared editor defines a small `formatBlock` dropdown for Paragraph, Heading 1, Heading 2, and Heading 3.
- `src/app/shared/components/text-editor/text-editor.component.ts` is already a reusable standalone editor, but its toolbar currently includes undo and redo and does not include heading controls.
- Rating and response components currently bind with `[(ngModel)]` to plain strings and validate character length directly.

## Decision Log
- Reuse the existing shared editor component rather than introducing a second rich-text editor implementation.
- Configure the shared editor toolbar without undo/redo and with heading-size controls implemented through `formatBlock`.
- Keep the current component outputs and parent contracts unchanged; rich text will be emitted as the editor's HTML string.
- Preserve the existing 2048-character guard for new ratings, with validation measured against the editor content string.

## Outcomes & Retrospective
- Rating and response comment fields now reuse the shared builder editor with formatting and heading controls.
- Undo and redo toolbar controls were removed from the shared editor; keyboard shortcuts remain available through the browser/editor.
- Rich-text output is rendered through Angular's sanitized `[innerHTML]` binding, and read-more collapse uses height rather than truncating HTML.
- No focused rich-text component test was added because the touched area has no established interaction-test harness; validation was performed with the production Angular build and diff checks.

## Context and Orientation
The Angular 18 application is primarily NgModule-based, with standalone components used in newer touched areas. The rating workflow lives under `src/app/cube/details/components/`: `NewRatingComponent` creates or edits ratings, `NewRatingResponseComponent` creates or edits responses, and `LearningObjectRatingsComponent` hosts response editors and emits the existing domain events. The builder's shared editor is `src/app/shared/components/text-editor/text-editor.component.ts`; its current template wraps `ngx-simple-text-editor` and emits changed content through `textOutput`.

This change touches shared UI and two rating form components. It does not touch routing, guards, interceptors, services, API boundaries, state ownership, types/entities, or environment/build behavior beyond compilation.

## Plan of Work
1. Update the shared text editor toolbar to remove undo/redo and add heading controls while retaining existing formatting controls.
2. Replace the rating and response `<textarea>` elements with the shared editor, mapping its output back to the existing model fields.
3. Preserve submit/cancel behavior and adapt rating validation to the editor output.
4. Build the Angular application and review the final diff for unrelated changes.

## Concrete Steps
- Inspect the installed `ngx-simple-text-editor` exports for heading button constants and the editor's model behavior.
- Modify `TextEditorComponent` toolbar configuration and, if needed, its inputs/outputs to support the rating use cases without breaking existing consumers.
- Import `TextEditorComponent` into the standalone rating components and replace their textareas.
- Ensure the editor receives existing response content when editing and emits updates before submission.
- Run `npm run build`; address only regressions caused by this change.

## Validation and Acceptance
- The builder/shared editor toolbar contains no undo or redo controls.
- Heading-size controls are available in the comment editor.
- New rating and response editors accept rich text and submit the resulting content through the existing outputs.
- Editing a response loads its existing content into the editor.
- Empty comments remain invalid, and the existing rating length guard remains enforced.
- `npm run build` succeeds. Manual browser verification should confirm toolbar behavior, heading formatting, submit/cancel behavior, and no layout regression in the rating panel.

## Idempotence and Recovery
Changes are limited to the shared editor and rating form components. Re-running the build is safe. If editor compatibility issues appear, revert only the rating template/import changes and retain the shared toolbar update only if existing builder consumers still compile and behave correctly.

## Artifacts and Notes
- `src/app/shared/components/text-editor/text-editor.component.ts`
- `src/app/cube/details/components/new-rating/new-rating.component.ts`
- `src/app/cube/details/components/new-rating/new-rating.component.html`
- `src/app/cube/details/components/new-rating-response/new-rating-response.component.ts`
- `src/app/cube/details/components/new-rating-response/new-rating-response.component.html`

## Interfaces and Dependencies
- Existing `TextEditorComponent` `savedContent`, `editorPlaceholder`, `textOutput`, and `touched` API.
- `ngx-simple-text-editor` toolbar button exports and `<st-editor>` model binding.
- Existing `NewRatingComponent` `rating` input and `setRating`/`cancelRating` outputs.
- Existing `NewRatingResponseComponent` `response` input and `submit`/`cancel` outputs.

## SC-39995 completion — 2026-09-21

This continuation supersedes the earlier 150-character/height preview and HTML-length decisions.

- [x] Inspected client changes, service DTOs, and both repositories' planning instructions.
- [x] 2026-09-21: Implemented decoded-text validation (2,048 Unicode code points), 512-character plain-text previews, and editor first-edit handling.
- [ ] BLOCKED 2026-09-21: Service branch/plan write permission was declined. No service files or branches were changed; both DTOs still enforce 512 raw characters.
- [x] 2026-09-21: Client build and eight focused extraction/preview tests passed.
- [x] 2026-09-21: Added fixed review editor sizing, overflow wrapping, paragraph/heading line-width rules, and a state-aware heading selector.
- [ ] Service validation and browser interaction checks remain outstanding.

Decision: Count decoded text with Array.from, excluding markup and script/style/template content. Preserve block and line-break boundaries as newlines. Use equivalent DOM parsing in the browser and the service's existing jsdom dependency. This is length extraction, not a sanitizer; Angular continues sanitizing rendered HTML. Date/Author: 2026-09-21 / Codex.

Scope: Rating form, rating preview, shared editor synchronization, and service create/update DTO validation. No route, auth, database, environment or build configuration changes. Responses retain their existing API contract. The builder's separate toolbar is outside this review-specific change.

Validation: Exercise 512/513 preview and 2048/2049 validation boundaries, entities, emoji, blank rich text, and first edit of saved content. Run npm run build and focused Jest tests; document existing tooling failures. Verify expand/collapse manually when a browser is available. Service edits use a matching story branch; no commits or destructive resets are needed.

Validation results: `npm run build` passed. Focused Jest run with jsdom and ts-jest (without the unrelated Angular setup) passed all 8 cases in `src/app/cube/details/components/rating-comment.spec.ts`. Shared editor first-edit behavior was reviewed but not browser-tested. Removed unused legacy counter configuration (its 1000 limit was never connected to st-editor). Service completion remains blocked, not silently skipped.

## Review dialog regression follow-up — 2026-09-21

- [x] Constrained the rating popup to 720px, capped at viewport width minus 32px, and made the rating component host fill that bounded parent. Percentage widths alone followed the content-sized popup and did not prevent expansion.
- [x] Passed an empty string to the library for an absent comment; its direct innerHTML assignment otherwise renders literal undefined.
- [x] Replaced the library's format selector with one accessible native select above the toolbar. Track the heading at the caret; map plain text/div/p to one Paragraph option, and restore the selection when applying formatting.
- [x] Client build and git diff whitespace check passed.
- [x] Headless Chrome tested the actual NewRatingComponent using an isolated Angular harness and the popup layout: 2,048 unbroken characters, constant popup width, internal scrolling, all four formats after typing and clicking, four unique menu options, empty initial content, and 375px viewport.

Observed editable widths: desktop clientWidth/scrollWidth 648/648px; mobile 271/271px. Editable height remained 149px with scrollHeight 892px and 2220px respectively. Test harness and screenshot are temporary artifacts at /private/tmp/clark-review-browser-check.cjs and /private/tmp/clark-review-verified.png. The harness uses the real component with an isolated popup fixture; the authenticated full application flow has not been automated. Service permission blocker remains unchanged.

This supersedes earlier claims that CSS ch units represent exact character counts. Current wrapping follows the available bounded width; no automatic paragraph insertion or per-character line splitting is performed.

## Prospective typing styles — 2026-09-23

Documentation follow-up (2026-09-23): Added targeted comments for native font-size mapping, dropdown input isolation, shortcut/model synchronization, empty-markup validation, submission-only serialization, service/client limits, preview block boundaries, reset handling, dialog width arithmetic and the intentional word-splitting tradeoff. Existing comments cover selection restoration, toolbar placement, sanitization and preview rendering. No functional behavior changes. PR description uses the user's Summary / Changes / Notes / Screenshots format and explicitly leaves the service-limit update outstanding.

Wrapping follow-up (2026-09-23): User confirmed short first/third lines were automatic. Reproduced with a short word followed by long space-separated tokens: both overflow-wrap:break-word and anywhere with word-break:normal yielded a 13-character first line. Changed only review-area and descendant word-break to break-all; the same fixture now fills 46 characters on the first line. This deliberately permits splitting ordinary words at the edge as well, explained to the user. No content/newline mutations or size changes. Chrome wrapping, toolbar, shortcut and mixed-size checks passed; Angular build and diff check passed.

### Compact rating dialog and reveal — 2026-09-23

- [x] (2026-09-23) Restored the original textarea outer width (372px including its former padding/border) via a bounded 442px dialog, accounting for popup padding and rating margins. Kept responsive width and long-text wrapping.
- [x] (2026-09-23) Replaced max-height unfolding with a 260ms CSS fade/slide on reveal, disabled for reduced motion. Angular build and diff whitespace checks passed. Isolated Chrome checks passed at desktop (370px editable clientWidth and scrollWidth) and mobile (271px), including shortcuts and mixed heading serialization. Visual animation preference still needs user review.

Scope: local rating SCSS and dialog width only. Angular 18 supports ordinary CSS keyframes without a new animation dependency. Original width verified from HEAD:new-rating.component.scss. Existing editor/keyboard behavior stays in place.

Follow-up (2026-09-23): User requested keeping the compact width but restoring the old transition. Restored the 0.6s ease scale/opacity/max-height reveal (500px expanded cap accommodates the rich toolbar) and retained reduced-motion support. Narrowed heading select from 9em minimum to 7em, reduced horizontal toolbar button padding to 10px so the link fits the desktop row. Chrome isolated checks confirm heading/link centers on the same row, wrapping and shortcuts pass; Angular build and diff check pass. This supersedes the fade/slide keyframes above.

Cleanup (2026-09-23): Audited all modified files; all belong to the ratings story. Removed the abandoned shared-editor visual redesign (global toolbar, color, fixed-height and heading overrides) now that review-specific styles live in NewRatingComponent. Retained wrapper reset/output/module functionality needed by responses and the builder, plus host-scoped wrapping. Removed the unused rating-popup class. Existing staged SCSS changes were preserved. Required ratings helpers/tests and this execution record remain; no unrelated config files were modified.

### Keyboard shortcuts follow-up

- [x] (2026-09-23) Added scoped Ctrl/Cmd+B/I/U formatting and Ctrl/Cmd+Z, Shift+Z, Ctrl+Y history handling in NewRatingComponent. Native copy/paste/select-all remain untouched; toolbar/model refresh after commands. Composition and unrelated modifier combinations are ignored.
- [x] (2026-09-23) Chrome isolated component checks passed for both Control and Meta formatting toggles on selected text, undo/redo and focus isolation. Existing mixed-heading, sanitized rendering and desktop/mobile wrapping checks also passed. Angular build and git diff --check passed. Temporary harness: /private/tmp/clark-review-browser-check.cjs. Native browser undo groups adjacent text edits; checks verify removal/restoration of an insertion rather than assuming every key is a separate history entry.

- [x] (2026-09-23) Removed Remove Format from the review toolbar and replaced whole-block formatting with inline typing sizes (Paragraph and Heading 1–3). Text before the caret is preserved and changing sizes adds no line.
- [x] (2026-09-23) Chrome isolated component checks passed for mixed sizes, all four selection labels, unchanged preceding text, sanitized submitted rendering and desktop/mobile wrapping. Nine focused utility tests passed; Angular build passed.

Decision: Keep this adjustment local to NewRatingComponent and use the editor's existing native editing commands for inline sizes and bold. The requested same-line behavior is visual heading styling, rather than semantic heading blocks. Use font size attributes supported by Angular sanitization, without bypassing sanitization. Existing semantic headings remain readable. No API, routing, environment, or shared builder changes are needed.

Observation: Chrome can serialize pending font sizes as style attributes even with styleWithCSS disabled. Added serializeRatingComment in rating-comment.ts to convert supported sizes to font attributes on submission, leaving the live selection alone. Angular sanitized preview was verified at 32px for Heading 1, with preceding/following text at 16px and no extra newline. Dropdown input events must not be treated as typing selection events. Existing Sass deprecations and querystring CommonJS build warning remain; full authenticated submission/backend persistence was not tested.

- [x] 2026-09-21: Moved the existing stateful heading select inside the library toolbar using Renderer2 after view initialization (the library exposes no projection slot). Preserved the Angular-owned control and bindings. Chrome checks confirm toolbar placement, all four formats after typing, and desktop/mobile wrapping; Angular build passed.
