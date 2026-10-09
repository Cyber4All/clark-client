# Reusable Feature Highlight Card

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

CLARK needs a reusable UI component for announcing new features across app pages. After this change, a page can render a feature highlight with configurable title, body copy, primary action, secondary action, and dismiss action without baking in author-dashboard or Agentic Builder assumptions. The author dashboard will use that component for the Agentic Builder announcement and keep the dismiss persistence in dashboard/application code so it can call the user preference update flow.

## Progress

- [x] (2026-07-31 11:33 America/New_York) Read `PLANS.md` and confirmed an ExecPlan is required because this is shared UI plus dashboard integration and tests.
- [x] (2026-07-31 11:33 America/New_York) Inspected the existing untracked `plans/agentic-builder-dashboard-entry.execplan.md` and chose not to overwrite it because this story is broader.
- [x] (2026-07-31 11:33 America/New_York) Reviewed author dashboard structure in `src/app/onion/dashboard` and shared component conventions in `src/app/shared/components`.
- [x] (2026-07-31 11:42 America/New_York) Added reusable shared `FeatureHighlightCardComponent` with typed title/body/action inputs, action/dismiss outputs, accessible buttons, and responsive SCSS.
- [x] (2026-07-31 11:45 America/New_York) Wired the author dashboard to render Agentic Builder content through the shared component without putting dashboard assumptions in the shared component.
- [x] (2026-07-31 11:46 America/New_York) Added dashboard-local `FeatureAnnouncementPreferencesService` and wired dismiss to persist a user-scoped feature announcement preference.
- [x] (2026-07-31 11:50 America/New_York) Added focused component and preference service specs.
- [x] (2026-07-31 11:55 America/New_York) Ran validation: app TypeScript and lint passed; Jest/spec execution is blocked by existing repo test-tooling drift documented below.
- [x] (2026-07-31 12:15 America/New_York) Updated the shared component and author dashboard usage to match the screenshot: compact bottom-right floating AI Object Builder announcement with icon, close control, `Try it`, and `Dismiss` actions.
- [x] (2026-07-31 12:18 America/New_York) Changed dismissal from localStorage-backed persistence to current-app-session preference state so the announcement can appear again on a later login.
- [x] (2026-07-31 12:22 America/New_York) Re-ran validation after the floating-notification update: app TypeScript and lint passed; Jest/spec execution remains blocked by existing repo test-tooling drift.
- [x] (2026-08-03 12:29 America/New_York) Updated the secondary `Dismiss` button to persist the hide preference in browser localStorage with key `Hide AI Announcemednt` and value `1`.
- [x] (2026-08-03 12:29 America/New_York) Kept the top-right close icon as current-view-only dismissal that does not write localStorage.
- [x] (2026-08-03 12:34 America/New_York) Ran validation after localStorage update: app TypeScript, targeted lint, and whitespace checks passed; focused Jest remains blocked by existing setup failure.
- [x] (2026-08-03 12:57 America/New_York) Planned follow-up route change: `Try it` should navigate to a new `/onion/ai-object-builder` page instead of the existing materials tab.
- [x] (2026-08-03 13:00 America/New_York) Added an AI Object Builder page with upload dropzone, selected-file list, no-files empty state, guidance input, and disabled build button until files are selected.
- [x] (2026-08-03 13:00 America/New_York) Updated the dashboard announcement primary action to route to `/onion/ai-object-builder`.
- [x] (2026-08-03 13:00 America/New_York) Added focused page tests and reran validation: app TypeScript, targeted lint, and whitespace checks passed; Jest/spec/build blockers remain existing repo/tooling issues.
- [x] (2026-08-04 10:37 America/New_York) Removed the AI Object Builder page files and local route registration from this PR because that implementation belongs to `feature/sc-39646/agentic-builder-dashboard-entry-point-for-new`.
- [x] (2026-08-04 10:37 America/New_York) Kept the dashboard announcement primary action pointed at `/onion/ai-object-builder` so the reusable announcement can route to the page once the other PR supplies it.
- [x] (2026-08-07 10:50 America/New_York) Addressed PR review feedback by replacing the feature-highlight card's individual inputs with one typed `FeatureHighlightConfig` signal input, updating the dashboard to pass one config object, and replacing the card template's `*ngIf` usage with Angular control-flow `@if` blocks.

