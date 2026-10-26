import { buildNotebookPreviewUrl } from "./notebook-preview-url";

describe("buildNotebookPreviewUrl", () => {
    it("builds an nbviewer URL for an HTTPS notebook", () => {
        expect(
            buildNotebookPreviewUrl(
                "https://files.example.com/notebooks/example.ipynb",
                "https://nbviewer.org",
            ),
        ).toBe(
            "https://nbviewer.org/urls/files.example.com/notebooks/example.ipynb",
        );
    });

    it("uses the HTTP provider path for an HTTP notebook", () => {
        expect(
            buildNotebookPreviewUrl(
                "http://files.example.com/example.ipynb",
                "https://notebooks.clark.center/preview/",
            ),
        ).toBe(
            "https://notebooks.clark.center/preview/url/files.example.com/example.ipynb",
        );
    });

    it("preserves a signed source URL query as an encoded path segment", () => {
        expect(
            buildNotebookPreviewUrl(
                "https://files.example.com/example.ipynb?token=a%2Fb&expires=123",
                "https://nbviewer.org",
            ),
        ).toBe(
            "https://nbviewer.org/urls/files.example.com/example.ipynb/%3Ftoken%3Da%252Fb%26expires%3D123",
        );
    });

    it.each([
        "javascript:alert(1)",
        "data:application/json,{}",
        "https://user:password@files.example.com/example.ipynb",
    ])("rejects an unsupported source URL: %s", (source) => {
        expect(() =>
            buildNotebookPreviewUrl(source, "https://nbviewer.org"),
        ).toThrow("Invalid notebook source URL.");
    });

    it("rejects an invalid viewer URL", () => {
        expect(() =>
            buildNotebookPreviewUrl(
                "https://files.example.com/example.ipynb",
                "not-a-url",
            ),
        ).toThrow("Invalid notebook viewer URL.");
    });
});
