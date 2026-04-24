# Register Country And State Dropdowns

## Purpose / Big Picture

Update the custom-organization step in `src/app/auth/register` so `country` becomes required, `state` becomes required only when the selected country is the United States, and both fields are collected from dropdowns instead of free-text inputs.

This is a local auth/register UI and validation change, but it touches multiple files in a mixed legacy/newer form area:

- `RegisterComponent` uses `ngModel` bindings together with `UntypedFormGroup`
- organization-step validation is owned directly in the component
- the organization-create payload is sent through `OrganizationService.createOrganization(...)`

The safest change is to preserve the current component structure and step flow while tightening validation and moving the option lists into a register-local constants file.

## Progress

- [x] (2026-04-24 20:15Z) Reviewed `PLANS.md`, existing register component/template/specs, and prior organization-step ExecPlan.
- [x] (2026-04-24 20:18Z) Confirmed this work should use an ExecPlan because it is a multi-file form/validation change in a story-scale auth flow.
- [x] (2026-04-24 20:24Z) Added register-local constants for countries and US states in `src/app/auth/register/register-location-options.ts`.
- [x] (2026-04-24 20:27Z) Updated the organization-step UI to use dropdowns for country and state instead of free-text inputs.
- [x] (2026-04-24 20:30Z) Added conditional `state` required validation for `US` and kept the state control disabled/cleared for non-US countries.
- [x] (2026-04-24 20:32Z) Updated focused register specs for the new validation and payload behavior.
- [x] (2026-04-24 20:36Z) Ran targeted ESLint and TypeScript validation for the touched files; Jest remains blocked by existing repo test-harness drift.
- [x] (2026-04-24 20:49Z) Refined organization-step UX so failed Next attempts surface missing field errors without requiring prior dropdown interaction, and swapped country/state positions to country-left/state-right.

## Surprises & Discoveries

- The custom-organization step already exists and currently treats `name` and `sector` as the only required fields.
- The component already resets `selectedOrg` and `createdOrganizationId` when organization details change, so country/state changes can follow the same pattern.
- Existing specs already cover the create-organization path, which gives a good place to extend validation/payload assertions without broad test churn.

## Decision Log

- Decision: keep the country and US state options in a register-local constants file.
  Rationale: the user confirmed this data is only expected to be used by the registration organization-entry flow, so feature-local ownership avoids premature sharing.
  Date/Author: 2026-04-24 / Codex

- Decision: use country codes as submitted values while showing full country labels in the dropdown.
  Rationale: this matches the requested UX and keeps conditional logic for `US` straightforward.
  Date/Author: 2026-04-24 / Codex

- Decision: keep the state dropdown visible but disabled when the selected country is not `US`.
  Rationale: the user explicitly preferred disabled over hidden; this also makes the conditional requirement easier to understand in the UI.
  Date/Author: 2026-04-24 / Codex

- Decision: preserve education levels as optional.
  Rationale: this is unchanged product behavior and should not be broadened during this form update.
  Date/Author: 2026-04-24 / Codex

## Outcomes & Retrospective

The register custom-organization flow now collects country from a required dropdown and collects state from a US-state dropdown that is only enabled and required when `United States` is selected. The option data lives in a feature-local constants file so the change stays close to the register flow and does not introduce new shared ownership prematurely.

Validation was successful through focused ESLint and app TypeScript compilation. Jest could not execute the touched spec because the repo's current `jest-preset-angular` setup fails before tests run with `TypeError: configSet.processWithEsbuild is not a function`, which appears to be existing tooling drift rather than a failure in this change.

## Context and Orientation

Relevant files for this change:

- `src/app/auth/register/register.component.ts`
- `src/app/auth/register/register.component.html`
- `src/app/auth/register/register.component.spec.ts`
- `src/app/auth/register/register.component.scss`
- `src/app/auth/register/` new local constants file for country/state options

Current affected interaction flow:

