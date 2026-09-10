import { NgFor, NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { LearningObject } from "@entity";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { PlaylistDetails } from "app/core/playlist-module/playlist.types";
import { LearningObjectListingComponent } from "app/cube/shared/learning-object/learning-object.component";
import { LearningObjectCardDirective } from "app/shared/directives/learning-object-card.directive";
import { forkJoin, Observable, of, Subject } from "rxjs";
import { catchError, map, switchMap, takeUntil } from "rxjs/operators";

interface PlaylistLearningObjectView {
    cuid: string;
    object: LearningObject | null;
}

@Component({
    selector: "clark-playlist-details",
    templateUrl: "./playlist-details.component.html",
    styleUrls: ["./playlist-details.component.scss"],
    standalone: true,
    imports: [
        NgFor,
        NgIf,
        RouterLink,
        LearningObjectListingComponent,
        LearningObjectCardDirective,
    ],
})
export class PlaylistDetailsComponent implements OnInit, OnDestroy {
    playlist?: PlaylistDetails;
    learningObjects: PlaylistLearningObjectView[] = [];
    loading = true;
    hasError = false;

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly route: ActivatedRoute,
        private readonly playlistService: PlaylistService,
        private readonly learningObjectService: LearningObjectService,
    ) {}

    ngOnInit(): void {
        this.route.paramMap
            .pipe(
                takeUntil(this.destroy$),
                switchMap((params) => {
                    const playlistId = params.get("playlistId");
                    if (!playlistId) {
                        throw new Error("Playlist ID is required");
                    }
                    this.loading = true;
                    this.hasError = false;
                    return this.playlistService.getPlaylist(playlistId);
                }),
                switchMap((playlist) => {
                    this.playlist = playlist;
                    return this.loadLearningObjects(playlist);
                }),
            )
            .subscribe({
                next: (learningObjects) => {
                    this.learningObjects = learningObjects;
                    this.loading = false;
                },
                error: () => {
                    this.hasError = true;
                    this.loading = false;
                },
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadLearningObjects(
        playlist: PlaylistDetails,
    ): Observable<PlaylistLearningObjectView[]> {
        if (!playlist.learningObjects.length) {
            return of([]);
        }

        return forkJoin(
            playlist.learningObjects.map((entry) => {
                if (!entry.object) {
                    return of({ cuid: entry.cuid, object: null });
                }

                return this.learningObjectService
                    .getLearningObjectObservable({
                        cuidInfo: {
                            cuid: entry.cuid,
                            version: entry.object.version,
                        },
                    })
                    .pipe(
                        map((object) => ({
                            cuid: entry.cuid,
                            object:
                                object instanceof HttpErrorResponse
                                    ? null
                                    : object,
                        })),
                        catchError(() =>
                            of({ cuid: entry.cuid, object: null }),
                        ),
                    );
            }),
        );
    }
}
