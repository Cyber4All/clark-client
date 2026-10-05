import { convertToParamMap } from "@angular/router";
import { LearningObject } from "@entity";
import { BehaviorSubject, of, throwError } from "rxjs";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
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
            service as unknown as PlaylistService,
            learningObjectService as unknown as LearningObjectService,
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
            service as unknown as PlaylistService,
            learningObjectService as unknown as LearningObjectService,
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
            service as unknown as PlaylistService,
            learningObjectService as unknown as LearningObjectService,
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
            service as unknown as PlaylistService,
            {} as LearningObjectService,
        );

        component.ngOnInit();

        expect(component.hasError).toBe(true);
        expect(component.loading).toBe(false);
        component.ngOnDestroy();
    });
});
