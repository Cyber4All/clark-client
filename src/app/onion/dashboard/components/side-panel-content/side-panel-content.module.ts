import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsComponent } from './metrics/metrics.component';
import { RevisionComponent } from './revision/revision.component';
import { LearningObjectComponent } from './learning-object/learning-object.component';
import { SharedModule } from '../../../../shared/shared.module';
import { SidePanelContentComponent } from './side-panel-content.component';
import { RouterModule } from '@angular/router';
@NgModule({
  declarations: [
    SidePanelContentComponent,
    MetricsComponent,
    RevisionComponent,
    LearningObjectComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    SidePanelContentComponent
  ]
})
export class SidePanelContentModule { }
