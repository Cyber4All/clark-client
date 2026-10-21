import {
    LearningObjectDescriptionComponent,
    normalizeDescriptionHeadings,
} from "./description.component";

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

    it("updates the editor value and emits normalized content", () => {
        const component = new LearningObjectDescriptionComponent();
        const emittedDescriptions: string[] = [];
        component.learningObject = { description: "" };
        component.textOutput.subscribe((description) =>
            emittedDescriptions.push(description),
        );
        component.ngOnInit();

        component.description.setValue("<h1>Heading</h1>");

        expect(component.description.value).toBe("<p>Heading</p>");
        expect(emittedDescriptions).toEqual(["<p>Heading</p>"]);
    });

    it("leaves supported content unchanged", () => {
        const description =
            '<p><strong>Text</strong> with <a href="/guide">a link</a>.</p><ul><li>Item</li></ul>';

        expect(normalizeDescriptionHeadings(description)).toBe(description);
    });
});
