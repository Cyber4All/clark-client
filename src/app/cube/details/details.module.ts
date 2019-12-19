import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from './details.component';
import { RouterModule } from '@angular/router';
import { SplashComponent } from './components/splash/splash.component';
import { LengthComponent } from './components/splash/length/length.component';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { DescriptionComponent } from './components/description/description.component';
import { OutcomeComponent } from './components/outcome/outcome.component';
import { AcademicLevelCardComponent } from './components/academic-level-card/academic-level-card.component';
import { MaterialsComponent } from './components/materials/materials.component';
import { ActionPadComponent } from './components/action-pad/action-pad.component';
import { VersionCardComponent } from './components/version-card/version-card.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([ { path: ':username/:learningObjectName', component: DetailsComponent } ]),
    SharedPipesModule
  ],
  exports: [],
  declarations: [
    // root level component
    DetailsComponent,
    // page components
    SplashComponent,
    LengthComponent,
    DescriptionComponent,
    OutcomeComponent,
    AcademicLevelCardComponent,
    MaterialsComponent,
    ActionPadComponent,
    VersionCardComponent,
  ],
  providers: []
})
export class DetailsModule {}
