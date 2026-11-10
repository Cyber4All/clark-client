import { BUNDLING_ROUTES } from "app/core/learning-object-module/bundling/bundling.routes";
import { ActionPanelComponent } from "./action-panel.component";
import { LearningObject } from "@entity";
import { Subject } from "rxjs";

describe("ActionPanelComponent", () => {
    function createComponent() {
        const libraryService = {
            downloadBundle: jest.fn().mockResolvedValue(undefined),
        };
        const closed = new Subject<void>();
        const dialogRef = {
            close: jest.fn(),
            afterClosed: () => closed,
            disableClose: false,
        };
        const dialog = { open: jest.fn().mockReturnValue(dialogRef) };

        const component = new ActionPanelComponent(
            { user: { username: "rakesh" } } as any,
            libraryService as any,
            {} as any,
            {} as any,
            { markForCheck: jest.fn() } as any,
            {} as any,
            {} as any,
            {} as any,
            {} as any,
            {} as any,
            dialog as any,
        );
        component.learningObject = {
            id: "learning-object-id",
            status: LearningObject.Status.RELEASED,
        } as any;
        component.hasDownloadAccess = true;

        return { component, libraryService, dialog, dialogRef, closed };
    }

    it("downloads through the bundle flow", async () => {
        const { component, libraryService } = createComponent();

        await component.download(component.learningObject.id);

        expect(libraryService.downloadBundle).toHaveBeenCalledWith(
            BUNDLING_ROUTES.DOWNLOAD_BUNDLE("learning-object-id"),
        );
    });

    it("does not start a download without current access", async () => {
        const { component, libraryService } = createComponent();
        component.hasDownloadAccess = false;

        await component.download(component.learningObject.id);

        expect(libraryService.downloadBundle).not.toHaveBeenCalled();
    });

    it("uses the same Material dialog sizing as playlist creation and prevents duplicate dialogs", () => {
        const { component, dialog, closed } = createComponent();
        component.openPlaylistDialog();
        component.openPlaylistDialog();
        expect(dialog.open).toHaveBeenCalledTimes(1);
        expect(dialog.open).toHaveBeenCalledWith(component.playlistDialog, {
            width: "420px",
            maxWidth: "calc(100vw - 36px)",
            ariaLabel: "Add to playlist",
        });
        closed.next();
        component.openPlaylistDialog();
        expect(dialog.open).toHaveBeenCalledTimes(2);
        component.ngOnDestroy();
    });

    it("prevents closing the dialog during a playlist request", () => {
        const { component, dialogRef } = createComponent();
        component.openPlaylistDialog();
        component.setPlaylistSaving(true);
        component.closePlaylistDialog();
        expect(dialogRef.disableClose).toBe(true);
        expect(dialogRef.close).not.toHaveBeenCalled();
        component.setPlaylistSaving(false);
        component.closePlaylistDialog();
        expect(dialogRef.disableClose).toBe(false);
        expect(dialogRef.close).toHaveBeenCalledTimes(1);
        component.ngOnDestroy();
    });

    it("restricts the dialog to signed-in users and released objects", () => {
        const { component, dialog } = createComponent();
        component.learningObject.status = LearningObject.Status.UNRELEASED;
        component.openPlaylistDialog();
        component.learningObject.status = LearningObject.Status.RELEASED;
        component.auth.user = null;
        component.openPlaylistDialog();
        expect(dialog.open).not.toHaveBeenCalled();
        component.ngOnDestroy();
    });
});
