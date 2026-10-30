import { getLastCompletedWeekRange } from "./usage-stats.component";

describe("getLastCompletedWeekRange", () => {
    it("returns the latest completed Sunday-to-Saturday UTC week", () => {
        const range = getLastCompletedWeekRange(
            new Date("2026-10-21T15:00:00.000Z"),
        );

        expect(range).toEqual({
            start: "2026-10-11T00:00:00.000Z",
            end: "2026-10-18T00:00:00.000Z",
        });
    });

    it("does not include the current week when today is Sunday", () => {
        const range = getLastCompletedWeekRange(
            new Date("2026-10-25T15:00:00.000Z"),
        );

        expect(range).toEqual({
            start: "2026-10-18T00:00:00.000Z",
            end: "2026-10-25T00:00:00.000Z",
        });
    });
});
