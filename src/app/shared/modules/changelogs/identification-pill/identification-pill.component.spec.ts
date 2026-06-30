import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";

import { IdentificationPillComponent } from "./identification-pill.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

describe("IdentificationPillComponent", () => {
    let component: IdentificationPillComponent;
    let fixture: ComponentFixture<IdentificationPillComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [IdentificationPillComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IdentificationPillComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
