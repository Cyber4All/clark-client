import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RatingEditorComponent } from "./rating-editor.component";

describe("RatingEditorComponent", () => {
    let fixture: ComponentFixture<RatingEditorComponent>;
    let area: HTMLElement;
    let command: jest.Mock;

    beforeEach(async () => {
        // jsdom does not implement native rich-text editing. These tests verify
        // Angular event/selection integration; browser checks cover actual formatting.
        command = jest.fn(() => true);
        Object.defineProperty(document, "execCommand", {
            configurable: true,
            value: command,
        });
        Object.defineProperty(document, "queryCommandState", {
            configurable: true,
            value: jest.fn(() => false),
        });
        Object.defineProperty(document, "queryCommandValue", {
            configurable: true,
            value: jest.fn(() => "3"),
        });
        await TestBed.configureTestingModule({
            imports: [RatingEditorComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(RatingEditorComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        area = fixture.nativeElement.querySelector(".st-area");
    });

    afterEach(() => {
        fixture.destroy();
        document.getSelection()?.removeAllRanges();
    });

    it("owns the toolbar in its template and labels the editable area", () => {
        expect(
            fixture.nativeElement.querySelector(".rating-toolbar select"),
        ).not.toBeNull();
        expect(
            fixture.nativeElement.querySelector("st-editor .st-toolbar select"),
        ).toBeNull();
        expect(area.getAttribute("role")).toBe("textbox");
        expect(area.getAttribute("aria-multiline")).toBe("true");
        expect(area.getAttribute("aria-label")).toBe(
            "Why did you leave this rating?",
        );
        expect(fixture.nativeElement.querySelectorAll("option")).toHaveLength(
            4,
        );
        expect(fixture.nativeElement.querySelector("st-input")).toBeNull();
    });

    it("accepts an external reset without emitting a user edit", async () => {
        const emit = jest.spyOn(fixture.componentInstance.valueChange, "emit");
        fixture.componentRef.setInput("value", "<b>Saved</b>");
        fixture.detectChanges();
        await fixture.whenStable();
        expect(area.innerHTML).toBe("<b>Saved</b>");
        fixture.componentRef.setInput("value", "");
        fixture.detectChanges();
        await fixture.whenStable();
        expect(area.innerHTML).toBe("");
        expect(emit).not.toHaveBeenCalled();
    });

    it("does not rewrite the editable DOM when the parent echoes a user edit", async () => {
        fixture.componentInstance.valueChange.subscribe((value) =>
            fixture.componentRef.setInput("value", value),
        );
        const text = document.createTextNode("Typed");
        area.appendChild(text);
        fixture.componentInstance.editor.domModify();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(fixture.componentInstance.value).toBe("Typed");
        expect(area.firstChild).toBe(text);
    });

    it.each([
        ["b", false, "bold"],
        ["i", false, "italic"],
        ["u", false, "underline"],
        ["z", false, "undo"],
        ["z", true, "redo"],
        ["y", false, "redo"],
    ])(
        "handles Ctrl and Cmd %s with shift=%s exactly once",
        (key, shiftKey, expected) => {
            for (const modifier of ["ctrlKey", "metaKey"]) {
                command.mockClear();
                const event = new KeyboardEvent("keydown", {
                    key: key as string,
                    shiftKey: shiftKey as boolean,
                    [modifier]: true,
                    bubbles: true,
                    cancelable: true,
                });
                area.dispatchEvent(event);
                expect(event.defaultPrevented).toBe(true);
                expect(command).toHaveBeenCalledTimes(1);
                expect(command.mock.calls[0][0]).toBe(expected);
            }
        },
    );

    it("leaves copy, composition, and toolbar keystrokes alone", () => {
        for (const options of [
            { key: "c", ctrlKey: true },
            { key: "b", ctrlKey: true, isComposing: true },
            { key: "b", ctrlKey: true, altKey: true },
        ]) {
            const event = new KeyboardEvent("keydown", {
                ...options,
                bubbles: true,
                cancelable: true,
            });
            area.dispatchEvent(event);
            expect(event.defaultPrevented).toBe(false);
        }
        fixture.nativeElement.querySelector("select").dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "b",
                ctrlKey: true,
                bubbles: true,
            }),
        );
        expect(command).not.toHaveBeenCalled();
    });

    it("blocks typed raw markup characters only inside the review field", () => {
        const markup = new InputEvent("beforeinput", {
            data: "<",
            inputType: "insertText",
            bubbles: true,
            cancelable: true,
        });
        area.dispatchEvent(markup);
        expect(markup.defaultPrevented).toBe(true);

        const toolbarInput = new InputEvent("beforeinput", {
            data: "<",
            inputType: "insertText",
            bubbles: true,
            cancelable: true,
        });
        fixture.nativeElement
            .querySelector("select")
            .dispatchEvent(toolbarInput);
        expect(toolbarInput.defaultPrevented).toBe(false);
    });

    it("converts pasted HTML markup to plain text before inserting it", () => {
        const paste = new Event("paste", {
            bubbles: true,
            cancelable: true,
        }) as ClipboardEvent;
        Object.defineProperty(paste, "clipboardData", {
            value: { getData: () => "A <strong>review</strong>" },
        });
        area.dispatchEvent(paste);

        expect(paste.defaultPrevented).toBe(true);
        expect(command).toHaveBeenCalledWith("insertText", false, "A review");
    });

    it("restores the saved selection when an Angular toolbar control is used", () => {
        area.textContent = "Selected review";
        const range = document.createRange();
        range.selectNodeContents(area);
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(range);
        fixture.componentInstance.updateHeading();
        document.getSelection().removeAllRanges();
        fixture.nativeElement.querySelector("st-button button").click();
        expect(document.getSelection().toString()).toBe("Selected review");
        expect(command.mock.calls[0][0]).toBe("bold");
    });
});
