import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidePanelContentComponent } from './side-panel-content.component';
import { MetricsComponent } from './metrics/metrics.component';
import { RevisionComponent } from './revision/revision.component';
@NgModule({
  declarations: [
    SidePanelContentComponent,
    MetricsComponent,
    RevisionComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SidePanelContentModule { }
