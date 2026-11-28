import { DebugElement, getDebugNode } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";

import { ChangeStatusModalComponent } from "./change-status-modal.component";
import { LearningObject } from "@entity";
import { ChangelogService } from "app/core/learning-object-module/changelog/changelog.service";
import { TipDirective } from "app/shared/directives/tip.directive";
import { BUILDER_ACTIONS, BuilderStore } from "../../../builder-store.service";

describe("ChangeStatusModalComponent", () => {
    let component: ChangeStatusModalComponent;
    let fixture: ComponentFixture<ChangeStatusModalComponent>;
    let store: { savedCorrectly: boolean; execute: jest.Mock };

    beforeEach(async () => {
        store = {
            savedCorrectly: true,
            execute: jest.fn().mockResolvedValue(undefined),
        };
        await TestBed.configureTestingModule({
            imports: [ChangeStatusModalComponent, NoopAnimationsModule],
            providers: [
                provideRouter([]),
                { provide: BuilderStore, useValue: store },
                { provide: ChangelogService, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChangeStatusModalComponent);
        component = fixture.componentInstance;
        component.learningObject = new LearningObject({
            status: LearningObject.Status.WAITING,
        });
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("only allows waiting learning objects to move to review", () => {
        expect(component.statuses).toEqual([LearningObject.Status.REVIEW]);
    });

    it("only allows review learning objects to be released or rejected", () => {
        component.learningObject = new LearningObject({
            status: LearningObject.Status.REVIEW,
        });

        component.ngOnInit();

        expect(component.statuses).toEqual([
            LearningObject.Status.RELEASED,
            LearningObject.Status.REJECTED,
        ]);
    });

    it("blocks status activation until the builder can save again", async () => {
        store.savedCorrectly = false;
        fixture.componentRef.setInput("shouldShow", true);
        fixture.detectChanges();

        // The popup projects its content into a viewer attached to the body.
        const popup = document.querySelector(".popup-inner");
        const option = popup.querySelector<HTMLElement>(".status-item");
        const choice = getDebugNode(option) as DebugElement;
        const tooltip = choice.injector.get(TipDirective);
        expect(option.getAttribute("aria-disabled")).toBe("true");
        expect(option.tabIndex).toBe(-1);
        expect(option.classList.contains("status-item--disabled")).toBe(true);
        expect(tooltip.tipDisabled).toBe(false);
        expect(tooltip.tip).toBe(
            "Please fix your changes before changing the status.",
        );

        option.click();
        option.dispatchEvent(new KeyboardEvent("keypress", { code: "Enter" }));
        expect(component.selectedStatus).toBeUndefined();
        expect(store.execute).not.toHaveBeenCalled();

        store.savedCorrectly = true;
        fixture.detectChanges();
        expect(option.getAttribute("aria-disabled")).toBe("false");
        expect(option.tabIndex).toBe(0);
        expect(option.classList.contains("status-item--disabled")).toBe(false);
        expect(tooltip.tipDisabled).toBe(true);

        option.dispatchEvent(new KeyboardEvent("keypress", { code: "Enter" }));
        expect(component.selectedStatus).toBe(LearningObject.Status.REVIEW);
        fixture.detectChanges();

        const confirm =
            popup.querySelector<HTMLButtonElement>(".btn-group .good");
        confirm.click();
        await fixture.whenStable();

        expect(store.execute).toHaveBeenCalledWith(
            BUILDER_ACTIONS.CHANGE_STATUS,
            {
                status: LearningObject.Status.REVIEW,
                reason: undefined,
            },
        );
    });
});
