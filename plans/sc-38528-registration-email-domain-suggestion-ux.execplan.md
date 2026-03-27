# SC-38528 Registration Email Domain Suggestion UX

## Purpose / Big Picture

Implement the registration UX that suggests a user organization from the entered email domain and auto-selects it by default, while still letting the user switch to the existing searchable organization selector if they want a different organization.

This story is local to the registration flow but crosses several layers inside that flow:

- `src/app/auth/register/register.component.ts`
- `src/app/auth/register/register.component.html`
- `src/app/auth/register/register.component.scss`
- `src/app/core/organization-module/organization.service.ts`
- registration tests and any related organization-service tests

The change is not a broad architectural refactor. It should stabilize the current registration flow in place while moving the touched code slightly toward a cleaner state:

- keep API access in services
- avoid direct component HTTP additions beyond existing service usage
- preserve the current multi-step registration UX
- reuse the existing organization search behavior rather than replacing it

## Progress

- [x] (2026-03-27 16:06Z) Reviewed `PLANS.md`, `AGENTS.md`, and confirmed that story work like SC-38528 requires a story-specific ExecPlan under `plans/`.
- [x] (2026-03-27 16:06Z) Inspected the current registration flow in `src/app/auth/register/register.component.ts` and `src/app/auth/register/register.component.html`.
- [x] (2026-03-27 16:06Z) Confirmed `OrganizationService.suggestDomain(email)` already exists in `src/app/core/organization-module/organization.service.ts`.
- [x] (2026-03-27 16:06Z) Confirmed registration already contains searchable organization selection behavior that can be reused for fallback and manual override.
- [x] (2026-03-27 16:16Z) Finished the register component state changes for suggestion lookup, auto-selection, manual change flow, and fallback behavior.
- [x] (2026-03-27 16:16Z) Updated the registration template and styles to show the auto-selected suggested organization and the `Change organization` path.
- [x] (2026-03-27 16:16Z) Added and updated focused specs for registration suggestion behavior and `OrganizationService.suggestDomain(...)`.
- [x] (2026-03-27 16:16Z) Ran targeted lint on touched TS/HTML/spec files and confirmed the repo-wide spec TypeScript build no longer reports errors in the new registration and organization-service specs.
- [ ] Capture final validation summary, residual risks, and commit the implementation changes.

## Surprises & Discoveries

- The repo already contains the typed organization domain-suggestion API client in `OrganizationService`, so this story is mainly UX wiring rather than API-layer construction.
- The registration component is already a mixed legacy/newer area: reactive form controls are present, but the template also uses `ngModel` and component-local orchestration.
- The existing organization search selector is embedded directly in the register component template, so the safest path is to reuse it as the fallback/manual path rather than extract shared UI in this story.
- The UX can be simplified further than the original story text: explicit confirmation is not necessary if the suggestion is set as the default selected organization and the user can override it via `Change organization`.
- I started modifying `register.component.ts` before creating this ExecPlan. That was process drift and should not have happened before the plan file existed.
- The repo’s current Jest setup is broken for targeted runs with `TypeError: configSet.processWithEsbuild is not a function`, so validation for this story had to rely on lint plus a repo-wide spec TypeScript compile filtered to the touched spec files.

## Decision Log

- Decision: Treat this story as a local feature enhancement, not a registration-form architecture rewrite.
  Rationale: The acceptance criteria are specific to suggestion UX, and expanding into a broader form modernization would increase risk and scope in a legacy area.
  Date/Author: 2026-03-27 / Codex

- Decision: Reuse the existing searchable organization selector for the `Change organization` path and for the no-suggestion/error fallback path.
  Rationale: This preserves existing behavior, reduces regression risk, and satisfies the story without introducing a new selector abstraction.
  Date/Author: 2026-03-27 / Codex

- Decision: Keep the API call in `OrganizationService` and only add component-level orchestration for when to call it and how to render the result.
  Rationale: The repo target direction is to keep API logic in services and avoid new direct `HttpClient` usage in components.
  Date/Author: 2026-03-27 / Codex

- Decision: Use a staged-in-place update to the register component rather than extracting a new state service/store in this story.
  Rationale: The flow is self-contained, and a store extraction would be unnecessary churn for a single UX enhancement.
  Date/Author: 2026-03-27 / Codex

- Decision: Auto-select the suggested organization by default instead of requiring an explicit `Confirm` action.
  Rationale: The user already has a natural opt-out through `Change organization`, so removing the extra confirmation step simplifies the registration flow while preserving control.
  Date/Author: 2026-03-27 / User

## Outcomes & Retrospective

This section will be completed after implementation and validation. It should capture:

- what shipped versus what was deferred
- whether the fallback UX behaved as expected
- whether the touched code became clearer or more fragile
- any follow-up cleanup worth tracking separately

## Context and Orientation

This repository is a single Angular 18 SPA that is still primarily NgModule-based and lazy-loads major feature areas. The registration flow lives under `src/app/auth`.

Relevant current flow:

1. The user lands in the auth feature and opens the register step.
2. `RegisterComponent` manages the multi-step registration flow.
3. The first step collects first name, last name, email, and organization.
4. The current component already performs:
   - email uniqueness checks through `AuthService`
   - username uniqueness checks through `AuthService`
   - searchable organization lookup through `OrganizationService.searchOrganizations(...)`
