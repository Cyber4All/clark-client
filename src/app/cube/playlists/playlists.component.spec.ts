import { convertToParamMap, ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { of, Subject, throwError } from "rxjs";
import { AuthService, AuthUser } from "app/core/auth-module/auth.service";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { UserService } from "app/core/user-module/user.service";
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

    function setup(query: Record<string, string> = {}) {
        const service = {
            getPlaylists: jest.fn().mockReturnValue(of([playlist])),
            getBrowsePlaylists: jest.fn().mockReturnValue(of([playlist])),
            createPlaylist: jest.fn().mockReturnValue(of(playlist)),
        };
        const userService = {
            getUser: jest.fn().mockResolvedValue({
                name: "Playlist author",
                username: "author",
            }),
        };
        const router = { navigate: jest.fn().mockResolvedValue(true) };
        const dialogRef = { close: jest.fn(), disableClose: false };
        const dialog = { open: jest.fn().mockReturnValue(dialogRef) };
        const component = new PlaylistsComponent(
            service as unknown as PlaylistService,
            userService as unknown as UserService,
            { queryParamMap: of(convertToParamMap(query)) } as ActivatedRoute,
            { user: new AuthUser({ _id: "user-id" }) } as AuthService,
            router as unknown as Router,
            dialog as unknown as MatDialog,
        );
        return { component, service, userService, router, dialog, dialogRef };
    }

    it("loads the public playlist collection without offering creation", () => {
        const { component, service, userService } = setup();
        component.ngOnInit();
        expect(service.getBrowsePlaylists).toHaveBeenCalledWith("user-id");
        expect(component.playlists).toEqual([playlist]);
        expect(component.loading).toBe(false);
        expect(component.hasError).toBe(false);
        expect(component.isOwnLibrary).toBe(false);
        expect(userService.getUser).toHaveBeenCalledWith("user-id");
        component.ngOnDestroy();
    });

    it("shows an error state when playlists cannot be loaded", () => {
        const { component, service } = setup();
        service.getPlaylists.mockReturnValue(
            throwError(() => new Error("failed")),
        );
        component.ngOnInit();
        expect(component.hasError).toBe(true);
        expect(component.loading).toBe(false);
        component.ngOnDestroy();
    });

    it("offers creation only on the signed-in user's library", () => {
        const { component, service, dialog } = setup({ userId: "user-id" });
        component.ngOnInit();
        expect(service.getPlaylists).toHaveBeenCalledWith({
            userId: "user-id",
        });
        expect(component.isOwnLibrary).toBe(true);
        component.openCreatePlaylist();
        expect(dialog.open).toHaveBeenCalled();
        component.ngOnDestroy();
    });

    it("does not open or create a playlist from someone else's library", () => {
        const { component, service, dialog } = setup({ userId: "other-user" });
        component.ngOnInit();
        component.createForm.setValue({
            name: "New playlist",
            description: "New description",
        });
        component.openCreatePlaylist();
        component.createPlaylist();
        expect(component.isOwnLibrary).toBe(false);
        expect(dialog.open).not.toHaveBeenCalled();
        expect(service.createPlaylist).not.toHaveBeenCalled();
        component.ngOnDestroy();
    });

    it("does not submit a blank title", () => {
        const { component, service } = setup({ userId: "user-id" });
        component.ngOnInit();
        component.createForm.setValue({
            name: "   ",
            description: "New description",
        });
        component.createPlaylist();
        expect(service.createPlaylist).not.toHaveBeenCalled();
        component.ngOnDestroy();
    });

    it("does not submit a blank description", () => {
        const { component, service } = setup({ userId: "user-id" });
        component.ngOnInit();
        component.createForm.setValue({
            name: "New playlist",
            description: "   ",
        });
        component.createPlaylist();
        expect(service.createPlaylist).not.toHaveBeenCalled();
        component.ngOnDestroy();
    });

    it("creates a private playlist with a title and description and opens its details", () => {
        const { component, service, router, dialogRef } = setup({
            userId: "user-id",
        });
        component.ngOnInit();
        component.openCreatePlaylist();
        component.createForm.setValue({
            name: "  New playlist  ",
            description: "  New description  ",
        });
        component.createPlaylist();
        expect(service.createPlaylist).toHaveBeenCalledWith({
            name: "New playlist",
            description: "New description",
            visibility: "private",
        });
        expect(dialogRef.close).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith([
            "/playlists",
            "playlist-id",
        ]);
        component.ngOnDestroy();
    });

    it("keeps the title available to retry after a failed create", () => {
        const { component, service, router, dialogRef } = setup({
            userId: "user-id",
        });
        service.createPlaylist.mockReturnValue(
            throwError(() => new Error("failed")),
        );
        component.ngOnInit();
        component.openCreatePlaylist();
        component.createForm.setValue({
            name: "New playlist",
            description: "New description",
        });
        component.createPlaylist();
        expect(component.createError).toBeTruthy();
        expect(component.createForm.getRawValue()).toEqual({
            name: "New playlist",
            description: "New description",
        });
        expect(component.createForm.enabled).toBe(true);
        expect(component.creating).toBe(false);
        expect(dialogRef.disableClose).toBe(false);
        expect(dialogRef.close).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
        component.ngOnDestroy();
    });

    it("prevents duplicate submission while creation is pending", () => {
        const { component, service, dialogRef } = setup({ userId: "user-id" });
        const pending = new Subject<Playlist>();
        service.createPlaylist.mockReturnValue(pending);
        component.ngOnInit();
        component.openCreatePlaylist();
        component.createForm.setValue({
            name: "New playlist",
            description: "New description",
        });
        component.createPlaylist();
        component.createPlaylist();
        expect(service.createPlaylist).toHaveBeenCalledTimes(1);
        expect(component.creating).toBe(true);
        expect(dialogRef.disableClose).toBe(true);
        pending.complete();
        component.ngOnDestroy();
    });
});
