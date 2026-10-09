import { BUNDLING_ROUTES } from "app/core/learning-object-module/bundling/bundling.routes";
import { ActionPanelComponent } from "./action-panel.component";

describe("ActionPanelComponent", () => {
    function createComponent() {
        const libraryService = {
            downloadBundle: jest.fn().mockResolvedValue(undefined),
        };

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
        );
        component.learningObject = { id: "learning-object-id" } as any;
        component.hasDownloadAccess = true;

        return { component, libraryService };
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
});