## Surprises & Discoveries

- Observation: The author dashboard is a standalone component imported by a traditional NgModule route.
  Evidence: `src/app/onion/dashboard/dashboard.component.ts` has `standalone: true`, while `src/app/onion/dashboard/dashboard.module.ts` configures the child route and imports the component.
- Observation: The repository has Jest dependencies and scripts, while `angular.json` still contains a Karma-style test target.
  Evidence: `package.json` exposes Jest commands and `angular.json` references `@angular-devkit/build-angular:karma`.
- Observation: There is an untracked, completed-looking Agentic Builder dashboard-entry ExecPlan in the working tree.
  Evidence: `git status --short` reports `?? plans/agentic-builder-dashboard-entry.execplan.md`.
- Observation: Focused Jest specs still fail before executing tests because of the repo's Angular Jest preset setup.
  Evidence: `npx jest --runTestsByPath ...` fails in `src/setup-jest.ts` with `TypeError: configSet.processWithEsbuild is not a function`.
- Observation: Full spec TypeScript compilation is blocked by unrelated existing spec errors.
  Evidence: `npx tsc -p src/tsconfig.spec.json --noEmit` reports stale/missing spec imports in admin, collection, cube, onion dashboard-item, filesystem, and entity specs before any new-file issue is reported.
- Observation: Angular build validation is currently not diagnostic.
  Evidence: `npx ng build clark --no-progress` terminated with exit code `-1` before emitting useful output.
- Observation: Focused Jest specs remain blocked before executing tests after the Angular 18 input/control-flow review update.
  Evidence: `npx jest src/app/shared/components/feature-highlight-card/feature-highlight-card.component.spec.ts --runInBand` and `npx jest src/app/onion/dashboard/dashboard.component.spec.ts --runInBand` fail in `src/setup-jest.ts` with `TypeError: configSet.processWithEsbuild is not a function`.

## Decision Log

- Decision: Implement the feature highlight as a generic shared standalone component under `src/app/shared/components/feature-highlight-card`.
  Rationale: The acceptance criteria asks for reuse across pages, and the dashboard should only provide content/actions rather than owning a one-off card.
  Date/Author: 2026-07-31 / Codex
- Decision: Keep preference persistence outside the shared component and emit a dismiss event.
  Rationale: This keeps the component reusable and lets the author dashboard call the appropriate user-preference update flow.
  Date/Author: 2026-07-31 / Codex
- Decision: Superseded prior decision to make the dashboard AI Object Builder dismissal non-permanent.
  Rationale: The screenshot-follow-up initially clarified that dismissal should not suppress future CLARK logins, but later product feedback changed the secondary `Dismiss` action to persist the hide preference in browser localStorage.
  Date/Author: 2026-07-31 / Codex
- Decision: Add `appearance`, `iconClass`, and `iconLabel` inputs to the reusable component rather than creating a separate dashboard-only toast component.
  Rationale: The same feature-highlight contract can support inline and floating placements while keeping page-specific copy, routing, and dismissal behavior in consumers.
  Date/Author: 2026-07-31 / Codex
- Decision: Store the secondary `Dismiss` action in localStorage while keeping the `x` close action transient.
  Rationale: Product feedback clarified that the secondary button should mean "do not show this announcement again" using the exact browser-storage key `Hide AI Announcemednt`, while the close icon should only hide the card in the current view.
  Date/Author: 2026-08-03 / Codex
- Decision: Add a sibling AI Object Builder route instead of sending users into the existing manual builder materials tab.
  Rationale: The mock shows a separate upload-first experience with its own title, dropzone, selected-file list, guidance input, and build action. Keeping it separate avoids changing the manual builder tabs and preserves the existing `/onion/learning-object-builder/materials` behavior.
  Date/Author: 2026-08-03 / Codex
- Decision: Move the AI Object Builder page and route out of this PR.
  Rationale: `feature/sc-39646/agentic-builder-dashboard-entry-point-for-new` owns the actual `/onion/ai-object-builder` page. This PR should provide only the reusable announcement/card, dashboard placement, dismissal behavior, and navigation target.
  Date/Author: 2026-08-04 / Codex

## Outcomes & Retrospective

