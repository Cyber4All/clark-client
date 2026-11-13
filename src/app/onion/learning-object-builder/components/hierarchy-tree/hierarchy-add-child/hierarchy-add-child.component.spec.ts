import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LearningObject } from "@entity";
import {
    HierarchyAddChildComponent,
    INVALID_NAME_MESSAGE,
} from "./hierarchy-add-child.component";
import { NewChildRequest } from "../hierarchy-tree.types";

const { COURSE, UNIT, MODULE, MICROMODULE, NANOMODULE } = LearningObject.Length;

describe("HierarchyAddChildComponent", () => {
    let fixture: ComponentFixture<HierarchyAddChildComponent>;
    let component: HierarchyAddChildComponent;
    let confirmed: NewChildRequest[];
    let cancelled: number;

    function create(parentLength: LearningObject.Length = COURSE): void {
        fixture = TestBed.createComponent(HierarchyAddChildComponent);
        component = fixture.componentInstance;
        component.parentName = "Intro to Security";
        component.parentLength = parentLength;
        confirmed = [];
        cancelled = 0;
        component.confirm.subscribe((request) => confirmed.push(request));
        component.cancel.subscribe(() => cancelled++);
        fixture.detectChanges();
    }

    const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
    const nameInput = (): HTMLInputElement =>
        el().querySelector<HTMLInputElement>("#add-child-name")!;
    const radios = (): HTMLInputElement[] =>
        Array.from(
            el().querySelectorAll<HTMLInputElement>('input[type="radio"]'),
        );
    const radioLabels = (): string[] =>
        radios().map((radio) => radio.parentElement!.textContent!.trim());
    const checkedLabel = (): string | undefined =>
        radios()
            .find((radio) => radio.checked)
            ?.parentElement?.textContent?.trim();
    const nameError = (): HTMLElement | null =>
        el().querySelector<HTMLElement>("#add-child-name-error");
    const generalError = (): HTMLElement | null =>
        el().querySelector<HTMLElement>(".hierarchy-add-child__error--general");
    const primary = (): HTMLButtonElement =>
        el().querySelector<HTMLButtonElement>(
            ".hierarchy-add-child__button--primary",
        )!;
    const cancelButton = (): HTMLButtonElement =>
        el().querySelector<HTMLButtonElement>(
            ".hierarchy-add-child__button--ghost",
        )!;
    function type(value: string): void {
        const input = nameInput();
        input.value = value;
        input.dispatchEvent(new Event("input"));
        fixture.detectChanges();
    }
    function submit(): void {
        el()
            .querySelector("form")!
            .dispatchEvent(new Event("submit", { cancelable: true }));
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HierarchyAddChildComponent],
        });
    });

    describe("length choices", () => {
        it("offers only lengths shorter than the parent, shortest first", () => {
            create(COURSE);
            expect(radioLabels()).toEqual([
                "Nanomodule",
                "Micromodule",
                "Module",
                "Unit",
            ]);
        });

        it("offers fewer lengths for a shorter parent", () => {
            create(MODULE);
            expect(radioLabels()).toEqual(["Nanomodule", "Micromodule"]);
        });

        it("offers a single length for a Micromodule parent", () => {
            create(MICROMODULE);
            expect(radioLabels()).toEqual(["Nanomodule"]);
        });

        it("offers none for a Nanomodule parent", () => {
            create(NANOMODULE);
            expect(radios()).toEqual([]);
        });

        it("preselects the longest valid length", () => {
            create(COURSE);
            expect(checkedLabel()).toBe("Unit");
        });

        it("names the parent in the intro text", () => {
            create();
            expect(el().textContent).toContain("Intro to Security");
        });

        it("falls back to a label for an unnamed parent", () => {
            create();
            component.parentName = "  ";
            fixture.detectChanges();
            expect(el().textContent).toContain("Unnamed object");
        });
    });

    describe("submitting", () => {
        it("emits the trimmed name and the chosen length", () => {
            create(COURSE);
            type("  My Module  ");
            radios()[2].click();
            fixture.detectChanges();
            submit();
            expect(confirmed).toEqual([{ name: "My Module", length: MODULE }]);
        });

        it("submits with Enter in the name field (a real form submit)", () => {
            create(COURSE);
            type("Quick unit");
            primary().click();
            expect(confirmed).toEqual([{ name: "Quick unit", length: UNIT }]);
        });

        it("emits nothing and shows an error for a blank name", () => {
            create();
            type("   ");
            submit();
            expect(confirmed).toEqual([]);
            expect(nameError()?.textContent).toContain("Enter a name");
        });

        it("shows no error before the author has typed or submitted", () => {
            create();
            expect(nameError()).toBeNull();
            expect(nameInput().getAttribute("aria-invalid")).toBeNull();
        });

        it.each(["a/b", "a\\b", 'a"b', "a*b", "a|b"])(
            "rejects %s as the author types and emits nothing",
            (name) => {
                create();
                type(name);
                expect(nameError()?.textContent?.trim()).toBe(
                    INVALID_NAME_MESSAGE,
                );
                submit();
                expect(confirmed).toEqual([]);
            },
        );

        it("links the error to the field for screen readers", () => {
            create();
            type("a/b");
            expect(nameInput().getAttribute("aria-invalid")).toBe("true");
            expect(nameInput().getAttribute("aria-describedby")).toBe(
                "add-child-name-error",
            );
            expect(nameError()?.id).toBe("add-child-name-error");
        });

        it("accepts ordinary punctuation", () => {
            create();
            type("Intro: Networks & Security (2026) - Part 1");
            submit();
            expect(confirmed).toHaveLength(1);
        });
    });

    describe("while saving", () => {
        it("locks the form, says it is creating, and ignores submit and Cancel", () => {
            create();
            type("Name");
            component.saving = true;
            fixture.detectChanges();
            expect(primary().disabled).toBe(true);
            expect(primary().textContent).toContain("Creating");
            expect(cancelButton().disabled).toBe(true);
            expect(nameInput().readOnly).toBe(true);
            expect(
                el().querySelector("fieldset")!.hasAttribute("disabled"),
            ).toBe(true);
            expect(el().querySelector("form")!.getAttribute("aria-busy")).toBe(
                "true",
            );
            submit();
            component.onCancel();
            expect(confirmed).toEqual([]);
            expect(cancelled).toBe(0);
        });

        it("unlocks again when saving ends", () => {
            create();
            component.saving = true;
            fixture.detectChanges();
            component.saving = false;
            fixture.detectChanges();
            expect(primary().disabled).toBe(false);
            expect(primary().textContent).toContain("Create");
            expect(nameInput().readOnly).toBe(false);
        });
    });

    describe("errors from the API", () => {
        it("shows a name error from the API next to the field", () => {
            create();
            type("Taken");
            component.nameError = "You already have this name.";
            fixture.detectChanges();
            expect(nameError()?.textContent).toContain("already have");
            expect(nameInput().getAttribute("aria-invalid")).toBe("true");
        });

        it("clears the API's name error as soon as the author edits the name", () => {
            create();
            component.nameError = "You already have this name.";
            fixture.detectChanges();
            type("Different");
            expect(nameError()).toBeNull();
        });

        it("shows a general failure as an alert and clears it on typing", () => {
            create();
            component.errorMessage = "The object could not be created.";
            fixture.detectChanges();
            expect(generalError()?.getAttribute("role")).toBe("alert");
            expect(generalError()?.textContent).toContain("could not be");
            type("x");
            expect(generalError()).toBeNull();
        });
    });

    describe("cancelling", () => {
        it("emits cancel when Cancel is pressed", () => {
            create();
            cancelButton().click();
            expect(cancelled).toBe(1);
        });
    });

    describe("accessibility", () => {
        it("is a labelled modal dialog", () => {
            create();
            const form = el().querySelector("form")!;
            expect(form.getAttribute("role")).toBe("dialog");
            expect(form.getAttribute("aria-modal")).toBe("true");
            const title = el().querySelector(
                `#${form.getAttribute("aria-labelledby")}`,
            );
            expect(title?.textContent).toContain("Add a new child object");
        });

        it("labels the name field and groups the lengths under a legend", () => {
            create();
            expect(
                el().querySelector('label[for="add-child-name"]'),
            ).toBeTruthy();
            expect(el().querySelector("fieldset legend")?.textContent).toBe(
                "Length",
            );
        });
    });
});
