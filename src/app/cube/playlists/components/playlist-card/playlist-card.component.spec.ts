import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { Playlist } from "app/core/playlist-module/playlist.types";
import { PlaylistCardComponent } from "./playlist-card.component";

describe("PlaylistCardComponent", () => {
    let fixture: ComponentFixture<PlaylistCardComponent>;

    const playlist: Playlist = {
        _id: "playlist-id",
        userId: "user-id",
        learningObjectCuids: ["object-cuid"],
        name: "Public playlist",
        description: "A public playlist",
        visibility: "public",
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlaylistCardComponent, RouterTestingModule],
        }).compileComponents();

        fixture = TestBed.createComponent(PlaylistCardComponent);
        fixture.componentInstance.playlist = playlist;
        fixture.detectChanges();
    });

    it("links to the playlist detail page", () => {
        const link = fixture.nativeElement.querySelector("a");

        expect(link.getAttribute("href")).toBe("/playlists/playlist-id");
        expect(link.getAttribute("aria-label")).toContain("1 learning object");
    });
});
