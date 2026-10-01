import { ThemeConfiguration } from "./theme.types";

/**
 * The single runtime control for the optional Halloween theme.
 *
 * Set `halloweenEnabled` to false to immediately fall back to the default
 * theme without removing the stored preference or token infrastructure.
 */
export const THEME_CONFIGURATION: ThemeConfiguration = {
    halloweenEnabled: true,
};
