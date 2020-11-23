import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MissionComponent } from './components/mission/mission.component';
import { DiversityComponent } from './components/diversity/diversity.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { AboutUsComponent } from './about-us.component';
import { AboutClarkComponent } from './components/about-clark/about-clark.component';
import { UsageComponent } from '../home/components/usage/usage.component';

@NgModule({
  declarations: [
    DiversityComponent,
    MissionComponent,
    TimelineComponent,
    AboutUsComponent,
    AboutClarkComponent,
    UsageComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    AboutUsComponent
  ]
})
export class AboutUsModule { }
