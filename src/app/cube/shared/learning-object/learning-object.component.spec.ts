import { LearningObjectListingComponent } from "./learning-object.component";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("LearningObjectListingComponent", () => {
    let ratingService: { getLearningObjectRatings: jest.Mock };
    let metricService: { getLearningObjectMetrics: jest.Mock };
    let cd: {
        markForCheck: jest.Mock;
        detectChanges: jest.Mock;
        detach: jest.Mock;
    };
    let component: LearningObjectListingComponent;

    beforeEach(() => {
        ratingService = { getLearningObjectRatings: jest.fn() };
        metricService = { getLearningObjectMetrics: jest.fn() };
        cd = {
            markForCheck: jest.fn(),
            detectChanges: jest.fn(),
            detach: jest.fn(),
        };
        component = new LearningObjectListingComponent(
            ratingService as any,
            metricService as any,
            {} as any,
            {} as any,
            {} as any,
            {} as any,
            cd as any,
        );
        jest.spyOn(console, "warn").mockImplementation(() => undefined);
    });

    afterEach(() => jest.restoreAllMocks());

    const learningObject = {
        cuid: "abc",
        version: 0,
        topics: [],
        tags: [],
    } as any;

    it("populates counts when all requests succeed", async () => {
        ratingService.getLearningObjectRatings.mockResolvedValue({
            avgValue: 4.5,
            ratings: [{}, {}],
        });
        metricService.getLearningObjectMetrics.mockResolvedValue({
            downloads: 12,
        });

        component.learningObject = learningObject;
        await flush();

        expect(component.averageRating).toBe(4.5);
        expect(component.reviewsCount).toBe(2);
        expect(component.downloadsCount).toBe(12);
        expect(component.isTrending).toBe(true);
        expect(cd.detectChanges).toHaveBeenCalled();
    });

    it("falls back to defaults when the metrics request fails (e.g. gateway 504)", async () => {
        ratingService.getLearningObjectRatings.mockResolvedValue({
            avgValue: 3,
            ratings: [{}],
        });
        metricService.getLearningObjectMetrics.mockRejectedValue(
            "Error occurred while trying to proxy: api.clark.center/learning-objects/metrics",
        );
        const unhandled = jest.fn();
        process.on("unhandledRejection", unhandled);

        component.learningObject = learningObject;
        await flush();
        process.off("unhandledRejection", unhandled);

        expect(unhandled).not.toHaveBeenCalled();
        expect(component.averageRating).toBe(3);
        expect(component.reviewsCount).toBe(1);
        expect(component.downloadsCount).toBe(0);
        expect(component.isTrending).toBe(false);
        expect(cd.detectChanges).toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalled();
    });

    it("falls back to defaults when the ratings request fails", async () => {
        ratingService.getLearningObjectRatings.mockRejectedValue(
            new Error("504"),
        );
        metricService.getLearningObjectMetrics.mockResolvedValue({
            downloads: 2,
        });

        component.learningObject = learningObject;
        await flush();

        expect(component.averageRating).toBe(0);
        expect(component.reviewsCount).toBe(0);
        expect(component.downloadsCount).toBe(2);
    });
});