5. The selected organization is stored as an organization ID and later sent in the registration request through `AuthService.register(...)`.
6. After this story, a suggested organization should populate that selected organization automatically when possible, without requiring a separate confirmation step.

Relevant files:

- `src/app/auth/register/register.component.ts`
- `src/app/auth/register/register.component.html`
- `src/app/auth/register/register.component.scss`
- `src/app/auth/auth.module.ts`
- `src/app/core/organization-module/organization.service.ts`
- `src/app/core/organization-module/organization.types.ts`
- `src/app/auth/register/register.component.spec.ts`
- `src/app/core/organization-module/organization.service.spec.ts`

Current architectural reality of the touched code:

- registration is component-driven
- state ownership is local to `RegisterComponent`
- forms are mixed reactive + template-driven
- API access already lives in services
- test coverage exists but this exact component test file is currently minimal

Target direction for touched code in this story:

- keep side effects readable and bounded
- make loading states explicit
- preserve service boundaries
- avoid adding more hidden branching in the template than necessary

## Plan of Work

1. Finish the component orchestration for suggestion lifecycle.
2. Add the suggested-organization decision UI to the first registration step.
3. Preserve and rewire the existing search selector as the fallback/manual path.
4. Add focused tests around the new decision flow.
5. Validate acceptance criteria manually and through targeted automated checks.

## Concrete Steps

1. Update `RegisterComponent` state
   - Add explicit state for:
     - suggestion loading
     - search loading
     - suggested organization
     - whether the searchable selector is active
   - Ensure state resets when the email changes.

2. Trigger domain suggestion
   - After email entry and validation, call `OrganizationService.suggestDomain(email)`.
   - Only continue to suggestion when email is syntactically valid and not already in use.

3. Handle suggestion outcomes
   - If the API returns an organization, auto-select it and render it as the current chosen organization.
   - If the API returns no organization, show the searchable selector by default.
   - If the API fails, also show the searchable selector by default.

4. Implement user actions
   - Suggested org default: populate the organization field display and selected org ID automatically.
   - `Change organization`: clear the default suggestion selection and open the searchable selector.
   - Existing organization search result selection should continue to set `selectedOrg`.

5. Update template and styling
   - Add a suggestion panel/message near the organization field indicating the auto-selected organization.
   - Keep current dropdown/search layout intact for fallback behavior.
   - Ensure loading states are visible both for suggestion and for search.

6. Add tests
   - Update `register.component.spec.ts` to cover:
     - suggestion success
     - no suggestion
     - suggestion error fallback
     - auto-selection behavior
     - change-organization behavior
   - Extend service tests only if needed for any uncovered suggestion behavior contract.

## Validation and Acceptance

Acceptance criteria to prove:

- Registration form calls `GET /organizations/suggest?email={email}` when email is entered.
- If an org is suggested, the UI shows the org name as the default selected organization with a `Change organization` option.
- The suggested org is auto-selected without an extra confirmation step.
- `Change organization` opens the searchable org selector using the existing functionality.
- If no org is suggested, the searchable org selector appears by default.
- Loading state is visible while the suggestion endpoint is in flight.
- API failure falls back to the searchable org selector.

Automated validation:

- updated `register.component.spec.ts`
- relevant organization-service tests if changed
- targeted lint on touched TS/HTML/spec files
- repo-wide `src/tsconfig.spec.json` compile filtered to touched spec files

Manual validation:

1. Enter a valid email with a suggestable domain and verify the suggested organization is auto-selected.
2. Enter a valid email with a suggestable domain and choose `Change organization`, then search/select an org.
3. Enter a valid email with a non-suggestable domain and confirm the searchable selector is shown.
4. Simulate suggestion failure and confirm searchable selector fallback.
5. Verify the next-step button and step progression still behave correctly.

## Idempotence and Recovery

If work pauses mid-story:

- inspect `register.component.ts`, `.html`, and `.scss` together before resuming because the UX state is split across them
- verify the selected organization still flows through `selectedOrg`
- verify search fallback still works before refining visuals
- check the git diff to ensure partial changes do not leave unreachable template branches

If the story needs to be resumed by a new contributor:

- start by reviewing this ExecPlan
- read the current `RegisterComponent` diff
- run targeted tests for `RegisterComponent`
- manually verify both suggestion and fallback branches before adding more refactors

## Artifacts and Notes

- Story ID: `38528`
- Shortcut story title: `Registration: Implement email domain suggestion UX`
- Existing service dependency:
  - `OrganizationService.suggestDomain(email: string)`
- Existing fallback/manual search dependency:
  - `OrganizationService.searchOrganizations({ text })`

Known technical debt intentionally left in place for this story:

- `RegisterComponent` remains a large, component-owned workflow
- mixed reactive form + `ngModel` usage remains
- no extraction of a dedicated registration state service/store

## Interfaces and Dependencies

Dependencies called out by the story:

- Story 5: domain suggestion endpoint must exist
- Story 4: organization search endpoint must exist

Touched interfaces and contracts:

- `SuggestDomainResponse` in `src/app/core/organization-module/organization.types.ts`
- `Organization` in `src/app/core/organization-module/organization.types.ts`
- `AuthService.register(...)` input still expects `organizationId`

Boundary expectations:

- No routing changes
- No guard or interceptor changes
- No environment/build changes
- Shared UI is not broadly refactored; the work stays in the auth registration surface
