// Core
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SidePanelViewerComponent } from './side-panel-viewer/side-panel-viewer.component';
import { PanelDirective } from './panel.directive';
import { SharedDirectivesModule } from '../../directives/shared-directives.module';

/**
 * Contains all stateless UI modules (directives, components, pipes) that are used across the app.
 *
 * @class SidePanelModule
 */
@NgModule({
  imports: [
    CommonModule,
    SharedDirectivesModule,
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
