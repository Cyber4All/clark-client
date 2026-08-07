import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FeatureHighlightCardComponent } from "./feature-highlight-card.component";

describe("FeatureHighlightCardComponent", () => {
    let component: FeatureHighlightCardComponent;
    let fixture: ComponentFixture<FeatureHighlightCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureHighlightCardComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FeatureHighlightCardComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("config", {
            title: "Try the new builder",
            body: "Upload materials and let CLARK help create a draft.",
            primaryAction: { label: "Try it" },
            secondaryAction: { label: "Dismiss" },
        });
        fixture.detectChanges();
    });

    it("renders the provided content and actions", () => {
        const element: HTMLElement = fixture.nativeElement;

        expect(element.textContent).toContain("Try the new builder");
        expect(element.textContent).toContain(
            "Upload materials and let CLARK help create a draft.",
        );
        expect(
            element.querySelector(".feature-highlight-card__button--primary")
                .textContent,
        ).toContain("Try it");
        expect(
            element.querySelector(".feature-highlight-card__button--secondary")
                .textContent,
        ).toContain("Dismiss");
        expect(
            element.querySelector(".feature-highlight-card__dismiss"),
        ).toBeTruthy();
    });

    it("emits action and dismiss events", () => {
        jest.spyOn(component.primaryActionSelected, "emit");
        jest.spyOn(component.secondaryActionSelected, "emit");
        jest.spyOn(component.dismissed, "emit");

        const element: HTMLElement = fixture.nativeElement;
        (
            element.querySelector(
                ".feature-highlight-card__button--primary",
            ) as HTMLButtonElement
        ).click();
        (
            element.querySelector(
                ".feature-highlight-card__button--secondary",
            ) as HTMLButtonElement
        ).click();
        (
            element.querySelector(
                ".feature-highlight-card__dismiss",
            ) as HTMLButtonElement
        ).click();

        expect(component.primaryActionSelected.emit).toHaveBeenCalledTimes(1);
        expect(component.secondaryActionSelected.emit).toHaveBeenCalledTimes(1);
        expect(component.dismissed.emit).toHaveBeenCalledTimes(1);
    });

    it("does not emit a disabled action", () => {
        jest.spyOn(component.primaryActionSelected, "emit");
        fixture.componentRef.setInput("config", {
            title: "Try the new builder",
            body: "Upload materials and let CLARK help create a draft.",
            primaryAction: { label: "Try it", disabled: true },
            secondaryAction: { label: "Dismiss" },
        });
        fixture.detectChanges();

        (
            fixture.nativeElement.querySelector(
                ".feature-highlight-card__button--primary",
            ) as HTMLButtonElement
        ).click();

        expect(component.primaryActionSelected.emit).not.toHaveBeenCalled();
    });

    it("can hide the dismiss action", () => {
        fixture.componentRef.setInput("config", {
            title: "Try the new builder",
            body: "Upload materials and let CLARK help create a draft.",
            primaryAction: { label: "Try it" },
            secondaryAction: { label: "Dismiss" },
            dismissible: false,
        });
        fixture.detectChanges();

        expect(
            fixture.nativeElement.querySelector(
                ".feature-highlight-card__dismiss",
            ),
        ).toBeNull();
    });

    it("supports the floating announcement appearance with an icon", () => {
        fixture.componentRef.setInput("config", {
            title: "Try the new builder",
            body: "Upload materials and let CLARK help create a draft.",
            appearance: "floating",
            iconClass: "fa-solid fa-wand-magic-sparkles",
            iconLabel: "AI Object Builder",
            primaryAction: { label: "Try it" },
            secondaryAction: { label: "Dismiss" },
        });
        fixture.detectChanges();

        const card: HTMLElement = fixture.nativeElement.querySelector(
            ".feature-highlight-card",
        );
        const icon: HTMLElement = fixture.nativeElement.querySelector(
            ".feature-highlight-card__icon",
        );

        expect(card.classList).toContain("feature-highlight-card--floating");
        expect(icon.getAttribute("aria-label")).toBe("AI Object Builder");
        expect(icon.querySelector("i").className).toBe(
            "fa-solid fa-wand-magic-sparkles",
        );
    });
});
