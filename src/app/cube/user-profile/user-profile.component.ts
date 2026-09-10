import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AuthService } from "app/core/auth-module/auth.service";
import { CollectionService } from "app/core/collection-module/collections.service";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { NgIf } from "@angular/common";
import { ProfileHeaderComponent } from "./components/profile-header/profile-header.component";
import { ProfileLearningObjectsComponent } from "./components/profile-learning-objects/profile-learning-objects.component";
import { ProfilePlaylistsComponent } from "./components/profile-playlists/profile-playlists.component";

type ProfileTab = "contributions" | "playlists";

@Component({
    selector: "clark-user-profile",
    templateUrl: "./user-profile.component.html",
    styleUrls: ["./user-profile.component.scss"],
    standalone: true,
    imports: [
        NgIf,
        RouterLink,
        ProfileHeaderComponent,
        ProfileLearningObjectsComponent,
        ProfilePlaylistsComponent,
    ],
})
export class UserProfileComponent implements OnInit, OnDestroy {
    loading: boolean;
    user: any;
    isUser = false;
    activeTab: ProfileTab = "contributions";
    playlists: Playlist[] = [];
    playlistsLoading = false;
    playlistsError = false;
    // Array of users learning objects
    allUserContributions = [];

    private readonly destroy$ = new Subject<void>();
    private playlistSubscription?: Subscription;

    constructor(
        private route: ActivatedRoute,
        private auth: AuthService,
        private learningObjectService: LearningObjectService,
        private collectionService: CollectionService,
        private playlistService: PlaylistService,
        private router: Router,
    ) {}

    async ngOnInit() {
        this.route.queryParamMap
            .pipe(takeUntil(this.destroy$))
            .subscribe((params) => {
                this.activeTab =
                    params.get("tab") === "playlists"
                        ? "playlists"
                        : "contributions";
            });

        // Subscribe to data returned from profile.resolver
        this.route.data
            .pipe(takeUntil(this.destroy$))
            .subscribe(async (val) => {
                // Toggle page loading
                this.loading = true;
                this.user = val.user;
                // Check if current user is on their profile
                this.isUser = this.user.username === this.auth.username;
                this.loadPlaylists(this.user.userId ?? this.user._id);
                await this.initProfileData();
            });
    }

    ngOnDestroy(): void {
        this.playlistSubscription?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }

    selectAdjacentTab(
        tab: ProfileTab,
        event: Event,
        target: HTMLElement,
    ): void {
        event.preventDefault();
        void this.router
            .navigate([], {
                relativeTo: this.route,
                queryParams: tab === "playlists" ? { tab } : {},
            })
            .then(() => target.focus());
    }

    /**
     * Method to retrieve the current user profile information
     */
    async initProfileData() {
        /**
         * Two service methods are being used here:
         *
         * @method getCollectionData returns an array of objects with cuid, collection, status, and version
         * @method fetchLearningObject returns an individual learning object based on cuid
         * @fetchLearningObject is nested in order to load page elements concurrently while still performing acynchronous operations.
         */
        await this.collectionService
            .getUserSubmittedCollections(this.user.username)
            .then(async (collectionMeta) => {
                const tempObjects = [];
                // Filter for released objects
                const filteredMeta = collectionMeta.filter(
                    (objectMeta) => objectMeta.status === "released",
                );
                // Await each learning object for a users profile
                const promises = filteredMeta.map(async (objectMeta) => {
                    // Return a promise for the current learning object
                    return await this.learningObjectService.fetchLearningObject(
                        objectMeta.cuid,
                        objectMeta.version,
                    );
                });
                // Resolve all calls to retrieve a learning object
                await Promise.allSettled(promises).then((promise) => {
                    promise.map((p) => {
                        if (p.status === "fulfilled") {
                            tempObjects.push(p.value);
                        }
                    });
                });
                // Users Learning Objects
                this.allUserContributions = tempObjects;
                // Toggle off loading profile
                this.loading = false;
            });
    }

    private loadPlaylists(userId: string): void {
        this.playlistSubscription?.unsubscribe();
        this.playlists = [];
        this.playlistsError = false;
        this.playlistsLoading = true;

        if (!userId) {
            this.playlistsError = true;
            this.playlistsLoading = false;
            return;
        }

        this.playlistSubscription = this.playlistService
            .getPlaylists(userId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (playlists) => {
                    this.playlists = playlists;
                    this.playlistsLoading = false;
                },
                error: () => {
                    this.playlistsError = true;
                    this.playlistsLoading = false;
                },
            });
    }
}
