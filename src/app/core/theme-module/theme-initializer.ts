import { THEME_CONFIGURATION } from "./theme.config";
import {
    APP_THEMES,
    AppTheme,
    THEME_STORAGE_KEY,
    ThemeConfiguration,
} from "./theme.types";

type ThemeStorage = Pick<Storage, "getItem">;

export function isHalloweenThemeEnabled(
    configuration: ThemeConfiguration = THEME_CONFIGURATION,
): boolean {
    return configuration.halloweenEnabled;
}

export function resolveTheme(
    candidate: unknown,
    configuration: ThemeConfiguration = THEME_CONFIGURATION,
): AppTheme {
    if (!APP_THEMES.includes(candidate as AppTheme)) {
        return "default";
    }

    const theme = candidate as AppTheme;

    return theme === "halloween" && !isHalloweenThemeEnabled(configuration)
        ? "default"
        : theme;
}

export function readStoredTheme(storage?: ThemeStorage): string | null {
    try {
        return storage?.getItem(THEME_STORAGE_KEY) ?? null;
    } catch {
        return null;
    }
}

export function applyThemeAttribute(
    theme: AppTheme,
    documentRef: Document,
): void {
    documentRef.documentElement.dataset.theme = theme;
}

/**
 * Applies a stored preference before Angular bootstraps, preventing the routed
 * application from first rendering with the wrong token set.
 */
export function applyInitialTheme(
    documentRef: Document = document,
    storage: ThemeStorage | undefined = window.localStorage,
    configuration: ThemeConfiguration = THEME_CONFIGURATION,
): AppTheme {
    const theme = resolveTheme(readStoredTheme(storage), configuration);
    applyThemeAttribute(theme, documentRef);
    return theme;
}
