import { NgModule } from '@angular/core';

// Components
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { LearningObjectListingComponent } from './learning-object/learning-object.component';
import { FooterComponent } from './footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Directives
import { LearningObjectCardDirective } from './directives/learning-object-card.directive';
import { RouterModule } from '@angular/router';

// 3rd Party Modules
import { ParticlesModule } from 'angular-particle'; // FIXME: push down into a component module

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ParticlesModule
  ],
  exports: [
    FooterComponent,
    BreadcrumbComponent,
    LearningObjectListingComponent,
    LearningObjectCardDirective
  ],
  declarations: [
    FooterComponent,
    BreadcrumbComponent,
    LearningObjectListingComponent,
    LearningObjectCardDirective
  ]
})
export class CubeSharedModule { }
