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
});
