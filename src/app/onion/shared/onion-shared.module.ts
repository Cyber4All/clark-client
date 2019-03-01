import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningObjectStatusIndicatorComponent } from './status-indicator.component';
import { SharedModule } from 'app/shared/shared.module';

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
