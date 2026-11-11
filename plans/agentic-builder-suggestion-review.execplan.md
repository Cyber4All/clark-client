# Agentic Builder Suggestion Review

## Purpose / Big Picture

Update the learning-object builder’s agentic generation flow for the new backend response contract. The build request now returns field-keyed suggestions instead of an empty success response. The frontend will keep the current learning object unchanged while showing an overlay review panel where users can inspect current-versus-suggested values, accept or reject individual fields, select individual learning outcomes, and apply only accepted changes.

## Progress

- [x] (2026-10-09) Traced the agentic request, existing panel, builder store mutation actions, learning-object model, and outcome model.
- [x] (2026-10-09) Confirmed the current panel ignores the build response and refetches immediately after a successful request.
- [x] (2026-10-09) Added typed suggestion response models and returned the backend response from the service.
- [x] (2026-10-09) Added review-state and apply/reject behavior to the agentic panel.
- [x] (2026-10-09) Restyled the existing panel as a quiet overlay review sidebar without AI-branded visual treatment.
- [x] (2026-10-09) Ran targeted ESLint, Prettier, `git diff --check`, and application TypeScript no-emit validation.
- [ ] Add focused component/service tests if the repository test harness is repaired; current Jest setup fails before tests with `configSet.processWithEsbuild is not a function`.
- [x] (2026-10-12) Refined the review drawer with responsive sizing, sticky header/footer, collapsible sections, explicit per-suggestion statuses, progress counts, and accepted-only footer actions.
- [x] (2026-10-12) Ran repository lint and production build validation; both completed successfully with existing lint warnings and the repository's Node 25 warning.
- [x] (2026-10-12) Investigated diff and Angular Material availability; selected the lightweight `diff` package and existing native collapsible pattern instead of adding a new drawer framework.
- [x] (2026-10-12) Evaluated the library-backed diff iteration and removed it per the updated content-first UX direction, including its direct dependencies and reusable component.
- [x] (2026-10-12) Simplified the 850px review drawer to show generated field content with optional current-value disclosure and a lightweight outcome list.
- [x] (2026-10-12) Added outside-click/Escape dismissal with the existing discard confirmation path and validated build, formatting, and diff cleanliness.
- [x] (2026-10-12) Refactored review decisions to immediate application/removal, replaced staged footer actions with Close and Accept all, and removed collapsible/current-value UI.

## Surprises & Discoveries

- `AgenticBuilderPanelComponent` is already a standalone overlay attached by `BuilderNavbarComponent`.
- `LearningObjectService.buildLearningObject()` currently returns `Promise<unknown>`, while the panel treats success as a 204 and then calls `store.fetch()`.
- `BuilderStore` already exposes `MUTATE_OBJECT`, `CREATE_OUTCOME`, and `MUTATE_OUTCOME` actions, but it does not yet have a batch suggestion-apply action.
- Learning outcomes are held in a `Map<string, Partial<LearningOutcome>>`; generated suggestions do not necessarily have IDs, so accepted new outcomes need temporary client IDs through the existing create-outcome path or a dedicated store method.
- This work touches the agentic service/UI/store boundary, but not routes, guards, interceptors, environments, or the general builder navigation structure.

## Decision Log

- Decision: Keep suggestions local until the user applies them.
  Rationale: A suggestion response must not silently overwrite user-authored content, and rejection should require no server request.
  Date/Author: 2026-10-09 / Codex
- Decision: Reuse the existing agentic panel as the review overlay rather than add a second global drawer system.
  Rationale: The current panel is already mounted in the builder navbar and can be expanded into a review sidebar without changing routes or shell ownership.
  Date/Author: 2026-10-09 / Codex
- Decision: Use explicit current/suggested blocks and per-item Accept/Reject controls instead of introducing a rich text diff dependency.
  Rationale: The response contains structured field values and outcomes; clear side-by-side/stacked values provide the needed diff without adding a new dependency.
  Date/Author: 2026-10-09 / Codex
- Decision: Prefer generated-content review with optional current-value disclosure over inline diff rendering.
  Rationale: The latest UX direction prioritizes evaluating the AI suggestion directly and removes the cognitive/visual overhead of word-level comparisons.
  Date/Author: 2026-10-12 / Codex
- Decision: Apply accepted suggestions immediately through `BuilderStore.applyAgenticSuggestions` and remove them from local queue state.
  Rationale: This matches the requested inline workflow while reusing the established persistence path for fields and appended outcomes.
  Date/Author: 2026-10-12 / Codex

