# SC-38807 Integrate Organization User Migration API in Admin Client

## Purpose / Big Picture

Wire the existing Admin Organizations migration UX to the new backend organization-user migration endpoint so an admin can move all users from one source organization to a verified target organization through a single supported client action.

This is not a greenfield feature. The admin organizations page already contains:

- a migration action in the table UI that is intentionally disabled
- a dedicated `clark-organization-migrate-modal`
- component orchestration for opening and closing the modal
- placeholder migration handling that currently shows a "not supported yet" toast

The story is localized to the admin organizations feature, but it crosses UI, service/API, typing, and validation layers:

- `src/app/admin/pages/organizations/organizations.component.ts`
- `src/app/admin/pages/organizations/organizations.component.html`
- `src/app/admin/pages/organizations/organization-migrate-modal/organization-migrate-modal.component.ts`
- `src/app/admin/pages/organizations/organization-migrate-modal/organization-migrate-modal.component.html`
- `src/app/core/organization-module/organization.service.ts`
- `src/app/core/organization-module/organization.types.ts`
- `src/app/core/organization-module/organization.schemas.ts`
- focused specs around the organization service and organizations admin page

This story should move the touched code toward the repo’s target standards without broad cleanup:

- keep API calls in `OrganizationService`
- keep the page component responsible for view orchestration and toast messaging
- preserve the existing Admin route and guard behavior
- avoid rewriting the modal or the organizations page architecture beyond what the migration flow needs

## Progress

- [x] (2026-04-17 00:00Z) Reviewed `AGENTS.md` and `PLANS.md` and confirmed SC-38807 requires a story-specific ExecPlan before implementation.
- [x] (2026-04-17 00:00Z) Inspected the current organizations admin page, migration modal, and `OrganizationService` to identify the real client integration points.
- [x] (2026-04-17 00:00Z) Confirmed the UI already contains a disabled migration action and a placeholder `onMigrateUsers(...)` flow in `src/app/admin/pages/organizations/organizations.component.ts`.
- [x] (2026-04-17 00:00Z) Created this ExecPlan file to guide the implementation.
- [x] (2026-04-17 00:26Z) Added the migration request contract to `src/app/core/organization-module/organization.types.ts`.
- [x] (2026-04-17 00:26Z) Implemented `OrganizationService.migrateOrganizationUsers(...)` for `POST /organizations/:organizationId/migrate`, treating HTTP `204 No Content` as success.
- [x] (2026-04-17 00:26Z) Enabled desktop and mobile migration actions in `src/app/admin/pages/organizations/organizations.component.html`.
- [x] (2026-04-17 00:26Z) Replaced the placeholder organizations-page migration flow with the real API call, loading state handling, success toast, error toast, and count/cache refresh behavior.
- [x] (2026-04-17 00:26Z) Replaced the stale organizations-page spec with focused migration-flow tests and extended the organization service spec for the `204` migration path.
- [x] (2026-04-17 00:29Z) Ran focused lint successfully on touched files, confirmed Jest is still blocked by the repo’s existing `configSet.processWithEsbuild is not a function` setup issue, and confirmed the touched specs no longer add TypeScript errors within the repo-wide spec compile.

## Surprises & Discoveries

- The organizations admin page is already prepared for this feature: `openMigrateModal(...)`, `closeMigrateModal()`, `getAvailableTargetOrganizations()`, and the modal component are all in place.
- The current migration action is disabled in both desktop and mobile actions, and the page exposes a tooltip that explicitly says migration is not yet supported by the API.
- `onMigrateUsers(...)` currently performs only client-side target lookup and then shows a warning toast. That method is the natural integration point for the new API call.
- `OrganizationService` already uses a typed-plus-zod pattern for organization endpoints, so the safest implementation is to extend that service with new request/response types and schemas rather than adding ad hoc HTTP in the component.
- The migration modal already filters candidate targets to verified organizations in the client by calling `getAvailableTargetOrganizations()`. That is helpful UX, but backend validation must still be treated as authoritative.
- `src/app/admin/pages/organizations/organizations.component.spec.ts` appears stale and does not match the current component shape. Implementation should expect to repair or replace that spec rather than simply add one small test to it.
- The organizations page still contains at least one legacy `toPromise()` use for unrelated logic. This story should not broaden into a general RxJS modernization unless a touched path requires it.

