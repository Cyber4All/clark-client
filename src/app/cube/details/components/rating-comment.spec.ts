import {
    ratingCommentLength,
    ratingCommentPreview,
    ratingCommentText,
    serializeRatingComment,
} from "./rating-comment";

describe("rating comment text", () => {
    it("preserves inline typing sizes without relying on style attributes", () => {
        const html = 'Before <b style="font-size: xx-large;">Heading</b> After';
        const saved = serializeRatingComment(html);
        expect(saved).toBe('Before <b><font size="6">Heading</font></b> After');
        expect(ratingCommentText(saved)).toBe("Before Heading After");
        expect(serializeRatingComment(saved)).toBe(saved);
    });
    it("counts decoded text instead of markup and entities", () => {
        expect(ratingCommentText("<p>A &amp; B</p>")).toBe("A & B");
        expect(ratingCommentLength("<h2>😀</h2>")).toBe(1);
    });
    it("preserves paragraph and line-break boundaries", () => {
        expect(ratingCommentText("<p>First</p><p>Second<br>Third</p>")).toBe(
            "First\nSecond\nThird",
        );
    });
    it("identifies empty formatted comments and excludes hidden markup", () => {
        expect(ratingCommentText("<p>&nbsp;<br></p>").trim()).toBe("");
        expect(
            ratingCommentText(
                "<script>bad()</script><style>p{}</style><p>OK</p>",
            ),
        ).toBe("OK");
    });
    it.each([512, 513, 2048, 2049])(
        "counts %i formatted characters",
        (count) => {
            const html = `<p>${"😀".repeat(count)}</p>`;
            expect(ratingCommentLength(html)).toBe(count);
            expect(Array.from(ratingCommentPreview(html))).toHaveLength(
                Math.min(512, count),
            );
        },
    );
    it("does not treat decoded literal markup as executable preview HTML", () => {
        expect(ratingCommentPreview("&lt;b&gt;text&lt;/b&gt;")).toBe(
            "<b>text</b>",
        );
    });
});
