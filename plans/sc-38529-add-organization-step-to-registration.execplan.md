# SC-38529 Add Organization Step To Registration

## Purpose / Big Picture

Add a dedicated `Organization` step to the registration flow in `src/app/auth/register` so users can enter organization metadata after the existing personal-info step and before account creation. The desired fields are:

- organization name
- sector
- education levels
- state
- country

This is a multi-step UI and component-state change in the auth registration area. It is mostly local to the auth feature, but it also includes a service/API flow for creating an unverified organization when a registering user does not find their organization in the existing search results.

The current registration flow is a mixed legacy/newer implementation:

- the component is NgModule-era and template-driven in the template, while also using `UntypedFormGroup` validation
- organization search is already wired into `RegisterComponent`
- the component state already defines an `organization` template step
- the progress UI already renders `Organization`
- the actual template-switch flow still jumps from `info` directly to `account`

This plan keeps the implementation bounded to the touched auth area, strengthens the local form flow, and avoids a broad registration rewrite.

## Progress

- [x] 2026-03-27  Initial code inspection completed for register component, progress component, organization types/service, and nearby tests.
- [x] 2026-03-27  Confirmed this work needs an ExecPlan because it spans a multi-step flow and is likely more than one implementation session.
- [x] 2026-03-27  Confirmed Shortcut story ID `38529`.
- [x] 2026-03-27  Confirmed product/API workflow for custom organizations: create an unverified organization through `OrganizationService.createOrganization(...)` when the user does not find an existing organization.
- [ ] 2026-03-27  Implement organization-step UI and navigation in the registration flow.
- [ ] 2026-03-27  Wire unverified-organization create flow and registration payload handoff.
- [ ] 2026-03-27  Add or update focused tests and run validation.

## Surprises & Discoveries

- `src/app/auth/register/register.component.ts` already includes `TEMPLATES.organization` and indexes for a five-stage flow (`info`, `organization`, `account`, `submission`, `sso`), but `nextTemp()` and `goBack()` do not yet traverse that intermediate step.
- `src/app/auth/register/register.component.html` already contains an empty `orgTemplate` block, so there is a natural insertion point for the new fields.
- `src/app/auth/register/components/registration-progress/registration-progress.component.html` already shows `1. Info`, `2. Organization`, `3. Account`, `4. SSO`. This likely reflects recent progress, but it currently does not match the actual runtime step transitions because the submission step also exists in the main component.
- `src/app/core/organization-module/organization.types.ts` already defines the exact enum-like values needed for `sector` and `levels`, including:
  - sectors: `academia`, `government`, `industry`, `other`
  - levels: `elementary`, `middle`, `high`, `community_college`, `undergraduate`, `graduate`, `post_graduate`, `training`
- `OrganizationService` already exposes `createOrganization(...)`, and this is now the confirmed service boundary for the unverified-organization path.
- The existing register specs are very shallow and will need targeted improvement if we want meaningful regression protection.

## Decision Log

- Decision: keep the implementation inside the existing `RegisterComponent` instead of splitting the registration step into new child components during this change.
  Reason: this minimizes churn in a legacy area and fits the repo guidance to stabilize first and refactor second.

- Decision: reuse organization domain constants from `src/app/core/organization-module/organization.types.ts` instead of duplicating sector/level option arrays in the auth feature.
  Reason: avoids duplicate source-of-truth problems and keeps new code aligned with the typed service layer.

- Decision: preserve the current mixed form style for now.
  Reason: the component already uses `ngModel` plus `UntypedFormGroup`. A full migration to typed reactive forms would be a larger refactor than this story needs.

- Decision: when a user does not find a listed organization, the frontend will collect the organization details on the new organization step, call `OrganizationService.createOrganization(...)`, and create an unverified organization record before user registration completes.
  Reason: this matches the confirmed API workflow for story `38529`.

- Decision: existing listed-organization registration should continue using the selected organization ID and should not create a new organization record.
  Reason: preserves current behavior and keeps the custom-organization path explicit.

