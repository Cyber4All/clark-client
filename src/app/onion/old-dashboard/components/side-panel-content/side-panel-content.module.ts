import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidePanelContentComponent } from './side-panel-content.component';
import { MetricsComponent } from './metrics/metrics.component';
import { RevisionComponent } from './revision/revision.component';
import { LearningObjectComponent } from './learning-object/learning-object.component';
import { OnionRoutingModule } from '../../../onion.routing';
import { SharedModule } from '../../../../shared/shared.module';

@NgModule({
  declarations: [
    SidePanelContentComponent,
    MetricsComponent,
    RevisionComponent,
    LearningObjectComponent
  ],
  imports: [
    CommonModule,
    OnionRoutingModule,
    SharedModule
  ]
})
export class SidePanelContentModule { }
