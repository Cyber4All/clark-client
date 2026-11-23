import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    tick,
} from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";
import { Subject } from "rxjs";
import { AuthService } from "app/core/auth-module/auth.service";

import { LearningObjectBuilderComponent } from "./learning-object-builder.component";
import { AgenticBuilderSessionStorageService } from "./components/agentic-builder-panel/agentic-builder-session-storage.service";
import { BuilderStore, BUILDER_ERRORS } from "./builder-store.service";
import { LearningObjectValidator } from "./validators/learning-object.validator";
import { LearningOutcomeValidator } from "./validators/learning-outcome.validator";

describe("LearningObjectBuilderComponent", () => {
    let component: LearningObjectBuilderComponent;
    let fixture: ComponentFixture<LearningObjectBuilderComponent>;
    let serviceInteraction: Subject<boolean | null>;

    beforeEach(async () => {
        serviceInteraction = new Subject<boolean | null>();
        await TestBed.configureTestingModule({
            imports: [LearningObjectBuilderComponent, NoopAnimationsModule],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: {} },
            ],
        })
            .overrideComponent(LearningObjectBuilderComponent, {
                set: {
                    providers: [
                        LearningObjectValidator,
                        LearningOutcomeValidator,
                        {
                            provide: BuilderStore,
                            useValue: {
                                serviceInteraction$: serviceInteraction,
                                serviceError$: new Subject<BUILDER_ERRORS>(),
                                learningObjectEvent: new Subject(),
                                makeNew: jest.fn(),
                            },
                        },
                    ],
                },
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LearningObjectBuilderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("shows saving and saved messages during a successful save", fakeAsync(() => {
        const indicator: HTMLElement =
            fixture.nativeElement.querySelector(".service-indicator");

        serviceInteraction.next(true);
        fixture.detectChanges();
        expect(indicator.textContent).toContain("Saving changes...");

        serviceInteraction.next(false);
        fixture.detectChanges();
        expect(indicator.textContent).toContain("Changes saved!");
        tick(3000);
    }));

    it("omits the inline error message when submission validation fails", () => {
        const validator = fixture.debugElement.injector.get(
            LearningObjectValidator,
        );
        validator.submissionMode = true;
        validator.errors.submitErrors.set("name", "A name is required.");

        fixture.detectChanges();

        const indicator: HTMLElement =
            fixture.nativeElement.querySelector(".service-indicator");
        expect(indicator.textContent.trim()).toBe("");
        expect(indicator.classList.contains("service-indicator--error")).toBe(
            false,
        );
    });

    it("clears the active suggestion session when leaving the builder", () => {
        const sessionStorage = TestBed.inject(
            AgenticBuilderSessionStorageService,
        );
        const clearActive = jest.spyOn(sessionStorage, "clearActive");

        fixture.destroy();

        expect(clearActive).toHaveBeenCalled();
    });
});
