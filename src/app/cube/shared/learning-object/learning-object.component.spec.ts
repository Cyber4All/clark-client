import { ChangeDetectorRef } from "@angular/core";
import { LearningObjectListingComponent } from "./learning-object.component";

describe("LearningObjectListingComponent", () => {
    let ratingService: { getLearningObjectRatings: jest.Mock };
    let metricService: { getLearningObjectMetrics: jest.Mock };
    let cd: Partial<ChangeDetectorRef>;
    let component: LearningObjectListingComponent;

    const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

    beforeEach(() => {
        ratingService = { getLearningObjectRatings: jest.fn() };
        metricService = { getLearningObjectMetrics: jest.fn() };
        cd = {
            markForCheck: jest.fn(),
            detectChanges: jest.fn(),
            detach: jest.fn(),
        };
        jest.spyOn(console, "warn").mockImplementation(() => undefined);

        component = new LearningObjectListingComponent(
            ratingService as any,
            metricService as any,
            {} as any,
            {} as any,
            {} as any,
            {} as any,
            cd as ChangeDetectorRef,
        );
    });

    afterEach(() => jest.restoreAllMocks());

    it("falls back to zero values when metrics/ratings requests fail", async () => {
        const proxyError =
            "Error occurred while trying to proxy: api.clark.center/learning-objects/metrics";
        ratingService.getLearningObjectRatings.mockRejectedValue(proxyError);
        metricService.getLearningObjectMetrics.mockRejectedValue(proxyError);

        const unhandled = jest.fn();
        process.on("unhandledRejection", unhandled);

        component.learningObject = {
            cuid: "abc",
            version: 1,
            topics: [],
            tags: [],
        } as any;
        await flush();
        await flush();

        process.off("unhandledRejection", unhandled);

        expect(unhandled).not.toHaveBeenCalled();
        expect(component.averageRating).toBe(0);
        expect(component.reviewsCount).toBe(0);
        expect(component.downloadsCount).toBe(0);
        expect(component.isTrending).toBe(false);
        expect(console.warn).toHaveBeenCalled();
        expect(cd.detectChanges).toHaveBeenCalled();
    });

    it("uses fulfilled values when only some requests fail", async () => {
        ratingService.getLearningObjectRatings.mockResolvedValue({
            avgValue: 4.5,
            ratings: [{}, {}],
        });
        metricService.getLearningObjectMetrics.mockImplementation(
            (_cuid: string, start?: string) =>
                start
                    ? Promise.reject("504")
                    : Promise.resolve({ downloads: 42 }),
        );

        component.learningObject = {
            cuid: "abc",
            version: 1,
            topics: [],
            tags: [],
        } as any;
        await flush();
        await flush();

        expect(component.averageRating).toBe(4.5);
        expect(component.reviewsCount).toBe(2);
        expect(component.downloadsCount).toBe(42);
        expect(component.isTrending).toBe(false);
    });
});
