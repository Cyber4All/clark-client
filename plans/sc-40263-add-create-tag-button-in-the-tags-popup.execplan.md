# Add Create Tag Button in the Tags Popup

## Purpose / Big Picture

Allow an editor to stage a new tag from the learning-object tagging popup without leaving the current workflow. The Create Tag button appears only on the Tags tab, opens a small form, and persists staged tags through the gateway `POST /tags` route only when the outer tagging changes are saved.

## Progress

- [x] 2026-10-12: Located the tagging popup, tag service, route helpers, and local gateway endpoint.
- [x] 2026-10-12: Added the conditional button, modal form, typed service method, and created-tag display behavior.
- [x] 2026-10-12: Refined button spacing and centered the modal title.
- [x] 2026-10-12: Ran the Angular build and Prettier check and reviewed the branch diff.
- [x] 2026-10-12: Committed the isolated feature on the SC-40263 branch.
- [x] 2026-10-12: Added in-progress button text and a success notification after local end-to-end testing confirmed tag persistence.
- [x] 2026-10-12: Removed the redundant post-create tag reload so the modal closes immediately from the successful POST response.
- [x] 2026-10-14: Moved modal cleanup to the start of the successful POST handler so later UI work cannot leave it stuck on Creating.
- [x] 2026-10-14: Replaced the unsupported nested shared popup with a local dialog layer after gateway logs confirmed successful 201 responses were leaving the nested viewer mounted.
- [x] 2026-10-14: Matched the rating-modal closure behavior by refreshing the dynamically projected tagging view after asynchronous create completion.
- [x] 2026-10-14: Applied the returned tag before that refresh so it appears immediately when the Create Tag dialog closes.
- [x] 2026-10-16: Placed newly created tags at the end of the existing ascending list and stopped selecting them automatically.
- [x] 2026-10-16: Deferred tag POST requests until the outer Save action so canceling the tagging popup does not create database records.
- [x] 2026-10-16: Corrected the request shape to satisfy the repository lint rules and reran lint validation.
- [ ] 2026-10-12: Push and PR publication are blocked because SSH rejected the available key and the GitHub CLI token is expired.

## Surprises & Discoveries

- The tagging popup is a standalone component even though most of the application remains NgModule-based.
- Tag selection is staged in `TaggingService`; creating a tag should not attach or select it without a separate user action.
- New tag definitions must remain local to the tagging popup until the user confirms the workflow with the outer Save action.
- The client already points local development requests at the gateway, so this feature needs no environment change.
- The repository uses RxJS 6.5, so the new service method returns an observable instead of relying on the newer `firstValueFrom` helper.
- Waiting for a second tag-list request could leave the creation modal showing its loading state even though the POST had already persisted the tag.
- Post-success state and notification work ran before modal cleanup, so an exception there could leave the successful form visibly stuck.
- `PopupComponent` dynamically appends its viewer to `document.body` and uses a global dummy-input ID, so nesting it inside the existing tagging popup can leave the inner viewer mounted.
- The rating popup flag belongs to `DetailsComponent`, while Create Tag lives in a child projected through a dynamically attached popup view; that child needs an explicit refresh after asynchronous state changes.

## Decision Log

- Keep HTTP access in `TagsService` and URL construction in `tags.routes.ts`.
- Reuse the existing template-driven form and button styles for this small local form.
- Keep the Create Tag dialog in the tagging component's view because the shared popup implementation does not support nested instances.
- Display Create Tag only when the Tags tab is active.
- Use the created tag returned by the POST to update the list immediately, avoiding a redundant request before closing the modal.
- Use temporary IDs for staged tags, then replace them with the POST response IDs before saving selected tag IDs to the learning object.

## Outcomes & Retrospective

The client now supports staging a tag from the Tags tab and persists it only when the outer tagging workflow is saved. Canceling the workflow leaves the database unchanged. The Angular build and Prettier check pass. The branch is committed locally; remote publication requires renewed GitHub authentication.

## Context and Orientation

The learning-object editorial action pad contains `TaggingBuilderComponent`, which switches between learning outcomes, topics, and tags. `TagsService` owns tag API requests, while `TaggingService` owns the popup's available and selected item arrays. This work changes the feature UI and tag API service boundary. It does not change routing, guards, interceptors, shared popup behavior, environment configuration, or backend code.

## Plan of Work

Add a centralized create route and typed service method. Add a Tags-tab-only button and modal form to `TaggingBuilderComponent`. Stage the entered tag in the current ascending list without selecting or persisting it. On outer Save, create all staged tags, replace their temporary IDs, and continue the existing learning-object save flow. Canceling discards the component-local staged records.

## Concrete Steps

1. Add `TAGS_ROUTES.CREATE_TAG()` and `TagsService.createTag()`.
2. Load valid tag types for the form.
3. Add the conditional button and create form.
4. Insert a temporary tag in the existing list order without making a request.
5. Persist staged tags and replace temporary IDs when the outer Save action runs.
6. Run `npm run build` and inspect the diff against `origin/main`.
7. Commit, push the feature branch, and open the PR.

## Validation and Acceptance

- The Create Tag button appears only on the Tags tab.
- The modal requires a name and valid tag type; description remains optional.
- Submitting the inner form stages the tag locally without calling `POST /tags`.
- A staged tag is visible and remains unselected until the user chooses it.
- Outer Save persists staged tags; outer Cancel does not create database records.
- A failed request leaves the modal open and shows an error.
- The Angular production build succeeds.

## Idempotence and Recovery

Opening and closing the inner modal resets its local fields. Canceling the outer tagging popup destroys its staged tag definitions without persisting them. A failed Save leaves staged tags available for another attempt. Creating the same tag more than once may be governed by backend validation; this client does not attempt database cleanup. The feature can be reverted by reverting its single commit.

## Artifacts and Notes

- `src/app/core/learning-object-module/tags/tags.routes.ts`
- `src/app/core/learning-object-module/tags/tags.service.ts`
- `src/app/cube/details/components/action-panel/editorial-action-pad/services/tagging.service.ts`
- `src/app/cube/details/components/action-panel/editorial-action-pad/tagging-builder/tagging-builder.component.ts`
- `src/app/cube/details/components/action-panel/editorial-action-pad/tagging-builder/tagging-builder.component.html`
- `src/app/cube/details/components/action-panel/editorial-action-pad/tagging-builder/tagging-builder.component.scss`

## Interfaces and Dependencies

- Gateway endpoint: authenticated `POST /tags`
- Request: `{ name: string; type: TagType; description?: string }`
- Response: `Tag`
- Existing `PopupComponent`, `FormsModule`, `TagsService`, and `TaggingService`
