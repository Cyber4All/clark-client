import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsComponent } from './metrics/metrics.component';
import { RevisionComponent } from './revision/revision.component';
import { LearningObjectComponent } from './learning-object/learning-object.component';
import { SharedModule } from '../../../../shared/shared.module';
import { SidePanelContentComponent } from './side-panel-content.component';
import { RouterModule } from '@angular/router';
@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        SharedModule,
        SidePanelContentComponent,
        MetricsComponent,
        RevisionComponent,
        LearningObjectComponent
    ],
    exports: [
        SidePanelContentComponent
    ]
})
export class SidePanelContentModule { }
