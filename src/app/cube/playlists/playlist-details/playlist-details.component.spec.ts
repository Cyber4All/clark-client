import { convertToParamMap } from "@angular/router";
import { BehaviorSubject, of, throwError } from "rxjs";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { PlaylistDetails } from "app/core/playlist-module/playlist.types";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { PlaylistDetailsComponent } from "./playlist-details.component";

describe("PlaylistDetailsComponent", () => {
    const params = new BehaviorSubject(
        convertToParamMap({ playlistId: "playlist-id" }),
    );
    const playlist: PlaylistDetails = {
        _id: "playlist-id",
        userId: "user-id",
        learningObjectCuids: ["available-cuid", "stale-cuid"],
        learningObjects: [
            {
                cuid: "available-cuid",
                object: {
                    cuid: "available-cuid",
                    name: "Available object",
                    description: "Object description",
                    objectCollection: "collection",
                    length: "nanomodule",
                    levels: ["undergraduate"],
                    version: 2,
                    status: "released",
                },
            },
            { cuid: "stale-cuid", object: null },
        ],
        name: "Public playlist",
        description: "A public playlist",
        visibility: "public",
    };

    it("loads a hydrated playlist from the route id", () => {
        const service = {
            getPlaylist: jest.fn().mockReturnValue(of(playlist)),
        };
        const learningObjectService = {
            getLearningObjectObservable: jest.fn().mockReturnValue(
                of({
                    cuid: "available-cuid",
                    version: 2,
                    author: { username: "author" },
                }),
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
        ).toHaveBeenCalledWith({
            cuidInfo: { cuid: "available-cuid", version: 2 },
        });
        expect(component.learningObjects[1].object).toBeNull();
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
