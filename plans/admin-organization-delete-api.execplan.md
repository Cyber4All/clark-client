# Admin Organization Delete API

## Purpose / Big Picture

Wire the admin organizations dashboard delete action to the backend `DELETE /organizations/:organizationId` endpoint. The UI should keep its existing local safety guard for organizations with users, show a confirmation popup that matches the Edit Organization and Migrate Users look and feel, and surface API-provided errors when deletion fails.

## Progress

- [x] (2026-06-29 18:53Z) Reviewed `PLANS.md`, confirmed this is a multi-file API/service plus UI change, and created this ExecPlan before implementation.
- [x] (2026-06-29 18:53Z) Inspected `src/app/admin/pages/organizations/organizations.component.html`, `organizations.component.ts`, delete/edit/migrate modal files, `OrganizationService`, and nearby specs.
- [x] (2026-06-30 17:30Z) User reset prior delete changes and fixed organization user-count filtering by changing the users query from `organizationId` to `organizationIds`; preserve that change.
- [x] (2026-06-30 17:30Z) Increment 1: add a typed organization delete method to `src/app/core/organization-module/organization.service.ts`.
- [x] (2026-06-30 17:30Z) Increment 1: add service coverage for `DELETE /organizations/:organizationId`.
- [x] (2026-06-30 17:30Z) Increment 1 validation: `npx tsc -p src/tsconfig.app.json --noEmit` passed.
- [x] (2026-06-30 17:30Z) Increment 1 validation: `npx jest --no-watchman src/app/core/organization-module/organization.service.spec.ts` still fails before tests execute with existing `configSet.processWithEsbuild is not a function`.
- [ ] Increment 2: enable desktop and mobile delete actions in `organizations.component.html`, using the existing delete modal without redesign.
- [ ] Increment 3: update `OrganizationsComponent.deleteOrganization()` to call the API, preserve the user-count guard, update table state only on success, and surface backend error messages.
- [ ] Increment 4: update delete modal markup/styles to match the current organization modal patterns and require confirmation certification.
- [ ] Update focused component Jest specs only after the component behavior changes are reintroduced.
- [ ] Run focused validation after each increment.

## Surprises & Discoveries

- The delete modal already exists, but the table action is disabled because the API was previously unsupported.
- `deleteOrganization()` currently performs a local-only removal after checking cached user count.
- Auth token handling is centralized in `HttpConfigInterceptor`; authenticated organization API requests should receive the admin bearer token from the `presence` cookie.
- Test tooling has drift: `angular.json` still references Karma, but nearby specs and `jest.config.js` indicate Jest is the practical runner for this area.
- Focused Jest execution is currently blocked before tests run by a setup/runtime error in the existing Jest configuration: `configSet.processWithEsbuild is not a function`.
- Full spec typechecking is currently blocked by unrelated pre-existing spec drift in other areas, including missing modules and renamed component exports.
- The Angular build command currently aborts immediately after `Building...` with exit code 134 and no useful diagnostic text.
- User identified the organization count issue as a query contract mismatch: the users search organization filter expects `organizationIds`, not `organizationId`.

## Decision Log

- Decision: Keep the frontend user-count guard and also rely on backend validation.
  Rationale: The UI can prevent obvious invalid deletes, while the API remains authoritative if counts are stale or business rules change.
  Date/Author: 2026-06-29 / Codex

- Decision: Implement delete in `OrganizationService` rather than directly in the component.
  Rationale: Organization API calls already live in this domain service, and keeping HTTP out of the component matches the repo target boundary.
  Date/Author: 2026-06-29 / Codex

- Decision: Keep the change local to the admin organizations page and organization service.
  Rationale: No routing, environment, shared UI, or interceptor change is needed for `DELETE /organizations/:organizationId`.
  Date/Author: 2026-06-29 / Codex

## Outcomes & Retrospective

Prior all-at-once implementation was reset by the user to isolate behavior changes. Reimplementation is now staged. Increment 1 adds only the service-layer delete method and service spec; no organizations dashboard template, component behavior, or styling was changed in this increment.

## Context and Orientation

The affected admin route is `src/app/admin/pages/organizations/`. The main table lives in `organizations.component.html` and is backed by `OrganizationsComponent` in `organizations.component.ts`. Organization HTTP operations are centralized in `src/app/core/organization-module/organization.service.ts`, with request/response domain types in `organization.types.ts` and runtime response validation in `organization.schemas.ts`.

The app uses `HttpConfigInterceptor` for API authentication. `DELETE /organizations/:organizationId` should not need a request body; the interceptor should attach credentials and the bearer token for authenticated API calls.

This is local feature work. It does not touch routing, guards, environment files, shared components, or state ownership beyond the local table/count state already in `OrganizationsComponent`.

## Plan of Work

Use the existing modal and service boundaries. Add only the missing API method, enable the existing delete entry points, make the confirmation popup consistent with neighboring modals, and update the component to perform an actual delete request with success/error handling.

Broader cleanup in the organizations dashboard, including existing `toPromise()` usage and reusable modal abstractions, is intentionally out of scope.

## Concrete Steps

1. Add `deleteOrganization(id: string): Observable<void>` to `OrganizationService`, using `this.updatePath(id)` and `HttpClient.delete`.
2. Update the desktop delete icon and mobile menu item to call `openDeleteModal(organization)` instead of showing the unsupported tooltip.
3. Add an `isDeleting` state in `OrganizationsComponent` and pass it to `OrganizationDeleteModalComponent`.
4. Update delete modal inputs/template/styles for a compact Material confirmation flow with the certification checkbox text `I confirm this action is correct`, plus Delete and Cancel options.
5. Update `deleteOrganization()` to:
   - return early if no selected organization or already deleting
   - keep the current `getUserCount()` guard
   - call `organizationService.deleteOrganization(selectedOrgId)`
   - remove table row/counts/cache only on success
   - close the modal on success
   - show API-provided error messages on failure
6. Add or update Jest coverage in the organization service and component specs.
7. Run focused Jest specs for the touched files.

## Validation and Acceptance

Automated validation:

- `npx jest --no-watchman src/app/core/organization-module/organization.service.spec.ts src/app/admin/pages/organizations/organizations.component.spec.ts`

Expected behavior:

- Delete actions are enabled in desktop and mobile organizations tables.
- Clicking delete opens a compact confirmation popup consistent with the existing organization modals.
- The Delete button remains disabled until the certification checkbox is checked.
- Organizations with cached user counts greater than zero are blocked client-side.
- Organizations with zero cached users call `DELETE /organizations/:organizationId`.
- On success, the row is removed and local count/cache state is refreshed.
- On failure, the UI displays the backend message when the API provides one.

## Idempotence and Recovery

The service method is additive and safe to reapply. The UI changes replace the old unsupported delete affordance rather than creating a second path. If implementation stops midway, check this plan's progress list, inspect `git diff`, and finish the remaining unchecked steps. If the backend endpoint rejects requests during manual testing, the component should keep the organization visible because the row is removed only after success.

## Artifacts and Notes

No external artifacts are required.

## Interfaces and Dependencies

Backend contract:

- Method: `DELETE`
- Path: `/organizations/:organizationId`
- Request body: none
- Auth: admin token via existing interceptor
- Success: no response body required
- Failure: prefer API-provided error message from a string response or `{ message: string }`
