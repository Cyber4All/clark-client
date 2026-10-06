import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";

import { PressComponent } from "./press.component";
import {
    Mention,
    PressCoverageService,
} from "../../core/client-module/press-coverage.service";

describe("PressComponent", () => {
    let component: PressComponent;
    let fixture: ComponentFixture<PressComponent>;
    let getMentions: jest.Mock;

    const configure = (impl: () => Promise<Mention[]>) => {
        getMentions = jest.fn(impl);
        TestBed.configureTestingModule({
            imports: [PressComponent],
            providers: [
                { provide: PressCoverageService, useValue: { getMentions } },
            ],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
        fixture = TestBed.createComponent(PressComponent);
        component = fixture.componentInstance;
    };

    it("should render before mentions have loaded", waitForAsync(() => {
        configure(() => new Promise<Mention[]>(() => {}));
        expect(() => fixture.detectChanges()).not.toThrow();
        expect(component.mentions).toEqual([]);
    }));

    it("should populate mentions once loaded", waitForAsync(async () => {
        const mentions = [new Mention("t", "l", "i", "s")];
        configure(() => Promise.resolve(mentions));
        fixture.detectChanges();
        await fixture.whenStable();
        expect(() => fixture.detectChanges()).not.toThrow();
        expect(component.mentions).toEqual(mentions);
    }));

    it("should keep an empty list when loading fails", waitForAsync(async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});
        configure(() => Promise.reject(new Error("network")));
        fixture.detectChanges();
        await fixture.whenStable();
        expect(() => fixture.detectChanges()).not.toThrow();
        expect(component.mentions).toEqual([]);
    }));
});
