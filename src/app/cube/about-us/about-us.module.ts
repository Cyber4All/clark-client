import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MissionComponent } from './components/mission/mission.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { AboutUsComponent } from './about-us.component';
import { AboutClarkComponent } from './components/about-clark/about-clark.component';
import { HomeModule } from '../home/home.module';

@NgModule({
  declarations: [
    MissionComponent,
    TimelineComponent,
    AboutUsComponent,
    AboutClarkComponent,
  ],
  imports: [
    CommonModule,
    HomeModule,
  ],
  exports: [
    AboutUsComponent
  ]
})
export class AboutUsModule { }
