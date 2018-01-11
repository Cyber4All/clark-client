//Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

//Modules
import { RoutingModule } from '../app.routing';

//Services
import { SortGroupsService } from './sort-groups.service';

//Pipes
import { EscapeHtmlPipe } from './pipes/keep-html.pipe'

//Components
import { CurriculumGroupComponent } from './curriculum-group/curriculum-group.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';

@NgModule({
  imports: [
    CommonModule,
    RoutingModule,
  ],
  declarations: [
    EscapeHtmlPipe,
    CurriculumGroupComponent,
    BreadcrumbComponent
  ],
  exports: [
    CurriculumGroupComponent,
    BreadcrumbComponent
  ],
  providers: [
    SortGroupsService
  ]
})
export class SharedModule { }
