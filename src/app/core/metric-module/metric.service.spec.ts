import {
    HttpClientTestingModule,
    HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "@env/environment";
import { MetricService } from "./metric.service";

describe("MetricService learning object downloads", () => {
    let service: MetricService;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(MetricService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it("scopes each card's metrics using the API's learningObjectcuid parameter", async () => {
        const first = service.getLearningObjectMetrics("object-a");
        const second = service.getLearningObjectMetrics("object-b");

        http.expectOne(
            `${environment.apiURL}/learning-objects/metrics?learningObjectcuid=object-a`,
        ).flush({ downloads: 12, saves: 0 });
        http.expectOne(
            `${environment.apiURL}/learning-objects/metrics?learningObjectcuid=object-b`,
        ).flush({ downloads: 37, saves: 0 });

        expect((await first).downloads).toBe(12);
        expect((await second).downloads).toBe(37);
    });

    it("keeps recent download metrics scoped to the same object and date range", async () => {
        const start = "2026-09-21T00:00:00.000Z";
        const end = "2026-10-21T00:00:00.000Z";
        const result = service.getLearningObjectMetrics("object/a", start, end);

        http.expectOne(
            `${environment.apiURL}/learning-objects/metrics?learningObjectcuid=object%2Fa&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
        ).flush({ downloads: 3, saves: 0 });

        expect((await result).downloads).toBe(3);
    });

    it("preserves aggregate metrics when no object is requested", async () => {
        const result = service.getLearningObjectMetrics();
        http.expectOne(`${environment.apiURL}/learning-objects/metrics`).flush({
            downloads: 98000,
            saves: 0,
        });
        expect((await result).downloads).toBe(98000);
    });
});
