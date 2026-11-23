import { Subject } from "rxjs";
import { BrowseComponent } from "./browse.component";

describe("Browse sorting and navigation", () => {
    let component: BrowseComponent;
    let params: Subject<Record<string, string>>;
    let navigate: jest.Mock;
    let getLearningObjects: jest.Mock;

    beforeEach(() => {
        params = new Subject();
        navigate = jest.fn().mockResolvedValue(true);
        getLearningObjects = jest
            .fn()
            .mockResolvedValue({ learningObjects: [], total: 40 });
        component = new BrowseComponent(
            { getLearningObjects } as any,
            { queryParams: params } as any,
            { navigate } as any,
            { detach: jest.fn(), detectChanges: jest.fn() } as any,
            { query: new Subject() } as any,
            { removeStyle: jest.fn() } as any,
            {} as any,
        );
        jest.spyOn(
            component as any,
            "initializeFilterDropdowns",
        ).mockImplementation(() => {});
        component.ngAfterViewInit();
    });

    afterEach(() => component.ngOnDestroy());

    it.each([
        ["rh", "rating", -1, "Average Rating (Highest)"],
        ["rl", "rating", 1, "Average Rating (Lowest)"],
        ["dd", "date", -1, "Newest"],
        ["ad", "date", 1, "Oldest"],
        ["w", "downloads", -1, "Most Downloaded"],
    ])(
        "selects %s from a directly loaded later page",
        (key, orderBy, sortType, label) => {
            params.next({ currPage: "3", text: "security", topics: "topic-1" });
            component.toggleSort(key);
            expect(navigate).toHaveBeenLastCalledWith(["browse"], {
                queryParams: expect.objectContaining({
                    currPage: 1,
                    orderBy,
                    sortType,
                    text: "security",
                    topics: ["topic-1"],
                    status: ["released"],
                }),
            });
            expect(component.sortText).toBe(label);
            expect(component.sortMenuDown).toBe(false);
        },
    );

    it("restores labels and API queries on reload and history navigation", () => {
        for (const [direction, label] of [
            ["-1", "Average Rating (Highest)"],
            ["1", "Average Rating (Lowest)"],
            ["-1", "Average Rating (Highest)"],
        ]) {
            params.next({
                orderBy: "rating",
                sortType: direction,
                currPage: "2",
                text: "security",
                status: "rejected",
            });
            expect(component.sortText).toBe(label);
            expect(getLearningObjects).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    orderBy: "rating",
                    sortType: Number(direction),
                    currPage: 2,
                    text: "security",
                    status: ["released"],
                }),
            );
        }
    });

    it("retains rating and filters on pagination and returns to page 1 on filter changes", () => {
        params.next({
            orderBy: "rating",
            sortType: "-1",
            topics: "topic-1",
            text: "security",
        });
        component.pageCount = 3;
        component.nextPage();
        expect(navigate).toHaveBeenLastCalledWith(["browse"], {
            queryParams: expect.objectContaining({
                currPage: 2,
                orderBy: "rating",
                sortType: -1,
                topics: ["topic-1"],
            }),
        });
        component.filters = { level: ["high"], removed: [] };
        component.performSearch();
        expect(navigate).toHaveBeenLastCalledWith(["browse"], {
            queryParams: expect.objectContaining({
                currPage: 1,
                orderBy: "rating",
                sortType: -1,
                level: ["high"],
                text: "security",
            }),
        });
    });

    it("keeps relevance unlabeled and restores default Newest", () => {
        params.next({ text: "security", orderBy: "none" });
        expect(component.sortText).toBe("");
        params.next({});
        expect(component.sortText).toBe("Newest");
    });
});
