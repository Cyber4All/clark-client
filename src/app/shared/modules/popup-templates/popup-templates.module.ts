import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

import { SharedComponents } from 'app/shared/components/shared-components.module';

import { DownloadNoticePopupComponent } from './download-notice-popup/download-notice-popup.component';
import { RevisionNoticePopupComponent } from './revision-notice-popup/revision-notice-popup.component';
import { SharedDirectivesModule } from 'app/shared/directives/shared-directives.module';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedComponents,
    // CLARK Modules
    SharedDirectivesModule,
    SharedPipesModule,
  ],
  declarations: [
    DownloadNoticePopupComponent,
    RevisionNoticePopupComponent,
  ],
  exports: [
    DownloadNoticePopupComponent,
    RevisionNoticePopupComponent,
  ],
})
export class PopupTemplatesModule { }