- Pending decision: whether organization metadata fields are shown only when the user selects `Other` or whether the tab is always shown but conditionally required.
  Impact: determines whether the organization step is conditional or always visible.

- Pending decision: whether `country` is also required in the new unverified-organization POST body or optional.
  Impact: affects validation rules and acceptance criteria.

## Outcomes & Retrospective

To be completed during/after implementation.

## Context and Orientation

Relevant repository areas:

- `src/app/auth/register/register.component.ts`
- `src/app/auth/register/register.component.html`
- `src/app/auth/register/register.component.scss`
- `src/app/auth/register/components/registration-progress/registration-progress.component.html`
- `src/app/auth/register/register.component.spec.ts`
- `src/app/auth/register/components/registration-progress/registration-progress.component.spec.ts`
- `src/app/core/organization-module/organization.types.ts`
- `src/app/core/organization-module/organization.service.ts`
- `src/app/core/auth-module/auth.service.ts`

Current registration interaction flow:

1. User lands on `/auth/register`.
2. `RegisterComponent` renders the `info` template first.
3. User enters first name, last name, email, and organization search text.
4. Existing org search uses `OrganizationService.searchOrganizations(...)` and requires the user to select a search result or `Other`.
5. The component currently advances straight from `info` to `account`.
6. User enters username/password/captcha and submits.
7. Success moves to `submission`, then optional `sso`.

Target interaction flow after this change:

1. User completes personal info and organization search.
2. If the user selects an existing organization, registration can proceed through the organization step with either prefilled read-only values or a minimal skip-through, depending on final UX.
3. If the user selects `Other` or does not find their organization, the user advances to a dedicated `organization` step and enters organization details.
4. The client creates an unverified organization via `OrganizationService.createOrganization(...)`.
5. The returned organization ID is used in the existing `AuthService.register(...)` call.
6. User completes account creation.
7. Registration completes as before.

Boundaries and non-goals:

- This plan does not include a full form architecture rewrite.
- This plan does not include broad auth module cleanup.
- This plan assumes the new backend POST endpoint exists or will exist with the same request shape as `CreateOrganizationRequest`.
- If the backend contract differs from the current client typing, update the typed service boundary rather than pushing ad hoc payload shapes into the component.

## Plan of Work

Phase 1: Align flow and local state in the register component

- Audit the existing `regInfo`, step state, and button guards.
- Add local organization-details state for the new fields, or extend `regInfo` if that produces less churn.
- Import `ORGANIZATION_SECTORS` and `ORGANIZATION_LEVELS` into the component.
- Add a dedicated form group for organization-step validation if needed.
- Update `nextTemp()` and `goBack()` so the step sequence truly becomes `info -> organization -> account -> submission -> sso`.

Phase 2: Build the organization-step UI

- Populate the empty `orgTemplate` in `register.component.html`.
- Add inputs/selectors for:
  - organization name
  - sector
  - education levels
  - state
  - country
- Match the surrounding auth/register styling patterns instead of introducing a new component library pattern.
- Add back/next navigation that respects validation.
- Ensure the new UI is only required for the custom-organization path if that is the agreed UX.

Phase 3: Wire the unverified-organization create flow

- Preserve the existing listed-organization search path.
- Detect the custom-organization path when the user does not select a listed organization and instead chooses `Other` or equivalent.
- Before `AuthService.register(...)`, call `OrganizationService.createOrganization(...)` with the new organization-step values.
- Use the returned organization ID as the `organizationId` for registration.
- Keep the component orchestration readable and avoid pushing route construction or payload-shape logic into the template.

Phase 4: Validate and tighten regressions

- Update registration progress expectations if the visible labels or indexes need correction.
- Add focused component tests around:
  - step transitions
  - button enable/disable behavior
  - organization options rendering
  - existing-organization vs custom-organization branching
  - create-organization-before-register sequencing where practical
- Run the nearest supported test command for the auth/register area.
- Do manual verification of both registration paths in the browser if feasible.

## Concrete Steps

1. Inspect the exact `CreateOrganizationRequest` client type and confirm it matches the new backend POST body.
2. Decide the trigger for the unverified-organization flow:
   - selecting `Other`
   - or failing to pick a listed result and continuing manually
