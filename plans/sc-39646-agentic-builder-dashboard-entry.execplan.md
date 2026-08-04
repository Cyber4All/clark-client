# SC-39646 Agentic Builder Dashboard Entry

## Purpose / Big Picture

Add the dashboard entry point and route-owned page for the CLARK AI Object Builder. This branch owns the direct dashboard button and `/onion/ai-object-builder` route/page, while the separate reusable-announcement branch owns the dismissible feature announcement.

## Progress

- [x] 2026-08-04: Confirmed this work is on `feature/sc-39646/agentic-builder-dashboard-entry-point-for-new`.
- [x] 2026-08-04: Found the existing inline dashboard banner and confirmed it is dashboard-specific.
- [x] 2026-08-04: Remove the inline dashboard banner, its dashboard preference flow, and banner-specific tests.
- [x] 2026-08-04: Add the lazy-loaded AI Object Builder route and page.
- [x] 2026-08-04: Add the `AI Object Builder` dashboard list action between `Filter` and `New +`.
- [x] 2026-08-04: Validate formatting, type checking, linting, and focused tests where repo tooling allows.

## Surprises & Discoveries

- The branch had no existing `src/app/onion/ai-object-builder` folder, so the builder page needs to be introduced here.
- The inline dashboard banner currently uses localStorage through `AgenticBuilderPreferencesService`; that behavior now belongs to the reusable announcement PR instead of this dashboard-entry PR.
- Focused Jest specs are still blocked before test execution by the existing repo setup error `TypeError: configSet.processWithEsbuild is not a function`.
- Repo-wide spec TypeScript compilation is blocked by unrelated legacy spec errors, but it did not report errors in the files added or edited for this story.

## Decision Log

- Keep the dashboard `New +` button pointed at `/onion/learning-object-builder`; it remains the manual builder entry.
- Add a separate outlined `AI Object Builder` button so users can intentionally open the AI-assisted flow from the dashboard.
- Use a lazy-loaded NgModule route to match the surrounding Onion routing pattern.
- Keep the first builder page UI local-only for now: selected files are shown from browser state, and the empty state shows no uploaded files.

## Outcomes & Retrospective

The dashboard no longer renders the wide Agentic Builder announcement banner. The draft list action area now includes a distinct `AI Object Builder` button between `Filter` and `New +`, with `New +` still targeting the manual builder. The branch now owns a lazy-loaded `/onion/ai-object-builder` route and a responsive, accessible first-step upload page that shows an empty uploaded-files state until the user selects or drops files.

## Context and Orientation

The relevant feature area is `src/app/onion`. The dashboard route lazy-loads `src/app/onion/dashboard/dashboard.module.ts`, whose standalone `DashboardComponent` renders the splash and draft/released object lists. The draft list actions live in `src/app/onion/dashboard/components/list/list.component.html`.

Routing for Onion lives in `src/app/onion/onion.routing.ts` and currently lazy-loads the dashboard and manual learning-object builder. The new AI Object Builder page should be another authenticated Onion child route.

This work touches route configuration and dashboard UI, but it does not change API contracts, guards, interceptors, global environment config, or backend integration.

## Plan of Work

Remove the dashboard-specific inline announcement because discovery is now handled by the reusable feature announcement PR. Then add a dedicated dashboard action for users who already know they want to start the AI-assisted flow. Finally, add the route-owned builder page so the new dashboard action and the separate announcement CTA have a valid target.

## Concrete Steps

1. Remove `clark-agentic-builder-card` from `dashboard.component.html`.
2. Remove `AgenticBuilderCardComponent`, `AgenticBuilderPreferencesService`, and related state/methods from `DashboardComponent`.
3. Delete the now-unused banner component and preference service files/specs if no references remain.
4. Add `/onion/ai-object-builder` to `onion.routing.ts` with `AuthGuard`.
5. Add `src/app/onion/ai-object-builder` module, routing file, component, template, SCSS, and focused component spec.
6. Add an `AI Object Builder` button between `Filter` and `New +` in the dashboard draft list actions.
7. Update the list component spec to verify both manual and AI builder route targets.

## Validation and Acceptance

- Visible dashboard behavior: no wide inline AI banner appears above the tabs/list.
- Visible dashboard behavior: draft list actions show `Filter`, `AI Object Builder`, and `New +`.
- Routing behavior: `AI Object Builder` navigates to `/onion/ai-object-builder`.
- Builder page behavior: no selected files shows `Uploaded files (0)` and a no-files empty state; selected files render real filename and size.
- Run Prettier on touched files.
- Run TypeScript app compilation with `npx tsc -p src/tsconfig.app.json --noEmit`.
- Run targeted Angular lint for touched TypeScript and HTML files.
- Run focused Jest specs where the repository test setup allows.
- Run `git diff --check`.

## Idempotence and Recovery

The change is local to dashboard UI and Onion routing. If interrupted, check `git status --short`, then verify the dashboard no longer references `AgenticBuilderCardComponent` or `AgenticBuilderPreferencesService` before deleting related files. The builder route and page can be added independently once the route path is stable.

## Artifacts and Notes

The reusable feature-highlight announcement PR can link to `/onion/ai-object-builder`, but it should not own the builder page files. This branch should not implement persistent announcement dismissal.

## Interfaces and Dependencies

- Depends on existing Angular Router lazy-loading and `AuthGuard`.
- Uses Font Awesome icons already configured in `angular.json`.
- Uses local browser `File` objects only; no backend upload or generation API is introduced in this step.
