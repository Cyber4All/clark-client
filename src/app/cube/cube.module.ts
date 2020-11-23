import { environment } from 'environments/environment';
// Core
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
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
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { UserInformationComponent } from './user-profile/user-information/user-information.component';
import { UserEditInformationComponent } from './user-profile/user-edit-information/user-edit-information.component';

// Other
// TODO: is ng-click-outside being used?
import { ClickOutsideModule } from 'ng-click-outside';

import { ModalModule } from '../shared/modules/modals/modal.module';
import { CollectionModule } from './collection-details/collection-details.module';
import { CollectionsComponent } from './collections/collections.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { FilterComponent } from './browse/components/filter/filter.component';
import { AccessibilityStatementComponent } from './accessibility-statement/accessibility-statement.component';
import { PressComponent } from './press/press.component';
import { SplashComponent } from './press/components/splash/splash.component';
import { AboutComponent } from './press/components/about/about.component';
import { MediaCardComponent } from './press/components/media-card/media-card.component';
import { OutagePageComponent } from './outage-page/outage-page.component';
import { OutageCardComponent } from './outage-page/outage-card/outage-card.component';
import { PastIssueComponent } from './outage-page/past-issue/past-issue.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { MissionComponent } from './about-us/components/mission/mission.component';
import { DiversityComponent } from './about-us/components/diversity/diversity.component';
import { TimelineComponent } from './about-us/components/timeline/timeline.component';
import { AboutClarkComponent } from './about-us/components/about-clark/about-clark.component';

/**
 * A feature collection module that bundles all feature modules related to the cube.
 *
 * @class CubeModule
 */
@NgModule({
  declarations: [
    CubeComponent,
    CartComponent,
    BrowseComponent,
    UserProfileComponent,
    UserPreferencesComponent,
    UserInformationComponent,
    UserEditInformationComponent,
    OrganizationListComponent,
    CollectionsComponent,
    TermsOfServiceComponent,
    FilterComponent,
    AccessibilityStatementComponent,
    PressComponent,
    SplashComponent,
    AboutComponent,
    MediaCardComponent,
    OutagePageComponent,
    OutageCardComponent,
    PastIssueComponent,
    AboutUsComponent,
    MissionComponent,
    DiversityComponent,
    TimelineComponent,
    AboutClarkComponent
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
    CUSTOM_ELEMENTS_SCHEMA
  ],
  imports: [
    // Angular imports
    FormsModule,
    CommonModule,
    // 3rd Party imports
    ClickOutsideModule,
    // Local module imports
    CubeCoreModule,
    CubeSharedModule,
    CubeRoutingModule,
    SharedModule,
    HomeModule,
    ModalModule,
    CollectionModule,
  ],
  providers: [LearningObjectService]
})
export class CubeModule {}
