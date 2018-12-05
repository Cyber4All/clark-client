import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupComponent } from './popup.component';
import { PopupViewerComponent } from './popup-viewer/popup-viewer.component';
import { CollectionSelectorComponent } from './templates/collection-selector/collection-selector.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    PopupComponent,
    PopupViewerComponent,
    CollectionSelectorComponent
  ],
  exports: [
    PopupComponent,
    CollectionSelectorComponent
  ],
  entryComponents: [
    PopupViewerComponent
  ]
})
export class PopupModule { }
