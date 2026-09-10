import {
    HttpClientTestingModule,
    HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "@env/environment";
import { PlaylistService } from "./playlist.service";
import { Playlist } from "./playlist.types";

describe("PlaylistService", () => {
    let service: PlaylistService;
    let httpMock: HttpTestingController;

    const playlist: Playlist = {
        _id: "playlist/id",
        userId: "user/id",
        learningObjectCuids: [],
        name: "Security playlist",
        description: "A playlist description",
        visibility: "public",
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PlaylistService],
        });
        service = TestBed.inject(PlaylistService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it("gets playlists for a profile user", () => {
        service.getPlaylists(playlist.userId).subscribe((result) => {
            expect(result).toEqual([playlist]);
        });

        const request = httpMock.expectOne(
            `${environment.apiURL}/playlists?userId=user%2Fid`,
        );
        expect(request.request.method).toBe("GET");
        expect(request.request.withCredentials).toBe(true);
        request.flush([playlist]);
    });

    it("gets one hydrated playlist", () => {
        service.getPlaylist(playlist._id).subscribe();

        const request = httpMock.expectOne(
            `${environment.apiURL}/playlists?playlistId=playlist%2Fid`,
        );
        expect(request.request.method).toBe("GET");
        expect(request.request.withCredentials).toBe(true);
        request.flush({ ...playlist, learningObjects: [] });
    });

    it("creates and updates playlists", () => {
        const createRequest = {
            name: playlist.name,
            description: playlist.description,
            visibility: playlist.visibility,
        };
        service.createPlaylist(createRequest).subscribe();
        const create = httpMock.expectOne(`${environment.apiURL}/playlists`);
        expect(create.request.method).toBe("POST");
        expect(create.request.body).toEqual(createRequest);
        create.flush(playlist);

        service
            .updatePlaylist(playlist._id, { name: "Updated playlist" })
            .subscribe();
        const update = httpMock.expectOne(
            `${environment.apiURL}/playlists/playlist%2Fid`,
        );
        expect(update.request.method).toBe("PATCH");
        expect(update.request.body).toEqual({ name: "Updated playlist" });
        update.flush({ ...playlist, name: "Updated playlist" });
    });

    it("deletes a playlist", () => {
        service.deletePlaylist(playlist._id).subscribe((result) => {
            expect(result).toBeUndefined();
        });

        const request = httpMock.expectOne(
            `${environment.apiURL}/playlists/playlist%2Fid`,
        );
        expect(request.request.method).toBe("DELETE");
        request.flush(null, { status: 204, statusText: "No Content" });
    });

    it("adds and removes learning objects", () => {
        service.addLearningObject(playlist._id, "learning/object").subscribe();
        const add = httpMock.expectOne(
            `${environment.apiURL}/playlists/playlist%2Fid/objects/learning%2Fobject`,
        );
        expect(add.request.method).toBe("PUT");
        expect(add.request.body).toEqual({});
        add.flush(playlist);

        service
            .removeLearningObject(playlist._id, "learning/object")
            .subscribe();
        const remove = httpMock.expectOne(
            `${environment.apiURL}/playlists/playlist%2Fid/objects/learning%2Fobject`,
        );
        expect(remove.request.method).toBe("DELETE");
        remove.flush(playlist);
    });
});
