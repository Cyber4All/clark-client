import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";
import { of, throwError } from "rxjs";
import { AddToPlaylistModalComponent } from "./add-to-playlist-modal.component";

describe("AddToPlaylistModalComponent", () => {
    let fixture: ComponentFixture<AddToPlaylistModalComponent>;
    let component: AddToPlaylistModalComponent;
    let playlistService: jest.Mocked<
        Pick<
            PlaylistService,
            "getPlaylists" | "createPlaylist" | "addLearningObject"
        >
    >;
    let toaster: { success: jest.Mock; error: jest.Mock };

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
            createPlaylist: jest.fn().mockReturnValue(of(playlist)),
            addLearningObject: jest.fn().mockReturnValue(of(playlist)),
        };
        toaster = { success: jest.fn(), error: jest.fn() };

        await TestBed.configureTestingModule({
            imports: [AddToPlaylistModalComponent],
            providers: [
                { provide: PlaylistService, useValue: playlistService },
                {
                    provide: ToastrOvenService,
                    useValue: toaster,
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

    it("emits cancellation", () => {
        const closed = jest.spyOn(component.closed, "emit");
        component.showCreateForm();
        fixture.detectChanges();

        fixture.nativeElement.querySelector("footer .neutral").click();

        expect(closed).toHaveBeenCalled();
        expect(component.createForm.touched).toBe(false);
    });

    it("returns to existing playlists without showing validation", () => {
        component.showCreateForm();
        component.createForm.controls.name.markAsTouched();

        component.showPlaylistList();

        expect(component.creating).toBe(false);
        expect(component.createAttempted).toBe(false);
    });

    it("shows the empty state", () => {
        component.playlists = [];
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain(
            "You don't have any available playlists yet.",
        );
    });

    it("adds the learning object to the selected playlist", () => {
        const added = jest.spyOn(component.added, "emit");
        component.selectedPlaylistId = playlist._id;

        component.addToPlaylist();

        expect(playlistService.addLearningObject).toHaveBeenCalledWith(
            playlist._id,
            "object-cuid",
        );
        expect(added).toHaveBeenCalled();
    });

    it("validates required create-playlist fields", () => {
        component.showCreateForm();

        component.createAndAdd();

        expect(component.createForm.controls.name.touched).toBe(true);
        expect(component.createForm.controls.description.touched).toBe(true);
        expect(playlistService.createPlaylist).not.toHaveBeenCalled();
    });

    it("creates a playlist and adds the learning object in one flow", () => {
        const added = jest.spyOn(component.added, "emit");
        component.showCreateForm();
        component.createForm.setValue({
            name: "New playlist",
            description: "A useful playlist",
            visibility: "public",
        });

        component.createAndAdd();

        expect(playlistService.createPlaylist).toHaveBeenCalledWith({
            name: "New playlist",
            description: "A useful playlist",
            visibility: "public",
        });
        expect(playlistService.addLearningObject).toHaveBeenCalledWith(
            playlist._id,
            "object-cuid",
        );
        expect(added).toHaveBeenCalled();
    });

    it("treats a duplicate response as an already-added success", () => {
        const added = jest.spyOn(component.added, "emit");
        playlistService.addLearningObject.mockReturnValue(
            throwError(() => new HttpErrorResponse({ status: 409 })),
        );
        component.selectedPlaylistId = playlist._id;

        component.addToPlaylist();

        expect(toaster.success).toHaveBeenCalledWith(
            "Already Added",
            `Learning Object is already in ${playlist.name}`,
        );
        expect(toaster.error).not.toHaveBeenCalled();
        expect(added).toHaveBeenCalled();
    });

    it("keeps the modal retryable after an API failure", () => {
        playlistService.addLearningObject.mockReturnValue(
            throwError(() => new HttpErrorResponse({ status: 500 })),
        );
        component.selectedPlaylistId = playlist._id;

        component.addToPlaylist();

        expect(component.saving).toBe(false);
        expect(toaster.error).toHaveBeenCalled();
    });

    it("retries adding to a newly created playlist without recreating it", () => {
        playlistService.addLearningObject
            .mockReturnValueOnce(
                throwError(() => new HttpErrorResponse({ status: 500 })),
            )
            .mockReturnValueOnce(of(playlist));
        component.showCreateForm();
        component.createForm.setValue({
            name: playlist.name,
            description: playlist.description,
            visibility: playlist.visibility,
        });

        component.createAndAdd();
        component.createAndAdd();

        expect(playlistService.createPlaylist).toHaveBeenCalledTimes(1);
        expect(playlistService.addLearningObject).toHaveBeenCalledTimes(2);
    });
});