## Decision Log

- Decision: Keep the migration API integration inside `OrganizationService` and call it from `OrganizationsComponent`.
  Rationale: This preserves the repo’s service boundary expectations and avoids adding direct `HttpClient` usage to the admin page component.
  Date/Author: 2026-04-17 / Codex

- Decision: Reuse the existing `OrganizationMigrateModalComponent` and its two-step confirmation flow rather than redesign the migration UX.
  Rationale: The modal already encodes the source org, target selection, and explicit confirmation behavior the story needs.
  Date/Author: 2026-04-17 / Codex

- Decision: Treat the backend migration endpoint as the source of truth for validation errors even though the client filters target organizations to verified orgs.
  Rationale: Client filtering improves UX, but same-org, missing-org, and verification errors must still be surfaced correctly from the server response.
  Date/Author: 2026-04-17 / Codex

- Decision: Keep this story scoped to migration integration and post-action refresh, not a broader organizations-page cleanup.
  Rationale: The page contains unrelated technical debt and stale tests, but the safest delivery path is a narrow integration with focused repair where testing requires it.
  Date/Author: 2026-04-17 / Codex

## Outcomes & Retrospective

This section will be completed after implementation. It should capture:

- the existing migration UX was sufficient without a redesign; the main work was enabling the existing modal and wiring it to the backend API contract.
- the organizations page stayed within its current architecture, with migration orchestration remaining in `OrganizationsComponent` and HTTP access staying in `OrganizationService`.
- user-count cache invalidation was necessary on success because the migration changes counts rather than organization records; without that, a successful `204` would have left stale visible counts in the table.
- the organizations-page spec had to be replaced because it targeted an older component shape. Focused migration tests are now in place, but repo-wide Jest execution is still blocked by the existing `jest-preset-angular`/esbuild incompatibility.
- broader cleanup of organizations-page technical debt, legacy `toPromise()` usage, and general spec-tooling drift remains out of scope for this story.

## Context and Orientation

`clark-client` is a lazy-loaded Angular SPA that remains primarily NgModule-based. The organizations admin experience lives under `src/app/admin/pages/organizations` and is gated by the existing admin route and `AdminGuard` in `src/app/admin/admin.routing.ts` and `src/app/core/client-module/admin.guard.ts`.

Current relevant flow:

1. An admin navigates to `/admin/organizations`.
2. `OrganizationsComponent` loads paginated organization data through `OrganizationService.searchOrganizationsResponse(...)`.
3. The organizations table renders action buttons for each row.
4. A migration modal component already exists and can be opened with a selected source organization.
5. The modal allows the user to search verified target organizations, select one, and confirm the migration.
6. The current implementation stops at a placeholder toast because the client does not yet call a backend migration endpoint.

Relevant files and responsibilities:

- `src/app/admin/pages/organizations/organizations.component.ts`
  Owns organizations-page state, row actions, modal visibility, toast messages, and reload/count refresh behavior.
- `src/app/admin/pages/organizations/organizations.component.html`
  Renders desktop and mobile table actions and hosts the migration modal.
- `src/app/admin/pages/organizations/organization-migrate-modal/organization-migrate-modal.component.ts`
  Owns target selection, confirmation checkbox state, and emits the target organization ID.
- `src/app/admin/pages/organizations/organization-migrate-modal/organization-migrate-modal.component.html`
  Renders the stepper-driven migration UI and loading indicator.
- `src/app/core/organization-module/organization.service.ts`
  Central service for organization HTTP operations, path construction, and zod-backed response validation.
- `src/app/core/organization-module/organization.types.ts`
  Shared request and response interfaces for organization APIs.
- `src/app/core/organization-module/organization.schemas.ts`
  Runtime schemas for organization API payload validation.

