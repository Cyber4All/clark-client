// Core
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SidePanelViewerComponent } from './side-panel-viewer/side-panel-viewer.component';
import { PanelDirective } from './panel.directive';

/**
 * Contains all stateless UI modules (directives, components, pipes) that are used across the app.
 *
 * @class SidePanelModule
 */
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SidePanelViewerComponent,
    PanelDirective
  ],
  exports: [
    PanelDirective
  ],
  entryComponents: [
    SidePanelViewerComponent
  ]
})
export class SidePanelModule {}
