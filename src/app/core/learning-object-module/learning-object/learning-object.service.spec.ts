import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { CookieService } from "ngx-cookie-service";
import { HttpConfigInterceptor } from "../../interceptor/httpconfig.interceptor";
import {
    HttpClientTestingModule,
    HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "@env/environment";
import { UserService } from "app/core/user-module/user.service";
import { LearningObject } from "@entity";
import { LearningObjectService } from "./learning-object.service";

describe("LearningObjectService", () => {
    let service: LearningObjectService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                LearningObjectService,
                {
                    provide: CookieService,
                    useValue: { get: () => "test-token" },
                },
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: HttpConfigInterceptor,
                    multi: true,
                },
                { provide: UserService, useValue: {} },
            ],
        });
        service = TestBed.inject(LearningObjectService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it("selects the highest released version when requested", () => {
        service
            .getLearningObjectObservable({
                cuidInfo: { cuid: "object-cuid" },
                latestReleased: true,
            })
            .subscribe((object) => {
                expect(object).toBeInstanceOf(LearningObject);
                expect((object as LearningObject).version).toBe(4);
                expect((object as LearningObject).status).toBe(
                    LearningObject.Status.RELEASED,
                );
            });

        const request = httpMock.expectOne(
            `${environment.apiURL}/learning-objects/object-cuid`,
        );
        expect(request.request.method).toBe("GET");
        request.flush([
            {
                cuid: "object-cuid",
                version: 2,
                status: LearningObject.Status.RELEASED,
                name: "Older released object",
                description: "Description",
            },
            {
                cuid: "object-cuid",
                version: 5,
                status: LearningObject.Status.UNRELEASED,
                name: "Draft object",
                description: "Description",
            },
            {
                cuid: "object-cuid",
                version: 4,
                status: LearningObject.Status.RELEASED,
                name: "Latest released object",
                description: "Description",
            },
        ]);
    });

    it("submits hierarchy form fields through the authenticated gateway PATCH", async () => {
        const result = service.submitHierarchy(
            "parent-id",
            "secinj",
            ["Spelling and Grammar Changes"],
            "Ready for review",
        );
        const request = httpMock.expectOne(
            `${environment.apiURL}/learning-objects/parent-id/status`,
        );
        expect(request.request.method).toBe("PATCH");
        expect(request.request.headers.get("Authorization")).toBe(
            "Bearer test-token",
        );
        expect(request.request.withCredentials).toBe(true);
        expect(request.request.body).toEqual({
            status: LearningObject.Status.WAITING,
            collection: "secinj",
            selectedAuthorizations: ["Spelling and Grammar Changes"],
            submissionReason: "Ready for review",
        });
        request.flush(null, { status: 204, statusText: "No Content" });
        await expect(result).resolves.toBeNull();
    });

    it("forwards an explicitly empty authorizations list", async () => {
        const result = service.submitHierarchy("parent-id", "secinj", []);
        const request = httpMock.expectOne(
            `${environment.apiURL}/learning-objects/parent-id/status`,
        );
        expect(request.request.body.selectedAuthorizations).toEqual([]);
        request.flush(null, { status: 204, statusText: "No Content" });
        await result;
    });

    it("releases hierarchies with an authenticated PATCH", async () => {
        const result = service.releaseHierarchy("parent-id");
        const request = httpMock.expectOne(
            `${environment.apiURL}/learning-objects/parent-id/status`,
        );
        expect(request.request.method).toBe("PATCH");
        expect(request.request.headers.get("Authorization")).toBe(
            "Bearer test-token",
        );
        expect(request.request.body).toEqual({
            status: LearningObject.Status.RELEASED,
        });
        request.flush(null, { status: 204, statusText: "No Content" });
        await result;
    });

    it("keeps individual status changes on POST", async () => {
        const result = service.updateLearningObjectStatus(
            "object-id",
            LearningObject.Status.REVIEW,
        );
        const request = httpMock.expectOne(
            `${environment.apiURL}/learning-objects/object-id/status`,
        );
        expect(request.request.method).toBe("POST");
        expect(request.request.headers.get("Authorization")).toBe(
            "Bearer test-token",
        );
        request.flush(null);
        await result;
    });

    it("propagates hierarchy validation errors to the form", async () => {
        const result = service.submitHierarchy("parent-id", "secinj", []);
        const rejected = expect(result).rejects.toMatchObject({ status: 400 });
        const request = httpMock.expectOne(
            `${environment.apiURL}/learning-objects/parent-id/status`,
        );
        request.flush(
            { message: "Invalid submission" },
            { status: 400, statusText: "Bad Request" },
        );
        await rejected;
    });
});
