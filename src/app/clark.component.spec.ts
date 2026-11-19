import * as Sentry from "@sentry/angular";
import { ClarkComponent } from "./clark.component";

jest.mock("@sentry/angular", () => ({ addBreadcrumb: jest.fn() }));

describe("ClarkComponent.refreshDowntime", () => {
    function build(getDowntime: jest.Mock): ClarkComponent {
        const component = Object.create(ClarkComponent.prototype);
        component.downtime = { isDown: false, message: "" };
        component.utilityService = { getDowntime };
        return component;
    }

    afterEach(() => jest.clearAllMocks());

    it("updates downtime state on success", async () => {
        const component = build(
            jest
                .fn()
                .mockResolvedValue({ isDown: true, message: "Maintenance" }),
        );
        await component.refreshDowntime();
        expect(component.downtime).toEqual({
            isDown: true,
            message: "Maintenance",
        });
    });

    it("swallows a failed check, keeps state and leaves a breadcrumb", async () => {
        const component = build(
            jest.fn().mockRejectedValue(new ProgressEvent("error")),
        );
        await expect(component.refreshDowntime()).resolves.toBeUndefined();
        expect(component.downtime).toEqual({ isDown: false, message: "" });
        expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
            expect.objectContaining({ category: "downtime", level: "warning" }),
        );
    });
});
