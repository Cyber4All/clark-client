// Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Modules
import { RoutingModule } from '../app.routing';

// Services
import { SortGroupsService } from './sort-groups.service';

// Components
import { CurriculumGroupComponent } from './curriculum-group/curriculum-group.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { LearningObjectListingComponent } from './learning-object/learning-object.component';
import { ModalService } from './modal.service';

@NgModule({
  imports: [
    CommonModule,
    RoutingModule,
  ],
  declarations: [
    CurriculumGroupComponent,
    BreadcrumbComponent,
    LearningObjectListingComponent
  ],
  exports: [
    CurriculumGroupComponent,
    BreadcrumbComponent,
    LearningObjectListingComponent
  ],
  providers: [
    SortGroupsService,
    ModalService
  ]
})
export class SharedModule { }
