import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { LearningObjectStatusIndicatorComponent } from './status-indicator/status-indicator.component';

@NgModule({
  declarations: [
    LearningObjectStatusIndicatorComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    LearningObjectStatusIndicatorComponent,
  ]
})
export class OnionSharedModule { }
