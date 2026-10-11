import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";

import { StickyMenuComponent } from "./sticky-menu.component";
import { LEARNING_OBJECT_INFO_STATES } from "../learning-object-info.component";

describe("StickyMenuComponent", () => {
    let component: StickyMenuComponent;
    let fixture: ComponentFixture<StickyMenuComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StickyMenuComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StickyMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    describe("changeSelection", () => {
        it("should call scrollIntoView when the element exists in the DOM", fakeAsync(() => {
            const mockEl = { scrollIntoView: jest.fn() } as unknown as HTMLElement;
            jest.spyOn(document, "getElementById").mockReturnValue(mockEl);

            component.changeSelection(LEARNING_OBJECT_INFO_STATES.LEARNING_OBJECT);
            tick();

            expect(mockEl.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });

            jest.restoreAllMocks();
        }));

        it("should not throw when the element does not exist in the DOM (null)", fakeAsync(() => {
            jest.spyOn(document, "getElementById").mockReturnValue(null);

            expect(() => {
                component.changeSelection(LEARNING_OBJECT_INFO_STATES.LEARNING_OBJECT);
                tick();
            }).not.toThrow();

            jest.restoreAllMocks();
        }));
    });
});
