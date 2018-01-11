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
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';

@NgModule({
  imports: [
    CommonModule,
    RoutingModule,
  ],
  declarations: [
<<<<<<< HEAD
    EscapeHtmlPipe,
    CurriculumGroupComponent,
    BreadcrumbComponent
  ],
  exports: [
    CurriculumGroupComponent,
    BreadcrumbComponent
=======
    CurriculumGroupComponent
>>>>>>> cb1770c603b8ad5bc9fe0b80f1f2085fc8949761
  ],
  providers: [
    SortGroupsService
  ]
})
export class SharedModule { }
