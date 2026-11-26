import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";

import { PressComponent } from "./press.component";
import { PressCoverageService } from "../../core/client-module/press-coverage.service";

describe("PressComponent", () => {
    let component: PressComponent;
    let fixture: ComponentFixture<PressComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [PressComponent],
            providers: [
                {
                    provide: PressCoverageService,
                    // Never resolves, simulating mentions that are still loading
                    useValue: { getMentions: () => new Promise(() => {}) },
                },
            ],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PressComponent);
        component = fixture.componentInstance;
    });

    it("should create", () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it("should render without errors before mentions have loaded", () => {
        expect(() => fixture.detectChanges()).not.toThrow();
        expect(component.mentions).toEqual([]);
    });
});
