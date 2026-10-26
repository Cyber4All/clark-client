import { Component, Input } from "@angular/core";
import {
    ComponentFixture,
    TestBed,
    fakeAsync,
    flush,
    flushMicrotasks,
} from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, Subject, of, throwError } from "rxjs";
import { LearningObject } from "@entity";
import { AuthService } from "app/core/auth-module/auth.service";
import { CollectionService } from "app/core/collection-module/collections.service";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { UserProfileComponent } from "./user-profile.component";
import { ProfileHeaderComponent } from "./components/profile-header/profile-header.component";
import { ProfileLearningObjectsComponent } from "./components/profile-learning-objects/profile-learning-objects.component";
import { LearningObjectListingComponent } from "../shared/learning-object/learning-object.component";

@Component({ selector: "clark-profile-header", standalone: true, template: "" })
class HeaderStubComponent {
    @Input() user: unknown;
    @Input() isUser: boolean;
}
@Component({
    selector: "clark-learning-object-component",
    standalone: true,
    template: "{{ learningObject.name }}",
})
class ObjectStubComponent {
    @Input() learningObject: LearningObject;
}

const viewedUser = {
    _id: "507f1f77bcf86cd799439011",
    username: "alice",
    name: "Alice Author",
};
const publicPlaylist: Playlist = {
    _id: "playlist-a",
    userId: viewedUser._id,
    name: "Public A",
    description: "Description",
    learningObjectCuids: [],
    visibility: "public",
};

