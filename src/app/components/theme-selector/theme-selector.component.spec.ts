import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BehaviorSubject } from "rxjs";

import { ThemeService } from "app/core/theme-module/theme.service";
import { AppTheme } from "app/core/theme-module/theme.types";

import { ThemeSelectorComponent } from "./theme-selector.component";

describe("ThemeSelectorComponent", () => {
    let component: ThemeSelectorComponent;
    let fixture: ComponentFixture<ThemeSelectorComponent>;
    let activeTheme: BehaviorSubject<AppTheme>;
    let toggleHalloweenTheme: jest.Mock;

    beforeEach(async () => {
        activeTheme = new BehaviorSubject<AppTheme>("default");
        toggleHalloweenTheme = jest.fn((enabled: boolean) => {
            activeTheme.next(enabled ? "halloween" : "default");
        });

        await TestBed.configureTestingModule({
            imports: [ThemeSelectorComponent],
            providers: [
                {
                    provide: ThemeService,
                    useValue: {
                        halloweenEnabled: true,
                        activeTheme$: activeTheme.asObservable(),
                        toggleHalloweenTheme,
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ThemeSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("renders a labeled native checkbox with its restored state", () => {
        activeTheme.next("halloween");
        fixture.detectChanges();

        const input = fixture.nativeElement.querySelector(
            "#halloween-theme",
        ) as HTMLInputElement;
        const label = fixture.nativeElement.querySelector(
            'label[for="halloween-theme"]',
        );

        expect(input.type).toBe("checkbox");
        expect(input.checked).toBe(true);
        expect(label.textContent).toContain("Halloween theme");
        expect(input.getAttribute("aria-describedby")).toBe(
            "halloween-theme-description",
        );
    });

    it("updates the selected theme from keyboard-operable native input", () => {
        const input = fixture.nativeElement.querySelector(
            "#halloween-theme",
        ) as HTMLInputElement;

        input.checked = true;
        input.dispatchEvent(new Event("change"));

        expect(toggleHalloweenTheme).toHaveBeenCalledWith(true);
    });
});