Completed the reusable feature highlight card and author-dashboard integration. The shared component is generic and presentation-only; dashboard code supplies AI Object Builder copy/actions and owns dismissal behavior. The dashboard now shows a compact bottom-right floating announcement matching the provided screenshot direction. The secondary `Dismiss` action stores `Hide AI Announcemednt = "1"` in localStorage so future dashboard loads hide the card, while the top-right close icon only hides it for the current view. The announcement primary action routes to `/onion/ai-object-builder`, but this PR intentionally does not define that page or route; `feature/sc-39646/agentic-builder-dashboard-entry-point-for-new` owns that implementation. Automated app TypeScript and targeted lint validation passed. Focused Jest execution and full spec TypeScript validation are still blocked by existing repository test-tooling/spec drift. The Angular build command also terminates with exit code `-1` before producing diagnostics.

## Context and Orientation

The author dashboard is rendered by `src/app/onion/dashboard/dashboard.component.ts` through the lazy-loaded route in `src/app/onion/dashboard/dashboard.module.ts`. Its template in `src/app/onion/dashboard/dashboard.component.html` shows the dashboard splash and a tabbed draft/released learning object carousel. The dashboard component currently handles data loading, navigation, side-panel state, changelogs, submission dialogs, and list actions.

Shared UI components live under `src/app/shared/components`, with several standalone components already imported directly by feature components. This story adds a new shared presentation component there. The component must not depend on dashboard routes, Agentic Builder copy, AuthService, localStorage, or any user-preference service.

Dismissal persistence belongs in dashboard/application code. This story adds a small dashboard-area service for the Agentic Builder announcement preference and wires it through `DashboardComponent`. The service uses browser localStorage with the exact key `Hide AI Announcemednt` and values `"1"` for hidden and `"0"` for visible. No route, guard, interceptor, environment, backend API, or build configuration changes are planned.

The AI Object Builder page itself is intentionally out of scope for this PR. The companion PR `feature/sc-39646/agentic-builder-dashboard-entry-point-for-new` owns `/onion/ai-object-builder` route registration and page implementation. This PR only routes interested users to that future route from the reusable announcement.

## Plan of Work

Create a shared standalone `FeatureHighlightCardComponent` that accepts typed action inputs for primary and secondary actions and emits outputs when those actions or dismiss are activated. The component will render a semantic heading, body text, optional icon, optional action buttons, and an accessible dismiss button. It supports inline and compact floating appearances through inputs and local SCSS while avoiding page-specific copy or route assumptions.

Integrate the component into the author dashboard with AI Object Builder-specific content provided by `DashboardComponent`. Dashboard code will own navigation to the builder route and the dismiss preference update. A small dashboard service will keep localStorage-backed dismissal state localized and testable.

Do not add the AI Object Builder page or route registration in this PR. Keep `DashboardComponent.startAgenticBuilder()` pointed at `/onion/ai-object-builder` as an integration contract with the companion PR.

Testing will focus on the shared component's inputs/outputs and the dashboard preference service. Dashboard integration will be kept small enough that existing dashboard tests only need minimal provider/import support unless they reveal more meaningful behavior to cover.

Out of scope: creating a global preferences architecture, changing dashboard routing, refactoring the dashboard's data-loading pattern, changing the builder flow, or modifying unrelated shared components.

## Concrete Steps

From the repository root:

1. Add `src/app/shared/components/feature-highlight-card/feature-highlight-card.component.ts`, `.html`, `.scss`, and `.spec.ts`.
2. Add `src/app/onion/dashboard/services/feature-announcement-preferences.service.ts` with focused localStorage-backed preference methods.
3. Update `src/app/onion/dashboard/dashboard.component.ts` to provide card content, react to action outputs, and call the preference service on dismiss.
4. Update `src/app/onion/dashboard/dashboard.component.html` and `.scss` to place the reusable card as a fixed bottom-right floating announcement when it has not been hidden in browser storage.
5. Run targeted Jest/component validation where possible, then TypeScript/lint validation for touched files.
6. Keep `DashboardComponent.startAgenticBuilder()` navigating to `/onion/ai-object-builder`.
7. Do not add `src/app/onion/ai-object-builder/` files in this PR.
8. Do not add the `/onion/ai-object-builder` child route in `src/app/onion/onion.routing.ts`; that belongs to `feature/sc-39646/agentic-builder-dashboard-entry-point-for-new`.

