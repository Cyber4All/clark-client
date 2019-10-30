import { NgModule } from '@angular/core';

import { DetailsComponent } from './details.component';
import { FileDetailsComponent } from './components/file-details/file-details.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CubeSharedModule } from '../shared/cube-shared.module';
import { OutcomesDetailViewComponent } from './components/outcomes-detail-view/outcomes-detail-view.component';
import { RouterModule, UrlSegment } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DetailsIncludedInComponent } from './components/included-in/included-in.component';
import { ChildrenDetailViewComponent } from './components/children-detail-view/children-detail-view.component';
import { ParentListingComponent } from './components/included-in/parent-listing.component';
import { DetailsSplashComponent } from './components/splash/details-splash.component';
import { ActionPanelComponent } from './components/action-panel/action-panel.component';
import { ErrorStatusComponent } from './components/error-status/error-status.component';
import { ReviewerPanelComponent } from './components/reviewer-panel/reviewer-panel.component';
import { FileBrowserModule } from 'app/shared/modules/filesystem/file-browser.module';
import { NewRatingComponent } from './components/new-rating/new-rating.component';
import { NewRatingResponseComponent } from './components/new-rating-response/new-rating-response.component';
import { ReportRatingComponent } from './components/report-rating/report-rating.component';
import { LearningObjectRatingsComponent } from './components/learning-object-ratings/learning-object-ratings.component';
import { EditorialActionPadModule } from './components/action-panel/editorial-action-pad/editorial-action-pad.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    RouterModule.forChild([ { path: ':username/:learningObjectName', component: DetailsComponent } ]),
    FileBrowserModule,
    CubeSharedModule,
    EditorialActionPadModule,
  ],
  exports: [],
  declarations: [
    DetailsComponent,
    FileDetailsComponent,
    OutcomesDetailViewComponent,
    DetailsIncludedInComponent,
    ChildrenDetailViewComponent,
    ParentListingComponent,
    DetailsSplashComponent,
    ActionPanelComponent,
    ErrorStatusComponent,
    ReviewerPanelComponent,
    NewRatingComponent,
    NewRatingResponseComponent,
    ReportRatingComponent,
    LearningObjectRatingsComponent
  ],
  providers: []
})
export class OldDetailsModule { }
