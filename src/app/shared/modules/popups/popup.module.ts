import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupComponent } from './popup.component';
import { PopupViewerComponent } from './popup-viewer/popup-viewer.component';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from 'app/shared/directives/shared-directives.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedDirectivesModule
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
