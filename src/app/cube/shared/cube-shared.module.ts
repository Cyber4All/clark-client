import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { LearningObjectListingComponent } from './learning-object/learning-object.component';
import { FooterComponent } from './footer/footer.component';

// Guards/Resolvers
import { ProfileGuard } from '../core/profile.guard';
import { UserResolver } from '../core/user.resolver';

// Directives
import { LearningObjectCardDirective } from './directives/learning-object-card.directive';
import { RouterModule } from '@angular/router';

// 3rd Party Modules
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { ClickOutsideModule } from 'ng-click-outside';
import { EscapeHtmlPipe } from '../../shared/pipes/keep-html.pipe';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    VirtualScrollModule,
    ClickOutsideModule,
    // TODO: Push down to feature feature modules if not all need to use it
    SharedModule
  ],
  exports: [
    FooterComponent,
    BreadcrumbComponent,
    LearningObjectListingComponent,
    LearningObjectCardDirective,
    EscapeHtmlPipe
  ],
  declarations: [
    FooterComponent,
    BreadcrumbComponent,
    LearningObjectListingComponent,
    LearningObjectCardDirective,
    EscapeHtmlPipe
  ],
  providers: [ProfileGuard, UserResolver]
})
export class CubeSharedModule { }
