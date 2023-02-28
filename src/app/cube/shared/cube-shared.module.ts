import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components
import { FooterComponent } from './footer/footer.component';

// Guards/Resolvers
import { ProfileResovler } from '../core/profile.resolver';

// Directives
import { RouterModule } from '@angular/router';

// 3rd Party Modules
import { ClickOutsideModule } from 'ng-click-outside';
import { SharedModule } from '../../shared/shared.module';
import { FeaturedComponent } from './featured/featured.component';
import { LearningObjectListingComponent } from './learning-object/learning-object.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ClickOutsideModule,
    // TODO: Push down to feature feature modules if not all need to use it
    SharedModule
  ],
  exports: [
    FooterComponent,
    FeaturedComponent,
    LearningObjectListingComponent,
  ],
  declarations: [
    FooterComponent,
    FeaturedComponent,
    LearningObjectListingComponent,
  ],
  providers: [ProfileResovler]
})
export class CubeSharedModule {}
