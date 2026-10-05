export const THEME_STORAGE_KEY = "clark.center:theme";

export const APP_THEMES = ["default", "halloween"] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export interface ThemeConfiguration {
    halloweenEnabled: boolean;
}
