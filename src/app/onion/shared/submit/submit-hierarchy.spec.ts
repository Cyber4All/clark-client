import { SubmitComponent } from "./submit.component";

describe("Hierarchy submission form", () => {
    it("forwards the author's selected authorizations and submission reason", async () => {
        const submitHierarchy = jest.fn().mockRejectedValue({ status: 400 });
        const error = jest.fn();
        // Exercise the form action without rendering its unrelated collection UI.
        const component = Object.create(
            SubmitComponent.prototype,
        ) as SubmitComponent;
        Object.assign(component, {
            needsChangelog: false,
            isHierarchySubmission: true,
            learningObject: { id: "parent-id" },
            collection: "secinj",
            selectedAuthorizations: ["Spelling and Grammar Changes"],
            submissionReason: "Please review the hierarchy",
            loading: [],
            learningObjectService: { submitHierarchy },
            toasterService: { error },
            auth: { logout: jest.fn() },
            isValidLearningObject: () => true,
            closeModal: jest.fn(),
        });

        await component.submitForReview();
        await Promise.resolve();

        expect(submitHierarchy).toHaveBeenCalledWith(
            "parent-id",
            "secinj",
            ["Spelling and Grammar Changes"],
            "Please review the hierarchy",
        );
        expect(error).toHaveBeenCalled();
        expect(component.loading).toEqual([]);
    });
});
