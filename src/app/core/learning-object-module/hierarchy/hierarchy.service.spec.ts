import {
    HttpClientTestingModule,
    HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { HierarchyService } from "./hierarchy.service";

describe("HierarchyService.getChildren", () => {
    let service: HierarchyService;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(HierarchyService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it("GETs the children route with credentials and returns the payload", () => {
        const body = [{ id: "c1" }] as any;
        let result: unknown;
        service.getChildren("abc123").subscribe((r) => (result = r));

        const req = http.expectOne(
            `${environment.apiURL}/learning-objects/abc123/children`,
        );
        expect(req.request.method).toBe("GET");
        expect(req.request.withCredentials).toBe(true);
        req.flush(body);

        expect(result).toEqual(body);
    });

    it("propagates HTTP errors to the caller", () => {
        let failed = false;
        service
            .getChildren("abc123")
            .subscribe({ error: () => (failed = true) });

        http.expectOne(
            `${environment.apiURL}/learning-objects/abc123/children`,
        ).flush("nope", { status: 500, statusText: "Server Error" });

        expect(failed).toBe(true);
    });
});
