import { NgModule } from '@angular/core';

import { DetailsComponent } from './details.component';
import { DetailsContentComponent } from './details-content.component';
import { FileDetailsComponent } from '../file-details/file-details.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CubeSharedModule } from '../../shared/cube-shared.module';
import { OutcomesDetailViewComponent } from './outcomes-detail-view/outcomes-detail-view.component';
import { ParticlesModule } from 'angular-particle';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { TooltipModule } from '@cyber4all/clark-tooltip';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ParticlesModule,
    RouterModule,
    CubeSharedModule,
    TooltipModule
  ],
  exports: [],
  declarations: [
    DetailsComponent,
    DetailsContentComponent,
    FileDetailsComponent,
    OutcomesDetailViewComponent
  ],
  providers: []
})
export class DetailsModule {}
