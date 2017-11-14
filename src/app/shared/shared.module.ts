import { CurriculumGroupComponent } from './curriculum-group/curriculum-group.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CurriculumGroupComponent],
  exports: [CurriculumGroupComponent]
})
export class SharedModule { }
