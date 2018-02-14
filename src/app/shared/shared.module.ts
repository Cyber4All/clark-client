// Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Modules
import { RoutingModule } from '../app.routing';
import { ModalModule } from '@cyber4all/clark-modal';
import { NotificationModule } from 'clark-notification';
import { CheckBoxModule } from 'clark-checkbox';
import { ParticlesModule } from 'angular-particle';

// Services
import { SortGroupsService } from './sort-groups.service';

// Components
import { CurriculumGroupComponent } from './curriculum-group/curriculum-group.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { LearningObjectListingComponent } from './learning-object/learning-object.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';

import { LearningObjectCardDirective } from './directives/learning-object-card.directive';

@NgModule({
  imports: [
    CommonModule,
    RoutingModule,
    CheckBoxModule,
    NotificationModule,
    ModalModule,
    ParticlesModule
  ],
  declarations: [
    NavbarComponent,
    FooterComponent,
    CurriculumGroupComponent,
    BreadcrumbComponent,
    LearningObjectListingComponent,
    LearningObjectCardDirective
  ],
  exports: [
    NavbarComponent,
    FooterComponent,
    CurriculumGroupComponent,
    BreadcrumbComponent,
    LearningObjectListingComponent,
    LearningObjectCardDirective
  ],
  providers: [
    SortGroupsService,
  ]
})
export class SharedModule { }
