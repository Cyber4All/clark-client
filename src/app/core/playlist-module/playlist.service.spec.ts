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

    it("gets one hydrated playlist", () => {
        service.getPlaylist(playlist._id).subscribe();

        const request = httpMock.expectOne(
            `${environment.apiURL}/playlists?playlistId=playlist%2Fid`,
        );
        expect(request.request.method).toBe("GET");
        expect(request.request.withCredentials).toBe(true);
        request.flush({ ...playlist, learningObjects: [] });
    });
});
