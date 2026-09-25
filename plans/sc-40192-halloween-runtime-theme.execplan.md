# SC-40192: Runtime Halloween Theme System

## Purpose / Big Picture

CLARK needs an optional Halloween appearance that users can toggle year-round, persist across sessions, and use without compromising readability, keyboard navigation, or the existing default appearance. The visible result is a dark application canvas with Pumpkin Orange actions, accessible Light Purple links, Slime Green focus indicators, and unchanged semantic success/warning/error meanings.

This plan implements the launch-critical foundation from Shortcut Epic 40192: semantic runtime tokens, an early preference application path, an accessible selector in the primary navigation, token-aware global/shared shell styling, scoped Angular Material theme output, contributor documentation, and rollout controls. It deliberately does not mechanically rewrite 264 scattered Sass/CSS files or redesign feature layouts. Existing hard-coded, feature-specific colors remain legacy work unless a global semantic override can safely cover them.

## Progress

- [x] (2026-09-22 09:10Z) Read Epic 40192 and all story objectives/acceptance criteria in Shortcut.
- [x] (2026-09-22 09:12Z) Inspected the Angular 18.2 standalone bootstrap, global Sass entry point, Material global theme, shell/navigation, and style footprint.
- [x] (2026-09-22 16:30Z) Created the semantic token contract and default/Halloween CSS custom-property definitions.
- [x] (2026-09-22 16:32Z) Added a storage-safe initializer and typed preference service with feature-flag fallback controls.
- [x] (2026-09-22 16:33Z) Added a keyboard-accessible native-checkbox selector to desktop and mobile primary navigation.
- [x] (2026-09-22 16:34Z) Scoped Angular Material Halloween component colors beneath the root selector and added shared/global shell token consumption.
- [x] (2026-09-22 16:35Z) Added contributor/rollout documentation and focused service/selector tests.
- [x] (2026-09-22 16:36Z) Verified formatting, generated the production build, and recorded the pre-existing test-runner blocker.
- [x] (2026-09-22 16:41Z) Removed calendar-based availability; the visible global toggle is now available year-round when enabled in central configuration.
- [x] (2026-09-22 16:47Z) Corrected reported Halloween contrast regressions in secondary navigation, browse cards/filters, dashboard surfaces, and shared text inputs using semantic tokens.
- [x] (2026-09-22 17:05Z) Migrated the remaining reported dropdown-filter, Home learning-content/hierarchy surfaces, and user-profile panels/forms from local fixed colors to semantic theme tokens.

## Surprises & Discoveries

- The workspace is Angular 18.2.14 and uses `bootstrapApplication`, not the repository's older NgModule default. New theme code should be standalone/provider-based while retaining existing local patterns.
- Global styles load `@angular/material/prebuilt-themes/pink-bluegrey.css` before `src/globals.scss`; no custom Material Sass theme currently exists.
- `main.ts` already synchronously reads localStorage before bootstrap, so applying `data-theme` there is the safest no-flash path.
- The project has 264 scattered styling files (~24k lines). The Epic explicitly excludes a broad Sass rewrite, so the runtime token layer must coexist with legacy `$` variables.
- The existing generic `clark-toggle-switch` is a focusable `div`, not a native switch. It is unsuitable for the new accessibility acceptance criteria; the selector will use a labeled native checkbox instead.
- The working tree already contains user-owned untracked `.agents/` and `skills-lock.json`, plus the previous agentic-panel work and execution plan. This work must preserve them.
- The existing Material integration already uses a custom M2 theme in `src/mat-input.scss`. Extending it with `mat.all-component-colors()` under `html[data-theme="halloween"]` compiled cleanly and added approximately 80 KB to the global stylesheet for the supported component colors.
- The Halloween selector is intentionally year-round. The central feature flag can still hide it and safely resolve stored Halloween preferences to default.
- The initial global migration bridge did not override higher-specificity legacy component styles, leaving white surfaces and dark legacy text in the secondary navbar, browse, and dashboard. These components now consume semantic variables directly instead of relying on a broad override.
- The same specificity problem affected the shared dropdown filter and several Home/Profile feature styles. Replacing their local surface, text, border, action, and selected-state declarations is safer than a global `!important` override and keeps their default appearance aligned with the token contract.
- The repository's Jest runner still fails before any test executes with `configSet.processWithEsbuild is not a function` in `jest-preset-angular`. Both new specs are blocked by this same pre-existing configuration mismatch.

## Decision Log

