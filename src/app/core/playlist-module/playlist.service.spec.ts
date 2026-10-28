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

    it("gets all public playlists without a user filter", () => {
        service.getPlaylists().subscribe((result) => {
            expect(result).toEqual([playlist]);
        });

        const request = httpMock.expectOne(`${environment.apiURL}/playlists`);
        expect(request.request.method).toBe("GET");
        expect(request.request.withCredentials).toBe(true);
        request.flush([playlist]);
    });

    it("gets playlists for one user", () => {
        service.getPlaylists({ userId: playlist.userId }).subscribe();

        const request = httpMock.expectOne(
            `${environment.apiURL}/playlists?userId=user%2Fid`,
        );
        expect(request.request.method).toBe("GET");
        request.flush([playlist]);
    });

    it("merges public and author-owned private playlists for browse", () => {
        const privatePlaylist: Playlist = {
            ...playlist,
            _id: "private-id",
            visibility: "private",
            createdAt: "2026-10-28T12:00:00.000Z",
        };
        const anotherPrivatePlaylist: Playlist = {
            ...privatePlaylist,
            _id: "another-private-id",
            userId: "another-user",
        };

        service.getBrowsePlaylists(playlist.userId).subscribe((result) => {
            expect(result).toEqual([privatePlaylist, playlist]);
        });

        httpMock
            .expectOne(`${environment.apiURL}/playlists`)
            .flush([playlist, anotherPrivatePlaylist]);
        httpMock
            .expectOne(`${environment.apiURL}/playlists?userId=user%2Fid`)
            .flush([privatePlaylist]);
    });

    it("gets one raw playlist", () => {
        service.getPlaylist(playlist._id).subscribe();

        const request = httpMock.expectOne(
            `${environment.apiURL}/playlists?playlistId=playlist%2Fid`,
        );
        expect(request.request.method).toBe("GET");
        expect(request.request.withCredentials).toBe(true);
        request.flush(playlist);
    });

    it("creates a playlist", () => {
        const body = {
            name: playlist.name,
            description: playlist.description,
            visibility: playlist.visibility,
        };
        service.createPlaylist(body).subscribe();

        const request = httpMock.expectOne(`${environment.apiURL}/playlists`);
        expect(request.request.method).toBe("POST");
        expect(request.request.body).toEqual(body);
        expect(request.request.withCredentials).toBe(true);
        request.flush(playlist);
    });

    it("adds a learning object to a playlist", () => {
        service.addLearningObject(playlist._id, "object/cuid").subscribe();

        const request = httpMock.expectOne(
            `${environment.apiURL}/playlists/playlist%2Fid/objects/object%2Fcuid`,
        );
        expect(request.request.method).toBe("PUT");
        expect(request.request.body).toEqual({});
        request.flush(playlist);
    });
});
