import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MatTooltip } from "@angular/material/tooltip";
import { ActivatedRoute, Router, convertToParamMap } from "@angular/router";
import { LearningObject } from "@entity";
import { BehaviorSubject, of, Subject, throwError } from "rxjs";
import { PlaylistService } from "app/core/playlist-module/playlist.service";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { AuthService, AuthUser } from "app/core/auth-module/auth.service";
import { SearchService } from "app/core/learning-object-module/search/search.service";
import { PlaylistDetailsComponent } from "./playlist-details.component";

describe("PlaylistDetailsComponent", () => {
    const params = new BehaviorSubject(
        convertToParamMap({ playlistId: "playlist-id" }),
    );
    const playlist: Playlist = {
        _id: "playlist-id",
        userId: "user-id",
        learningObjectCuids: ["available-cuid", "stale-cuid"],
        name: "Public playlist",
        description: "A public playlist",
        visibility: "public",
    };

    it("uses URL state to return to the source owner library", () => {
        const component = new PlaylistDetailsComponent(
            {
                snapshot: {
                    queryParamMap: convertToParamMap({
                        returnUserId: "user-id",
                    }),
                },
                paramMap: params.asObservable(),
            } as any,
            {} as Router,
            { getPlaylist: jest.fn().mockReturnValue(of(playlist)) } as any,
            {
                getLearningObjectObservable: jest
                    .fn()
                    .mockReturnValue(of(null)),
            } as any,
            {} as SearchService,
            { user: new AuthUser({ _id: "user-id" }) } as AuthService,
            { open: jest.fn() } as unknown as MatDialog,
        );

        component.ngOnInit();

        expect(component.returnUserId).toBe("user-id");
        component.ngOnDestroy();
    });

    it("loads CUIDs from the route playlist and preserves their order", () => {
        const availableObject = new LearningObject({
            cuid: "available-cuid",
            name: "Available object",
            description: "Object description",
            status: LearningObject.Status.RELEASED,
            version: 2,
        });
        const service = {
            getPlaylist: jest.fn().mockReturnValue(of(playlist)),
        };
        const learningObjectService = {
            getLearningObjectObservable: jest
                .fn()
                .mockImplementation(({ cuidInfo: { cuid } }) =>
                    of(cuid === "available-cuid" ? availableObject : null),
                ),
        };
        const component = new PlaylistDetailsComponent(
            { paramMap: params.asObservable() } as any,
            {} as Router,
            service as unknown as PlaylistService,
            learningObjectService as unknown as LearningObjectService,
            {} as SearchService,
            { user: new AuthUser({ _id: "user-id" }) } as AuthService,
            { open: jest.fn() } as unknown as MatDialog,
        );

        component.ngOnInit();

        expect(service.getPlaylist).toHaveBeenCalledWith("playlist-id");
        expect(
            learningObjectService.getLearningObjectObservable,
        ).toHaveBeenNthCalledWith(1, {
            cuidInfo: { cuid: "available-cuid" },
            latestReleased: true,
        });
        expect(
            learningObjectService.getLearningObjectObservable,
        ).toHaveBeenNthCalledWith(2, {
            cuidInfo: { cuid: "stale-cuid" },
            latestReleased: true,
        });
        expect(component.learningObjects.map(({ cuid }) => cuid)).toEqual([
            "available-cuid",
            "stale-cuid",
        ]);
        expect(component.learningObjects[1].object).toBeNull();
        expect(component.learningObjects[0].object).toBe(availableObject);
        expect(component.loading).toBe(false);
        component.ngOnDestroy();
    });

    it("keeps the playlist usable when an object request fails", () => {
        const service = {
            getPlaylist: jest.fn().mockReturnValue(of(playlist)),
        };
        const learningObjectService = {
            getLearningObjectObservable: jest
                .fn()
                .mockReturnValue(throwError(() => new Error("missing"))),
        };
        const component = new PlaylistDetailsComponent(
            { paramMap: params.asObservable() } as any,
            {} as Router,
            service as unknown as PlaylistService,
            learningObjectService as unknown as LearningObjectService,
            {} as SearchService,
            { user: new AuthUser({ _id: "user-id" }) } as AuthService,
            { open: jest.fn() } as unknown as MatDialog,
        );

        component.ngOnInit();

        expect(component.hasError).toBe(false);
        expect(component.learningObjects).toHaveLength(2);
        expect(component.learningObjects.every(({ object }) => !object)).toBe(
            true,
        );
        component.ngOnDestroy();
    });

    it("does not request learning objects for an empty playlist", () => {
        const emptyPlaylist = { ...playlist, learningObjectCuids: [] };
        const service = {
            getPlaylist: jest.fn().mockReturnValue(of(emptyPlaylist)),
        };
        const learningObjectService = {
            getLearningObjectObservable: jest.fn(),
        };
        const component = new PlaylistDetailsComponent(
            { paramMap: params.asObservable() } as any,
            {} as Router,
            service as unknown as PlaylistService,
            learningObjectService as unknown as LearningObjectService,
            {} as SearchService,
            { user: new AuthUser({ _id: "user-id" }) } as AuthService,
            { open: jest.fn() } as unknown as MatDialog,
        );

        component.ngOnInit();

        expect(
            learningObjectService.getLearningObjectObservable,
        ).not.toHaveBeenCalled();
        expect(component.learningObjects).toEqual([]);
        expect(component.loading).toBe(false);
        component.ngOnDestroy();
    });

    it("shows an unavailable state when the playlist request fails", () => {
        const service = {
            getPlaylist: jest
                .fn()
                .mockReturnValue(throwError(() => new Error("not found"))),
        };
        const component = new PlaylistDetailsComponent(
            { paramMap: params.asObservable() } as any,
            {} as Router,
            service as unknown as PlaylistService,
            {} as LearningObjectService,
            {} as SearchService,
            { user: new AuthUser({ _id: "user-id" }) } as AuthService,
            { open: jest.fn() } as unknown as MatDialog,
        );

        component.ngOnInit();

        expect(component.hasError).toBe(true);
        expect(component.loading).toBe(false);
        component.ngOnDestroy();
    });

    describe("metadata dialog", () => {
        it("keeps the edit tooltip hidden when the dialog restores focus", fakeAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    PlaylistDetailsComponent,
                    MatDialogModule,
                    NoopAnimationsModule,
                ],
                providers: [
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            paramMap: of(
                                convertToParamMap({ playlistId: playlist._id }),
                            ),
                        },
                    },
                    {
                        provide: Router,
                        useValue: {
                            createUrlTree: jest.fn(),
                            serializeUrl: jest
                                .fn()
                                .mockReturnValue("/playlists"),
                            events: of(),
                        },
                    },
                    {
                        provide: PlaylistService,
                        useValue: {
                            getPlaylist: jest.fn().mockReturnValue(
                                of({
                                    ...playlist,
                                    learningObjectCuids: [],
                                }),
                            ),
                        },
                    },
                    { provide: LearningObjectService, useValue: {} },
                    { provide: SearchService, useValue: {} },
                    {
                        provide: AuthService,
                        useValue: { user: new AuthUser({ _id: "user-id" }) },
                    },
                ],
            });
            const fixture = TestBed.createComponent(PlaylistDetailsComponent);
            fixture.detectChanges();
            const edit = fixture.debugElement.query(By.directive(MatTooltip));
            const tooltip = edit.injector.get(MatTooltip);
            const button: HTMLButtonElement = edit.nativeElement;
            button.focus();
            tooltip.show(0);
            tick(500);
            expect(tooltip._isTooltipVisible()).toBe(true);

            button.click();
            fixture.detectChanges();
            tick(500);
            expect(tooltip._isTooltipVisible()).toBe(false);
            fixture.componentInstance.cancelEditPlaylist();
            fixture.detectChanges();
            tick(500);
            expect(document.activeElement).toBe(button);
            expect(tooltip._isTooltipVisible()).toBe(false);
            fixture.destroy();
            tick(500);
        }));

        function setup(owner = true) {
            const playlistService = {
                updatePlaylist: jest.fn().mockReturnValue(
                    of({
                        ...playlist,
                        name: "Updated title",
                        description: "Updated description",
                    }),
                ),
            };
            const dialogRef = { close: jest.fn(), disableClose: false };
            const dialog = { open: jest.fn().mockReturnValue(dialogRef) };
            const component = new PlaylistDetailsComponent(
                {} as any,
                {} as Router,
                playlistService as unknown as PlaylistService,
                {} as LearningObjectService,
                {} as SearchService,
                {
                    user: new AuthUser({
                        _id: owner ? "user-id" : "other-user",
                    }),
                } as AuthService,
                dialog as unknown as MatDialog,
            );
            component.playlist = { ...playlist };
            return { component, playlistService, dialog, dialogRef };
        }

        it("opens with current fields and discards cancelled drafts when reopened", () => {
            const { component, dialog, dialogRef, playlistService } = setup();
            component.openEditPlaylist();
            expect(dialog.open).toHaveBeenCalledWith(
                component.editPlaylistDialog,
                expect.objectContaining({ width: "420px" }),
            );
            expect(component.editForm.getRawValue()).toEqual({
                name: playlist.name,
                description: playlist.description,
            });
            component.editForm.patchValue({ name: "Unsaved draft" });
            component.cancelEditPlaylist();
            expect(dialogRef.close).toHaveBeenCalled();
            expect(playlistService.updatePlaylist).not.toHaveBeenCalled();
            expect(component.playlist.name).toBe(playlist.name);
            component.openEditPlaylist();
            expect(component.editForm.controls.name.value).toBe(playlist.name);
            component.ngOnDestroy();
        });

        it("prefills an absent description with an empty field", () => {
            const { component } = setup();
            component.playlist.description = undefined;
            component.openEditPlaylist();
            expect(component.editForm.controls.description.value).toBe("");
            expect(component.editForm.valid).toBe(true);
            component.ngOnDestroy();
        });

        it("saves trimmed fields together and updates the header after success", () => {
            const { component, playlistService, dialogRef } = setup();
            component.openEditPlaylist();
            component.editForm.setValue({
                name: "  Updated title  ",
                description: "  Updated description  ",
            });
            component.saveMetadata();
            expect(playlistService.updatePlaylist).toHaveBeenCalledWith(
                playlist._id,
                { name: "Updated title", description: "Updated description" },
            );
            expect(component.playlist.name).toBe("Updated title");
            expect(component.playlist.description).toBe("Updated description");
            expect(component.playlist.visibility).toBe("public");
            expect(dialogRef.close).toHaveBeenCalled();
            expect(component.editForm.enabled).toBe(true);
            component.ngOnDestroy();
        });

        it("allows clearing the optional description", () => {
            const { component, playlistService } = setup();
            component.openEditPlaylist();
            component.editForm.controls.description.setValue("   ");
            component.saveMetadata();
            expect(playlistService.updatePlaylist).toHaveBeenCalledWith(
                playlist._id,
                { name: playlist.name, description: "" },
            );
            component.ngOnDestroy();
        });

        it("keeps failed drafts available for retry without changing displayed metadata", () => {
            const { component, playlistService, dialogRef } = setup();
            playlistService.updatePlaylist.mockReturnValue(
                throwError(() => new Error("failed")),
            );
            component.openEditPlaylist();
            component.editForm.controls.name.setValue("Retry title");
            component.saveMetadata();
            expect(component.editError).toBeTruthy();
            expect(component.playlist.name).toBe(playlist.name);
            expect(component.editForm.controls.name.value).toBe("Retry title");
            expect(component.editForm.enabled).toBe(true);
            expect(component.savingMetadata).toBe(false);
            expect(dialogRef.disableClose).toBe(false);
            expect(dialogRef.close).not.toHaveBeenCalled();
            component.ngOnDestroy();
        });

        it("prevents duplicate saves and cancellation during a pending request", () => {
            const { component, playlistService, dialogRef } = setup();
            const pending = new Subject<Playlist>();
            playlistService.updatePlaylist.mockReturnValue(pending);
            component.openEditPlaylist();
            component.saveMetadata();
            component.saveMetadata();
            component.cancelEditPlaylist();
            expect(playlistService.updatePlaylist).toHaveBeenCalledTimes(1);
            expect(component.editForm.disabled).toBe(true);
            expect(dialogRef.disableClose).toBe(true);
            expect(dialogRef.close).not.toHaveBeenCalled();
            component.ngOnDestroy();
            expect(dialogRef.close).toHaveBeenCalled();
        });

        it("prevents non-owners from opening or saving", () => {
            const { component, playlistService, dialog } = setup(false);
            component.openEditPlaylist();
            component.editForm.setValue({ name: "Changed", description: "" });
            component.saveMetadata();
            expect(dialog.open).not.toHaveBeenCalled();
            expect(playlistService.updatePlaylist).not.toHaveBeenCalled();
            component.ngOnDestroy();
        });

        it.each([
            { name: "   ", description: "" },
            { name: "a".repeat(101), description: "" },
            { name: "Valid", description: "a".repeat(501) },
        ])("rejects invalid fields %p", (fields) => {
            const { component, playlistService } = setup();
            component.openEditPlaylist();
            component.editForm.setValue(fields);
            component.saveMetadata();
            expect(playlistService.updatePlaylist).not.toHaveBeenCalled();
            component.ngOnDestroy();
        });
    });

    describe("candidate pagination", () => {
        afterEach(() => jest.useRealTimers());

        function setup() {
            const searchService = { getLearningObjects: jest.fn() };
            const playlistService = { addLearningObject: jest.fn() };
            const component = new PlaylistDetailsComponent(
                { paramMap: params.asObservable() } as any,
                {} as Router,
                playlistService as unknown as PlaylistService,
                {} as LearningObjectService,
                searchService as unknown as SearchService,
                { user: new AuthUser({ _id: "user-id" }) } as AuthService,
                { open: jest.fn() } as unknown as MatDialog,
            );
            component.playlist = { ...playlist, learningObjectCuids: [] };
            component.searchText = "security";
            return { component, searchService, playlistService };
        }

        function candidate(cuid: string): LearningObject {
            const object = new LearningObject({ cuid, name: cuid, version: 1 });
            return object;
        }

        it("keeps the spinner visible for a third of a second before revealing results", async () => {
            const { component, searchService } = setup();
            const object = candidate("available");
            searchService.getLearningObjects.mockResolvedValue({
                learningObjects: [object],
                total: 1,
            });

            jest.useFakeTimers();
            const pendingSearch = component.search();
            jest.advanceTimersByTime(332);
            expect(component.searchLoading).toBe(true);
            expect(component.searchResults).toEqual([]);

            jest.advanceTimersByTime(1);
            await pendingSearch;
            expect(component.searchLoading).toBe(false);
            expect(component.searchResults).toEqual([object]);
        });

        it("requests four candidates and advances after adding the last one", async () => {
            const { component, searchService, playlistService } = setup();
            const first = candidate("first");
            const next = candidate("next");
            searchService.getLearningObjects
                .mockResolvedValueOnce({ learningObjects: [first], total: 8 })
                .mockResolvedValueOnce({ learningObjects: [next], total: 8 });
            playlistService.addLearningObject.mockReturnValue(
                of({
                    ...component.playlist,
                    learningObjectCuids: [first.cuid],
                }),
            );

            await component.search();
            const nextSearch = jest.spyOn(component, "search");
            component.addLearningObject(first);
            await nextSearch.mock.results[0].value;

            expect(searchService.getLearningObjects).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({ currPage: 1, limit: 4 }),
            );
            expect(searchService.getLearningObjects).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({ currPage: 2, limit: 4 }),
            );
            expect(component.searchResults).toEqual([next]);
            expect(component.learningObjects[0].object).toBe(first);
            expect(component.searchHasMore).toBe(false);
        });

        it("skips pages containing only objects already in the playlist", async () => {
            const { component, searchService } = setup();
            const existing = candidate("existing");
            const available = candidate("available");
            component.playlist.learningObjectCuids = [existing.cuid];
            searchService.getLearningObjects
                .mockResolvedValueOnce({
                    learningObjects: [existing],
                    total: 8,
                })
                .mockResolvedValueOnce({
                    learningObjects: [available],
                    total: 8,
                });

            await component.search();

            expect(searchService.getLearningObjects).toHaveBeenCalledTimes(2);
            expect(component.searchResults).toEqual([available]);
            expect(component.searchHasMore).toBe(false);
        });

        it("stops automatically when all remaining pages are excluded", async () => {
            const { component, searchService } = setup();
            const existing = candidate("existing");
            component.playlist.learningObjectCuids = [existing.cuid];
            searchService.getLearningObjects.mockResolvedValue({
                learningObjects: [existing],
                total: 8,
            });

            await component.search();

            expect(searchService.getLearningObjects).toHaveBeenCalledTimes(2);
            expect(component.searchResults).toEqual([]);
            expect(component.searchHasMore).toBe(false);
            expect(component.searchLoading).toBe(false);
        });

        it("does not request another page after adding the final search match", async () => {
            const { component, searchService, playlistService } = setup();
            const last = candidate("last");
            searchService.getLearningObjects.mockResolvedValue({
                learningObjects: [last],
                total: 1,
            });
            playlistService.addLearningObject.mockReturnValue(
                of({ ...component.playlist, learningObjectCuids: [last.cuid] }),
            );

            await component.search();
            component.addLearningObject(last);

            expect(searchService.getLearningObjects).toHaveBeenCalledTimes(1);
            expect(component.searchResults).toEqual([]);
        });

        it("keeps the added object when loading the next page fails", async () => {
            const { component, searchService, playlistService } = setup();
            const first = candidate("first");
            searchService.getLearningObjects
                .mockResolvedValueOnce({ learningObjects: [first], total: 8 })
                .mockRejectedValueOnce(new Error("search unavailable"));
            playlistService.addLearningObject.mockReturnValue(
                of({
                    ...component.playlist,
                    learningObjectCuids: [first.cuid],
                }),
            );

            await component.search();
            const nextSearch = jest.spyOn(component, "search");
            component.addLearningObject(first);
            await nextSearch.mock.results[0].value;

            expect(component.learningObjects[0].object).toBe(first);
            expect(component.searchError).toBe(true);
            expect(component.searchLoading).toBe(false);
        });
    });
});
