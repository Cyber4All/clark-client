import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewHomeComponent } from './new-home.component';
import { SplashComponent } from './splash/splash.component';
import { MissionComponent } from './mission/mission.component';
import { HelpComponent } from './help/help.component';
import { LearningObjectInfoComponent } from './learning-object-info/learning-object-info.component';
import { TeachNowComponent } from './help/teach-now/teach-now.component';
import { BuildProgramComponent } from './help/build-program/build-program.component';
import { ExploreCollectionsComponent } from './help/explore-collections/explore-collections.component';



@NgModule({
  declarations: [
    NewHomeComponent,
    SplashComponent,
    MissionComponent,
    HelpComponent,
    LearningObjectInfoComponent,
    TeachNowComponent,
    BuildProgramComponent,
    ExploreCollectionsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class NewHomeModule { }
