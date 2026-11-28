import { of } from "rxjs";
import { SearchService } from "./search.service";
import { OrderBy, SortType } from "../../../interfaces/query";

describe("Browse search request serialization", () => {
    it.each([SortType.Descending, SortType.Ascending])(
        "serializes rating direction %s with filters and pagination",
        async (sortType) => {
            const get = jest
                .fn()
                .mockReturnValue(of({ objects: [], total: 0 }));
            const service = new SearchService({ get } as any);
            await service.getLearningObjects({
                orderBy: OrderBy.Rating,
                sortType,
                currPage: 2,
                text: "network security",
                topics: ["topic-1"],
                status: ["released"],
            });
            const params = new URL(get.mock.calls[0][0]).searchParams;
            expect(params.get("orderBy")).toBe("rating");
            expect(params.get("sortType")).toBe(String(sortType));
            expect(params.get("currPage")).toBe("2");
            expect(params.get("text")).toBe("network security");
            expect(params.get("topics")).toBe("topic-1");
            expect(params.get("status")).toBe("released");
        },
    );
});