## Validation and Acceptance

Acceptance is met when:

- The reusable component supports title, body text, primary action, secondary action, and dismiss action.
- The reusable component contains no author-dashboard or Agentic Builder assumptions.
- The author dashboard renders the component with AI Object Builder content in a bottom-right floating notification.
- Clicking the secondary `Dismiss` button calls dashboard-owned preference update flow, writes `Hide AI Announcemednt = "1"` to localStorage, and hides the card on future dashboard loads in that browser.
- Clicking the top-right close icon hides the card for the current view without writing localStorage.
- `Try it` opens `/onion/ai-object-builder` instead of `/onion/learning-object-builder/materials`.
- This PR does not define `/onion/ai-object-builder`; route/page ownership belongs to `feature/sc-39646/agentic-builder-dashboard-entry-point-for-new`.
- The component is responsive and uses accessible buttons, labels, and semantic heading structure.
- Basic tests cover component rendering and output events.

Target commands:

    npx jest --runTestsByPath src/app/shared/components/feature-highlight-card/feature-highlight-card.component.spec.ts src/app/onion/dashboard/services/feature-announcement-preferences.service.spec.ts
    npx tsc -p src/tsconfig.app.json --noEmit
    npx ng lint clark --lint-file-patterns src/app/shared/components/feature-highlight-card/feature-highlight-card.component.ts src/app/shared/components/feature-highlight-card/feature-highlight-card.component.html src/app/onion/dashboard/dashboard.component.ts src/app/onion/dashboard/dashboard.component.html
    git diff --check

Validation performed:

    npx prettier --write plans/reusable-feature-highlight-card.execplan.md src/app/shared/components/feature-highlight-card/feature-highlight-card.component.ts src/app/shared/components/feature-highlight-card/feature-highlight-card.component.html src/app/shared/components/feature-highlight-card/feature-highlight-card.component.scss src/app/shared/components/feature-highlight-card/feature-highlight-card.component.spec.ts src/app/onion/dashboard/services/feature-announcement-preferences.service.ts src/app/onion/dashboard/services/feature-announcement-preferences.service.spec.ts src/app/onion/dashboard/dashboard.component.ts src/app/onion/dashboard/dashboard.component.html src/app/onion/dashboard/dashboard.component.scss

Expected and observed: completed with no formatting changes.

    npx tsc -p src/tsconfig.app.json --noEmit

Expected and observed: passed.

    npx jest --runTestsByPath src/app/shared/components/feature-highlight-card/feature-highlight-card.component.spec.ts src/app/onion/dashboard/services/feature-announcement-preferences.service.spec.ts

Expected: focused specs execute. Observed: blocked before tests run by `TypeError: configSet.processWithEsbuild is not a function` in `jest-preset-angular` setup.

    npx ng lint clark --lint-file-patterns src/app/shared/components/feature-highlight-card/feature-highlight-card.component.ts src/app/shared/components/feature-highlight-card/feature-highlight-card.component.html src/app/onion/dashboard/services/feature-announcement-preferences.service.ts src/app/onion/dashboard/dashboard.component.ts src/app/onion/dashboard/dashboard.component.html

Expected and observed: all files pass linting.

    npx ng lint clark --lint-file-patterns src/app/shared/components/feature-highlight-card/feature-highlight-card.component.spec.ts src/app/onion/dashboard/services/feature-announcement-preferences.service.spec.ts

Expected and observed: all files pass linting.

    npx tsc -p src/tsconfig.spec.json --noEmit

Expected: spec TypeScript compiles. Observed: blocked by unrelated existing spec errors in admin, collection, cube, onion dashboard-item, filesystem, and entity tests.

    git diff --check

Expected and observed: passed.

Validation repeated after the August 3 localStorage update:

    npx prettier --write plans/reusable-feature-highlight-card.execplan.md src/app/onion/dashboard/services/feature-announcement-preferences.service.ts src/app/onion/dashboard/services/feature-announcement-preferences.service.spec.ts src/app/onion/dashboard/dashboard.component.ts src/app/onion/dashboard/dashboard.component.html

Expected and observed: completed with no formatting changes.

    git diff --check

Expected and observed: passed.

    npx tsc -p src/tsconfig.app.json --noEmit

