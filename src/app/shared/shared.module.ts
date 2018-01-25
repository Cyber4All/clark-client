// Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Modules
import { RoutingModule } from '../app.routing';
import { ModalModule } from '@cyber4all/clark-modal';
import { NotificationModule } from 'clark-notification';
import { CheckBoxModule } from 'clark-checkbox';

// Services
import { SortGroupsService } from './sort-groups.service';

// Components
import { CurriculumGroupComponent } from './curriculum-group/curriculum-group.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { LearningObjectListingComponent } from './learning-object/learning-object.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  imports: [
    CommonModule,
    RoutingModule,
    CheckBoxModule,
    NotificationModule,
    ModalModule
  ],
  declarations: [
    NavbarComponent,
    FooterComponent,
    CurriculumGroupComponent,
    BreadcrumbComponent,
    LearningObjectListingComponent,
  ],
  exports: [
    NavbarComponent,
    FooterComponent,
    CurriculumGroupComponent,
    BreadcrumbComponent,
    LearningObjectListingComponent,
  ],
  providers: [
    SortGroupsService,
  ]
})
export class SharedModule { }
