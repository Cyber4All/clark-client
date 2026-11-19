import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { PressComponent } from "./press.component";
import {
    Mention,
    PressCoverageService,
} from "../../core/client-module/press-coverage.service";

describe("PressComponent", () => {
    let component: PressComponent;
    let fixture: ComponentFixture<PressComponent>;
    let resolveMentions: (mentions: Mention[]) => void;

    beforeEach(waitForAsync(() => {
        const coverageServiceStub = {
            getMentions: () =>
                new Promise<Mention[]>((resolve) => {
                    resolveMentions = resolve;
                }),
        };

        TestBed.configureTestingModule({
            imports: [PressComponent],
            providers: [
                {
                    provide: PressCoverageService,
                    useValue: coverageServiceStub,
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

    it("should render up to 5 highlights and all recent mentions once loaded", async () => {
        fixture.detectChanges();
        const mentions = Array.from(
            { length: 6 },
            (_, i) =>
                new Mention(
                    `title ${i}`,
                    `link ${i}`,
                    `icon ${i}`,
                    `source ${i}`,
                ),
        );
        resolveMentions(mentions);
        await fixture.whenStable();
        fixture.detectChanges();

        expect(
            fixture.debugElement.queryAll(By.css("clark-media-card")).length,
        ).toBe(5);
        expect(
            fixture.debugElement.queryAll(By.css("clark-media-item")).length,
        ).toBe(6);
    });
});
