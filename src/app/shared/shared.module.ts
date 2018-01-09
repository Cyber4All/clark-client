import { CurriculumGroupComponent } from './curriculum-group/curriculum-group.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortGroupsService } from './sort-groups.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CurriculumGroupComponent],
  exports: [CurriculumGroupComponent],
  providers: [
    SortGroupsService
  ]
})
export class SharedModule { }
