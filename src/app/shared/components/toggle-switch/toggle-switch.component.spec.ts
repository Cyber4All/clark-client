import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";

import { ToggleSwitchComponent } from "./toggle-switch.component";

describe("ToggleSwitchComponent", () => {
    let component: ToggleSwitchComponent;
    let fixture: ComponentFixture<ToggleSwitchComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ToggleSwitchComponent],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ToggleSwitchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
