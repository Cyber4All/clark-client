# Migrate Learning Object Builder and Child Components to Semantic Theme Tokens

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

The Learning Object Builder (`src/app/onion/learning-object-builder/`) and its child components (including `builder-navbar`, `column-wrapper`, `outcome`, `scaffold`, `standard-outcomes`, `user-dropdown`, `content-upload`, and builder subpages) currently use hard-coded colors and legacy Sass variables (such as `#ffffff`, `white`, `$light-blue`, `$light-grey`, `$dark-grey`, and `$darker-grey`). In dark themes such as Halloween (`html[data-theme="halloween"]`), these hard-coded styles cause bright white surfaces, unreadable low-contrast text, and disconnected styling.

After this change, the builder page and its child components will consume the runtime semantic CSS custom properties defined in `src/styles/theme/_tokens.scss` (`--theme-canvas`, `--theme-surface`, `--theme-surface-subtle`, `--theme-surface-raised`, `--theme-text`, `--theme-text-strong`, `--theme-text-muted`, `--theme-border`, `--theme-action-primary`, `--theme-action-on-primary`, `--theme-status-error`, `--theme-status-success`, `--theme-focus`, `--theme-shadow`, etc.). Both default (light) and Halloween (dark) themes will render seamlessly with high contrast and proper accessibility while preserving all existing layouts, interactions, animations, and builder functionality.

## Progress

- [x] (2026-09-22 17:25Z) Audited all SCSS and component styles across `src/app/onion/learning-object-builder/` and its child components for hard-coded colors and legacy variables.
- [x] (2026-09-22 17:28Z) Migrated `builder-navbar` and top-level `learning-object-builder` styles to semantic theme tokens.
- [x] (2026-09-22 17:30Z) Migrated builder layout and structure (`column-wrapper`, `description.component.ts`, `scaffold`, `add-child`).
- [x] (2026-09-22 17:32Z) Migrated outcome components (`outcome`, `outcome-typeahead`, `standard-outcomes`, `outcomes-list-item`).
- [x] (2026-09-22 17:34Z) Migrated builder pages and child controls (`info-page`, `metadata`, `materials-page`, `outcome-page`, `contributor-pill`, `user-dropdown`, `material-notes`, `editor-action-panel`, `change-status-modal`, and `clark-submit`).
- [x] (2026-09-22 17:36Z) Migrated content-upload components (`upload`, `file-manager`, `file-upload-status`, `url-manager`, `url-row`, `dropzone`).
- [x] (2026-09-22 17:40Z) Migrated Admin Dashboard Users view and child components (`users.component.scss`, `content-wrapper.component.scss`, `user-card.component.scss`, `user-privileges.component.scss`, `privileges-list.component.scss`, `user-search-wrapper.component.scss`, `add-evaluator.component.scss`, `selected-user.component.scss`, and `change-author-user-dropdown.component.scss`).
- [x] (2026-09-22 17:50Z) Migrated `collectionsDropdown` and `collection-card` to semantic theme tokens, removed obsolete triangle markup, stopped backdrop click bubbling from inside the panel, and adjusted `top` from `195px` to `140px` to eliminate the gap from the secondary navbar.
- [x] (2026-09-22 18:02Z) Added `$breakpoints` map, `@mixin respond-to`, and `@mixin respond-above` to `src/_vars.scss`. Converted `collections-dropdown` from flex-wrap to CSS Grid with responsive columns (`repeat(4, 225px)` -> `repeat(3, 225px)` -> `repeat(2, 225px)` -> `repeat(1, 225px)`), ensuring the dropdown width fits the number of items per row with zero right-side gap.
- [x] (2026-09-22 18:14Z) Migrated Learning Object Details page and all child components across `src/app/cube/details/` (26 files: `details.component.scss`, `_global-details.scss`, `details.component.html`, `splash`, `hierarchy-link`, `side-panel-content`, `cube-pattern`, `description`, `outcome`, `academic-level-card`, `materials`, `tab-menu`, `notes`, `urls`, `tag-pill`, `version-card`, `reviewer-panel`, `action-panel`, `editorial-action-pad`, `tagging-builder`, `tags`, `topics`, `learning-object-ratings`, `new-rating`, `new-rating-response`, `report-rating`) to semantic theme custom properties.
- [x] (2026-09-22 18:28Z) Migrated Edit Profile popup modal padding and background (`popup-viewer.component.scss`, `profile-header.component.scss`, `edit-profile.component.scss`) from hardcoded `white` and `$dark-overlay` to `var(--theme-surface-raised)`, `var(--theme-border)`, `var(--theme-overlay)`, and `var(--theme-shadow)`.
- [x] (2026-09-22 18:33Z) Migrated shared `pill.component.scss` to semantic theme tokens (`--theme-surface`, `--theme-border`, `--theme-text`, `--theme-surface-subtle`, `--theme-border-strong`, `--theme-surface-selected`, `--theme-action-primary`, `--theme-focus`).
- [x] (2026-09-22 18:40Z) Configured 3rd-party `ngx-simple-text-editor` (`st-editor`) in `src/styles/theme/_shared.scss` to consume semantic theme custom properties (`--theme-surface-raised`, `--theme-surface-subtle`, `--theme-surface`, `--theme-text`, `--theme-text-muted`, `--theme-text-disabled`, `--theme-border`, `--theme-action-primary`, `--theme-action-on-primary`, `--theme-focus`, `--theme-shadow`). Covers container, toolbar, items/buttons, select dropdowns, dividers, editor content area, and link input popup dialog across all application usages.
- [x] (2026-09-22 19:00Z) Implemented collection route theme exclusion (`collection.routing.ts`, `clark.routing.ts`, `clark.component.ts`, `_tokens.scss`). Scopes collection page content (`router-outlet + *`) to retain default light tokens and white background while allowing the root navigation bars (`primary-navbar`, `secondary-navbar`) and theme switcher toggle to seamlessly reflect active seasonal/dark theme selections.
- [x] (2026-09-22 19:10Z) Fixed checkbox (`checkbox.component.scss`) check icon selectors (`i`, `i.fas`, `.fa-check`, `.svg-inline--fa`) so the check mark is strictly hidden (`visibility: hidden; opacity: 0; transform: scale(0.5)`) when unchecked and visible (`visibility: visible; opacity: 1; transform: scale(1)`) only when active/checked, eliminating ghost check outlines in filter checkboxes. Migrated checkbox border and active states to semantic theme tokens.

