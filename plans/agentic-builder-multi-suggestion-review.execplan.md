# Agentic Builder: Multiple Suggestion Review

## Purpose / Big Picture

Expand “Generate with AI” with explicit selection and review views, single replaceable name suggestions, a description carousel, repeatable outcome generation, and CUID-keyed session storage that is purged when the user leaves the builder.

## Progress

- [x] (2026-10-23) Inspected the panel, navbar host, service response types, store apply path, and existing styles.
- [x] (2026-10-23) Recorded the current API contract: one `name` and one `description` string per build call; outcomes are an array; requests select fields but do not specify a result count.
- [x] (2026-10-23) Confirmed with the user that a name batch uses four separate build calls and a description batch uses three.
- [x] (2026-10-23) Updated panel state for accumulated alternatives, retained navigation state, and independent section loading/errors.
- [x] (2026-10-23) Reworked generation, validation, navigation, application, and review UI for alternative batches.
- [x] (2026-10-23) Added focused tests; attempted automated and interactive flow verification.
- [x] (2026-10-23) Reviewed changes and recorded validation limitations.
- [x] (2026-10-26) Fixed return-to-selection click handling and standalone pill directive imports; changed name generation to one replaceable suggestion per request per user direction.
- [x] (2026-10-26) Inspected builder route lifecycle and confirmed `LearningObject.cuid` is the storage key.
- [x] (2026-10-26) Persisted suggestion and review state in CUID-keyed `sessionStorage`; restore on same-tab reload.
- [x] (2026-10-26) Added cleanup when changing CUID or leaving the builder root; child-page navigation retains state.
- [x] (2026-10-26) Added focused persistence/cleanup specs and recorded test tooling limits.

## Surprises & Discoveries

- `BuilderNavbarComponent` keeps the panel component mounted and hides it with `[hidden]`, so session-only selection and suggestion state can remain in the panel instance.
- The review-to-selection click changed the template before the document click listener evaluated containment, causing the outside-click handler to immediately restore review. Stopping propagation on the navigation control prevents that race.
- `PillComponent` is standalone and uses `*ngIf`; it must import `NgIf` in its own component metadata, regardless of the panel importing the pill.
- `LearningObjectBuilderComponent` owns the `info`, `outcomes`, and `materials` child routes, so it remains alive while moving among builder pages and is destroyed when leaving the builder. This is the appropriate cleanup boundary.
- The endpoint response currently models `name` and `description` as scalars. To avoid requiring an unavailable backend contract, the current plan is to call the existing build endpoint four times for each selected name/description type and aggregate the scalar values. Outcomes continue to use the returned array from a field-scoped request.
- `BuilderStore.applyAgenticSuggestions()` already routes name and description changes through object mutation/save and each accepted outcome through existing create/mutate actions.
- The builder navbar currently maps any falsey service-interaction state, including the store's `null` failure state, to “All changes saved”; this must distinguish save failure from successful completion.

## Decision Log

- Decision (supersedes in-memory-only storage): Persist suggestion candidates, selected types, review location, applied markers, and generation-history flags in `sessionStorage`, keyed by `LearningObject.cuid`.
  Rationale: Suggestions survive refreshes within the tab, stay separated by learning object, and are not durably stored on the backend.
- Decision: Clear the current CUID's entry when the builder root is destroyed or the active CUID changes; do not clear during navigation among builder child pages.
  Rationale: The parent route spans child pages and represents the user's builder session.
- Decision: Always render Name, Description, and Learning Outcomes in review; ungenerated sections show an empty state and a section-level Generate action. Remove page traversal controls.
  Rationale: The user chose direct section generation for types omitted on the initial selection screen.
- Decision: Use four existing field-scoped build calls for each name batch and three for each description batch.
  Rationale: The user specified these counts, and the current API contract returns one scalar for each requested attribute without a count parameter.
- Decision (supersedes the previous name batch decision): Make one build call per name generation and replace the current name suggestion; title alternatives and title batch navigation are removed.
  Rationale: The user clarified that title selection should be discarded in favor of a single suggestion that can be regenerated.
- Decision: Keep outcome generation and decisions item-based, append each returned list, and retain the outcomes section even when no pending items remain.
  Rationale: The current response is already an outcomes array and outcomes can be generated again after review.
- Decision: Validate responses before appending; reject descriptions longer than 1,500 characters rather than silently truncate them.
  Rationale: The user requested response validation and a hard maximum length.
- Decision: Track applied name/description candidate indexes separately from radio/carousel position and clear the applied marker when the stored field later changes.
  Rationale: A prior AI choice should not appear current after a user edits the field.
- Decision: Show an applied marker only after explicit application; do not display “Saved” from the panel. Make the navbar's saved indicator distinguish store save failures from successful persistence.
  Rationale: Existing store methods update local state optimistically, so local application is not proof of persistence.
- Decision: Apply name and description alternatives individually; preserve only an explicit outcome bulk action if the UI already has one.
  Rationale: Mixed alternatives are mutually exclusive and must not be applied together.

## Outcomes & Retrospective

