import {
    waitForAsync,
    ComponentFixture,
    TestBed,
    fakeAsync,
    tick,
} from "@angular/core/testing";
import { ChangeDetectorRef } from "@angular/core";
import { LearningObjectListingComponent } from "./learning-object.component";
import { MetricService } from "../../../core/metric-module/metric.service";
import { RatingService } from "../../../core/rating-module/rating.service";
import { TagsStore } from "app/core/learning-object-module/tags/tags.store";
import { TopicsStore } from "app/core/learning-object-module/topics/topics.store";
import { AuthService } from "../../../core/auth-module/auth.service";
import { OrganizationStore } from "../../../core/organization-module/organization.store";
import { LearningObject } from "@entity";

/**
 * Build a minimal stub LearningObject with the fields refresh() needs.
 */
function makeStubLearningObject(cuid = "test-cuid-1234"): LearningObject {
    return {
        cuid,
        version: 1,
        name: "Test Object",
        contributors: [],
        outcomes: [],
        topics: [],
        tags: [],
        guidelines: [],
        fileTypes: [],
    } as unknown as LearningObject;
}

describe("LearningObjectListingComponent – refresh() error resilience", () => {
    let component: LearningObjectListingComponent;
    let fixture: ComponentFixture<LearningObjectListingComponent>;

    let metricServiceSpy: jasmine.SpyObj<MetricService>;
    let ratingServiceSpy: jasmine.SpyObj<RatingService>;
    let tagsStoreSpy: jasmine.SpyObj<TagsStore>;
    let topicsStoreSpy: jasmine.SpyObj<TopicsStore>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let orgStoreSpy: jasmine.SpyObj<OrganizationStore>;

    beforeEach(waitForAsync(() => {
        metricServiceSpy = jasmine.createSpyObj("MetricService", [
            "getLearningObjectMetrics",
        ]);
        ratingServiceSpy = jasmine.createSpyObj("RatingService", [
            "getLearningObjectRatings",
        ]);
        tagsStoreSpy = jasmine.createSpyObj("TagsStore", ["getTagNames"]);
        topicsStoreSpy = jasmine.createSpyObj("TopicsStore", [
            "getTopicNames",
        ]);
        authServiceSpy = jasmine.createSpyObj("AuthService", [], {
            user: null,
        });
        orgStoreSpy = jasmine.createSpyObj("OrganizationStore", [
            "getOrganization",
        ]);

        // Default happy-path stubs
        ratingServiceSpy.getLearningObjectRatings.and.returnValue(
            Promise.resolve({ avgValue: 4.5, ratings: [{}, {}] } as any),
        );
        metricServiceSpy.getLearningObjectMetrics.and.returnValue(
            Promise.resolve({ downloads: 42 } as any),
        );
        tagsStoreSpy.getTagNames.and.returnValue(Promise.resolve([]));
        topicsStoreSpy.getTopicNames.and.returnValue(Promise.resolve([]));

        TestBed.configureTestingModule({
            imports: [LearningObjectListingComponent],
            providers: [
                { provide: MetricService, useValue: metricServiceSpy },
                { provide: RatingService, useValue: ratingServiceSpy },
                { provide: TagsStore, useValue: tagsStoreSpy },
                { provide: TopicsStore, useValue: topicsStoreSpy },
                { provide: AuthService, useValue: authServiceSpy },
                { provide: OrganizationStore, useValue: orgStoreSpy },
            ],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LearningObjectListingComponent);
        component = fixture.componentInstance;
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("renders correct metrics when all fetches succeed", fakeAsync(() => {
        component.learningObject = makeStubLearningObject();
        tick(0); // flush micro-task queue

        expect(component.averageRating).toBe(4.5);
        expect(component.reviewsCount).toBe(2);
        expect(component.downloadsCount).toBe(42);
    }));

    it("falls back to 0 downloads when the metrics endpoint rejects (e.g. 504)", fakeAsync(() => {
        // Simulate the 504 gateway timeout that triggered CLARK-CLIENT-7Y
        metricServiceSpy.getLearningObjectMetrics.and.returnValue(
            Promise.reject(
                new Error(
                    "Error occurred while trying to proxy: api.clark.center/learning-objects/metrics",
                ),
            ),
        );

        // Setting the input should not throw even though metrics will reject
        expect(() => {
            component.learningObject = makeStubLearningObject(
                "7540a58c-062e-4cb6-921e-59254f0345a0",
            );
        }).not.toThrow();

        tick(0); // flush all pending micro-tasks

        // Ratings resolved successfully — those values should still be set
        expect(component.averageRating).toBe(4.5);
        expect(component.reviewsCount).toBe(2);
        // Metrics rejected — falls back to 0
        expect(component.downloadsCount).toBe(0);
        // isTrending should remain false (0 recent downloads)
        expect(component.isTrending).toBeFalsy();
    }));

    it("falls back gracefully when ratings endpoint rejects", fakeAsync(() => {
        ratingServiceSpy.getLearningObjectRatings.and.returnValue(
            Promise.reject(new Error("Ratings service unavailable")),
        );

        expect(() => {
            component.learningObject = makeStubLearningObject();
        }).not.toThrow();

        tick(0);

        expect(component.averageRating).toBe(0);
        expect(component.reviewsCount).toBe(0);
        // Metrics resolved fine
        expect(component.downloadsCount).toBe(42);
    }));

    it("falls back gracefully when all fetches reject simultaneously", fakeAsync(() => {
        metricServiceSpy.getLearningObjectMetrics.and.returnValue(
            Promise.reject(new Error("504")),
        );
        ratingServiceSpy.getLearningObjectRatings.and.returnValue(
            Promise.reject(new Error("504")),
        );

        expect(() => {
            component.learningObject = makeStubLearningObject();
        }).not.toThrow();

        tick(0);

        expect(component.averageRating).toBe(0);
        expect(component.reviewsCount).toBe(0);
        expect(component.downloadsCount).toBe(0);
        expect(component.isTrending).toBeFalsy();
    }));
});
