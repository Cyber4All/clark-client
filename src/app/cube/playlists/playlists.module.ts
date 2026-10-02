import { NgModule } from "@angular/core";
import { PlaylistDetailsComponent } from "./playlist-details/playlist-details.component";
import { PlaylistsComponent } from "./playlists.component";
import { PlaylistsRoutingModule } from "./playlists.routing";

@NgModule({
    imports: [
        PlaylistsRoutingModule,
        PlaylistsComponent,
        PlaylistDetailsComponent,
    ],
})
export class PlaylistsModule {}
