import { Router, convertToParamMap } from "@angular/router";
import { LearningObject } from "@entity";
import { BehaviorSubject, of, throwError } from "rxjs";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { AuthService, AuthUser } from "app/core/auth-module/auth.service";
import { SearchService } from "app/core/learning-object-module/search/search.service";
import { PlaylistDetailsComponent } from "./playlist-details.component";

describe("PlaylistDetailsComponent", () => {
    const params = new BehaviorSubject(
        convertToParamMap({ playlistId: "playlist-id" }),
    );
    const playlist: Playlist = {
        _id: "playlist-id",
        userId: "user-id",
        learningObjectCuids: ["available-cuid", "stale-cuid"],
        name: "Public playlist",
        description: "A public playlist",
        visibility: "public",
    };

    it("loads CUIDs from the route playlist and preserves their order", () => {
        const availableObject = new LearningObject({
            cuid: "available-cuid",
            name: "Available object",
            description: "Object description",
            status: LearningObject.Status.RELEASED,
            version: 2,
        });
        const service = {
            getPlaylist: jest.fn().mockReturnValue(of(playlist)),
        };
        const learningObjectService = {
            getLearningObjectObservable: jest
                .fn()
                .mockImplementation(({ cuidInfo: { cuid } }) =>
                    of(cuid === "available-cuid" ? availableObject : null),
                ),
        };
        const component = new PlaylistDetailsComponent(
            { paramMap: params.asObservable() } as any,
            {} as Router,
            service as unknown as PlaylistService,
            learningObjectService as unknown as LearningObjectService,
            {} as SearchService,
            { user: new AuthUser({ _id: "user-id" }) } as AuthService,
        );

        component.ngOnInit();

        expect(service.getPlaylist).toHaveBeenCalledWith("playlist-id");
        expect(
            learningObjectService.getLearningObjectObservable,
        ).toHaveBeenNthCalledWith(1, {
            cuidInfo: { cuid: "available-cuid" },
            latestReleased: true,
        });
        expect(
            learningObjectService.getLearningObjectObservable,
        ).toHaveBeenNthCalledWith(2, {
            cuidInfo: { cuid: "stale-cuid" },
            latestReleased: true,
        });
        expect(component.learningObjects.map(({ cuid }) => cuid)).toEqual([
            "available-cuid",
            "stale-cuid",
        ]);
        expect(component.learningObjects[1].object).toBeNull();
        expect(component.learningObjects[0].object).toBe(availableObject);
        expect(component.loading).toBe(false);
        component.ngOnDestroy();
    });

    it("keeps the playlist usable when an object request fails", () => {
        const service = {
            getPlaylist: jest.fn().mockReturnValue(of(playlist)),
        };
        const learningObjectService = {
            getLearningObjectObservable: jest
                .fn()
                .mockReturnValue(throwError(() => new Error("missing"))),
        };
        const component = new PlaylistDetailsComponent(
            { paramMap: params.asObservable() } as any,
            {} as Router,
            service as unknown as PlaylistService,
            learningObjectService as unknown as LearningObjectService,
            {} as SearchService,
            { user: new AuthUser({ _id: "user-id" }) } as AuthService,
        );

        component.ngOnInit();

        expect(component.hasError).toBe(false);
        expect(component.learningObjects).toHaveLength(2);
        expect(component.learningObjects.every(({ object }) => !object)).toBe(
            true,
        );
        component.ngOnDestroy();
    });

    it("does not request learning objects for an empty playlist", () => {
        const emptyPlaylist = { ...playlist, learningObjectCuids: [] };
        const service = {
            getPlaylist: jest.fn().mockReturnValue(of(emptyPlaylist)),
        };
        const learningObjectService = {
            getLearningObjectObservable: jest.fn(),
        };
        const component = new PlaylistDetailsComponent(
            { paramMap: params.asObservable() } as any,
            {} as Router,
            service as unknown as PlaylistService,
            learningObjectService as unknown as LearningObjectService,
            {} as SearchService,
            { user: new AuthUser({ _id: "user-id" }) } as AuthService,
        );

        component.ngOnInit();

        expect(
            learningObjectService.getLearningObjectObservable,
        ).not.toHaveBeenCalled();
        expect(component.learningObjects).toEqual([]);
        expect(component.loading).toBe(false);
        component.ngOnDestroy();
    });

    it("shows an unavailable state when the playlist request fails", () => {
        const service = {
            getPlaylist: jest
                .fn()
                .mockReturnValue(throwError(() => new Error("not found"))),
        };
        const component = new PlaylistDetailsComponent(
            { paramMap: params.asObservable() } as any,
            {} as Router,
            service as unknown as PlaylistService,
            {} as LearningObjectService,
            {} as SearchService,
            { user: new AuthUser({ _id: "user-id" }) } as AuthService,
        );

        component.ngOnInit();

        expect(component.hasError).toBe(true);
        expect(component.loading).toBe(false);
        component.ngOnDestroy();
    });

    describe("candidate pagination", () => {
        afterEach(() => jest.useRealTimers());

        function setup() {
            const searchService = { getLearningObjects: jest.fn() };
            const playlistService = { addLearningObject: jest.fn() };
            const component = new PlaylistDetailsComponent(
                { paramMap: params.asObservable() } as any,
                {} as Router,
                playlistService as unknown as PlaylistService,
                {} as LearningObjectService,
                searchService as unknown as SearchService,
                { user: new AuthUser({ _id: "user-id" }) } as AuthService,
            );
            component.playlist = { ...playlist, learningObjectCuids: [] };
            component.searchText = "security";
            return { component, searchService, playlistService };
        }

        function candidate(cuid: string): LearningObject {
            const object = new LearningObject({ cuid, name: cuid, version: 1 });
            return object;
        }

        it("keeps the spinner visible for a third of a second before revealing results", async () => {
            const { component, searchService } = setup();
            const object = candidate("available");
            searchService.getLearningObjects.mockResolvedValue({
                learningObjects: [object],
                total: 1,
            });

            jest.useFakeTimers();
            const pendingSearch = component.search();
            jest.advanceTimersByTime(332);
            expect(component.searchLoading).toBe(true);
            expect(component.searchResults).toEqual([]);

            jest.advanceTimersByTime(1);
            await pendingSearch;
            expect(component.searchLoading).toBe(false);
            expect(component.searchResults).toEqual([object]);
        });

        it("requests four candidates and advances after adding the last one", async () => {
            const { component, searchService, playlistService } = setup();
            const first = candidate("first");
            const next = candidate("next");
            searchService.getLearningObjects
                .mockResolvedValueOnce({ learningObjects: [first], total: 8 })
                .mockResolvedValueOnce({ learningObjects: [next], total: 8 });
            playlistService.addLearningObject.mockReturnValue(
                of({
                    ...component.playlist,
                    learningObjectCuids: [first.cuid],
                }),
            );

            await component.search();
            const nextSearch = jest.spyOn(component, "search");
            component.addLearningObject(first);
            await nextSearch.mock.results[0].value;

            expect(searchService.getLearningObjects).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({ currPage: 1, limit: 4 }),
            );
            expect(searchService.getLearningObjects).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({ currPage: 2, limit: 4 }),
            );
            expect(component.searchResults).toEqual([next]);
            expect(component.learningObjects[0].object).toBe(first);
            expect(component.searchHasMore).toBe(false);
        });

        it("skips pages containing only objects already in the playlist", async () => {
            const { component, searchService } = setup();
            const existing = candidate("existing");
            const available = candidate("available");
            component.playlist.learningObjectCuids = [existing.cuid];
            searchService.getLearningObjects
                .mockResolvedValueOnce({
                    learningObjects: [existing],
                    total: 8,
                })
                .mockResolvedValueOnce({
                    learningObjects: [available],
                    total: 8,
                });

            await component.search();

            expect(searchService.getLearningObjects).toHaveBeenCalledTimes(2);
            expect(component.searchResults).toEqual([available]);
            expect(component.searchHasMore).toBe(false);
        });

        it("stops automatically when all remaining pages are excluded", async () => {
            const { component, searchService } = setup();
            const existing = candidate("existing");
            component.playlist.learningObjectCuids = [existing.cuid];
            searchService.getLearningObjects.mockResolvedValue({
                learningObjects: [existing],
                total: 8,
            });

            await component.search();

            expect(searchService.getLearningObjects).toHaveBeenCalledTimes(2);
            expect(component.searchResults).toEqual([]);
            expect(component.searchHasMore).toBe(false);
            expect(component.searchLoading).toBe(false);
        });

        it("does not request another page after adding the final search match", async () => {
            const { component, searchService, playlistService } = setup();
            const last = candidate("last");
            searchService.getLearningObjects.mockResolvedValue({
                learningObjects: [last],
                total: 1,
            });
            playlistService.addLearningObject.mockReturnValue(
                of({ ...component.playlist, learningObjectCuids: [last.cuid] }),
            );

            await component.search();
            component.addLearningObject(last);

            expect(searchService.getLearningObjects).toHaveBeenCalledTimes(1);
            expect(component.searchResults).toEqual([]);
        });

        it("keeps the added object when loading the next page fails", async () => {
            const { component, searchService, playlistService } = setup();
            const first = candidate("first");
            searchService.getLearningObjects
                .mockResolvedValueOnce({ learningObjects: [first], total: 8 })
                .mockRejectedValueOnce(new Error("search unavailable"));
            playlistService.addLearningObject.mockReturnValue(
                of({
                    ...component.playlist,
                    learningObjectCuids: [first.cuid],
                }),
            );

            await component.search();
            const nextSearch = jest.spyOn(component, "search");
            component.addLearningObject(first);
            await nextSearch.mock.results[0].value;

            expect(component.learningObjects[0].object).toBe(first);
            expect(component.searchError).toBe(true);
            expect(component.searchLoading).toBe(false);
        });
    });
});
