import { LearningObject } from "@entity";
import { getLearningObjectStatusLabel } from "./learning-object-status";

describe("learning object status helpers", () => {
    it("labels unreleased learning objects as Draft", () => {
        expect(
            getLearningObjectStatusLabel(LearningObject.Status.UNRELEASED),
        ).toBe("Draft");
    });

});
