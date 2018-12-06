import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupComponent } from './popup.component';
import { PopupViewerComponent } from './popup-viewer/popup-viewer.component';
import { CollectionSelectorComponent } from './templates/collection-selector/collection-selector.component';
import { FormsModule } from '@angular/forms';
import { DownloadNoticeComponent } from './templates/download-notice/download-notice.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    PopupComponent,
    PopupViewerComponent,
    CollectionSelectorComponent,
    DownloadNoticeComponent
  ],
  exports: [
    PopupComponent,
    CollectionSelectorComponent,
    DownloadNoticeComponent
  ],
  entryComponents: [
    PopupViewerComponent
  ]
})
export class PopupModule { }
