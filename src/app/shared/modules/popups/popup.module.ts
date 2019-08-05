import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupComponent } from './popup.component';
import { PopupViewerComponent } from './popup-viewer/popup-viewer.component';
import { FormsModule } from '@angular/forms';
import { SharedComponents } from 'app/shared/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedComponents
  ],
  declarations: [
    PopupComponent,
    PopupViewerComponent,
  ],
  exports: [
    PopupComponent,
  ],
  entryComponents: [
    PopupViewerComponent
  ]
})
export class PopupModule { }
