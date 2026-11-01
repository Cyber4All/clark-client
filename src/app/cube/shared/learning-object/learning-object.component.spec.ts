jest.mock("@sentry/angular", () => ({ captureException: jest.fn() }));

import * as Sentry from "@sentry/angular";
import { LearningObjectListingComponent } from "./learning-object.component";

describe("LearningObjectListingComponent refresh", () => {
    const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

    function build(metricImpl: (...args: any[]) => Promise<any>) {
        const ratingService = {
            getLearningObjectRatings: jest
                .fn()
                .mockResolvedValue({ avgValue: 4, ratings: [{}, {}] }),
        };
        const metricService = { getLearningObjectMetrics: jest.fn(metricImpl) };
        const cd = {
            markForCheck: jest.fn(),
            detectChanges: jest.fn(),
            detach: jest.fn(),
        };
        const component = new LearningObjectListingComponent(
            ratingService as any,
            metricService as any,
            {} as any,
            {} as any,
            {} as any,
            {} as any,
            cd as any,
        );
        return { component, cd };
    }

    beforeEach(() => jest.clearAllMocks());

    it("renders with fallbacks and reports when the metrics API returns a 504", async () => {
        const proxyError =
            "Error occurred while trying to proxy: api.clark.center/learning-objects/metrics";
        const { component, cd } = build(() => Promise.reject(proxyError));

        component.learningObject = { cuid: "abc", version: 0 } as any;
        await flush();

        expect(component.averageRating).toBe(4);
        expect(component.reviewsCount).toBe(2);
        expect(component.downloadsCount).toBe(0);
        expect(component.isTrending).toBe(false);
        expect(cd.detectChanges).toHaveBeenCalled();
        expect(Sentry.captureException).toHaveBeenCalledTimes(2);
        const [err, ctx] = (Sentry.captureException as jest.Mock).mock.calls[0];
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe(proxyError);
        expect(ctx.level).toBe("warning");
        expect(ctx.extra.cuid).toBe("abc");
    });

    it("sets downloads and trending when metrics succeed", async () => {
        const { component } = build(() => Promise.resolve({ downloads: 25 }));

        component.learningObject = { cuid: "abc", version: 0 } as any;
        await flush();

        expect(component.downloadsCount).toBe(25);
        expect(component.isTrending).toBe(true);
        expect(Sentry.captureException).not.toHaveBeenCalled();
    });
});
