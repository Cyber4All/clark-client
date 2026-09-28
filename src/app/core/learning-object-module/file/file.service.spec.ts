import { HttpClient } from "@angular/common/http";
import { FileService } from "./file.service";

describe("FileService previews", () => {
    let service: FileService;
    let openSpy: jest.SpyInstance;

    beforeEach(() => {
        service = new FileService({} as HttpClient);
        openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    });

    afterEach(() => {
        openSpy.mockRestore();
    });

    it.each(["lesson.ipynb", "LESSON.IPYNB"])(
        "allows %s to be previewed",
        (fileName) => {
            expect(FileService.canPreview(fileName)).toBe(true);
        },
    );

    it("opens notebooks in notebook mode in the shared preview route", async () => {
        const url = "https://files.example.com/lesson.ipynb?token=signed-value";

        await service.previewLearningObjectFile(url, "lesson.ipynb");

        expect(openSpy).toHaveBeenCalledWith(
            `/preview/code?url=${encodeURIComponent(url)}&type=notebook&filename=lesson.ipynb`,
            "_blank",
            "noopener,noreferrer",
        );
    });
});
