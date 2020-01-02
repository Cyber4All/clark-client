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
import { FileBrowserModule } from 'app/shared/modules/filesystem/file-browser.module';
import { TabMenuComponent } from './components/materials/components/tab-menu/tab-menu.component';
import { SharedModules } from 'app/shared/modules/shared-modules.module';
import { NotesComponent } from './components/materials/components/notes/notes.component';
import { UrlsComponent } from './components/materials/components/urls/urls.component';
import { AuthorCardComponent } from './components/author-card/author-card.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([ { path: ':username/:learningObjectName', component: DetailsComponent } ]),
    SharedPipesModule,
    FileBrowserModule,
    SharedModules,
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
    TabMenuComponent,
    NotesComponent,
    UrlsComponent,
    AuthorCardComponent,
  ],
  providers: []
})
export class DetailsModule {}
