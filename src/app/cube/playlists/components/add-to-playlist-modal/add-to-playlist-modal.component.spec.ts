import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";
import { of } from "rxjs";
import { AddToPlaylistModalComponent } from "./add-to-playlist-modal.component";

describe("AddToPlaylistModalComponent", () => {
    let fixture: ComponentFixture<AddToPlaylistModalComponent>;
    let component: AddToPlaylistModalComponent;
    let playlistService: jest.Mocked<
        Pick<PlaylistService, "getPlaylists" | "addLearningObject">
    >;

    const playlist: Playlist = {
        _id: "playlist-id",
        userId: "user-id",
        learningObjectCuids: [],
        name: "Quantum Fundamentals",
        description: "Quantum learning objects",
        visibility: "private",
    };

    beforeEach(async () => {
        playlistService = {
            getPlaylists: jest.fn().mockReturnValue(of([playlist])),
            addLearningObject: jest.fn().mockReturnValue(of(playlist)),
        };

        await TestBed.configureTestingModule({
            imports: [AddToPlaylistModalComponent],
            providers: [
                { provide: PlaylistService, useValue: playlistService },
                {
                    provide: ToastrOvenService,
                    useValue: { success: jest.fn(), error: jest.fn() },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AddToPlaylistModalComponent);
        component = fixture.componentInstance;
        component.learningObjectCuid = "object-cuid";
        component.userId = "user-id";
        fixture.detectChanges();
    });

    it("loads the current user's available playlists", () => {
        expect(playlistService.getPlaylists).toHaveBeenCalledWith("user-id");
        expect(component.playlists).toEqual([playlist]);
    });

    it("selects one playlist and toggles it off when selected again", () => {
        component.togglePlaylist(playlist._id);
        expect(component.selectedPlaylistId).toBe(playlist._id);

        component.togglePlaylist(playlist._id);
        expect(component.selectedPlaylistId).toBe("");
    });

    it("adds the learning object to the selected playlist", () => {
        const added = jest.spyOn(component.added, "emit");
        component.selectedPlaylistId = playlist._id;

        component.addToPlaylist();

        expect(playlistService.addLearningObject).toHaveBeenCalledWith(
            playlist._id,
            "object-cuid",
        );
        expect(added).toHaveBeenCalledWith(playlist);
    });
});
