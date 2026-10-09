import {
    ratingCommentLength,
    ratingCommentPreview,
    ratingCommentPreviewHtml,
    ratingCommentText,
    serializeRatingComment,
} from "./rating-comment";

describe("rating comment text", () => {
    it.each([1, 2, 3, 8])(
        "reserves closing boundaries for %i nested blocks",
        (depth) => {
            // Emojis use two UTF-16 code units, so this verifies that nested rich
            // text previews count user-visible Unicode characters instead.
            const html =
                "<div>".repeat(depth) +
                "<p><b>" +
                "😀".repeat(600) +
                "</b></p>" +
                "</div>".repeat(depth);
            const preview = ratingCommentPreviewHtml(html);
            expect(ratingCommentLength(preview.replace("…", ""))).toBe(512);
            expect(preview).toContain("…</b></p>");
            expect(preview.match(/…/g)).toHaveLength(1);
        },
    );

    it("places the marker inside a heading when the cutoff is a block boundary", () => {
        const html = "<h1>" + "a".repeat(512) + "</h1><p>Hidden</p>";
        expect(ratingCommentPreviewHtml(html)).toBe(
            "<h1>" + "a".repeat(512) + "…</h1>",
        );
    });

    it("does not add a marker to an untruncated review", () => {
        const html = "<p><b>" + "a".repeat(512) + "</b></p>";
        expect(ratingCommentPreviewHtml(html)).toBe(html);
    });

    it("keeps the marker beside text when the cutoff ends with whitespace", () => {
        const html = "<p>" + "a".repeat(509) + "\n\n\n" + "tail" + "</p>";
        expect(ratingCommentPreviewHtml(html)).toBe(
            "<p>" + "a".repeat(509) + "…</p>",
        );
    });
    it("preserves headings and inline sizes in a truncated preview", () => {
        const html =
            '<h1>Title</h1><p><b><font size="5">' +
            "😀".repeat(600) +
            "</font></b></p><p>Hidden</p>";
        const preview = ratingCommentPreviewHtml(html);
        expect(preview).toBe(
            '<h1>Title</h1><p><b><font size="5">' +
                "😀".repeat(506) +
                "…</font></b></p>",
        );
        expect(ratingCommentLength(preview.replace("…", ""))).toBe(512);
        expect(html).toContain("Hidden");
    });

    it("keeps literal markup escaped and ignores hidden content in HTML previews", () => {
        const preview = ratingCommentPreviewHtml(
            "<script>bad()</script><style>p{}</style>&lt;b&gt;text&lt;/b&gt;",
        );
        expect(preview).toBe("&lt;b&gt;text&lt;/b&gt;");
    });

    it("counts line breaks and closes tags at a preview boundary", () => {
        const preview = ratingCommentPreviewHtml(
            "<p>" + "a".repeat(510) + "<br><i>bc</i></p>",
        );
        expect(preview).toBe("<p>" + "a".repeat(510) + "<br><i>b…</i></p>");
        expect(ratingCommentLength(preview.replace("…", ""))).toBe(512);
    });
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
