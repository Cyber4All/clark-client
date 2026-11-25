import { TestBed } from "@angular/core/testing";
import {
    HttpClientTestingModule,
    HttpTestingController,
} from "@angular/common/http/testing";
import { LearningObject } from "@entity";
import { environment } from "../../../../environments/environment";
import { HierarchyService } from "./hierarchy.service";

describe("HierarchyService.searchLinkCandidates", () => {
    let service: HierarchyService;
    let http: HttpTestingController;
    const url = `${environment.apiURL}/learning-objects/parent-1/hierarchy-candidates`;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(HierarchyService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it("asks for released objects (link mode) with defaults for the page", () => {
        service.searchLinkCandidates({ parentId: "parent-1" }).subscribe();

        const req = http.expectOne((r) => r.url === url);
        expect(req.request.method).toBe("GET");
        expect(req.request.withCredentials).toBe(true);
        expect(req.request.params.get("mode")).toBe("link");
        expect(req.request.params.get("currPage")).toBe("1");
        expect(req.request.params.get("limit")).toBe("10");
        expect(req.request.params.has("text")).toBe(false);
        expect(req.request.params.has("hierarchyRootId")).toBe(false);
        expect(req.request.params.has("length")).toBe(false);
        expect(req.request.params.has("topics")).toBe(false);
        req.flush({ objects: [], total: 0 });
    });

    it("sends the root, text, repeated length and topic filters, and the page", () => {
        service
            .searchLinkCandidates({
                parentId: "parent-1",
                hierarchyRootId: "root-1",
                text: "firewall",
                length: [
                    LearningObject.Length.MODULE,
                    LearningObject.Length.UNIT,
                ],
                topics: ["t1", "t2"],
                currPage: 3,
                limit: 5,
            })
            .subscribe();

        const req = http.expectOne((r) => r.url === url);
        const params = req.request.params;
        expect(params.get("hierarchyRootId")).toBe("root-1");
        expect(params.get("text")).toBe("firewall");
        expect(params.getAll("length")).toEqual(["module", "unit"]);
        expect(params.getAll("topics")).toEqual(["t1", "t2"]);
        expect(params.get("currPage")).toBe("3");
        expect(params.get("limit")).toBe("5");
        req.flush({ objects: [], total: 0 });
    });

    it("encodes the parent id in the path", () => {
        service.searchLinkCandidates({ parentId: "a/b" }).subscribe();
        http.expectOne(
            `${environment.apiURL}/learning-objects/a%2Fb/hierarchy-candidates?mode=link&currPage=1&limit=10`,
        ).flush({ objects: [], total: 0 });
    });

    it("maps the response to learning objects and a total", () => {
        let page: Awaited<ReturnType<typeof firstPage>>;
        const firstPage = () =>
            new Promise<{ learningObjects: LearningObject[]; total: number }>(
                (resolve) =>
                    service
                        .searchLinkCandidates({ parentId: "parent-1" })
                        .subscribe(resolve),
            );
        const promise = firstPage().then((p) => (page = p));
        http.expectOne((r) => r.url === url).flush({
            objects: [
                {
                    id: "o1",
                    cuid: "c1",
                    name: "One",
                    length: "module",
                    status: "released",
                    version: 2,
                },
            ],
            total: 41,
        });

        return promise.then(() => {
            expect(page.total).toBe(41);
            expect(page.learningObjects).toHaveLength(1);
            expect(page.learningObjects[0]).toBeInstanceOf(LearningObject);
            expect(page.learningObjects[0].id).toBe("o1");
            expect(page.learningObjects[0].name).toBe("One");
            expect(page.learningObjects[0].length).toBe("module");
            expect(page.learningObjects[0].status).toBe("released");
        });
    });

    it("passes an API failure on to the caller", () => {
        let status: number | undefined;
        service.searchLinkCandidates({ parentId: "parent-1" }).subscribe({
            error: (error) => (status = error.status),
        });
        http.expectOne((r) => r.url === url).flush("no", {
            status: 403,
            statusText: "Forbidden",
        });
        expect(status).toBe(403);
    });
});
