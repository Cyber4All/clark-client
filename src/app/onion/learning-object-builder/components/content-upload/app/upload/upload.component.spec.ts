import { BehaviorSubject } from "rxjs";
import { LearningObject } from "@entity";
import { UploadComponent } from "./upload.component";

describe("UploadComponent", () => {
    let component: UploadComponent;
    let notificationService: { warning: jest.Mock };
    let learningObject$: BehaviorSubject<LearningObject>;

    beforeEach(() => {
        notificationService = { warning: jest.fn() };
        component = new UploadComponent(
            notificationService as any,
            { detectChanges: jest.fn() } as any,
            {} as any,
            {} as any,
            {} as any,
        );
        learningObject$ = new BehaviorSubject<LearningObject>(null);
        component.learningObject$ = learningObject$.asObservable();
    });

    afterEach(() => {
        component.unsubscribe$.next();
        component.unsubscribe$.complete();
    });

    it("handles a learning object whose materials omit the files array", () => {
        const object = new LearningObject();
        // Simulate the materials API response omitting `files`
        object.materials = {
            urls: [],
            notes: "",
            folderDescriptions: [],
            pdf: { name: "", url: "" },
        } as any;

        component.ngOnInit();

        expect(() => learningObject$.next(object)).not.toThrow();
        expect(component.files$.value).toEqual([]);
        expect(component.solutionUpload).toBe(false);
        expect(notificationService.warning).not.toHaveBeenCalled();
    });

    it("still publishes files when they are present", () => {
        const object = new LearningObject();
        const files = [{ name: "solution.pdf", fullPath: "solution.pdf" }];
        object.materials = {
            files,
            urls: [],
            notes: "",
            folderDescriptions: [],
            pdf: { name: "", url: "" },
        } as any;

        component.ngOnInit();
        learningObject$.next(object);

        expect(component.files$.value).toBe(files as any);
        expect(component.solutionUpload).toBe(true);
    });
});
