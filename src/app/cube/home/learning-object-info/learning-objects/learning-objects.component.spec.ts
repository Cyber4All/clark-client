import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LearningObjectsComponent } from "./learning-objects.component";

describe("LearningObjectsComponent", () => {
    let component: LearningObjectsComponent;
    let fixture: ComponentFixture<LearningObjectsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LearningObjectsComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LearningObjectsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
