# Color schemes

CLARK currently ships one application color scheme. Its semantic CSS custom properties are defined in `src/styles/theme/_tokens.scss` on `html`. Components use those properties so their colors can change without rewriting feature styles. There is currently no application-wide scheme selector or stored scheme preference.

Collection pages also have local `data-theme="dark"` styles for their own branding. Those are separate from an application-wide color scheme.

## Use semantic colors in components

Choose a token for its purpose rather than copying a palette color:

| Need | Token |
| --- | --- |
| Application background | `--theme-background` |
| Card, dialog, menu layer | `--theme-foreground` / `--theme-foreground-raised` |
| Primary and muted text | `--theme-text` / `--theme-text-muted` |
| Boundaries and inputs | `--theme-border` / `--theme-border-strong` |
| Primary action | `--theme-action-primary` + `--theme-action-on-primary` |
| Secondary action | `--theme-action-secondary` + `--theme-action-on-secondary` |
| Link | `--theme-link` |
| Keyboard focus | `--theme-focus` |
| Semantic feedback | `--theme-status-success`, `--theme-status-warning`, `--theme-status-error`, `--theme-status-info` |

```scss
.example-card {
    color: var(--theme-text);
    background: var(--theme-foreground);
    border: 1px solid var(--theme-border);

    &:focus-within {
        outline: 3px solid var(--theme-focus);
        outline-offset: 3px;
    }
}
```

Keep feature styles on semantic tokens where practical. Existing legacy Sass variables can be migrated as their components are touched. Status must never be conveyed by color alone; retain labels, icons, validation messages, and visible selected states.

## Add an application color scheme

1. Add a named override block in `src/styles/theme/_tokens.scss`, scoped to the root element. Define every semantic token from the default `html` block, including text on action backgrounds, focus, border, overlay, and status colors. Also set `color-scheme` to match the native control appearance. For example:

   ```scss
   html[data-theme="new-scheme"] {
       color-scheme: dark;
       --theme-background: #171a20;
       --theme-foreground: #242933;
       // Define the rest of the semantic tokens from the html block here.
   }
   ```

2. Add a typed list of supported application schemes and a single service to select one. Set `document.documentElement.dataset.theme` from that service. Validate saved values against the list so removed or unknown schemes fall back to the default. If the choice persists, use one namespaced `localStorage` key and handle storage being unavailable.
3. Apply the saved selection in `src/main.ts` before Angular bootstraps to avoid a flash of the default scheme. Mount an accessible scheme control in both desktop and mobile layouts of `src/app/components/primary-navbar/primary-navbar.component.html` if users should be able to switch schemes.
4. If Angular Material needs different colors, define a Material theme with its supported Sass API and scope `mat.all-component-colors(...)` under the same `html[data-theme="new-scheme"]` selector in `src/mat-input.scss`. This also covers CDK overlays rooted under `html`. Avoid styling Material internals directly.
5. Check the collection-specific override in `src/styles/theme/_tokens.scss`. Keep collection branding intentional while allowing shared navigation and controls to use the selected scheme.
6. Test default and new schemes across authentication, Cube, collection, Onion/builder, and Admin views. Check focus indicators, contrast, forms, dialogs, menus, loading/error/empty states, and both navbar layouts. Normal text needs 4.5:1 contrast; large text and essential non-text UI need 3:1 where applicable.

Keep all application scheme state at the root rather than setting `data-theme` independently from feature components. Do not add raw palette colors to feature styles when a semantic token serves the same purpose. Future utility or Tailwind styles should consume this token contract rather than introduce another palette or persistence mechanism.
