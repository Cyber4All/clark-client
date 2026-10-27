# Keep and Regenerate Agentic Builder Suggestions

## Purpose / Big Picture

Keep generated suggestions available when the Agentic Builder panel closes, and let users regenerate the title/name, description, or outcomes directly from review. The user can reopen the panel during the current builder session to continue reviewing pending suggestions.

## Progress

- [x] (2026-10-22) Inspected the agentic panel, builder navbar host, build request contract, and repository planning guidance.
- [x] (2026-10-22) Changed panel dismissal to retain the in-memory review queue.
- [x] (2026-10-22) Added single-field build requests and per-attribute regeneration controls with replacement/error handling.
- [x] (2026-10-22) Reviewed the final diff and ran `git diff --check`.

## Surprises & Discoveries

- `BuilderNavbarComponent` keeps the agentic panel mounted and toggles its visibility with `[hidden]`; component state naturally lasts across closing and builder page navigation.
- The build service already accepts a typed request containing `fields` and returns typed optional fields (`name`, `description`, and `learningOutcomes`). No service/API contract change is needed.
- The review UI currently removes accepted and rejected items from its local suggestion response. Closing currently calls `resetReview()`, which discards the rest of the queue.

## Decision Log

- Decision: Keep pending suggestions in the panel's existing in-memory state for the builder session.
  Rationale: The panel remains mounted while closed; no store or persistence layer is needed.
- Decision: Regenerate only the requested field, retaining its current pending suggestion if the request fails or omits a replacement.
  Rationale: This avoids losing reviewable content when generation cannot produce a replacement.
- Decision: Regenerate outcomes as one attribute and replace the pending outcomes list as a group.
  Rationale: The backend request is field-keyed and outcomes are an array; accepted outcomes have already been removed and must not be reverted.

## Outcomes & Retrospective

Closing the panel now only hides it, leaving suggestions available on reopen. Regeneration is field-scoped, preserves the prior pending suggestion if the response omits that field or the request fails, and replaces only the requested pending field when a replacement is returned. Outcomes regenerate as a list; accepted outcomes remain applied and are not restored into the pending list.

## Context and Orientation

The feature is under `src/app/onion/learning-object-builder`. `BuilderNavbarComponent` owns the open/closed visibility flag and mounts `AgenticBuilderPanelComponent` persistently. The panel calls `LearningObjectService.buildLearningObject(learningObjectId, { fields })`; the service and `LearningObjectBuildRequest` already provide the needed typed API. Accepted changes continue through `BuilderStore.applyAgenticSuggestions`, while rejected suggestions are removed locally. This is a feature-local UI/service interaction change: no routing, guards, interceptors, shared UI, types, environment, or build configuration changes are expected.

## Plan of Work

1. Stop clearing review state from ordinary close and dismissal paths; preserve existing explicit completion/reset behavior after Accept all.
2. Add a regeneration method that requests exactly one `AgenticBuilderField`, validates the response field, and replaces only that field's pending suggestion. On errors or omitted response fields, retain the existing suggestion and report failure where applicable.
3. Add Regenerate controls beside Accept/Reject for name/title and description, and at the outcomes section level. Disable all review actions while a request is active and show regeneration progress.
4. Inspect the final diff for request scoping, action propagation, and queue preservation.

## Concrete Steps

- Edit `agentic-builder-panel.component.ts` to preserve close state and implement typed per-field regeneration using the existing service and generation indicator.
- Edit `agentic-builder-panel.component.html` to place accessible Regenerate buttons in the name, description, and outcomes review controls.
- Do not change the service endpoint, response types, persistence semantics, or accepted/rejected behavior.

## Validation and Acceptance

- Verify by code inspection that closing via the close button, outside click, or Escape retains `reviewing` and `suggestions`, while Accept all still clears completed review state.
- Verify each Regenerate action sends exactly one field and updates only that pending field; outcomes replace the pending list without restoring already accepted outcomes.
- Verify request failure and omitted response values do not erase the existing suggestion, and concurrent review actions are disabled during generation.
- `git diff --check` passes. Automated tests and builds were not run; the applicable session instruction prohibits adding or running tests unless requested, and this change did not require a build to complete the requested implementation.

## Idempotence and Recovery

Regeneration only requests suggestions and does not mutate the learning object. Closing the panel keeps local pending data. Accept/reject semantics remain as-is, and accepted changes continue through the existing builder store save path. A reload or leaving the builder ends this in-memory session and clears suggestions.

## Artifacts and Notes

- `src/app/onion/learning-object-builder/components/agentic-builder-panel/agentic-builder-panel.component.ts`
- `src/app/onion/learning-object-builder/components/agentic-builder-panel/agentic-builder-panel.component.html`
- `src/app/onion/learning-object-builder/components/builder-navbar/builder-navbar.component.ts` (inspection only; expected no change)

## Interfaces and Dependencies

- Existing `AgenticBuilderField`, `LearningObjectBuildRequest`, and `AgenticBuilderSuggestions` types.
- Existing `LearningObjectService.buildLearningObject()` API and `BuilderStore.setAgenticGeneration/clearAgenticGeneration()` progress signaling.
- No new dependencies or public service interfaces.
