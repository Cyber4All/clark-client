import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";

import { PaginationComponent } from "./pagination.component";

describe("PaginationComponent", () => {
    let component: PaginationComponent;
    let fixture: ComponentFixture<PaginationComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [PaginationComponent],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PaginationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("shows the current page and total page count", () => {
        component.currentPageNumber = 3;
        component.lastPageNumber = 7;
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain("Page 3 of 7");
    });

    it("disables previous on the first page and next on the last page", () => {
        component.currentPageNumber = 1;
        component.lastPageNumber = 3;
        fixture.detectChanges();

        let buttons = fixture.nativeElement.querySelectorAll("button");
        expect(buttons[0].disabled).toBe(true);
        expect(buttons[1].disabled).toBe(false);

        component.currentPageNumber = 3;
        fixture.detectChanges();

        buttons = fixture.nativeElement.querySelectorAll("button");
        expect(buttons[0].disabled).toBe(false);
        expect(buttons[1].disabled).toBe(true);
    });

    it("emits adjacent page numbers when arrows are clicked", () => {
        component.currentPageNumber = 3;
        component.lastPageNumber = 7;
        const emitSpy = jest.spyOn(component.newPageNumberClicked, "emit");

        component.onLeftArrowClick();
        component.onRightArrowClick();

        expect(emitSpy).toHaveBeenNthCalledWith(1, 2);
        expect(emitSpy).toHaveBeenNthCalledWith(2, 4);
    });
});