3. Extend `RegisterComponent` state with:
   - sector options from `ORGANIZATION_SECTORS`
   - level options from `ORGANIZATION_LEVELS`
   - form controls/model fields for sector, levels, state, country
4. Add an `organizationFormGroup` or equivalent validation strategy.
5. Update `nextTemp()` to move from `info` to `organization`, and from `organization` to `account`.
6. Update `goBack()` to support:
   - `account -> organization`
   - `organization -> info`
7. Fill in the `orgTemplate` with the new fields and step actions.
8. Keep existing listed-organization selection behavior intact.
9. On submit:
   - existing organization path uses the already selected `organizationId`
   - custom organization path calls `createOrganization(...)` first, then registers with the returned ID
10. Update shallow specs into focused assertions for step order, branching, and orchestration.
11. Run local validation and capture any API/tooling drift.

## Validation and Acceptance

Functional acceptance:

- Registration flow visually shows and actually navigates through `Info -> Organization -> Account -> Submission -> SSO`.
- User can enter:
  - organization name
  - sector
  - one or more education levels
  - state
  - country
- Required validation prevents progression when mandatory organization fields are missing for the custom-organization path.
- Existing organization search still works.
- Selecting an existing organization does not create a new organization.
- Selecting `Other` or equivalent creates an unverified organization through the organization service before user registration.
- Successful registration still reaches submission and optional SSO.

Automated validation:

- Update `[register.component.spec.ts](/Users/diegosoto/Documents/secured/development-environment/clark-client/src/app/auth/register/register.component.spec.ts)` with focused tests for step progression, custom-organization branching, and create-then-register orchestration.
- Update `[registration-progress.component.spec.ts](/Users/diegosoto/Documents/secured/development-environment/clark-client/src/app/auth/register/components/registration-progress/registration-progress.component.spec.ts)` if labels/index expectations change.
- Run the nearest repo-supported test command for the auth area after inspecting `package.json` and `angular.json` before execution.

Manual validation:

- Open `/auth/register`.
- Verify the new organization tab appears in the progress UI and the navigation order is correct.
- Verify `Back` and `Next` preserve entered values.
- Verify dropdown values match expected labels.
- Verify existing-organization and custom-organization flows separately.
- Verify the custom path sends the organization-create request before registration.
- Verify successful registration still reaches submission and optional SSO.

## Idempotence and Recovery

- The flow work can be staged safely:
  - first land UI navigation and local form state
  - then wire create-organization behavior
  - then add tests
- If implementation pauses after Phase 2, the component should not ship unless the custom-organization path is either fully wired or clearly blocked.
- Avoid deleting the current organization search path until the replacement path is proven.
- If backend request fields differ from current client typings, update the service/types first and then resume component wiring.

## Artifacts and Notes

- Existing org search currently uses:
  - `organizationInput$`
  - `searchResults`
  - `selectedOrg`
  - `OrganizationService.searchOrganizations(...)`
- Existing fallback `Other` selection hardcodes organization ID `602ae2a038e2aaa1059f3c39`. This is legacy behavior that should likely be removed or bypassed for story `38529`, because the new flow creates a dedicated unverified organization record instead of reusing a shared placeholder.
- The progress component currently lists four visible steps while the main component internally tracks five templates including `submission`. That mismatch should be left alone only if it still matches intended UX; otherwise it should be clarified during implementation.

## Interfaces and Dependencies

- UI dependencies:
  - `RegisterComponent`
  - `RegistrationProgressComponent`
- Domain/service dependencies:
  - `OrganizationService.searchOrganizations(...)`
  - `OrganizationService.createOrganization(...)`
  - `AuthService.register(...)`
- Type dependencies:
  - `Organization`
  - `CreateOrganizationRequest`
  - `ORGANIZATION_SECTORS`
  - `ORGANIZATION_LEVELS`
- Open interface questions:
  - Is `country` required or optional for the unverified organization POST?
  - Should the organization step be always visible, or only meaningfully required for the custom-organization path?
