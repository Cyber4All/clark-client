jest.mock("@sentry/angular", () => ({ captureMessage: jest.fn() }));
// Resolved via webpack/tsconfig in the app build; not needed for these handler tests
jest.mock("getUserAgentBrowser", () => ({ getUserAgentBrowser: jest.fn() }), {
    virtual: true,
});

import * as Sentry from "@sentry/angular";
import { UploadComponent } from "./upload.component";

/**
 * Builds a bare UploadComponent instance (no TestBed) exposing only the
 * state touched by the upload update handlers.
 */
function createComponent(): any {
    const component: any = Object.create(UploadComponent.prototype);
    component.uploadQueue = [];
    component.uploadQueueMap = {};
    component.activeUploadBatches = 0;
    component.newFileMeta = [];
    component.uploadProgress = 0;
    component.totalUploaded = 0;
    component.totalUploadSize = 0;
    component.folderInput = { nativeElement: { value: "x" } };
    component.fileInput = { nativeElement: { value: "x" } };
    component.uploadComplete = { emit: jest.fn() };
    component.filesUploaded = { emit: jest.fn() };
    component.error$ = { next: jest.fn() };
    return component;
}

function enqueue(component: any, paths: string[]) {
    component.enqueueFiles(
        paths.map((p) => ({ name: p, fullPath: p, size: 10 })),
    );
    component.activeUploadBatches++;
}

describe("UploadComponent upload updates", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        (Sentry.captureMessage as jest.Mock).mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("does not reset shared queue while another batch is still uploading", () => {
        const component = createComponent();
        enqueue(component, ["Module 5/a.pptx"]);
        enqueue(component, ["Module 4/b.pptx"]);

        component.handleUploadUpdates({
            type: "complete",
            data: { fullPath: "Module 5/a.pptx" },
        });
        component.handleUploadUpdates({
            type: "queueComplete",
            data: { successful: 1, failed: 0 },
        });
        jest.advanceTimersByTime(600);

        expect(component.uploadQueue.length).toBe(2);
        expect(() =>
            component.handleUploadUpdates({
                type: "complete",
                data: { fullPath: "Module 4/b.pptx" },
            }),
        ).not.toThrow();
        expect(component.uploadQueue[1].success).toBe(true);
        expect(Sentry.captureMessage).not.toHaveBeenCalled();

        component.handleUploadUpdates({
            type: "queueComplete",
            data: { successful: 1, failed: 0 },
        });
        jest.advanceTimersByTime(600);
        expect(component.uploadQueue.length).toBe(0);
        expect(component.activeUploadBatches).toBe(0);
    });

    it("does not throw and reports when an update references an untracked path", () => {
        const component = createComponent();

        expect(() =>
            component.handleUploadUpdates({
                type: "complete",
                data: { fullPath: "missing.pptx" },
            }),
        ).not.toThrow();
        expect(() =>
            component.handleUploadUpdates({
                type: "progress",
                data: { fullPath: "missing.pptx", totalUploaded: 5 },
            }),
        ).not.toThrow();
        expect(() =>
            component.handleUploadUpdates({
                type: "error",
                error: { name: "Other" },
                data: { fullPath: "missing.pptx" },
            }),
        ).not.toThrow();

        expect(component.newFileMeta).toEqual([{ fullPath: "missing.pptx" }]);
        expect(Sentry.captureMessage).toHaveBeenCalledTimes(3);
        expect(
            (Sentry.captureMessage as jest.Mock).mock.calls[0][1].extra
                .fullPath,
        ).toBe("missing.pptx");
    });
});
