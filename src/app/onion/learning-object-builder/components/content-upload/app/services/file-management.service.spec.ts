import { FileInput } from "../upload/upload.component";
import { FileManagementService } from "./file-management.service";
import { UploadErrorUpdate } from "./typings";

describe("FileManagementService", () => {
    const createFile = (file: Partial<FileInput>): FileInput =>
        file as FileInput;

    it("emits an error update with the error field populated when getCognitoIdentityId fails", (done) => {
        const credentialsError = new Error("Unauthorized");
        const authMock = {
            user: { username: "author" },
            isAdminOrEditor: jest.fn().mockReturnValue(true),
        };
        const userServiceMock = {
            getUserFileAccessId: jest.fn().mockRejectedValue(credentialsError),
        };

        const service = new FileManagementService(
            null,
            authMock as any,
            userServiceMock as any,
        );

        service
            .upload({
                authorUsername: "author",
                learningObjectCuid: "test-cuid",
                learningObjectRevisionId: 0,
                files: [createFile({ name: "test.pdf" })],
            })
            .subscribe((update) => {
                if (update.type === "error") {
                    expect((update as UploadErrorUpdate).error).toBe(
                        credentialsError,
                    );
                    done();
                }
            });
    });

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
