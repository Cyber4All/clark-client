# Runtime theming

CLARK has a semantic runtime theme contract. The current themes are `default` and the optional `halloween` theme. The active selection is expressed on the root element:

```html
<html data-theme="halloween"></html>
```

The root selector is set synchronously before Angular bootstraps and is maintained by `ThemeService`. Do not set `data-theme` from individual feature components.

## Consuming semantic tokens

Tokens are defined in `src/styles/theme/_tokens.scss`. Use their semantic purpose, not a raw palette color:

| Need                       | Token                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| Application background     | `--theme-canvas`                                                                                  |
| Card, dialog, menu surface | `--theme-surface` / `--theme-surface-raised`                                                      |
| Primary and muted text     | `--theme-text` / `--theme-text-muted`                                                             |
| Boundaries and inputs      | `--theme-border` / `--theme-border-strong`                                                        |
| Primary action             | `--theme-action-primary` + `--theme-action-on-primary`                                            |
| Secondary action           | `--theme-action-secondary`                                                                        |
| Link                       | `--theme-link`                                                                                    |
| Keyboard focus             | `--theme-focus`                                                                                   |
| Semantic feedback          | `--theme-status-success`, `--theme-status-warning`, `--theme-status-error`, `--theme-status-info` |

```scss
.example-card {
    color: var(--theme-text);
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);

    &:focus-within {
        outline: 3px solid var(--theme-focus);
        outline-offset: 3px;
    }
}
```

Do not add a Halloween-specific selector to a feature component, and do not add new hard-coded colors when a semantic token applies. Existing legacy Sass variables remain supported during incremental migration; migrate touched styles only.

## Palette and accessibility rules

The Halloween canvas is Midnight Black (`#0D0D0D`). Soft White (`#F7F3EF`) is primary text and Muted Lavender Gray (`#BDB5C2`) is secondary text. Pumpkin Orange (`#FF7518`) is the primary action color and always pairs with dark foreground text. Light Purple (`#C77DFF`) is the accessible text/icon accent; Witch Purple (`#6A0DAD`) and Blood Red (`#4C0027`) are filled/decorative colors, not text on Midnight Black. Slime Green (`#39FF14`) is reserved for sparing keyboard focus/highlights and does not redefine success.

Status is never communicated by color alone. Preserve visible labels, icons, disabled attributes, validation messages, and selected-state affordances. Normal text must meet 4.5:1 contrast; large text and essential non-text UI need 3:1 where applicable.

## Toggle availability and rollback

`src/app/core/theme-module/theme.config.ts` is the sole availability control. The Halloween toggle is available year-round when `halloweenEnabled` is true. Set it to `false` to hide the selector and resolve Halloween preferences to the default theme immediately. The stored preference remains intact, so re-enabling the control does not require users to clear storage.

For rollout:

1. Verify `halloweenEnabled` is true.
2. Test default and Halloween themes on authentication, Cube, collection, Onion/builder, and Admin routes.
3. Check keyboard focus, text contrast, overlays, dialogs, menus, forms, loading/error/empty states, and collection logos on dark surfaces.
4. If a release issue occurs, set `halloweenEnabled` to `false`, deploy, and verify existing users resolve to default without clearing local storage.

## Angular Material and future Tailwind work

Material's Halloween colors are emitted through its supported Sass theming API in `src/styles/theme/_material.scss`, scoped beneath the root selector so CDK overlays inherit the selected appearance. Do not introduce Material-internal selectors or new `::ng-deep` color overrides.

A future Tailwind migration must consume this same token contract (for example `bg-[var(--theme-surface)]` or theme-aware design tokens). It must not create a competing palette or persistence mechanism.

## Legacy migration guardrails

- Keep intentional collection-brand colors for logos and branded media; use semantic tokens for surrounding text and surfaces.
- Migrate feature Sass only when that area is being touched or audited.
- Retain stable layout, density, typography, and non-theme behavior.
- Add both default and Halloween visual evidence when completing a themed feature-area story.
