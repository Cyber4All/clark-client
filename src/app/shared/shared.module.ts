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
import { ModalService } from './popups/modal.service';
import { DialogMenuComponent } from './popups/dialogmenu.component';
import { ContextMenuComponent } from './popups/contextmenu.component';
import { EscapeHtmlPipe } from './popups/pipes/keep-html.pipe';

@NgModule({
  imports: [
    CommonModule,
    RoutingModule,
  ],
  declarations: [
    CurriculumGroupComponent,
    BreadcrumbComponent,
    LearningObjectListingComponent,
    ContextMenuComponent,
    DialogMenuComponent,
    EscapeHtmlPipe
  ],
  exports: [
    CurriculumGroupComponent,
    BreadcrumbComponent,
    LearningObjectListingComponent,
    ContextMenuComponent,
    DialogMenuComponent
  ],
  providers: [
    SortGroupsService,
    ModalService
  ]
})
export class SharedModule { }
