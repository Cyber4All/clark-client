import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { LearningObjectListingComponent } from './learning-object/learning-object.component';
import { FooterComponent } from './footer/footer.component';
import { BrowseByMappingsComponent } from './browse-by-mappings/browse-by-mappings.component';

// Directives
import { LearningObjectCardDirective } from './directives/learning-object-card.directive';
import { RouterModule } from '@angular/router';

// 3rd Party Modules
import { ParticlesModule } from 'angular-particle'; // FIXME: push down into a component module
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { CheckBoxModule } from 'clark-checkbox';
import { ClickOutsideModule } from 'ng-click-outside';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ParticlesModule,
    FormsModule,
    VirtualScrollModule,
    CheckBoxModule,
    ClickOutsideModule,
  ],
  exports: [
    FooterComponent,
    BreadcrumbComponent,
    LearningObjectListingComponent,
    LearningObjectCardDirective,
    BrowseByMappingsComponent
  ],
  declarations: [
    FooterComponent,
    BreadcrumbComponent,
    LearningObjectListingComponent,
    LearningObjectCardDirective,
    BrowseByMappingsComponent
  ]
})
export class CubeSharedModule { }
