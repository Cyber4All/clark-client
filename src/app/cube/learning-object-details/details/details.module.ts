import { NgModule } from '@angular/core';

import { DetailsComponent } from './details.component';
import { DetailsContentComponent } from './details-content.component';
import { FileDetailsComponent } from '../file-details/file-details.component';
import { FolderViewComponent } from '../file-details/folder-view/folder-view.component';
import { FileViewComponent } from '..//file-details/file-view/file-view.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CubeSharedModule } from '../../shared/cube-shared.module';
import { OutcomesDetailViewComponent } from './outcomes-detail-view/outcomes-detail-view.component';
import { ParticlesModule } from 'angular-particle';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ParticlesModule,
    RouterModule,
    CubeSharedModule
  ],
  exports: [],
  declarations: [
    DetailsComponent,
    DetailsContentComponent,
    FileDetailsComponent,
    FolderViewComponent,
    FileViewComponent,
    OutcomesDetailViewComponent
  ],
  providers: []
})
export class DetailsModule {}