describe("Two-tab profile", () => {
    let fixture: ComponentFixture<UserProfileComponent>;
    let component: UserProfileComponent;
    let data: BehaviorSubject<{ user: typeof viewedUser }>;
    let collections: { getUserSubmittedCollections: jest.Mock };
    let learningObjects: { fetchLearningObject: jest.Mock };
    let playlists: { getPublicPlaylists: jest.Mock };
    const objects = [
        { cuid: "a", name: "Object from A", collection: "collection-a" },
        { cuid: "b", name: "Object from B", collection: "collection-b" },
    ] as LearningObject[];

    beforeEach(async () => {
        data = new BehaviorSubject({ user: viewedUser });
        collections = {
            getUserSubmittedCollections: jest.fn().mockResolvedValue([
                {
                    cuid: "a",
                    version: 1,
                    status: "released",
                    collection: "collection-a",
                },
                {
                    cuid: "b",
                    version: 2,
                    status: "released",
                    collection: "collection-b",
                },
                { cuid: "draft", version: 1, status: "unreleased" },
            ]),
        };
        learningObjects = {
            fetchLearningObject: jest
                .fn()
                .mockImplementation((cuid) =>
                    Promise.resolve(
                        objects.find((object) => object.cuid === cuid),
                    ),
                ),
        };
        playlists = {
            getPublicPlaylists: jest.fn().mockReturnValue(of([publicPlaylist])),
        };
        await TestBed.configureTestingModule({
            imports: [
                UserProfileComponent,
                RouterTestingModule.withRoutes([]),
                NoopAnimationsModule,
            ],
            providers: [
                { provide: ActivatedRoute, useValue: { data } },
                { provide: AuthService, useValue: { username: "viewer" } },
                { provide: CollectionService, useValue: collections },
                { provide: LearningObjectService, useValue: learningObjects },
                { provide: PlaylistService, useValue: playlists },
            ],
        })
            .overrideComponent(UserProfileComponent, {
                remove: { imports: [ProfileHeaderComponent] },
                add: { imports: [HeaderStubComponent] },
            })
            .overrideComponent(ProfileLearningObjectsComponent, {
                remove: { imports: [LearningObjectListingComponent] },
                add: { imports: [ObjectStubComponent] },
            })
            .compileComponents();
        fixture = TestBed.createComponent(UserProfileComponent);
        component = fixture.componentInstance;
    });
    function render(): void {
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
    }
    function openPlaylists(): void {
        fixture.nativeElement.querySelectorAll('[role="tab"]')[1].click();
        fixture.detectChanges();
        flush();
        fixture.detectChanges();
    }

    it("uses original released-object retrieval and displays a flat list under two tabs", fakeAsync(() => {
        render();
        const tabs = [
            ...fixture.nativeElement.querySelectorAll('[role="tab"]'),
        ] as HTMLElement[];
        expect(tabs.map((tab) => tab.textContent.trim())).toEqual([
            "Contributions",
            "Public Playlists",
        ]);
        expect(tabs[0].getAttribute("aria-selected")).toBe("true");
        expect(tabs[0].getAttribute("tabindex")).toBe("0");
        expect(
            fixture.nativeElement.querySelectorAll(
                "clark-learning-object-component",
            ),
        ).toHaveLength(2);
        expect(fixture.nativeElement.textContent).toContain("Object from A");
        expect(fixture.nativeElement.textContent).toContain("Object from B");
        expect(fixture.nativeElement.querySelector(".secondTabs")).toBeNull();
        expect(
            fixture.nativeElement.querySelector(
                "clark-profile-learning-objects a",
            ),
        ).toBeNull();
        expect(collections.getUserSubmittedCollections).toHaveBeenCalledWith(
            "alice",
        );
        expect(learningObjects.fetchLearningObject).toHaveBeenCalledTimes(2);
        expect(learningObjects.fetchLearningObject).toHaveBeenCalledWith(
            "a",
            1,
        );
        expect(learningObjects.fetchLearningObject).toHaveBeenCalledWith(
            "b",
            2,
        );
        flush();
    }));

    it("keeps successful object fetches when another fails, as before", fakeAsync(() => {
        learningObjects.fetchLearningObject.mockRejectedValueOnce(
            new Error("unavailable"),
        );
        render();
        expect(component.allUserContributions).toEqual([objects[1]]);
        expect(component.contributionsError).toBe(false);
        expect(
            fixture.nativeElement.querySelectorAll(
                "clark-learning-object-component",
            ),
        ).toHaveLength(1);
        flush();
    }));

    it("supports ArrowRight focus and Enter selection", fakeAsync(() => {
        render();
        const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
        tabs[0].focus();
        tabs[0].dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "ArrowRight",
                keyCode: 39,
                bubbles: true,
            }),
        );
        flush();
        fixture.detectChanges();
        expect(document.activeElement).toBe(tabs[1]);
        tabs[1].dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "Enter",
                keyCode: 13,
                bubbles: true,
            }),
        );
        flush();
        fixture.detectChanges();
        expect(tabs[1].getAttribute("aria-selected")).toBe("true");
        flush();
    }));

    it.each([undefined, "viewer", "alice"])(
        "shows only owned public playlists for visitor %s",
        fakeAsync((username) => {
            Object.defineProperty(TestBed.inject(AuthService), "username", {
                value: username,
                configurable: true,
            });
            render();
            openPlaylists();
            expect(component.publicPlaylists).toEqual([publicPlaylist]);
            expect(component.isUser).toBe(username === "alice");
            expect(playlists.getPublicPlaylists).toHaveBeenCalledWith(
                viewedUser._id,
            );
            expect(fixture.nativeElement.textContent).not.toContain(
                "Private secret",
            );
            expect(fixture.nativeElement.textContent).not.toContain(
                "Other playlist",
            );
            expect(
                fixture.nativeElement
                    .querySelector("a.playlist-card")
                    .getAttribute("href"),
            ).toBe("/playlists/playlist-a");
        }),
    );

    it("defines independent loading and empty states", fakeAsync(() => {
        let resolve: (metadata: unknown[]) => void;
        collections.getUserSubmittedCollections.mockReturnValue(
            new Promise((r) => (resolve = r)),
        );
        const response = new Subject<Playlist[]>();
        playlists.getPublicPlaylists.mockReturnValue(response);
        render();
        expect(fixture.nativeElement.textContent).toContain(
            "Loading contributions...",
        );
        resolve([]);
        render();
        expect(fixture.nativeElement.textContent).toContain(
            "No contributions yet.",
        );
        openPlaylists();
        expect(fixture.nativeElement.textContent).toContain(
            "Loading public playlists...",
        );
        response.next([]);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain(
            "No public playlists yet.",
        );
    }));

    it("defines independent errors and retries", fakeAsync(() => {
        collections.getUserSubmittedCollections.mockRejectedValue(
            new Error("offline"),
        );
        playlists.getPublicPlaylists.mockReturnValue(
            throwError(new Error("offline")),
        );
        render();
        expect(fixture.nativeElement.textContent).toContain(
            "Unable to load contributions.",
        );
        collections.getUserSubmittedCollections.mockResolvedValue([]);
        fixture.nativeElement
            .querySelector("clark-profile-learning-objects button")
            .click();
        render();
        expect(fixture.nativeElement.textContent).toContain(
            "No contributions yet.",
        );
        openPlaylists();
        expect(fixture.nativeElement.textContent).toContain(
            "Unable to load public playlists.",
        );
        playlists.getPublicPlaylists.mockReturnValue(of([]));
        fixture.nativeElement.querySelector("[role=alert] button").click();
        render();
        expect(fixture.nativeElement.textContent).toContain(
            "No public playlists yet.",
        );
    }));

    it("resets on another direct profile navigation and ignores stale responses", fakeAsync(() => {
        let resolve: (metadata: unknown[]) => void;
        collections.getUserSubmittedCollections.mockReturnValueOnce(
            new Promise((r) => (resolve = r)),
        );
        const old = new Subject<Playlist[]>();
        const nextUserPlaylists = [
            { ...publicPlaylist, _id: "playlist-b", userId: "author-b" },
        ];
        playlists.getPublicPlaylists
            .mockReturnValueOnce(old)
            .mockReturnValueOnce(of(nextUserPlaylists));
        render();
        openPlaylists();
        data.next({
            user: { ...viewedUser, _id: "author-b", username: "bob" },
        });
        render();
        resolve([{ name: "Stale" } as LearningObject]);
        old.next([publicPlaylist]);
        render();
        expect(component.selectedTab).toBe(0);
        expect(component.allUserContributions).toEqual(objects);
        expect(component.publicPlaylists).toEqual(nextUserPlaylists);
        expect(
            collections.getUserSubmittedCollections,
        ).toHaveBeenLastCalledWith("bob");
        flush();
    }));
});