## Outcomes & Retrospective

The frontend now preserves the learning object until explicit apply, supports per-field and per-outcome review, and uses the existing builder save/validation paths. The review drawer is responsive and content-author focused, with generated-content previews, optional current-value disclosure, compact outcome review, explicit progress, and accepted counts. Jest coverage remains a follow-up because the repository's current Jest transformer fails before executing tests.

## Context and Orientation

`src/app/onion/learning-object-builder/components/agentic-builder-panel/` contains the current generation UI. `BuilderNavbarComponent` mounts it as a fixed panel and controls its visibility. The panel calls `LearningObjectService.buildLearningObject()` from `src/app/core/learning-object-module/learning-object/learning-object.service.ts`, using the `BUILD_LEARNING_OBJECT` route. `BuilderStore` owns the active `LearningObject` and its outcome map, and its existing `execute()` actions route field and outcome edits through validation and persistence.

The backend response is field-keyed, for example `{ name, description, learningOutcomes }`. The frontend must tolerate omitted fields and normalize learning outcomes for display. Existing values are read from `store.learningObject` and `store.outcomes`; accepted values are committed through store methods so normal validation and save indicators remain active.

This is cross-cutting across one feature’s service, store, and overlay UI. It changes a service response type and state ownership for pending suggestions. It does not change routing, guards/interceptors, environments/build configuration, or unrelated builder pages.

## Plan of Work

1. Define a typed suggestion response with optional `name`, `description`, and `learningOutcomes` fields and update the HTTP service to return it.
2. Add a small store API for applying accepted name/description/outcome suggestions using existing mutation logic and temporary outcome IDs where needed.
3. Expand the agentic panel into two states: generation selection/loading and suggestion review. Preserve the current close behavior while allowing the user to reject all or apply selected changes.
4. Add structured current/suggested presentation and concise status controls; keep the overlay visually consistent with existing builder surfaces.
5. Add focused tests for response typing/normalization and accept/reject state, then validate lint and TypeScript compilation.

## Concrete Steps

- Add feature-local types under the agentic builder panel or learning-object service boundary; avoid `unknown`/`any` for the new response.
- Change `buildLearningObject()` to `Promise<AgenticBuilderSuggestions>`.
- Remove the automatic post-generation refetch and success-close behavior.
- Track pending suggestions and per-suggestion status (`pending`, `accepted`, `rejected`) in the panel.
- Render current and suggested values for name and description; render each suggested outcome with Bloom, verb, and text plus independent selection.
- Apply selected fields/outcomes only when the user confirms; close the panel after successful application and leave rejected/current values untouched.
- Keep backend/API persistence inside the service/store layer; the component remains responsible for presentation and interaction only.

## Validation and Acceptance

- Service test proves the build request exposes the JSON response rather than treating it as 204-only success.
- Panel tests prove suggestions remain pending after generation, reject leaves the current value unchanged, accept applies only the selected field, and outcome selection is independent.
- TypeScript compilation and targeted ESLint pass for touched files.
- Manual validation: generate name, description, and outcomes; confirm the overlay opens; compare current and suggested values; reject one item; accept another; apply selected changes; verify only accepted content updates and saves through the existing builder flow.
- Record any Jest harness failure separately if the existing `jest-preset-angular` configuration prevents execution.

## Idempotence and Recovery

Generating suggestions does not mutate the learning object. Closing or rejecting the overlay discards local suggestion state. Applying is explicit and uses existing debounced saves; if applying fails, the existing builder error handling remains responsible for reporting it. No route or remote data is changed until the user confirms application.

## Artifacts and Notes

- Agentic panel: `src/app/onion/learning-object-builder/components/agentic-builder-panel/`
- Service: `src/app/core/learning-object-module/learning-object/learning-object.service.ts`
- Store: `src/app/onion/learning-object-builder/builder-store.service.ts`
- Existing panel mounting point: `src/app/onion/learning-object-builder/components/builder-navbar/`

## Interfaces and Dependencies

- Angular standalone components and existing `ActivateDirective`.
- `LearningObjectService` and `LEARNING_OBJECT_ROUTES.BUILD_LEARNING_OBJECT`.
- `BuilderStore`, `LearningObject`, and `LearningOutcome` models.
- Existing toaster and builder validation/save indicators.
- No new external UI or diff dependency planned.