- Decision: Use semantic CSS custom properties on `html` and `html[data-theme="halloween"]`.
  Rationale: Properties cascade through legacy Angular component encapsulation and CDK overlay containers without every component importing a Sass module. The same contract can later be consumed by Tailwind.
  Date/Author: 2026-09-22 / Codex

- Decision: Keep the current default theme's visual tokens close to current values and provide a high-contrast Halloween override.
  Rationale: The epic requires a stable default appearance. Introducing a new default palette would combine a seasonal feature with a broad redesign.
  Date/Author: 2026-09-22 / Codex

- Decision: Apply the stored preference synchronously in `main.ts`, with `ThemeService` owning subsequent runtime state and persistence.
  Rationale: Dependency injection initializes after bootstrapping, while the root attribute must exist before the first visible render.
  Date/Author: 2026-09-22 / Codex

- Decision: Keep the Halloween toggle year-round and centrally configurable with a single feature flag.
  Rationale: A visible user-controlled toggle is more useful than a calendar-gated choice. Disabling the flag remains a safe rollback without deleting stored preferences.
  Date/Author: 2026-09-22 / Codex

- Decision: Use supported Angular Material Sass theming under `html[data-theme="halloween"]` and avoid Material-internal selectors.
  Rationale: It themes native controls and overlays while avoiding fragile `::ng-deep` customizations.
  Date/Author: 2026-09-22 / Codex

## Context and Orientation

`src/main.ts` initializes Sentry and checks a version cache before `bootstrapApplication(ClarkComponent, ...)`. It is the only place capable of applying the resolved theme before Angular renders. `src/app/clark.component.html` owns the application shell and places the standalone primary and secondary navbars ahead of the routed view.

`src/globals.scss` is loaded as a global style entry after Material's prebuilt `pink-bluegrey.css`; it imports `src/_vars.scss`, which contains the legacy Sass color variables used throughout the application. The new `src/styles/theme/` folder will contain only global semantic token definitions, Material theme configuration, and accessibility-safe generic UI skins. It will not replace feature Sass imports.

`src/app/core/theme-module/theme.service.ts` owns the selected versus resolved theme. It sets `document.documentElement.dataset.theme`, stores `clark.center:theme`, exposes a typed observable for standalone/legacy consumers, and consults a single configuration flag. `src/app/components/theme-selector/` is a standalone presentational control rendered in `PrimaryNavbarComponent` desktop and mobile markup.

The active theme flows as follows:

    synchronous bootstrap read -> html[data-theme] -> global token override and Material selector
    -> ThemeService state -> navigation selector -> localStorage + html[data-theme]
    -> legacy component CSS that consumes global shell/token overrides

No route, guard, backend API, auth, entity, environment replacement, or collection-specific nested theme contract changes in this phase. Existing collection branding remains independent; token values affect surrounding surfaces rather than logo/image assets.

## Plan of Work

1. Establish the semantic contract in `src/styles/theme/_tokens.scss`: canvas, surface, text, border, action, focus, semantic-status, and shadow variables for both themes. Document approved palette pairings and states alongside the declarations.
2. Add `_material.scss` using Angular Material's Sass API. Keep default prebuilt styling in place for stability; emit the Halloween system/component theme only inside `html[data-theme="halloween"]` so CDK overlay content inherits it from the root ancestor.
3. Create typed theme identifiers/configuration and `ThemeService`. Normalize invalid storage values, prevent unavailable Halloween activation, support an injected/testing clock, and make DOM/storage operations safe for test environments.
4. Add a small synchronous `applyInitialTheme()` helper called before `bootstrapApplication`. This reads the same storage key/configuration and writes the root data attribute before styles paint.
5. Build `ThemeSelectorComponent` with a native checkbox and visible label. Use `aria-describedby`, `aria-checked` through the checkbox, and a conventional label/input relationship. Show it whenever the feature flag is enabled, and place it in both primary-navigation breakpoints.
6. Update `globals.scss`, primary navigation styles, and shell-level common styles to consume semantic custom properties for canvas, text, links, buttons, forms, popup surfaces, focus rings, and overlays. Favor shallow, class-based selectors; leave local feature Sass untouched.
7. Write service and selector tests following the repository's Jest style. Add `docs/theming.md` explaining the contract, migration rules, Tailwind compatibility, feature-flag behavior, QA matrix, and rollback behavior.
8. Run formatting, a focused test attempt, and `npx ng build clark`. Inspect output/errors and update this plan with concrete results.

## Concrete Steps