Expected and observed: passed.

    npx ng lint clark --lint-file-patterns src/app/onion/dashboard/services/feature-announcement-preferences.service.ts src/app/onion/dashboard/services/feature-announcement-preferences.service.spec.ts src/app/onion/dashboard/dashboard.component.ts src/app/onion/dashboard/dashboard.component.html

Expected and observed: all files pass linting.

    npx jest --runTestsByPath src/app/onion/dashboard/services/feature-announcement-preferences.service.spec.ts

Expected: focused service spec executes. Observed: still blocked before tests run by `TypeError: configSet.processWithEsbuild is not a function` in `jest-preset-angular` setup.

Superseded validation from the temporary AI Object Builder route/page implementation, before that work moved to the companion PR:

    npx prettier --write plans/reusable-feature-highlight-card.execplan.md src/app/onion/ai-object-builder/ai-object-builder.component.ts src/app/onion/ai-object-builder/ai-object-builder.component.html src/app/onion/ai-object-builder/ai-object-builder.component.scss src/app/onion/ai-object-builder/ai-object-builder.routing.ts src/app/onion/ai-object-builder/ai-object-builder.module.ts src/app/onion/ai-object-builder/ai-object-builder.component.spec.ts src/app/onion/onion.routing.ts src/app/onion/dashboard/dashboard.component.ts

Expected and observed: completed.

    npx tsc -p src/tsconfig.app.json --noEmit

Expected and observed: passed.

    npx ng lint clark --lint-file-patterns src/app/onion/ai-object-builder/ai-object-builder.component.ts src/app/onion/ai-object-builder/ai-object-builder.component.html src/app/onion/ai-object-builder/ai-object-builder.component.spec.ts src/app/onion/ai-object-builder/ai-object-builder.routing.ts src/app/onion/ai-object-builder/ai-object-builder.module.ts src/app/onion/onion.routing.ts src/app/onion/dashboard/dashboard.component.ts

Expected and observed: all files pass linting.

    git diff --check

Expected and observed: passed.

    npx jest --runTestsByPath src/app/onion/ai-object-builder/ai-object-builder.component.spec.ts src/app/onion/dashboard/services/feature-announcement-preferences.service.spec.ts

Expected: focused specs execute. Observed: still blocked before tests run by `TypeError: configSet.processWithEsbuild is not a function` in `jest-preset-angular` setup.

    npx tsc -p src/tsconfig.spec.json --noEmit

Expected: spec TypeScript compiles. Observed: still blocked by unrelated existing spec errors in admin, collection, cube, onion dashboard-item, filesystem, and entity tests.

    npx ng build clark --no-progress

Expected: Angular application build completes or reports actionable diagnostics. Observed: terminated with exit code `-1` before emitting useful output.

Validation repeated after the August 7 review-feedback update:

    npx prettier --write src/app/shared/components/feature-highlight-card/feature-highlight-card.component.ts src/app/shared/components/feature-highlight-card/feature-highlight-card.component.html src/app/shared/components/feature-highlight-card/feature-highlight-card.component.spec.ts src/app/onion/dashboard/dashboard.component.ts src/app/onion/dashboard/dashboard.component.html

Expected and observed: completed with no formatting changes.

    npx jest src/app/shared/components/feature-highlight-card/feature-highlight-card.component.spec.ts --runInBand
    npx jest src/app/onion/dashboard/dashboard.component.spec.ts --runInBand

Expected: focused specs execute. Observed: still blocked before tests run by `TypeError: configSet.processWithEsbuild is not a function` in `jest-preset-angular` setup.

    npx ng build clark --configuration=development

Expected: Angular application build completes. Observed: blocked because the workspace does not define a `development` build configuration.

    npx ng build clark

Expected: Angular application build completes or reports actionable diagnostics. Observed: terminated with exit code `-1` after printing `Building...` and before emitting useful diagnostics.

    git diff --check

Expected and observed: passed.

Validation repeated after removing AI Object Builder page/route ownership from this PR:

    npx prettier --write plans/reusable-feature-highlight-card.execplan.md src/app/onion/onion.routing.ts

Expected and observed: completed.

    npx tsc -p src/tsconfig.app.json --noEmit

