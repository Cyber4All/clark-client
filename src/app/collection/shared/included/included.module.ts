import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from './stat-card/stat-card.component';
import { LearningObjectService } from 'app/cube/learning-object.service';

@NgModule({
  declarations: [
    StatCardComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    StatCardComponent,
  ],
  providers: [LearningObjectService]
})
export class IncludedModule {

 }