1. Add `src/styles/theme/_tokens.scss`, `_material.scss`, and `_shared.scss`; import them from `src/globals.scss`.
2. Add `src/app/core/theme-module/theme.types.ts`, `theme.config.ts`, `theme.service.ts`, and a focused spec.
3. Add `src/app/core/theme-module/theme-initializer.ts` and call it before bootstrapping in `src/main.ts`.
4. Generate or add a standalone `ThemeSelectorComponent`; connect it to `PrimaryNavbarComponent` imports, template, and stylesheet.
5. Update global/nav theme-aware colors and focus states using `var(--theme-...)` only; do not bulk-replace Sass variables in feature files.
6. Add `docs/theming.md` with token/state tables, usage examples, migration guardrails, availability configuration, rollout and rollback instructions.
7. Run Prettier/checks, targeted tests, and `npx ng build clark`.

## Validation and Acceptance

- With no preference, the root element receives `data-theme="default"` before Angular bootstraps and existing default visuals remain available.
- Selecting Halloween applies `data-theme="halloween"` immediately, persists it, and survives a restart.
- A malformed value or a disabled Halloween theme resolves safely to default; changing the central feature flag disables the option without storage clearing.
- Desktop and mobile navigation expose a labelled native checkbox that is keyboard-operable and visibly focused.
- Halloween normal text uses Soft White or Muted Lavender Gray on Midnight Black; orange action backgrounds use dark foregrounds; focus is Slime Green; semantic success/warning/error retain distinct roles.
- Material system/component styles and global popup/overlay surfaces follow the root selector.
- Auth, Cube, Collection, Onion, and Admin receive the global canvas/text/surface baseline; detailed route screenshots and full visual-regression automation remain a follow-up QA exercise absent an existing browser runner.
- `npx ng build clark` passes. Focused tests are run if the repository test transformer permits them; otherwise document the pre-existing blocker.

## Idempotence and Recovery

All runtime theme state is client-side and reversible. Removing `data-theme` or selecting default restores default token values immediately. Stored preferences are namespaced with a single key and invalid values are ignored. To roll back the optional experience, set `halloweenEnabled` false in the central config; the service resolves existing stored values to default and leaves no required user cleanup. Revert only the new theme files and navigation/global-style integrations if a regression is found. No remote data changes occur.

## Outcomes & Retrospective

Implemented the foundation and launch controls for Epic 40192 in one branch. `src/styles/theme/_tokens.scss` defines a stable semantic contract for the unchanged default visual language and an accessible Halloween override. `ThemeService` and `applyInitialTheme()` synchronize the root `data-theme` attribute, localStorage preference, a year-round toggle, and safe feature-flag fallback behavior. `ThemeSelectorComponent` is a native checkbox with a visible label and focus treatment, mounted in both desktop and mobile primary navigation paths.

The Angular Material integration extends the pre-existing M2 Sass setup instead of adding a new Material stack. Halloween component colors are scoped under the root theme selector, allowing CDK overlay descendants to inherit them. The global migration bridge and top-level Auth, Cube, Onion, Admin, and maintenance styles consume semantic tokens. Collection branding is intentionally left independent; the documentation names it as an incremental-audit boundary rather than silently overriding logos/assets.

Validation completed: Prettier check passed, `git diff --check` passed, and `npx ng build clark` passed. The targeted Jest command reached the existing `jest-preset-angular` transformer failure before compiling either test, so no unit-test assertions executed. No browser/E2E runner exists in a working state for screenshots or route-by-route visual regression evidence; `docs/theming.md` records the required rollout QA matrix.

## Artifacts and Notes

- Epic: Shortcut 40192 — “Add a toggle for Halloween Color Scheme”
- Theme token entry: `src/styles/theme/_tokens.scss`
- Material theme entry: `src/styles/theme/_material.scss`
- Runtime owner: `src/app/core/theme-module/theme.service.ts`
- Early initialization: `src/app/core/theme-module/theme-initializer.ts`
- Global selector: `src/app/components/theme-selector/`
- Contributor/rollout documentation: `docs/theming.md`

## Interfaces and Dependencies

```ts
export type AppTheme = "default" | "halloween";

export interface ThemeConfiguration {
    halloweenEnabled: boolean;
}

class ThemeService {
    readonly activeTheme$: Observable<AppTheme>;
    readonly halloweenEnabled: boolean;
    setTheme(theme: AppTheme): void;
    toggleHalloweenTheme(enabled: boolean): void;
}
```

The CSS token interface is the stable boundary shared by Sass now and a future Tailwind migration later. Components consume `var(--theme-...)` at the point where their existing local hard-coded style needs runtime behavior; they must not consume raw Halloween palette values or add new theme-specific selectors.
