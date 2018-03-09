// Core
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Routes
import { CubeRoutingModule } from './cube.routing';

// Services
import { LearningObjectService } from './learning-object.service';
import { CartService } from './cube-core/services/cart.service';
import { CartV2Service } from '../core/cartv2.service';

// Redux
import { StoreModule } from '@ngrx/store';
import { cartReducer } from './cube-core/redux/reducers/cart.reducer';

// Pipes
import { EscapeHtmlPipe } from '../shared/pipes/keep-html.pipe';

// Modules
import { CubeCoreModule } from './cube-core/cube-core.module';
import { CubeSharedModule } from './cube-shared/cube-shared.module';
import { HomeModule } from './home/home.module';
import { SharedModule } from '../shared/shared.module';
import { CheckBoxModule } from 'clark-checkbox';
import { AuthModule } from '../auth/auth.module';

// Components
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from './cube-shared/footer/footer.component';
import { CubeComponent } from './cube.component';
import { DetailsComponent } from './learning-object-details/details/details.component';
import { DetailsContentComponent } from './learning-object-details/details/details-content.component';
import { CartComponent } from './cart/cart.component';
import { BrowseComponent } from './browse/browse.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { RouterComponent } from './cube-shared/breadcrumb/router.component';

// Guards
import { AuthGuard } from '../core/auth-guard.service';

// Other
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { AuthService } from '../core/auth.service';
// TODO: is ng-click-outside being used?
import { ClickOutsideModule } from 'ng-click-outside';
import { ParticlesModule } from 'angular-particle';
import { RavenErrorHandler } from '../error-handler';
import { ModalModule } from '../shared/modals';
import {
  NotificationComponent,
  NotificationModule
} from '../shared/notifications';
import { UserInformationComponent } from './user-information/user-information.component';
import { UserEditInformationComponent } from './user-edit-information/user-edit-information.component';

/**
 * A feature collection module that bundles all feature modules related to the cube.
 *
 * @class CubeModule
 */
@NgModule({
  declarations: [
    CubeComponent,
    EscapeHtmlPipe,
    DetailsComponent,
    DetailsContentComponent,
    CartComponent, // TODO Create Details module
    DetailsContentComponent, // TODO Create Details module
    RouterComponent,
    BrowseComponent,
    UserProfileComponent,
    UserPreferencesComponent,
    UserInformationComponent,
    UserEditInformationComponent
  ],
  imports: [
    // Angular imports
    HttpModule,
    FormsModule,
    CommonModule,
    // 3rd Party imports
    ClickOutsideModule,
    ParticlesModule,
    VirtualScrollModule,
    // Local module imports
    StoreModule.forRoot({ cart: cartReducer }),
    CubeCoreModule,
    CubeSharedModule,
    CubeRoutingModule,
    SharedModule,
    HomeModule,
    CheckBoxModule,
    ModalModule,
    NotificationModule
  ],
  providers: [LearningObjectService, CartService]
  // bootstrap: [CubeComponent]
})
export class CubeModule {}
