import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SecondaryNavbarComponent } from "./secondary-navbar.component";

describe("SecondaryNavbarComponent", () => {
    let component: SecondaryNavbarComponent;
    let fixture: ComponentFixture<SecondaryNavbarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SecondaryNavbarComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SecondaryNavbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
