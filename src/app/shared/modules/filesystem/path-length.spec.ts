import {
    getFilePath,
    hasLongWindowsExtractionPath,
    hasLongWindowsExtractionPathForFile,
} from "./path-length";

describe("path-length", () => {
    it("warns only when a path is longer than 160 characters", () => {
        expect(hasLongWindowsExtractionPath("x".repeat(160))).toBe(false);
        expect(hasLongWindowsExtractionPath("x".repeat(161))).toBe(true);
    });

    it("uses the full path before other file path fields", () => {
        expect(
            getFilePath({
                name: "file.txt",
                webkitRelativePath: "folder/file.txt",
                fullPath: "nested/folder/file.txt",
            }),
        ).toBe("nested/folder/file.txt");
    });

    it("checks the resolved path for a file", () => {
        expect(
            hasLongWindowsExtractionPathForFile({ name: "x".repeat(161) }),
        ).toBe(true);
        expect(
            hasLongWindowsExtractionPathForFile({
                name: "file.txt",
                webkitRelativePath: "x".repeat(161),
            }),
        ).toBe(true);
    });
});