Expected and observed: passed.

    npx ng lint clark --lint-file-patterns src/app/onion/onion.routing.ts src/app/onion/dashboard/dashboard.component.ts src/app/onion/dashboard/dashboard.component.html src/app/onion/dashboard/services/feature-announcement-preferences.service.ts src/app/onion/dashboard/services/feature-announcement-preferences.service.spec.ts src/app/shared/components/feature-highlight-card/feature-highlight-card.component.ts src/app/shared/components/feature-highlight-card/feature-highlight-card.component.html src/app/shared/components/feature-highlight-card/feature-highlight-card.component.spec.ts

Expected and observed: all files pass linting.

    git diff --check

Expected and observed: passed.

    npx ng build clark --no-progress

Expected: Angular application build completes or reports actionable diagnostics. Observed: terminated with exit code `-1` before emitting useful output.

Validation repeated after screenshot-driven floating notification changes:

    npx prettier --write plans/reusable-feature-highlight-card.execplan.md src/app/shared/components/feature-highlight-card/feature-highlight-card.component.ts src/app/shared/components/feature-highlight-card/feature-highlight-card.component.html src/app/shared/components/feature-highlight-card/feature-highlight-card.component.scss src/app/shared/components/feature-highlight-card/feature-highlight-card.component.spec.ts src/app/onion/dashboard/services/feature-announcement-preferences.service.ts src/app/onion/dashboard/services/feature-announcement-preferences.service.spec.ts src/app/onion/dashboard/dashboard.component.ts src/app/onion/dashboard/dashboard.component.html src/app/onion/dashboard/dashboard.component.scss

Expected and observed: completed with no formatting changes.

    npx tsc -p src/tsconfig.app.json --noEmit

Expected and observed: passed.

    npx ng lint clark --lint-file-patterns src/app/shared/components/feature-highlight-card/feature-highlight-card.component.ts src/app/shared/components/feature-highlight-card/feature-highlight-card.component.html src/app/shared/components/feature-highlight-card/feature-highlight-card.component.spec.ts src/app/onion/dashboard/services/feature-announcement-preferences.service.ts src/app/onion/dashboard/services/feature-announcement-preferences.service.spec.ts src/app/onion/dashboard/dashboard.component.ts src/app/onion/dashboard/dashboard.component.html

Expected and observed: all files pass linting.

    npx jest --runTestsByPath src/app/shared/components/feature-highlight-card/feature-highlight-card.component.spec.ts src/app/onion/dashboard/services/feature-announcement-preferences.service.spec.ts

Expected: focused specs execute. Observed: still blocked before tests run by `TypeError: configSet.processWithEsbuild is not a function` in `jest-preset-angular` setup.

    npx tsc -p src/tsconfig.spec.json --noEmit

Expected: spec TypeScript compiles. Observed: still blocked by unrelated existing spec errors in admin, collection, cube, onion dashboard-item, filesystem, and entity tests.

    git diff --check

Expected and observed: passed.

## Idempotence and Recovery

Most work is additive. If interrupted, inspect `git status --short` and continue from the first unchecked `Progress` item. The shared card can be removed independently from dashboard integration if necessary. Because dashboard dismissal is in memory, reloading the app or logging in again restores visibility for manual verification.

Do not modify or remove the existing untracked `plans/agentic-builder-dashboard-entry.execplan.md` unless the user explicitly asks for that separate plan to be reconciled.

## Artifacts and Notes

- New floating announcement usage on the author dashboard routes primary action to `/onion/ai-object-builder`.
- The secondary `Dismiss` button hides the announcement through `hideAgenticBuilderAnnouncement()` and writes `Hide AI Announcemednt = "1"` to localStorage.
- The top-right close control hides the announcement through `dismissAgenticBuilderAnnouncement()` without writing localStorage.
- `/onion/ai-object-builder` route/page files are intentionally excluded from this PR and belong to `feature/sc-39646/agentic-builder-dashboard-entry-point-for-new`.

## Interfaces and Dependencies

- New shared component: `FeatureHighlightCardComponent`.
- Dashboard integration: `DashboardComponent` template, class, and styles.
- Dashboard preference service: localStorage-backed service under `src/app/onion/dashboard/services`.
- Angular dependencies: `CommonModule` for structural directives and standard Angular inputs/outputs.
- No backend, environment, guard, interceptor, or route contract changes are expected.
