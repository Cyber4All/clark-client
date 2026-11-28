import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";

import { SubmitComponent } from "./submit.component";

describe("SubmitComponent", () => {
    let component: SubmitComponent;
    let fixture: ComponentFixture<SubmitComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [SubmitComponent],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SubmitComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});

describe("SubmitComponent.isValidLearningObject", () => {
    const baseObject = {
        name: "Test",
        description: "Desc",
        contributors: [{}],
        outcomes: [],
    };

    const validate = (ctx: any): boolean =>
        SubmitComponent.prototype.isValidLearningObject.call(ctx);

    it("returns false without throwing when learningOutcomes input is not provided and object has no outcomes", () => {
        expect(() =>
            validate({ learningObject: { ...baseObject } }),
        ).not.toThrow();
        expect(validate({ learningObject: { ...baseObject } })).toBe(false);
    });

    it("returns true when learningOutcomes input is not provided but object has outcomes", () => {
        expect(
            validate({
                learningObject: { ...baseObject, outcomes: [{}] },
            }),
        ).toBe(true);
    });

    it("returns true when learningOutcomes map has entries", () => {
        expect(
            validate({
                learningObject: { ...baseObject },
                learningOutcomes: new Map([["a", {}]]),
            }),
        ).toBe(true);
    });
});
