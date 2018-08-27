// Core
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Routes
import { CubeRoutingModule } from './cube.routing';

// Services
import { LearningObjectService } from './learning-object.service';

// Modules
import { CubeCoreModule } from './core/cube-core.module';
import { CubeSharedModule } from './shared/cube-shared.module';
import { HomeModule } from './home/home.module';
import { SharedModule } from '../shared/shared.module';

// Components
import { CubeComponent } from './cube.component';
import { CartComponent } from './cart/cart.component';
import { BrowseComponent } from './browse/browse.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserPreferencesComponent } from './user-profile/user-preferences/user-preferences.component';
import { RouterComponent } from './shared/breadcrumb/router.component';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { UserInformationComponent } from './user-profile/user-information/user-information.component';
import { UserEditInformationComponent } from './user-profile/user-edit-information/user-edit-information.component';

// Other
import { VirtualScrollModule } from 'angular2-virtual-scroll';
// TODO: is ng-click-outside being used?
import { ClickOutsideModule } from 'ng-click-outside';

import { ModalModule } from '../shared/modals';
import {
  ToasterModule
} from '../shared/toaster';
import { CollectionModule } from './collections/collection.module';
import { DetailsModule } from './details/details.module';
import { UserProfileLearningObjectsResolver } from './user-profile/learning-objects.resolver';

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
    OrganizationListComponent,
  ],
  imports: [
    // Angular imports
    HttpModule,
    FormsModule,
    CommonModule,
    // 3rd Party imports
    ClickOutsideModule,
    VirtualScrollModule,
    // Local module imports
    CubeCoreModule,
    CubeSharedModule,
    CubeRoutingModule,
    SharedModule,
    HomeModule,
    ModalModule,
    ToasterModule,
    CollectionModule,
    DetailsModule,
  ],
  providers: [LearningObjectService, UserProfileLearningObjectsResolver]
})
export class CubeModule {}
