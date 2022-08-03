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
import { HelpCardComponent } from './help/components/help-card/help-card.component';
import { LearningObjectsComponent } from './learning-object-info/learning-objects/learning-objects.component';
import { LearningOutcomesComponent } from './learning-object-info/learning-outcomes/learning-outcomes.component';
import { HierarchiesComponent } from './learning-object-info/hierarchies/hierarchies.component';
import { CollectionsComponent } from './learning-object-info/collections/collections.component';
import { StickyMenuComponent } from './learning-object-info/sticky-menu/sticky-menu.component';
import { CubeSharedModule } from '../shared/cube-shared.module';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { HelpBackBtnComponent } from './help/components/help-back-btn/help-back-btn.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    NewHomeComponent,
    SplashComponent,
    MissionComponent,
    HelpComponent,
    LearningObjectInfoComponent,
    TeachNowComponent,
    BuildProgramComponent,
    ExploreCollectionsComponent,
    LearningObjectsComponent,
    LearningOutcomesComponent,
    HierarchiesComponent,
    CollectionsComponent,
    StickyMenuComponent,
    HelpCardComponent,
    HelpBackBtnComponent
  ],
  imports: [
    CommonModule,
    CubeSharedModule,
    SharedModule,
    RouterModule,
    FormsModule
  ]
})
export class NewHomeModule { }