Architectural impact for this story:

- Routing: no expected route-path changes
- Guards/interceptors: no expected new guard logic, but the endpoint remains admin-restricted server-side
- Shared UI: no shared-component contract change outside the existing migration modal
- Service/API boundary: yes, `OrganizationService` gains a new migration method
- State ownership: remains in `OrganizationsComponent`
- Types/interfaces: yes, new migration request/response types will likely be added
- Build/environment: no expected change

## Plan of Work

1. Define the client-side migration contract in the organization domain layer.
2. Add the new migration API method to `OrganizationService` using the repo’s existing typed/zod pattern.
3. Enable the organizations-page migration actions in both desktop and mobile table UIs.
4. Replace the placeholder migration toast path with a real async flow that:
   - sets `isMigrating`
   - calls the service with source and target org IDs
   - handles success and failure messaging
   - refreshes organizations and any visible counts after success
5. Update the modal or parent orchestration only as needed so the loading state and close behavior remain correct.
6. Add or repair focused tests for the new service method and organizations-page behavior.

## Concrete Steps

1. Extend organization domain types
   - Add a request type that clearly models the target organization ID sent in the POST body.
   - Add a response type only if the backend returns a structured payload that the client needs.
   - Keep naming aligned with the backend story language while staying idiomatic for the Angular client.

2. Extend organization schemas
   - Add zod schema support for the migration response if the response body is structured and used by the client.
   - If the endpoint returns no meaningful body, document that and avoid unnecessary schema churn.

3. Implement the service API call
   - Add a private path helper for `POST /organizations/:organizationId/migrate` or a similarly scoped helper.
   - Implement a typed `migrateOrganizationUsers(sourceOrganizationId, request)` method in `OrganizationService`.
   - Treat HTTP `204 No Content` as the success case and avoid requiring a response body for successful completion.
   - Preserve existing `HttpClient` conventions, including credentials behavior if required by the surrounding service patterns.

4. Enable the admin UI actions
   - Remove the disabled migration button state and "not supported" tooltip in the organizations table.
   - Do the same for the mobile action menu.
   - Keep delete actions untouched because that API is still unsupported.

5. Replace placeholder page orchestration
   - Update `onMigrateUsers(targetOrgId: string)` in `OrganizationsComponent` to call the new service method.
   - Guard against missing `selectedOrganization` and missing client-side target lookup as the current code already does.
   - Set `isMigrating` before the request and clear it in both success and error paths.
   - On success:
     - treat a completed `204` response as the success signal
     - show a success toast
     - close the modal
     - clear or refresh any cached organization data as needed
     - reload organizations so counts and filters reflect the new data
   - On error:
     - keep the modal open unless the UX clearly calls for closing it
     - show a user-facing error toast based on the backend failure, preferring backend-provided error messaging when available and falling back to a safe generic message when not
     - ensure the loading state resets cleanly

6. Check modal integration details
   - Confirm the modal’s `isMigrating` input disables selection and confirmation paths correctly during the request.
   - Adjust copy only if needed to better reflect the now-live backend action.
   - Avoid a redesign of the stepper or target-search UX in this story.

7. Add or repair tests
   - Extend `src/app/core/organization-module/organization.service.spec.ts` to prove the new POST path, request body, and parsing behavior.
   - Inspect `src/app/admin/pages/organizations/organizations.component.spec.ts` and either:
     - repair it enough to support targeted migration-flow tests, or
     - replace its stale assumptions with focused tests around the actual current component behavior
   - Add coverage for:
     - migration action enabled state
     - successful migration flow
     - missing target lookup guard
     - failed migration flow resetting loading state and surfacing an error

## Validation and Acceptance

Acceptance criteria this client story should prove:

