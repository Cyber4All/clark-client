import { TestBed } from "@angular/core/testing";

import { THEME_CONFIGURATION } from "./theme.config";
import { isHalloweenThemeEnabled, resolveTheme } from "./theme-initializer";
import { ThemeService } from "./theme.service";
import { THEME_STORAGE_KEY } from "./theme.types";

describe("ThemeService", () => {
    let service: ThemeService;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({});
        service = TestBed.inject(ThemeService);
    });

    afterEach(() => {
        document.documentElement.dataset.theme = "default";
    });

    it("restores and persists the Halloween preference", () => {
        service.setTheme("halloween");

        expect(service.activeTheme).toBe("halloween");
        expect(document.documentElement.dataset.theme).toBe("halloween");
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("halloween");
    });

    it("falls back safely for invalid and disabled theme values", () => {
        expect(resolveTheme("not-a-theme")).toBe("default");
        expect(resolveTheme("halloween", { halloweenEnabled: false })).toBe(
            "default",
        );
    });

    it("uses the central feature configuration", () => {
        expect(isHalloweenThemeEnabled(THEME_CONFIGURATION)).toBe(true);
        expect(isHalloweenThemeEnabled({ halloweenEnabled: false })).toBe(
            false,
        );
    });
});
