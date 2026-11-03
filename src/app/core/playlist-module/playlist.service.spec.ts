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

    it("creates a playlist without a description", () => {
        const input = { name: "Title only", visibility: "private" as const };
        const created: Playlist = {
            _id: "new-playlist",
            userId: "user/id",
            learningObjectCuids: [],
            ...input,
        };
        service.createPlaylist(input).subscribe((result) => {
            expect(result).toEqual(created);
        });
        const request = httpMock.expectOne(`${environment.apiURL}/playlists`);
        expect(request.request.method).toBe("POST");
        expect(request.request.body).toEqual(input);
        expect(request.request.withCredentials).toBe(true);
        request.flush(created);
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
});
