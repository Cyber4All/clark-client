import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupComponent } from './popup.component';
import { PopupViewerComponent } from './popup-viewer/popup-viewer.component';

@NgModule({
  imports: [
  CommonModule
  ],
  declarations: [
    PopupComponent,
    PopupViewerComponent
  ],
  exports: [
    PopupComponent
  ],
  entryComponents: [
    PopupViewerComponent
  ]
})
export class PopupModule { }
