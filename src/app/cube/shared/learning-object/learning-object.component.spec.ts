import { LearningObjectListingComponent } from "./learning-object.component";

jest.mock("@sentry/angular", () => ({
    addBreadcrumb: jest.fn(),
    captureException: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Sentry = require("@sentry/angular");

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("LearningObjectListingComponent metrics error handling", () => {
    const gatewayTimeout = {
        status: 504,
        message: "Error occurred while trying to proxy",
    };
    let ratingService: any;
    let metricService: any;
    let component: LearningObjectListingComponent;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "warn").mockImplementation(() => undefined);
        ratingService = {
            getLearningObjectRatings: jest
                .fn()
                .mockResolvedValue({ avgValue: 4, ratings: [{}, {}] }),
        };
        metricService = {
            getLearningObjectMetrics: jest
                .fn()
                .mockRejectedValue(gatewayTimeout),
        };
        const cd: any = {
            markForCheck: jest.fn(),
            detectChanges: jest.fn(),
            detach: jest.fn(),
        };
        component = new LearningObjectListingComponent(
            ratingService,
            metricService,
            {} as any,
            {} as any,
            {} as any,
            {} as any,
            cd,
        );
    });

    it("falls back to 0 downloads when the metrics endpoint returns 504", async () => {
        component.learningObject = {
            cuid: "abc",
            version: 0,
            topics: [],
            tags: [],
        } as any;
        await flush();
        await flush();

        expect(metricService.getLearningObjectMetrics).toHaveBeenCalledTimes(2);
        expect(component.downloadsCount).toBe(0);
        expect(component.isTrending).toBe(false);
        expect(component.averageRating).toBe(4);
        expect(component.reviewsCount).toBe(2);
        expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
            expect.objectContaining({ data: { cuid: "abc", status: 504 } }),
        );
        expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it("keeps ratings fallback when the ratings request fails", async () => {
        ratingService.getLearningObjectRatings.mockRejectedValue(
            gatewayTimeout,
        );
        metricService.getLearningObjectMetrics.mockResolvedValue({
            downloads: 12,
        });
        component.learningObject = {
            cuid: "abc",
            version: 0,
            topics: [],
            tags: [],
        } as any;
        await flush();
        await flush();

        expect(component.averageRating).toBe(0);
        expect(component.downloadsCount).toBe(12);
        expect(component.isTrending).toBe(true);
    });
});
