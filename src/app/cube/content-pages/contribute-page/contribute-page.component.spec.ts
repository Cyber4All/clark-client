import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ContributePageComponent } from "./contribute-page.component";

describe("ContributePageComponent", () => {
    let component: ContributePageComponent;
    let fixture: ComponentFixture<ContributePageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ContributePageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ContributePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