Implemented the multi-suggestion review, explicit apply/save handling, section-level generation, CUID-keyed session storage, and builder-exit cleanup. `npx ng build clark`, focused ESLint, Prettier, and `git diff --check` pass. The focused Jest suites are blocked before test collection by the existing `jest-preset-angular` error `configSet.processWithEsbuild is not a function` (0 tests executed). The full spec TypeScript compile reports unrelated existing errors; it has no diagnostics in the files changed here. A browser runtime is not available for manual interactive verification. No backend changes were needed.

## Context and Orientation

The feature is under `src/app/onion/learning-object-builder/components/agentic-builder-panel/`, mounted persistently by `BuilderNavbarComponent`. The build call returns suggestions directly; no read endpoint exists. A feature-local session service will serialize panel state by `LearningObject.cuid`. `LearningObjectBuilderComponent` owns the builder child routes and will clear the active CUID when the root is destroyed or the object changes. The backend API, guards, environment, and durable save flow remain unchanged.

## Plan of Work

1. Keep the initial selection view and open review after valid generation; always show all three attribute sections in review with independent Generate/Regenerate actions.
2. Keep the existing agreed generation behavior: one request for a name, three requests per description batch, and one outcomes request; append description/outcome candidates and replace the name candidate.
3. Persist candidates, selections, applied markers, generated-history flags, and review state in a versioned session-storage record keyed by CUID; reset transient loading and error state when restoring.
4. Use the panel's learning-object event to load or save by CUID, clear the previous CUID when the active object changes, and purge the active entry when the builder root is destroyed.
5. Keep accepted values on the existing store save path and keep the navbar's save success/failure behavior explicit.

## Concrete Steps

- Keep the scalar service response type and add a small feature-local candidate collection/state model for accumulated batches.
- Update `agentic-builder-panel.component.ts` to append batches, validate response shapes, handle explicit selection/application, track applied alternatives, preserve state on close, and perform count-limited build calls.
- Update panel template and SCSS for explicit selection checkmarks, radio pages, description carousel, persistent section controls, and scrollable body/fixed header-footer.
- Keep accepted values on the existing `BuilderStore.applyAgenticSuggestions()` save path and keep outcome accept/reject behavior intact. Distinguish save failure from completed persistence in the navbar status.
- Add a feature-local session service that safely parses/version-checks session state and stores only serializable candidate/review state. Activate it from the panel's learning-object event using the CUID.
- Clear the old CUID's stored suggestions when switching objects and clear the active CUID when leaving the builder root.
- Add focused panel/service tests using the established Jest patterns; run the affected specs and a build/lint check if supported.

## Validation and Acceptance

- Verify one name request yields one title suggestion and Regenerate replaces it while preserving description/outcome state.
- Verify description carousel navigation, repeat generation, applied markers, and the 1,500-character limit.
- Verify every review section is present, including empty sections with Generate actions, and section generation does not reset other candidates.
- Verify applying a candidate updates only the chosen object attribute through the store.
- Verify outcomes append, can be reviewed individually, and their section remains available for later generation.
- Verify initial selection and close/reopen preserve state, and a same-tab refresh restores the same CUID's suggestions.
- Verify a different CUID restores no previous candidates, leaving the builder purges active state, and moving among info/outcomes/materials retains state.
- Verify the review body scrolls independently, header/footer remain visible, and descriptions stay within 1,500 characters in a consistent responsive region.
- Run focused panel, storage-service, and builder-lifecycle tests for request counts, validation, application, session restore, CUID isolation, and cleanup. Manually verify the builder pages retain state while navigation outside the builder clears it.

## Idempotence and Recovery

Generation only requests suggestions and must not mutate current learning-object values. Applying a selected name/description/outcome uses the existing store flow. Failed generation must leave accumulated suggestions, current selection, and review position intact. Applied markers are cleared if current object fields no longer match their applied candidate. Persisted state is limited to the current tab and is removed when leaving the builder or switching CUIDs.

## Artifacts and Notes

- `src/app/onion/learning-object-builder/components/agentic-builder-panel/agentic-builder-panel.component.ts`
- `src/app/onion/learning-object-builder/components/agentic-builder-panel/agentic-builder-panel.component.html`
- `src/app/onion/learning-object-builder/components/agentic-builder-panel/agentic-builder-panel.component.scss`
- `src/app/onion/learning-object-builder/builder-store.service.ts`
- `src/app/onion/learning-object-builder/components/builder-navbar/builder-navbar.component.ts`
- `src/app/onion/learning-object-builder/components/agentic-builder-panel/agentic-builder-panel.component.spec.ts`
- `src/app/onion/learning-object-builder/components/agentic-builder-panel/agentic-builder-session-storage.service.ts`
- `src/app/onion/learning-object-builder/learning-object-builder.component.ts`
- `plans/agentic-builder-multi-suggestion-review.execplan.md`

## Interfaces and Dependencies

- Existing `AgenticBuilderField`, `LearningObjectBuildRequest`, `LearningObjectService`, `BuilderStore`, and toaster services.
- No new external package, endpoint, or backend response contract is planned; one feature-local session-storage service and a builder-root lifecycle hook are added.
