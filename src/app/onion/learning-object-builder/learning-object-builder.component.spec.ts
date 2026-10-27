import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";

import { LearningObjectBuilderComponent } from "./learning-object-builder.component";
import { AgenticBuilderSessionStorageService } from "./components/agentic-builder-panel/agentic-builder-session-storage.service";

describe("LearningObjectBuilderComponent", () => {
    let component: LearningObjectBuilderComponent;
    let fixture: ComponentFixture<LearningObjectBuilderComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [LearningObjectBuilderComponent],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LearningObjectBuilderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
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