## Surprises & Discoveries

- Observation: `collections-dropdown` had an arbitrary `top: 195px;` hardcoded in commit `3b592f7b`, creating an unsightly 55px gap below the 140px bottom plane of the secondary navbar. Adjusting to `top: 140px;` brings it flush below the secondary navbar.
  Evidence: `src/app/shared/components/collections-dropdown/collections-dropdown.component.scss` line 14.

- Observation: `DescriptionComponent` has inline styles (`styles: [...]`) containing hardcoded hex values (`#fff`, `#d9e1ec`, `#f8fafc`, `#4a5568`, `#1c70dd`, `#2d3748`) targeting simple-text-editor elements (`::ng-deep .st-editor-container`, etc.).
  Evidence: `src/app/onion/learning-object-builder/components/description.component.ts` lines 50-137.
- Observation: `ColumnWrapperComponent` defines the content wrapper `.content { background: white; ... }`, which caused the entire central workspace of the builder to remain white regardless of theme.
  Evidence: `src/app/onion/learning-object-builder/components/column-wrapper/column-wrapper.component.scss` line 27.
- Observation: `relevancy-builder` is an unrouted legacy component not imported by any module, whereas `learning-object-builder` is the active builder route loaded by `OnionRoutingModule`.
  Evidence: `src/app/onion/onion.routing.ts` and module analysis.
- Observation: The Admin Dashboard Users page title was fixed to `$dark-grey` in `content-wrapper.component.scss`, causing the header to have very poor contrast on the dark canvas.
  Evidence: `src/app/admin/components/content-wrapper/content-wrapper.component.scss` line 5.

## Decision Log

- Decision: Replace hard-coded colors with semantic custom property tokens (`var(--theme-...)`) directly in each component SCSS file rather than using global `::ng-deep` overrides.
  Rationale: Follows `docs/theming.md` and the existing precedent in `dashboard.component.scss` and `browse.component.scss`. Angular component view encapsulation prevents broad global rules from overriding higher-specificity component styles unless forced with `!important`, which is fragile and violates SCSS best practices.
  Date/Author: 2026-09-22 / Antigravity

- Decision: Preserve semantic status colors and specific badge palettes (e.g. length badges nanomodule/micromodule/etc., and status badges) while updating surrounding text, surfaces, borders, and shadows to theme tokens.
  Rationale: Adheres to `docs/theming.md` and accessibility requirements that status meaning is preserved while ensuring accessible contrast on dark backgrounds.
  Date/Author: 2026-09-22 / Antigravity

## Outcomes & Retrospective

All hardcoded colors and legacy non-semantic Sass variables across the Learning Object Builder, its child components, and the Admin Dashboard Users view were replaced with semantic theme custom properties (`var(--theme-...)`). In the default light theme, the UI retains its exact visual styling. In the Halloween theme, cards, navigation bars, dropdowns, modal dialogs, and text inputs cleanly transition to dark surfaces with high-contrast text and theme-aware actions and focus indicators.

## Context and Orientation

