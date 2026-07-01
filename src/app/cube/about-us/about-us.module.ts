import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MissionComponent } from "./components/mission/mission.component";
import { TimelineComponent } from "./components/timeline/timeline.component";
import { AboutUsComponent } from "./about-us.component";
import { AboutClarkComponent } from "./components/about-clark/about-clark.component";
import { HomeModule } from "../home/home.module";

@NgModule({
    imports: [
        CommonModule,
        HomeModule,
        MissionComponent,
        TimelineComponent,
        AboutUsComponent,
        AboutClarkComponent,
    ],
    exports: [AboutUsComponent],
})
export class AboutUsModule {}
