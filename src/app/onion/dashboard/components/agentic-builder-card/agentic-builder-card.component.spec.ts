import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";

import { AgenticBuilderCardComponent } from "./agentic-builder-card.component";

describe("AgenticBuilderCardComponent", () => {
    let component: AgenticBuilderCardComponent;
    let fixture: ComponentFixture<AgenticBuilderCardComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, AgenticBuilderCardComponent],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AgenticBuilderCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should route the CTA to the upload-first builder flow by default", () => {
        const link: HTMLAnchorElement =
            fixture.nativeElement.querySelector(".button.good");

        expect(link.getAttribute("href")).toBe(
            "/onion/learning-object-builder/materials",
        );
    });

    it("should label the CTA as NEW + AI", () => {
        const link: HTMLAnchorElement =
            fixture.nativeElement.querySelector(".button.good");

        expect(link.textContent).toContain("NEW + AI");
    });

    it("should emit when the announcement is dismissed", () => {
        const dismissSpy = jest.spyOn(component.dismissAnnouncement, "emit");
        const button: HTMLButtonElement = fixture.nativeElement.querySelector(
            ".agentic-builder-card__dismiss",
        );

        button.click();

        expect(dismissSpy).toHaveBeenCalled();
    });

    it("should hide announcement messaging when dismissed by preference", () => {
        component.showAnnouncement = false;
        fixture.detectChanges();

        expect(
            fixture.nativeElement.querySelector(
                ".agentic-builder-card__announcement",
            ),
        ).toBeNull();
    });
});
