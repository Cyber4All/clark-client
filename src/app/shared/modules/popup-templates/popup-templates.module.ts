import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

import { SharedComponents } from 'app/shared/components/shared-components.module';

import { CollectionSelectorPopupComponent } from './collection-selector-popup/collection-selector-popup.component';
import { DownloadNoticePopupComponent } from './download-notice-popup/download-notice-popup.component';
import { RevisionNoticePopupComponent } from './revision-notice-popup/revision-notice-popup.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedComponents,
  ],
  declarations: [
    CollectionSelectorPopupComponent,
    DownloadNoticePopupComponent,
    RevisionNoticePopupComponent
  ],
  exports: [
    CollectionSelectorPopupComponent,
    DownloadNoticePopupComponent,
    RevisionNoticePopupComponent
  ],
})
export class PopupTemplatesModule { }
