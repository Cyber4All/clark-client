import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PlaylistDetailsComponent } from "./playlist-details/playlist-details.component";
import { PlaylistsComponent } from "./playlists.component";

const playlistRoutes: Routes = [
    {
        path: "",
        component: PlaylistsComponent,
        pathMatch: "full",
    },
    {
        path: ":playlistId",
        component: PlaylistDetailsComponent,
        data: { title: "Playlist" },
    },
];

@NgModule({
    imports: [RouterModule.forChild(playlistRoutes)],
    exports: [RouterModule],
})
export class PlaylistsRoutingModule {}
