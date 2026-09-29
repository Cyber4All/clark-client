import { FileInput } from "../upload/upload.component";
import { FileManagementService } from "./file-management.service";

describe("FileManagementService", () => {
    const createFile = (file: Partial<FileInput>): FileInput =>
        file as FileInput;

    it("lists every invalid file using its upload-relative path", () => {
        const service = new FileManagementService(null, null, null);

        expect(() =>
            service.upload({
                authorUsername: "author",
                learningObjectCuid: "learning-object",
                learningObjectRevisionId: 1,
                files: [
                    createFile({ name: "valid-file.pdf" }),
                    createFile({
                        name: "file&one.pdf",
                        fullPath: "uploaded-folder/section/file&one.pdf",
                    }),
                    createFile({
                        name: "file#two.pdf",
                        webkitRelativePath: "uploaded-folder/file#two.pdf",
                    }),
                ],
            }),
        ).toThrow(
            "Files with invalid names:\n• uploaded-folder/section/file&one.pdf\n• uploaded-folder/file#two.pdf",
        );
    });
});
