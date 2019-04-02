import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components
import { FooterComponent } from './footer/footer.component';

// Guards/Resolvers
import { ProfileGuard } from '../core/profile.guard';
import { UserResolver } from '../core/user.resolver';

// Directives
import { RouterModule } from '@angular/router';

// 3rd Party Modules
import { ClickOutsideModule } from 'ng-click-outside';
import { EscapeHtmlPipe } from '../../shared/pipes/keep-html.pipe';
import { SharedModule } from '../../shared/shared.module';
import { FeaturedComponent } from './featured/featured.component';

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
    EscapeHtmlPipe,
    FeaturedComponent
  ],
  declarations: [
    FooterComponent,
    EscapeHtmlPipe,
    FeaturedComponent
  ],
  providers: [ProfileGuard, UserResolver]
})
export class CubeSharedModule {}
