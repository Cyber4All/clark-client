import { LearningObject } from "@entity";
import { BUILDER_ACTIONS } from "../../../builder-store.service";
import { ChangeStatusModalComponent } from "./change-status-modal.component";

describe("Builder status confirmation", () => {
    function setup() {
        const execute = jest.fn().mockResolvedValue(undefined);
        const error = jest.fn();
        const navigate = jest.fn();
        const component = new ChangeStatusModalComponent(
            { execute } as never,
            { createChangelog: jest.fn() } as never,
            { error } as never,
            { detectChanges: jest.fn() } as never,
            { navigate } as never,
        );
        component.learningObject = new LearningObject({
            status: LearningObject.Status.WAITING,
        });
        component.selectedStatus = LearningObject.Status.REVIEW;
        const closed = jest.fn();
        component.closed.subscribe(closed);
        return { component, execute, error, closed, navigate };
    }

    it("delegates confirmation to the store and updates the UI on success", async () => {
        const { component, execute, closed, error } = setup();
        await component.updateStatus();
        expect(execute).toHaveBeenCalledWith(BUILDER_ACTIONS.CHANGE_STATUS, {
            status: LearningObject.Status.REVIEW,
            reason: undefined,
        });
        expect(component.learningObject.status).toBe(
            LearningObject.Status.REVIEW,
        );
        expect(component.statuses).toEqual([
            LearningObject.Status.RELEASED,
            LearningObject.Status.REJECTED,
        ]);
        expect(closed).toHaveBeenCalledTimes(1);
        expect(component.serviceInteraction).toBe(false);
        expect(error).not.toHaveBeenCalled();
    });

    it("shows save blockers, clears busy state, and allows retry", async () => {
        const { component, execute, closed, error } = setup();
        execute.mockRejectedValueOnce(
            new Error("Please resolve save errors before changing status."),
        );
        await component.updateStatus();
        expect(error).toHaveBeenCalledWith(
            "Error!",
            "Please resolve save errors before changing status.",
        );
        expect(component.serviceInteraction).toBe(false);
        expect(component.learningObject.status).toBe(
            LearningObject.Status.WAITING,
        );
        expect(component.selectedStatus).toBe(LearningObject.Status.REVIEW);
        expect(closed).not.toHaveBeenCalled();
        await component.updateStatus();
        expect(component.learningObject.status).toBe(
            LearningObject.Status.REVIEW,
        );
        expect(closed).toHaveBeenCalledTimes(1);
    });

    it("shows backend errors without pretending that status changed", async () => {
        const { component, execute, closed, error } = setup();
        execute.mockRejectedValue({
            status: 403,
            error: { message: "User does not have the required access group" },
        });
        await component.updateStatus();
        expect(error).toHaveBeenCalledWith(
            "Error!",
            "User does not have the required access group",
        );
        expect(component.learningObject.status).toBe(
            LearningObject.Status.WAITING,
        );
        expect(component.serviceInteraction).toBe(false);
        expect(closed).not.toHaveBeenCalled();
    });

    it("prevents duplicate confirms while a request is pending", async () => {
        const { component, execute, closed } = setup();
        let finish: () => void;
        execute.mockReturnValue(
            new Promise<void>((resolve) => {
                finish = resolve;
            }),
        );
        const first = component.updateStatus();
        await component.updateStatus();
        expect(execute).toHaveBeenCalledTimes(1);
        expect(component.serviceInteraction).toBe(true);
        finish();
        await first;
        expect(component.serviceInteraction).toBe(false);
        expect(closed).toHaveBeenCalledTimes(1);
    });

    it.each([LearningObject.Status.RELEASED, LearningObject.Status.REJECTED])(
        "preserves dashboard navigation after %s",
        async (status) => {
            const { component, navigate } = setup();
            component.selectedStatus = status;
            await component.updateStatus();
            expect(navigate).toHaveBeenCalledWith([
                "admin",
                "learning-objects",
            ]);
        },
    );
});
