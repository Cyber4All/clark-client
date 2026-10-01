import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

import { THEME_CONFIGURATION } from "./theme.config";
import {
    applyThemeAttribute,
    isHalloweenThemeEnabled,
    readStoredTheme,
    resolveTheme,
} from "./theme-initializer";
import { AppTheme, THEME_STORAGE_KEY, ThemeConfiguration } from "./theme.types";

@Injectable({
    providedIn: "root",
})
export class ThemeService {
    private readonly activeThemeSubject: BehaviorSubject<AppTheme>;

    readonly activeTheme$: Observable<AppTheme>;

    constructor(@Inject(DOCUMENT) private readonly document: Document) {
        this.activeThemeSubject = new BehaviorSubject<AppTheme>(
            this.resolveStoredTheme(),
        );
        this.activeTheme$ = this.activeThemeSubject.asObservable();
        applyThemeAttribute(this.activeThemeSubject.value, this.document);
    }

    get activeTheme(): AppTheme {
        return this.activeThemeSubject.value;
    }

    get halloweenEnabled(): boolean {
        return isHalloweenThemeEnabled();
    }

    setTheme(theme: AppTheme): void {
        const resolvedTheme = resolveTheme(theme);

        if (theme === "halloween" && resolvedTheme !== "halloween") {
            this.apply(resolvedTheme);
            return;
        }

        this.persist(theme);
        this.apply(resolvedTheme);
    }

    toggleHalloweenTheme(enabled: boolean): void {
        this.setTheme(enabled ? "halloween" : "default");
    }

    private resolveStoredTheme(
        configuration: ThemeConfiguration = THEME_CONFIGURATION,
    ): AppTheme {
        return resolveTheme(readStoredTheme(this.storage), configuration);
    }

    private get storage(): Storage | undefined {
        try {
            return this.document.defaultView?.localStorage;
        } catch {
            return undefined;
        }
    }

    private persist(theme: AppTheme): void {
        try {
            this.storage?.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // Storage may be unavailable in privacy-restricted browser contexts.
        }
    }

    private apply(theme: AppTheme): void {
        applyThemeAttribute(theme, this.document);
        this.activeThemeSubject.next(theme);
    }
}
