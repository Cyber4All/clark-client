import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";

import { ChangeStatusModalComponent } from "./change-status-modal.component";
import { LearningObject } from "@entity";

describe("ChangeStatusModalComponent", () => {
    let component: ChangeStatusModalComponent;
    let fixture: ComponentFixture<ChangeStatusModalComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ChangeStatusModalComponent],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
    }));

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
});