1. User reaches `/auth/register`.
2. User enters personal details and either selects an existing organization or enters the custom-organization path.
3. On the custom-organization step, the user currently enters organization name, sector, optional levels, optional state, and optional country.
4. Submitting registration calls `OrganizationService.createOrganization(...)` before `AuthService.register(...)` when `shouldCreateOrganization` is true.

Target behavior:

1. The custom-organization step shows a required country dropdown.
2. The state control is a dropdown of US states.
3. The state dropdown is disabled unless `country === 'US'`.
4. Validation requires:
   - `name`
   - `sector`
   - `country`
   - `state` only when `country === 'US'`
5. The create-organization payload continues to use the form values, now sourced from controlled dropdowns.

Non-goals:

- No broad form rewrite to typed reactive forms.
- No shared/global country constants extraction.
- No API/service contract redesign beyond using the same existing request shape.

## Plan of Work

Phase 1: Add feature-local option data

- Create a local constants file in `src/app/auth/register/` for country options and US state options.
- Keep the data in a simple typed shape that works directly in the template.

Phase 2: Update component validation and state behavior

- Import the new options into `RegisterComponent`.
- Make `country` required in `organizationFormGroup`.
- Add conditional `state` validators based on the selected country value.
- Ensure changing country clears/disables state when moving away from `US`.

Phase 3: Update template rendering

- Replace the free-text country and state inputs with `<select>` controls.
- Keep state visible but disabled for non-US countries.
- Preserve the existing touched/error behavior and local styling conventions as much as possible.

Phase 4: Update tests and validate

- Extend `register.component.spec.ts` to cover:
  - `country` required
  - `state` required only for `US`
  - state reset/disabled behavior for non-US countries
  - payload values using country codes
- Run the nearest practical lint/test validation for the touched files.

## Concrete Steps

1. Add a register-local constants file exporting country and US state option arrays.
2. Import those arrays into `RegisterComponent`.
3. Update the `organizationFormGroup` so `country` is required.
4. Add component logic that applies `Validators.required` to `state` only when `country` is `US`.
5. Replace the `country` and `state` text inputs in the organization template with dropdowns.
6. Disable `state` when the selected country is not `US`, and clear its value when the country changes away from `US`.
7. Update specs to cover the new form rules and payload expectations.
8. Run targeted validation and record outcomes.

## Validation and Acceptance

Functional acceptance:

- The organization step shows a country dropdown with full labels.
- Selecting `United States` enables the state dropdown and makes it required.
- Selecting any non-US country disables the state dropdown and clears any prior state selection.
- The user cannot continue in the custom-organization flow without a country.
- The user cannot continue with `United States` selected unless a state is selected.
- Education levels remain optional.

Automated validation:

- Update `[register.component.spec.ts](/Users/diegosoto/Documents/secured/development-environment/clark-client/src/app/auth/register/register.component.spec.ts)` to assert conditional validation and payload behavior.
- Run the closest repo-supported check(s) against the touched auth/register files.

Manual validation:

- Open `/auth/register`.
- Enter the custom-organization path.
- Verify country is required.
- Verify state is disabled until `United States` is selected.
- Verify state becomes required for `United States`.
- Verify choosing a non-US country after selecting a state clears/disables the state field.

## Idempotence and Recovery

- The work can land safely in stages:
  - constants file
  - component validation logic
  - template update
  - tests
- If implementation pauses after the component logic change, the template should not ship until both dropdown rendering and validation behavior agree.
- If any payload mismatch is discovered with the backend, preserve the local option lists and adjust the service boundary or value mapping in the component rather than returning to free-text inputs.

## Artifacts and Notes

- Existing repo test tooling is mixed: `package.json` favors Jest scripts while `angular.json` still contains Karma config. Validation notes should call out exactly which checks were run.

## Interfaces and Dependencies

- `RegisterComponent` owns the organization-step form state and submit orchestration.
- `OrganizationService.createOrganization(...)` remains the service boundary for the custom-organization path.
- The new constants file is a feature-local dependency of the register component only.
