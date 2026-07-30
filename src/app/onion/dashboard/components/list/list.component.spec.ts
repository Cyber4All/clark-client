import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";

import { ListComponent } from "./list.component";

describe("ListComponent", () => {
    let component: ListComponent;
    let fixture: ComponentFixture<ListComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, ListComponent],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;
        component.learningObjects = [];
        component.showOptions = true;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should keep the existing New button pointed at the manual builder flow", () => {
        const newButton = fixture.debugElement.query(
            By.css('[aria-label="Create a new Learning Object"]'),
        );
        const routerLink = newButton.injector.get(RouterLink);

        expect(routerLink.urlTree.toString()).toBe(
            "/onion/learning-object-builder",
        );
    });
});
