import {
    HttpClientTestingModule,
    HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "@env/environment";
import { MetricService } from "./metric.service";

describe("MetricService", () => {
    let service: MetricService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [MetricService],
        });

        service = TestBed.inject(MetricService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it("requests total downloads for an inclusive/exclusive date range", async () => {
        const start = "2026-10-11T00:00:00.000Z";
        const end = "2026-10-18T00:00:00.000Z";
        const result = service.getTotalDownloads(start, end);

        const request = httpMock.expectOne(
            (req) =>
                req.url === `${environment.apiURL}/reports/total-downloads` &&
                req.params.get("start") === start &&
                req.params.get("end") === end,
        );
        expect(request.request.method).toBe("GET");
        request.flush({ totalDownloads: 123 });

        await expect(result).resolves.toBe(123);
    });
});
