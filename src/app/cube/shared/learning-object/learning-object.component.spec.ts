import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { LearningObjectListingComponent } from "./learning-object.component";
import { RatingService, LearningObjectRatings } from "../../../core/rating-module/rating.service";
import { MetricService } from "../../../core/metric-module/metric.service";
import { TagsStore } from "app/core/learning-object-module/tags/tags.store";
import { TopicsStore } from "app/core/learning-object-module/topics/topics.store";
import { AuthService } from "../../../core/auth-module/auth.service";
import { OrganizationStore } from "../../../core/organization-module/organization.store";
import { LearningObject } from "@entity";
import { of } from "rxjs";

// ---------------------------------------------------------------------------
// Minimal stub for a LearningObject that refresh() requires
// ---------------------------------------------------------------------------
function makeStubLo(overrides: Partial<LearningObject> = {}): LearningObject {
    return {
        cuid: "test-cuid-1234",
        version: 1,
        topics: [],
        tags: [],
        guidelines: [],
        ...overrides,
    } as unknown as LearningObject;
}

// ---------------------------------------------------------------------------
// Service stubs
// ---------------------------------------------------------------------------
const ratingsSuccess: LearningObjectRatings = {
    avgValue: 4.2,
    ratings: [{ value: 4 } as any, { value: 5 } as any],
};

const metricsSuccess = { downloads: 42 };

function makeRatingServiceStub(resolve: boolean) {
    return {
        getLearningObjectRatings: resolve
            ? jasmine.createSpy("getLearningObjectRatings").and.resolveTo(ratingsSuccess)
            : jasmine.createSpy("getLearningObjectRatings").and.rejectWith(new Error("504 proxy error")),
    };
}

function makeMetricServiceStub(resolve: boolean) {
    return {
        getLearningObjectMetrics: resolve
            ? jasmine.createSpy("getLearningObjectMetrics").and.resolveTo(metricsSuccess)
            : jasmine.createSpy("getLearningObjectMetrics").and.rejectWith(new Error("504 proxy error")),
    };
}

const tagsStoreStub = {
    tag$: jasmine.createSpy("tag$").and.returnValue(Promise.resolve(of(null))),
};

const topicsStoreStub = {
    topics$: jasmine.createSpy("topics$").and.returnValue(Promise.resolve(of(null))),
};

const authServiceStub = {};
const orgStoreStub = {};

// ---------------------------------------------------------------------------
// Helper: configure TestBed with given service stubs
// ---------------------------------------------------------------------------
async function createFixture(
    ratingServiceStub: ReturnType<typeof makeRatingServiceStub>,
    metricServiceStub: ReturnType<typeof makeMetricServiceStub>,
): Promise<{ component: LearningObjectListingComponent; fixture: ComponentFixture<LearningObjectListingComponent> }> {
    await TestBed.configureTestingModule({
        imports: [LearningObjectListingComponent],
        providers: [
            { provide: RatingService, useValue: ratingServiceStub },
            { provide: MetricService, useValue: metricServiceStub },
            { provide: TagsStore, useValue: tagsStoreStub },
            { provide: TopicsStore, useValue: topicsStoreStub },
            { provide: AuthService, useValue: authServiceStub },
            { provide: OrganizationStore, useValue: orgStoreStub },
        ],
        teardown: { destroyAfterEach: false },
    }).compileComponents();

    const fixture = TestBed.createComponent(LearningObjectListingComponent);
    const component = fixture.componentInstance;
    return { component, fixture };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("LearningObjectListingComponent", () => {
    afterEach(() => TestBed.resetTestingModule());

    describe("refresh() – all services succeed", () => {
        it("should display ratings and download counts from the resolved data", async () => {
            const { component } = await createFixture(
                makeRatingServiceStub(true),
                makeMetricServiceStub(true),
            );

            component.learningObject = makeStubLo();
            // Wait for all async microtasks
            await new Promise<void>((r) => setTimeout(r, 0));

            expect(component.averageRating).toBe(4.2);
            expect(component.reviewsCount).toBe(2);
            expect(component.downloadsCount).toBe(42);
        });
    });

    describe("refresh() – metrics endpoint returns 504 (rejects)", () => {
        it("should NOT throw and should fall back to 0 for all metric fields", async () => {
            const { component } = await createFixture(
                makeRatingServiceStub(true),   // ratings succeed
                makeMetricServiceStub(false),  // metrics reject (simulates 504)
            );

            let caughtError: unknown = null;
            const originalHandler = window.onerror;
            window.onerror = (e) => {
                caughtError = e;
                return false;
            };

            component.learningObject = makeStubLo();
            await new Promise<void>((r) => setTimeout(r, 0));

            window.onerror = originalHandler;

            // Ratings still resolved, metrics fell back to 0
            expect(component.averageRating).toBe(4.2);
            expect(component.reviewsCount).toBe(2);
            expect(component.downloadsCount).toBe(0);
            expect(component.isTrending).toBeFalse();

            // No unhandled rejection should have reached the global handler
            expect(caughtError).toBeNull();
        });

        it("should NOT throw when both ratings and metrics reject", async () => {
            const { component } = await createFixture(
                makeRatingServiceStub(false),  // ratings reject
                makeMetricServiceStub(false),  // metrics reject
            );

            component.learningObject = makeStubLo();
            await new Promise<void>((r) => setTimeout(r, 0));

            expect(component.averageRating).toBe(0);
            expect(component.reviewsCount).toBe(0);
            expect(component.downloadsCount).toBe(0);
            expect(component.isTrending).toBeFalse();
        });
    });
});
