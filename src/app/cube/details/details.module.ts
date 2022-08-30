import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from './details.component';
import { RouterModule } from '@angular/router';
import { SplashComponent } from './components/splash/splash.component';
import { LengthComponent } from './components/splash/components/length/length.component';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { DescriptionComponent } from './components/description/description.component';
import { OutcomeComponent } from './components/outcome/outcome.component';
import { AcademicLevelCardComponent } from './components/academic-level-card/academic-level-card.component';
import { MaterialsComponent } from './components/materials/materials.component';
import { ActionPanelComponent } from './components/action-panel/action-panel.component';
import { VersionCardComponent } from './components/version-card/version-card.component';
import { FileBrowserModule } from 'app/shared/modules/filesystem/file-browser.module';
import { TabMenuComponent } from './components/materials/components/tab-menu/tab-menu.component';
import { SharedModules } from 'app/shared/modules/shared-modules.module';
import { NotesComponent } from './components/materials/components/notes/notes.component';
import { UrlsComponent } from './components/materials/components/urls/urls.component';
import { AuthorCardComponent } from '../../shared/components/author-card/author-card.component';
import { LearningObjectRatingsComponent} from './components/learning-object-ratings/learning-object-ratings.component';
import { SharedModule } from 'app/shared/shared.module';
import { NewRatingResponseComponent } from './components/new-rating-response/new-rating-response.component';
import { ReportRatingComponent } from './components/report-rating/report-rating.component';
import { FormsModule } from '@angular/forms';
import { NewRatingComponent } from './components/new-rating/new-rating.component';
import { HierarchyLinkComponent } from './components/splash/components/hierarchy-link/hierarchy-link.component';
import { CubeSharedModule } from '../shared/cube-shared.module';
import { SidePanelContentComponent } from './components/splash/components/components/side-panel-content/side-panel-content.component';
import { EditorialActionPadModule } from './components/action-panel/editorial-action-pad/editorial-action-pad.module';
import { ReviewerPanelComponent } from './components/reviewer-panel/reviewer-panel.component';
import { CubePatternComponent } from './components/cube-pattern/cube-pattern.component';
import { RouteBackwardsCompatGuard } from '../core/route-backwards-compat.guard';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: ':username/:learningObjectName',
        component: DetailsComponent,
        canActivate: [ RouteBackwardsCompatGuard ]
      }
    ]),
    SharedPipesModule,
    FileBrowserModule,
    FormsModule,
    SharedModules,
    SharedModule,
    CubeSharedModule,
    EditorialActionPadModule,
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
    ActionPanelComponent,
    VersionCardComponent,
    TabMenuComponent,
    NotesComponent,
    UrlsComponent,
    LearningObjectRatingsComponent,
    NewRatingResponseComponent,
    ReportRatingComponent,
    NewRatingComponent,
    HierarchyLinkComponent,
    SidePanelContentComponent,
    ReviewerPanelComponent,
    CubePatternComponent,
  ],
  providers: []
})
export class DetailsModule {}
