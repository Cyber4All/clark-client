import { of, throwError } from "rxjs";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { PlaylistsComponent } from "./playlists.component";

describe("PlaylistsComponent", () => {
    const playlist: Playlist = {
        _id: "playlist-id",
        userId: "user-id",
        learningObjectCuids: [],
        name: "Public playlist",
        description: "A public playlist",
        visibility: "public",
    };

    it("loads the unfiltered public playlist collection", () => {
        const service = {
            getPlaylists: jest.fn().mockReturnValue(of([playlist])),
        };
        const component = new PlaylistsComponent(
            service as unknown as PlaylistService,
        );

        component.ngOnInit();

        expect(service.getPlaylists).toHaveBeenCalledWith();
        expect(component.playlists).toEqual([playlist]);
        expect(component.loading).toBe(false);
        expect(component.hasError).toBe(false);
        component.ngOnDestroy();
    });

    it("shows an error state when public playlists cannot be loaded", () => {
        const service = {
            getPlaylists: jest
                .fn()
                .mockReturnValue(throwError(() => new Error("failed"))),
        };
        const component = new PlaylistsComponent(
            service as unknown as PlaylistService,
        );

        component.ngOnInit();

        expect(component.hasError).toBe(true);
        expect(component.loading).toBe(false);
        component.ngOnDestroy();
    });
});
