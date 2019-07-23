import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollectionSelectorPopupComponent } from './collection-selector-popup/collection-selector-popup.component';
import { DownloadNoticePopupComponent } from './download-notice-popup/download-notice-popup.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    CollectionSelectorPopupComponent,
    DownloadNoticePopupComponent
  ],
  exports: [
    CollectionSelectorPopupComponent,
    DownloadNoticePopupComponent
  ],
})
export class PopupTemplatesModule { }
