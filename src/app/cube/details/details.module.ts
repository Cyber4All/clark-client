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
import { NewFileBrowserComponent } from './components/materials/components/new-file-browser/new-file-browser.component';
import { SharedModules } from 'app/shared/modules/shared-modules.module';
import { UrlComponentComponent } from './components/materials/components/url-component/url-component.component';
import { NoteComponentComponent } from './components/materials/components/note-component/note-component.component';
import { NotesComponent } from './components/materials/components/notes/notes.component';
import { UrlsComponent } from './components/materials/components/urls/urls.component';

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
    NewFileBrowserComponent,
    UrlComponentComponent,
    NoteComponentComponent,
    NotesComponent,
    UrlsComponent,
  ],
  providers: []
})
export class DetailsModule {}
