import { NgModule } from '@angular/core';

import { DetailsComponent } from './details.component';
import { FileDetailsComponent } from './file-details/file-details.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CubeSharedModule } from '../shared/cube-shared.module';
import { OutcomesDetailViewComponent } from './outcomes-detail-view/outcomes-detail-view.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DetailsIncludedInComponent } from './included-in/included-in.component';
import { ChildrenDetailViewComponent } from './children-detail-view/children-detail-view.component';
import { ParentListingComponent } from './included-in/parent-listing.component';
import { DetailsSplashComponent } from './splash/details-splash.component';
import { ActionPanelComponent } from './action-panel/action-panel.component';
import { ErrorStatusComponent } from './error-status/error-status.component';
import { VersionSwitchComponent } from './version-switch/version-switch.component';
import { ReviewerPanelComponent } from './reviewer-panel/reviewer-panel.component';
import { ReviseButtonComponent } from './action-panel/revise-button.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    RouterModule,
    CubeSharedModule
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
    VersionSwitchComponent,
    ReviewerPanelComponent,
    ReviseButtonComponent,
  ],
  providers: []
})
export class DetailsModule {}
