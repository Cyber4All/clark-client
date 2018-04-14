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
import { CartService } from './core/services/cart.service';
import { CartV2Service } from '../core/cartv2.service';

// Redux
import { StoreModule } from '@ngrx/store';
import { cartReducer } from './core/redux/reducers/cart.reducer';

// Modules
import { CubeCoreModule } from './core/cube-core.module';
import { CubeSharedModule } from './shared/cube-shared.module';
import { HomeModule } from './home/home.module';
import { SharedModule } from '../shared/shared.module';
import { CheckBoxModule } from 'clark-checkbox';
import { AuthModule } from '../auth/auth.module';

// Components
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CubeComponent } from './cube.component';
import { CartComponent } from './cart/cart.component';
import { BrowseComponent } from './browse/browse.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserPreferencesComponent } from './user-profile/user-preferences/user-preferences.component';
import { RouterComponent } from './shared/breadcrumb/router.component';

// Guards
import { AuthGuard } from '../core/auth-guard.service';

// Other
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { AuthService } from '../core/auth.service';
// TODO: is ng-click-outside being used?
import { ClickOutsideModule } from 'ng-click-outside';
import { ParticlesModule } from 'angular-particle';
import { ModalModule } from '../shared/modals';
import { TooltipModule } from '@cyber4all/clark-tooltip';
import {
  NotificationComponent,
  NotificationModule
} from '../shared/notifications';
import { UserInformationComponent } from './user-profile/user-information/user-information.component';
import { UserEditInformationComponent } from './user-profile/user-edit-information/user-edit-information.component';
import { CoreModule } from '../core/core.module';
import { CollectionModule } from './collections/collection.module';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { DetailsModule } from './learning-object-details/details/details.module';

/**
 * A feature collection module that bundles all feature modules related to the cube.
 *
 * @class CubeModule
 */
@NgModule({
  declarations: [
    CubeComponent,
    CartComponent,
    RouterComponent,
    BrowseComponent,
    UserProfileComponent,
    UserPreferencesComponent,
    UserInformationComponent,
    UserEditInformationComponent,
    OrganizationListComponent
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
    NotificationModule,
    CollectionModule,
    TooltipModule,
    DetailsModule
  ],
  providers: [LearningObjectService, CartService]
})
export class CubeModule {}
