import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollectionSelectorPopupComponent } from './collection-selector-popup/collection-selector-popup.component';
import { DownloadNoticePopupComponent } from './download-notice-popup/download-notice-popup.component';
import {SharedComponents} from '../../shared components/shared-components.module';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedComponents,
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
