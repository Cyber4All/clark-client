import {
    LearningObjectDescriptionComponent,
    normalizeDescriptionHeadings,
} from "./description.component";
import { EditorComponent, ExecCommand } from "ngx-simple-text-editor";

describe("LearningObjectDescriptionComponent", () => {
    it("converts pasted H1 content to a paragraph and preserves supported markup", () => {
        const description =
            '<h1 class="external-heading">Read <strong>this</strong> <a href="/guide">guide</a></h1><ul><li>First item</li></ul>';

        expect(normalizeDescriptionHeadings(description)).toBe(
            '<p>Read <strong>this</strong> <a href="/guide">guide</a></p><ul><li>First item</li></ul>',
        );
    });

    it("converts pasted H2 content to a paragraph and preserves supported markup", () => {
        const description =
            "<p>Introduction</p><h2><em>Details</em> and <u>examples</u></h2><ol><li>Step one</li></ol>";

        expect(normalizeDescriptionHeadings(description)).toBe(
            "<p>Introduction</p><p><em>Details</em> and <u>examples</u></p><ol><li>Step one</li></ol>",
        );
    });

    it("inserts normalized pasted headings through the editor command history", () => {
        const component = new LearningObjectDescriptionComponent();
        const execCommand = jest.fn();
        component.editor = { execCommand } as unknown as EditorComponent;
        const paste = new Event("paste", {
            bubbles: true,
            cancelable: true,
        }) as ClipboardEvent;
        Object.defineProperty(paste, "clipboardData", {
            value: {
                getData: (type: string) =>
                    type === "text/html" ? "<h1>Heading</h1>" : "",
            },
        });

        component.normalizePastedHeadings(paste);

        expect(paste.defaultPrevented).toBe(true);
        expect(execCommand).toHaveBeenCalledWith(
            ExecCommand.insertHTML,
            "<p>Heading</p>",
        );
    });

    it("leaves supported content unchanged", () => {
        const description =
            '<p><strong>Text</strong> with <a href="/guide">a link</a>.</p><ul><li>Item</li></ul>';

        expect(normalizeDescriptionHeadings(description)).toBe(description);
    });

    it("prevents toolbar buttons from submitting the builder form", () => {
        const component = new LearningObjectDescriptionComponent();
        const toolbar = document.createElement("div");
        const button = document.createElement("button");
        const icon = document.createElement("i");
        const click = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
        });
        toolbar.classList.add("st-toolbar");
        button.appendChild(icon);
        toolbar.appendChild(button);
        toolbar.addEventListener("click", (event) =>
            component.preventToolbarSubmit(event as MouseEvent),
        );

        icon.dispatchEvent(click);

        expect(click.defaultPrevented).toBe(true);
    });
});
