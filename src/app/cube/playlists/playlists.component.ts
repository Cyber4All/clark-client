import { NgFor, NgIf } from "@angular/common";
import {
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import {
    MatDialog,
    MatDialogModule,
    MatDialogRef,
} from "@angular/material/dialog";
import { AuthService } from "app/core/auth-module/auth.service";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { UserService } from "app/core/user-module/user.service";
import { SkipLinkComponent } from "app/shared/components/skip-link/skip-link.component";
import { Subject } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";
import { PlaylistCardComponent } from "./components/playlist-card/playlist-card.component";

@Component({
    selector: "clark-playlists",
    templateUrl: "./playlists.component.html",
    styleUrls: ["./playlists.component.scss"],
    standalone: true,
    imports: [
        NgFor,
        NgIf,
        ReactiveFormsModule,
        MatDialogModule,
        PlaylistCardComponent,
        SkipLinkComponent,
    ],
})
export class PlaylistsComponent implements OnInit, OnDestroy {
    playlists: Playlist[] = [];
    authorNames: Record<string, string> = {};
    loading = true;
    hasError = false;
    userId = "";
    creating = false;
    createError = "";
    readonly createForm = new FormGroup({
        name: new FormControl("", {
            nonNullable: true,
            validators: [
                Validators.required,
                Validators.pattern(/\S/),
                Validators.maxLength(100),
            ],
        }),
        description: new FormControl("", {
            nonNullable: true,
            validators: [
                Validators.required,
                Validators.pattern(/\S/),
                Validators.maxLength(500),
            ],
        }),
    });
    @ViewChild("createPlaylistDialog")
    createPlaylistDialog!: TemplateRef<unknown>;
    private createDialogRef?: MatDialogRef<unknown>;

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly playlistService: PlaylistService,
        private readonly userService: UserService,
        private readonly route: ActivatedRoute,
        private readonly auth: AuthService,
        private readonly router: Router,
        private readonly dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.route.queryParamMap
            .pipe(
                switchMap((params) => {
                    this.userId = params.get("userId") || "";
                    this.loading = true;
                    this.hasError = false;
                    return this.userId
                        ? this.playlistService.getPlaylists({
                              userId: this.userId,
                          })
                        : this.playlistService.getBrowsePlaylists(
                              this.auth.user?.userId,
                          );
                }),
                takeUntil(this.destroy$),
            )
            .subscribe({
                next: (playlists) => {
                    this.playlists = playlists;
                    this.loading = false;
                    void this.loadAuthorNames(playlists);
                },
                error: () => {
                    this.hasError = true;
                    this.loading = false;
                },
            });
    }

    ngOnDestroy(): void {
        this.createDialogRef?.close();
        this.destroy$.next();
        this.destroy$.complete();
    }

    get isOwnLibrary(): boolean {
        return (
            Boolean(this.auth.user?.userId) &&
            this.userId === this.auth.user?.userId
        );
    }

    openCreatePlaylist(): void {
        if (!this.isOwnLibrary || this.creating) {
            return;
        }
        this.createForm.reset({ name: "", description: "" });
        this.createError = "";
        this.createDialogRef = this.dialog.open(this.createPlaylistDialog, {
            width: "420px",
            maxWidth: "calc(100vw - 36px)",
            ariaLabelledBy: "create-playlist-title",
        });
    }

    cancelCreatePlaylist(): void {
        if (!this.creating) {
            this.createDialogRef?.close();
        }
    }

    createPlaylist(): void {
        if (!this.isOwnLibrary || this.creating || this.createForm.invalid) {
            return;
        }
        this.creating = true;
        this.createError = "";
        this.createForm.disable();
        if (this.createDialogRef) {
            this.createDialogRef.disableClose = true;
        }
        this.playlistService
            .createPlaylist({
                name: this.createForm.getRawValue().name.trim(),
                description: this.createForm.getRawValue().description.trim(),
                visibility: "private",
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (playlist) => {
                    this.creating = false;
                    this.createForm.enable();
                    this.createDialogRef?.close();
                    void this.router.navigate(["/playlists", playlist._id]);
                },
                error: () => {
                    this.creating = false;
                    this.createForm.enable();
                    if (this.createDialogRef) {
                        this.createDialogRef.disableClose = false;
                    }
                    this.createError =
                        "We couldn't create your playlist. Please try again.";
                },
            });
    }

    trackPlaylist(_: number, playlist: Playlist): string {
        return playlist._id;
    }

    private async loadAuthorNames(playlists: Playlist[]): Promise<void> {
        const userIds = [...new Set(playlists.map(({ userId }) => userId))];
        const authors = await Promise.all(
            userIds.map(async (userId) => {
                const user = await this.userService.getUser(userId);

                return {
                    userId,
                    name: user?.name || user?.username || userId,
                };
            }),
        );

        this.authorNames = authors.reduce<Record<string, string>>(
            (names, { userId, name }) => {
                names[userId] = name;
                return names;
            },
            {},
        );
    }
}
