# Builder Outcome ID Race

## Purpose / Big Picture

Prevent the learning object builder from PATCHing a new learning outcome with its temporary UUID. New outcomes use a local UUID before creation, while the API requires a MongoDB ObjectId for updates. Edits made during the POST create request must be held until the response supplies the persisted ID.

## Progress

- [x] (2026-10-26) Read `PLANS.md` and traced outcome creation, mutation, persistence, and the PATCH route.
- [x] Add per-outcome create-in-flight coordination and flush any latest edits after create succeeds.
- [x] Preserve caller data and use the persisted outcome ID in the PATCH URL.
- [x] Run focused static validation and inspect the final diff.
- [x] (2026-10-27) Route agentic suggestion acceptance through the shared in-flight outcome creation tracker.
- [x] (2026-10-27) Correct outcome edit coalescing to merge from the outcome cache rather than the learning-object cache.
- [x] (2026-10-27) Read the backend route handler and DTO: POST returns `{ id }`; PATCH validates `req.params.outcomeId`, not a body ID.
- [x] (2026-10-27) Four focused tests passed: stored service-ID resolution, PATCH URL/body contract, immutable caller data, and invalid-ID blocking.

## Surprises & Discoveries

- `BuilderStore.createOutcome()` assigns a UUID and marks the entry in `newOutcomes`.
- `saveOutcome()` selects create versus update from `newOutcomes`, while `updateLearningOutcome()` only replaces the UUID when `serviceId` is present.
- `UpdateLearningOutcomeDto` assigns `outcomeId` from `req.params.outcomeId` and applies `IsMongoId`. The earlier assumption that the body required `id` was incorrect.
- The reported UUID PATCH proves that an update reached `OutcomeService` without the MongoDB ID; it does not alone distinguish a missing/incorrect create response ID from an ordering issue.
- Agentic suggestion acceptance had a separate direct POST path, bypassing the in-flight tracker used by normal outcome edits. An edit from the outcome page during that POST could race creation and send an update before the persisted ID was available.

## Decision Log

- Decision: Keep the builder's temporary UUID as the stable local map key, and use `serviceId` only for API addressing.
  Rationale: Existing editor components refer to outcomes by the local map key.
- Decision: While an outcome create is pending, prevent duplicate POSTs. After successful creation, compare the latest local data with the submitted create data and PATCH any edits made during the request using the returned database ID.
  Rationale: This preserves in-flight user edits without sending an update against a temporary identity.
- Decision: Use the persisted outcome ID in the PATCH URL, omit the editor ID from the body, and reject invalid IDs before HTTP.
  Rationale: This matches the inspected backend DTO. Resolve missing `serviceId` from the stored outcome before constructing an update.
- Decision: Route agentic suggestion creation through the same per-outcome creation tracker and keep the local UUID as the editor key.
  Rationale: Edits made while its POST is pending can then be flushed with the persisted database ID, consistent with regular builder outcomes.

## Outcomes & Retrospective

The builder shares outcome create tracking and resolves the persisted service ID from the incoming edit or stored outcome. PATCH requests use the persisted MongoDB ID in the URL, preserve caller data, and reject UUIDs or missing IDs before HTTP. Four focused regression tests passed. Live browser/API behavior has not been exercised.

## Context and Orientation

This is a contained service/store change in the NgModule-based Angular client. `BuilderStore` owns local outcome records and debounced writes; `OutcomeService` owns HTTP requests. No routes, guards, shared UI, environment behavior, or backend contracts need to change. Outcome types remain as they are.

Current flow: the outcome page creates a local record, mutates it through `BuilderStore`, the store POSTs complete outcomes, and later edits PATCH `/learning-outcomes/:id`. The API response ID is stored as `serviceId`; `id` remains the local UUID used by UI components. Agentic suggestions use the same local create and persistence lifecycle so page edits cannot race their initial POST.

## Plan of Work

1. Track pending create requests keyed by local UUID in `BuilderStore`.
2. Ensure repeated debounced writes during creation do not issue multiple POSTs.
3. On create success, store the returned database ID, clear local-new state, and PATCH the latest record if it changed after the POST payload was captured.
4. Reject invalid IDs in `OutcomeService.saveOutcome()` before sending HTTP and preserve the passed object.
5. Ensure agentic suggestion acceptance uses the per-outcome creation tracker, then verify the returned `serviceId` before reporting success.
6. Merge coalesced outcome edits from `outcomeCache$`, not the separate learning-object cache.
7. Review errors, retry behavior, and ensure the existing `serviceInteraction$` state resolves on both success and failure.

## Concrete Steps

- Edit `src/app/onion/learning-object-builder/builder-store.service.ts` for create coordination and post-create edit flushing.
- Update the agentic builder path in `src/app/onion/learning-object-builder/builder-store.service.ts` to share create coordination; `OutcomePageComponent` continues to edit through the existing store API.
- Edit `src/app/core/learning-object-module/outcomes/outcome.service.ts` for ID validation and non-mutating request construction.
- Format the touched files and run applicable non-test static validation/build. Earlier changes passed Prettier, ESLint, `git diff --check`, and `npx ng build clark`; validation of the 2026-10-27 follow-up remains outstanding.

## Validation and Acceptance

- A new outcome produces one POST while creation is pending, even if multiple edits are saved during the request.
- When those edits differ from the create payload, a PATCH is sent only after POST succeeds and its URL uses the returned MongoDB ID.
- If POST fails, no PATCH follows and builder state reports the existing create error path.
- PATCH requests use the persisted MongoDB ID in the route. The body contains the editable fields, matching the backend DTO.
- The PATCH service does not mutate the caller's object.
- Run formatting, lint on touched files if supported, `git diff --check`, and Angular build. Automated tests are not run unless requested.

Follow-up regression command (four tests passed):

    node node_modules/jest/bin/jest.js --runInBand --no-cache --modulePaths ./src --transform '{"^.+\\.(ts|js|html)$":"jest-preset-angular"}' --runTestsByPath src/app/core/learning-object-module/outcomes/outcome.service.spec.ts src/app/onion/learning-object-builder/builder-store.service.spec.ts

The default Jest command failed before tests ran because its mixed transformers produced `configSet.processWithEsbuild is not a function`. The explicit Angular transformer and source module path resolve the test invocation without changing repository-wide configuration. No backend files were changed.

## Idempotence and Recovery

The pending-create map is in-memory and scoped to the builder store lifetime. A failed create remains governed by existing service error handling and does not issue a PATCH. If implementation is interrupted, the plan can be resumed from the unchecked steps without modifying API contracts.

## Artifacts and Notes

- `src/app/onion/learning-object-builder/builder-store.service.ts`
- `src/app/core/learning-object-module/outcomes/outcome.service.ts`
- This ExecPlan

## Interfaces and Dependencies

- Existing `OutcomeService.addLearningOutcome()` response is expected to contain `id`, consistent with current callers.
- Existing `serviceId` property remains the API-facing persisted ID; no shared model changes are planned.
- The app currently has legacy Promise/`toPromise()` service patterns; this change stays within those patterns.
