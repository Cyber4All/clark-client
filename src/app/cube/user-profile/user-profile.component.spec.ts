import { convertToParamMap, Router } from "@angular/router";
import { BehaviorSubject, of } from "rxjs";
import { AuthService } from "app/core/auth-module/auth.service";
import { CollectionService } from "app/core/collection-module/collections.service";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { UserProfileComponent } from "./user-profile.component";

describe("UserProfileComponent", () => {
    const routeData = new BehaviorSubject<Record<string, unknown>>({});
    const queryParams = new BehaviorSubject(convertToParamMap({}));
    const playlist: Playlist = {
        _id: "playlist-id",
        userId: "profile-user-id",
        learningObjectCuids: [],
        name: "Profile playlist",
        description: "A public playlist",
        visibility: "public",
    };
    const playlistService = {
        getPlaylists: jest.fn().mockReturnValue(of([playlist])),
    };
    const router = {
        navigate: jest.fn().mockResolvedValue(true),
    };
    let component: UserProfileComponent;

    beforeEach(() => {
        routeData.next({
            user: {
                _id: "profile-user-id",
                username: "profile-user",
            },
        });
        queryParams.next(convertToParamMap({}));
        playlistService.getPlaylists.mockClear();
        router.navigate.mockClear();

        component = new UserProfileComponent(
            {
                data: routeData.asObservable(),
                queryParamMap: queryParams.asObservable(),
            } as any,
            { username: "profile-user" } as AuthService,
            {
                fetchLearningObject: jest.fn().mockResolvedValue({}),
            } as unknown as LearningObjectService,
            {
                getUserSubmittedCollections: jest.fn().mockResolvedValue([]),
            } as unknown as CollectionService,
            playlistService as unknown as PlaylistService,
            router as unknown as Router,
        );
        void component.ngOnInit();
    });

    afterEach(() => component.ngOnDestroy());

    it("defaults direct profile navigation to Contributions", () => {
        expect(component.activeTab).toBe("contributions");
    });

    it("selects Playlists from a directly navigated query parameter", () => {
        queryParams.next(convertToParamMap({ tab: "playlists" }));
        expect(component.activeTab).toBe("playlists");
    });

    it("loads playlists using the resolved profile user id", () => {
        expect(playlistService.getPlaylists).toHaveBeenCalledWith(
            "profile-user-id",
        );
        expect(component.playlists).toEqual([playlist]);
        expect(component.isUser).toBe(true);
    });

    it("supports arrow-key tab navigation and moves focus", async () => {
        const target = document.createElement("a");
        const focus = jest.spyOn(target, "focus");
        const event = { preventDefault: jest.fn() } as unknown as Event;

        component.selectAdjacentTab("playlists", event, target);
        await Promise.resolve();

        expect(event.preventDefault).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith([], {
            relativeTo: expect.anything(),
            queryParams: { tab: "playlists" },
        });
        expect(focus).toHaveBeenCalled();
    });
});
