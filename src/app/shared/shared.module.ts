//Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

//Modules
import { RoutingModule } from '../app.routing';

//Services
import { SortGroupsService } from './sort-groups.service';

//Components
import { CurriculumGroupComponent } from './curriculum-group/curriculum-group.component';

@NgModule({
  imports: [
    CommonModule,
    RoutingModule,
  ],
  declarations: [
    CurriculumGroupComponent
  ],
  exports: [CurriculumGroupComponent],
  providers: [
    SortGroupsService
  ]
})
export class SharedModule { }
