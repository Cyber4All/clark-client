import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";

import { LearningObjectsComponent } from "./learning-objects.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import {
    provideHttpClient,
    withInterceptorsFromDi,
} from "@angular/common/http";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";
import { AuthService } from "app/core/auth-module/auth.service";
import { CollectionService } from "app/core/collection-module/collections.service";
import { of } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import {
    HttpTestingController,
    provideHttpClientTesting,
} from "@angular/common/http/testing";
import { OrderBy, SortType } from "app/interfaces/query";
import { environment } from "@env/environment";

describe("LearningObjectsComponent", () => {
    let component: LearningObjectsComponent;
    let fixture: ComponentFixture<LearningObjectsComponent>;
    let httpMock: HttpTestingController;
    let router: Router;

    class ActivatedRouteStub {
        public parent = {
            params: of({}),
        };

        public queryParams = of({});
    }

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            teardown: { destroyAfterEach: false },
            imports: [RouterTestingModule, LearningObjectsComponent],
            providers: [
                ToastrOvenService,
                AuthService,
                CollectionService,
                { provide: ActivatedRoute, useClass: ActivatedRouteStub },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LearningObjectsComponent);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it.each([
        [OrderBy.Name, "name"],
        [OrderBy.Author, "author"],
    ])(
        "sorts by %s in both directions and preserves query parameters",
        async (orderBy, apiOrderBy) => {
            component.query = {
                text: "search text",
                status: ["released"],
                collection: "collection-abv",
                currPage: 3,
                start: "2026-01-01",
                end: "2026-02-01",
            };

            component.sortBy(orderBy);
            let request = httpMock.expectOne(
                (req) =>
                    req.url === `${environment.apiURL}/learning-objects` &&
                    req.params.get("orderBy") === apiOrderBy &&
                    req.params.get("sortType") === "-1" &&
                    req.params.get("text") === "search text" &&
                    req.params.get("currPage") === "3" &&
                    req.params.get("status") === "released" &&
                    req.params.get("collection") === "collection-abv" &&
                    req.params.get("start") === "2026-01-01" &&
                    req.params.get("end") === "2026-02-01",
            );
            request.flush({ objects: [], total: 0 });

            await fixture.whenStable();
            expect(component.query.orderBy).toBe(orderBy);
            expect(component.query.sortType).toBe(SortType.Descending);
            expect(router.url).toContain(`orderBy=${apiOrderBy}`);
            expect(router.url).toContain("sortType=-1");

            component.sortBy(orderBy);
            request = httpMock.expectOne(
                (req) =>
                    req.url === `${environment.apiURL}/learning-objects` &&
                    req.params.get("orderBy") === apiOrderBy &&
                    req.params.get("sortType") === "1" &&
                    req.params.get("text") === "search text" &&
                    req.params.get("currPage") === "3" &&
                    req.params.get("status") === "released" &&
                    req.params.get("collection") === "collection-abv" &&
                    req.params.get("start") === "2026-01-01" &&
                    req.params.get("end") === "2026-02-01",
            );
            request.flush({ objects: [], total: 0 });

            await fixture.whenStable();
            expect(component.query.sortType).toBe(SortType.Ascending);
            expect(router.url).toContain(`orderBy=${apiOrderBy}`);
            expect(router.url).toContain("sortType=1");
        },
    );
});