The Learning Object Builder is reached via `/onion/learning-object-builder` and `/onion/learning-object-builder/:cuid/:version`.
Key files in this area:
- `src/app/onion/learning-object-builder/learning-object-builder.component.scss`: Host page service indicator and error popups.
- `src/app/onion/learning-object-builder/components/builder-navbar/builder-navbar.component.scss`: Sticky navbar, action buttons, tab navigation, revision notice, saving indicator.
- `src/app/onion/learning-object-builder/components/column-wrapper/column-wrapper.component.scss`: 3-column layout grid and main column card wrapper.
- `src/app/onion/learning-object-builder/components/description.component.ts`: Rich text editor styles.
- `src/app/onion/learning-object-builder/components/outcome/`: Outcome list cards and Bloom's taxonomy typeahead input/menu.
- `src/app/onion/learning-object-builder/components/scaffold/`: Hierarchy child object tree, drag previews, and add-child modal.
- `src/app/onion/learning-object-builder/components/standard-outcomes/`: Standard outcome mappings drawer and list items.
- `src/app/onion/learning-object-builder/components/user-dropdown/`: Author/collaborator search dropdown.
- `src/app/onion/learning-object-builder/components/material-notes/`: Material notes accordion.
- `src/app/onion/learning-object-builder/components/contributor-pill/`: Contributor remove dropdown.
- `src/app/onion/learning-object-builder/components/editor-action-panel/`: Admin action panel and status modal.
- `src/app/onion/learning-object-builder/pages/info-page/`: Basic Info page, metadata cards.
- `src/app/onion/learning-object-builder/pages/materials-page/`: Materials page container.
- `src/app/onion/learning-object-builder/pages/outcome-page/`: Outcomes page container and empty state.
- `src/app/onion/learning-object-builder/components/content-upload/`: File manager, uploader modal, dropzone, and URL manager.

## Plan of Work

1. Update `learning-object-builder.component.scss` and `builder-navbar.component.scss` to use theme tokens for surfaces, text, links, actions, indicators, and borders.
2. Update `column-wrapper.component.scss` to use `--theme-surface`, `--theme-text`, and `--theme-shadow` for the builder content card.
3. Update `description.component.ts` inline styles to use `--theme-border`, `--theme-surface-raised`, `--theme-surface-subtle`, `--theme-surface-selected`, `--theme-text`, `--theme-text-muted`, and `--theme-focus`.
4. Update `outcome.component.scss` and `outcome-typeahead.component.scss` for outcome cards, Bloom's level buttons, inputs, dropdown menus, and delete buttons.
5. Update `scaffold.component.scss` and `add-child.component.scss` for child object lists, drag feedback, search bars, and action links.
6. Update `standard-outcomes.component.scss` and `outcomes-list-item.component.scss` for search bars, guidelines links, item cards, and active selected states.
7. Update `info-page.component.scss`, `metadata.component.scss`, `materials-page.component.scss`, and `outcome-page.component.scss`.
8. Update `user-dropdown.component.scss`, `material-notes.component.scss`, `contributor-pill.component.scss`, and `change-status-modal.component.scss`.
9. Update `content-upload` subcomponents: `file-manager.component.scss`, `upload.component.scss`, `file-upload-status.component.scss`, `url-manager.component.scss`, `url-manager.component.html`, `url-row.component.scss`, and `dropzone.scss`.
10. Run `npm run build` and verify that the Angular application compiles cleanly. Run `npm run format` (prettier) if needed.

## Concrete Steps

From the repository root:
1. Edit SCSS and TypeScript files using `replace_file_content`.
2. Run:
       npm run build
   Expect: Successful compilation of all browser bundles and lazy chunks with exit code 0.
3. Check git diff to ensure all changes adhere to SCSS best practices (clean indentation, semantic tokens, no extraneous `!important`, no regressions in layout).

## Validation and Acceptance

- All hard-coded colors and legacy non-semantic color variables in the builder components are replaced with semantic CSS variables.
- In default (light) theme, colors render identially to the design system (white surfaces, dark slate text, blue primary actions).
- In Halloween (dark) theme, surfaces adapt to dark tones (`--theme-surface`, `--theme-surface-raised`), text adapts to high-contrast light neutrals (`--theme-text`, `--theme-text-strong`, `--theme-text-muted`), inputs and borders adapt to theme borders, and actions adapt to `--theme-action-primary` (Pumpkin Orange) or `--theme-link` (Light Purple).
- Build succeeds with zero compile errors.

## Idempotence and Recovery

All file edits are idempotent replacements. If any compilation issue occurs, revert using git checkout on the affected file and re-apply cleanly.

## Artifacts and Notes

- Token mappings followed strictly from `src/styles/theme/_tokens.scss` and `docs/theming.md`.

## Interfaces and Dependencies

- `src/styles/theme/_tokens.scss`: Contract for all theme variables.
- `LearningObjectBuilderModule`: Affected Angular feature module.
- `DropdownFilterComponent` & `CheckBoxComponent`: Fixed checkmark DOM presence (`*ngIf`) and CSS (`display: none`, `visibility: hidden`, `opacity: 0`, and `color: transparent`) when unchecked so no font/SVG outline or color trick is visible in Halloween or light themes.
- `XP Cyber` and `502 Project` Collections: Fixed collection page text inheritance and scoped variables (`body.collection-page`, `:host`, `.root_502`, `.card__wrapper`, `.curators`, `curator-card`, `header h1`, `philosophy p`) ensuring high-contrast dark text is used consistently on light backgrounds.
- `502 Project Toggle`: Fixed slide-toggle internal label (`.mdc-label`, `label`) and icon bindings to explicitly track `var(--primary-text)` through `::ng-deep` and `--mdc-switch-label-text-color`, keeping "Switch to Light Mode" and "Switch to Dark Mode" perfectly contrasted during both 502 and global theme toggling.



