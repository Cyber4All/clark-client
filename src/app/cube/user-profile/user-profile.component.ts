import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgFor, NgIf } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { MatTabsModule } from "@angular/material/tabs";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LearningObject, User } from "@entity";
import { AuthService } from "app/core/auth-module/auth.service";
import { CollectionService } from "app/core/collection-module/collections.service";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { PlaylistCardComponent } from "../playlists/components/playlist-card/playlist-card.component";
import { ProfileHeaderComponent } from "./components/profile-header/profile-header.component";
import { ProfileLearningObjectsComponent } from "./components/profile-learning-objects/profile-learning-objects.component";

@Component({
    selector: "clark-user-profile",
    templateUrl: "./user-profile.component.html",
    styleUrls: ["./user-profile.component.scss"],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        MatTabsModule,
        ProfileHeaderComponent,
        ProfileLearningObjectsComponent,
        PlaylistCardComponent,
    ],
})
export class UserProfileComponent implements OnInit, OnDestroy {
    user: User;
    isUser = false;
    selectedTab = 0;
    contributionsLoading = true;
    contributionsError = false;
    playlistsLoading = true;
    playlistsError = false;
    allUserContributions: LearningObject[] = [];
    publicPlaylists: Playlist[] = [];
    private readonly destroyed = new Subject<void>();
    private readonly profileChanged = new Subject<void>();
    private requestId = 0;

    constructor(
        private route: ActivatedRoute,
        private auth: AuthService,
        private collectionService: CollectionService,
        private learningObjectService: LearningObjectService,
        private playlists: PlaylistService,
    ) {}

    ngOnInit(): void {
        this.route.data.pipe(takeUntil(this.destroyed)).subscribe((data) => {
            this.profileChanged.next();
            this.requestId++;
            this.user = new User(data.user);
            this.isUser = this.user.username === this.auth.username;
            this.selectedTab = 0;
            this.allUserContributions = [];
            this.publicPlaylists = [];
            this.loadContributions();
            this.loadPlaylists();
        });
    }

    async loadContributions(): Promise<void> {
        const requestId = this.requestId;
        this.contributionsLoading = true;
        this.contributionsError = false;
        try {
            const collectionMeta =
                await this.collectionService.getUserSubmittedCollections(
                    this.user.username,
                );
            const releasedMeta = collectionMeta.filter(
                (objectMeta) => objectMeta.status === "released",
            );
            const results = await Promise.allSettled<LearningObject>(
                releasedMeta.map((objectMeta) =>
                    this.learningObjectService.fetchLearningObject(
                        objectMeta.cuid,
                        objectMeta.version,
                    ),
                ),
            );
            if (requestId === this.requestId) {
                this.allUserContributions = results.reduce<LearningObject[]>(
                    (objects, result) => {
                        if (result.status === "fulfilled") {
                            objects.push(result.value);
                        }
                        return objects;
                    },
                    [],
                );
            }
        } catch {
            if (requestId === this.requestId) {
                this.contributionsError = true;
            }
        } finally {
            if (requestId === this.requestId) {
                this.contributionsLoading = false;
            }
        }
    }

    loadPlaylists(): void {
        this.playlistsLoading = true;
        this.playlistsError = false;
        const userId = this.user.userId;
        if (!userId) {
            this.playlistsError = true;
            this.playlistsLoading = false;
            return;
        }
        this.playlists
            .getPublicPlaylists(userId)
            .pipe(takeUntil(this.profileChanged), takeUntil(this.destroyed))
            .subscribe({
                next: (playlists) => {
                    this.publicPlaylists = playlists;
                    this.playlistsLoading = false;
                },
                error: () => {
                    this.playlistsError = true;
                    this.playlistsLoading = false;
                },
            });
    }

    ngOnDestroy(): void {
        this.requestId++;
        this.destroyed.next();
        this.destroyed.complete();
        this.profileChanged.complete();
    }
}