- Admin users can trigger migration from the current organizations admin page.
- The client calls `POST /organizations/:sourceOrganizationId/migrate` with the selected target organization ID in the request body.
- The source org ID comes from the currently selected organization on the admin page.
- The target org ID comes from the modal selection.
- The UI shows an in-flight migration state and prevents duplicate confirmation while the request is pending.
- On HTTP `204 No Content`, the UI confirms the migration and refreshes organizations/counts so the page reflects the backend result.
- On backend validation or rollback failure, the UI surfaces an error message through the toaster or equivalent user-visible feedback and does not leave the page stuck in a loading state.

Automated validation:

- updated `src/app/core/organization-module/organization.service.spec.ts`
- updated or repaired `src/app/admin/pages/organizations/organizations.component.spec.ts`
- focused verification that a `204` response is treated as success and that error responses surface user-visible messaging
- targeted lint or test command(s) supported by the touched area after inspecting current repo tooling

Manual validation:

1. Open `/admin/organizations` as an admin-capable user.
2. Confirm the migration action is enabled in desktop and mobile row actions.
3. Open the migration modal for a source organization with users.
4. Search/select a verified target organization and confirm the request is sent to the new endpoint.
5. Verify the loading bar appears during the request and duplicate migration submission is blocked.
6. Verify success closes the modal, shows a success toast, and refreshes the table/counts.
7. Verify a server-side error leaves the modal usable, clears the loading state, and shows an error toast.
8. Verify the same-org path is not normally selectable in the UI and that a forced backend same-org error still surfaces correctly.

## Idempotence and Recovery

If work pauses midway:

- start by reading this ExecPlan and then inspecting the diff in:
  - `src/app/core/organization-module/organization.service.ts`
  - `src/app/core/organization-module/organization.types.ts`
  - `src/app/core/organization-module/organization.schemas.ts`
  - `src/app/admin/pages/organizations/organizations.component.ts`
  - `src/app/admin/pages/organizations/organizations.component.html`
- verify the desktop and mobile migration actions are in the same enabled/disabled state
- verify `isMigrating` always resets on both success and error paths before making more UI changes
- rerun the focused service spec first, then the organizations-page spec, because stale tests in this area may need repair before they give useful signal

If the change must be backed out safely:

- disable the migration action again in the template
- remove or stop calling the new service method from `OrganizationsComponent`
- keep the domain types and service method changes together so the service layer does not expose an unused partial contract

## Artifacts and Notes

- Story ID: `38807`
- Shortcut story title: `Integrate Organization User Migration API in Admin Client`
- Backend dependency:
  - new admin-only endpoint at `POST /organizations/:organizationId/migrate`
  - request path param is the source organization ID
  - request body `organizationId` is the target organization ID
- Existing client assets already in place:
  - `clark-organization-migrate-modal`
  - `openMigrateModal(...)`
  - `getAvailableTargetOrganizations()`
  - `isMigrating` state on `OrganizationsComponent`

Technical debt intentionally left in place unless implementation proves otherwise:

- the organizations page remains a large component that owns filtering, counts, modal state, and API orchestration
- the stale organizations-page spec may need repair, but this story should not become a broad test-suite rewrite
- unrelated legacy `toPromise()` usage in this page stays out of scope

## Interfaces and Dependencies

Primary frontend interface changes expected:

- `src/app/core/organization-module/organization.types.ts`
  - add migration request type
  - optionally add migration response type
- `src/app/core/organization-module/organization.schemas.ts`
  - optionally add migration response schema
- `src/app/core/organization-module/organization.service.ts`
  - add migration method and path helper

Primary feature dependency chain:

1. `OrganizationsComponent` receives the selected source organization from row actions.
2. `OrganizationMigrateModalComponent` emits the selected target organization ID.
3. `OrganizationsComponent.onMigrateUsers(...)` calls `OrganizationService`.
4. `OrganizationService` posts to the backend migration endpoint.
5. The page refreshes organizations and visible counts after a successful response.

External dependencies and assumptions:

- backend story delivers the migration endpoint and enforces admin authorization
- the backend returns client-meaningful error codes/messages for invalid source, invalid target, unverified target, same-org rejection, and rollback failures
- the backend signals migration success with HTTP `204 No Content`
- the organizations search endpoint continues to provide enough verified target organizations for the modal selector
