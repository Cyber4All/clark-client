import { SUBMISSION_ROUTES } from "./submissions.routes";

describe("SUBMISSION_ROUTES", () => {
    it("builds author submissions on the submissions route", () => {
        const route = SUBMISSION_ROUTES.SUBMIT_LEARNING_OBJECT({
            learningObjectId: "learning-object-id",
        });

        expect(route).toContain("/learning-objects/learning-object-id/submissions");
        expect(route).not.toContain("/status");
    });
});
