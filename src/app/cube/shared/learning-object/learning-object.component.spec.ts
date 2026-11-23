import * as Sentry from "@sentry/angular";
import { LearningObjectListingComponent } from "./learning-object.component";

jest.mock("@sentry/angular", () => ({ captureException: jest.fn() }));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("LearningObjectListingComponent metrics loading", () => {
    const lo: any = {
        cuid: "8606b295-4881-4003-aa69-86f9338727a0",
        version: 1,
        topics: [],
        tags: [],
        guidelines: [],
    };

    function create(
        metricImpl: (cuid: string, start?: string) => Promise<any>,
    ) {
        const ratingService: any = {
            getLearningObjectRatings: jest
                .fn()
                .mockResolvedValue({ avgValue: 4, ratings: [{}, {}] }),
        };
        const metricService: any = {
            getLearningObjectMetrics: jest.fn(metricImpl),
        };
        const cd: any = {
            markForCheck: jest.fn(),
            detectChanges: jest.fn(),
            detach: jest.fn(),
        };
        const component = new LearningObjectListingComponent(
            ratingService,
            metricService,
            {} as any,
            {} as any,
            {} as any,
            {} as any,
            cd,
        );
        return { component, cd };
    }

    beforeEach(() => jest.clearAllMocks());

    it("falls back to 0 and reports to Sentry when recent downloads request fails (504)", async () => {
        const proxyError = {
            message:
                "Error occurred while trying to proxy: api.clark.center/learning-objects/metrics",
        };
        const { component, cd } = create((_cuid, start) =>
            start
                ? Promise.reject(proxyError)
                : Promise.resolve({ downloads: 42 }),
        );

        component.learningObject = lo;
        await flush();

        expect(component.averageRating).toBe(4);
        expect(component.reviewsCount).toBe(2);
        expect(component.downloadsCount).toBe(42);
        expect(component.isTrending).toBe(false);
        expect(cd.detectChanges).toHaveBeenCalled();
        expect(Sentry.captureException).toHaveBeenCalledTimes(1);
        expect(Sentry.captureException).toHaveBeenCalledWith(
            expect.any(Error),
            expect.objectContaining({
                tags: expect.objectContaining({ request: "recent-downloads" }),
                extra: expect.objectContaining({ cuid: lo.cuid }),
            }),
        );
    });

    it("uses fetched values when all requests succeed", async () => {
        const { component } = create((_cuid, start) =>
            Promise.resolve({ downloads: start ? 15 : 100 }),
        );

        component.learningObject = lo;
        await flush();

        expect(component.downloadsCount).toBe(100);
        expect(component.isTrending).toBe(true);
        expect(Sentry.captureException).not.toHaveBeenCalled();
    });
});
