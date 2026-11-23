import { SearchComponent } from "./search.component";

describe("Browse text search sorting", () => {
    it.each([-1, 1])(
        "preserves rating direction %s and filters while resetting pagination",
        (sortType) => {
            const navigate = jest.fn();
            const component = new SearchComponent(
                { navigate } as any,
                {
                    snapshot: {
                        queryParams: {
                            orderBy: "rating",
                            sortType,
                            currPage: 3,
                            topics: "topic-1",
                        },
                    },
                } as any,
                {} as any,
            );
            component.performSearch({ value: " security ", blur: jest.fn() });
            expect(navigate).toHaveBeenCalledWith(["/browse"], {
                queryParams: {
                    orderBy: "rating",
                    sortType,
                    currPage: 1,
                    topics: "topic-1",
                    text: "security",
                },
            });
        },
    );

    it.each(["date", "downloads", undefined])(
        "preserves legacy relevance behavior for %s",
        (orderBy) => {
            const navigate = jest.fn();
            const component = new SearchComponent(
                { navigate } as any,
                { snapshot: { queryParams: { orderBy } } } as any,
                {} as any,
            );
            component.performSearch({ value: "security", blur: jest.fn() });
            expect(navigate.mock.calls[0][1].queryParams.orderBy).toBe("none");
        },
    );
});
