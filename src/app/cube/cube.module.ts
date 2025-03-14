import { environment } from 'environments/environment';
// Core
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Routes
import { CubeRoutingModule } from './cube.routing';

// Modules
import { CubeCoreModule } from './core/cube-core.module';
import { CubeSharedModule } from './shared/cube-shared.module';
import { SharedModule } from '../shared/shared.module';

// Components
import { CubeComponent } from './cube.component';
import { BrowseComponent } from './browse/browse.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';

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
import { MediaItemComponent } from './press/components/media-item/media-item.component';
import { AboutUsModule } from './about-us/about-us.module';
import { DonateComponent } from './donate/donate.component';
import { FilterSectionComponent } from './browse/components/filter-section/filter-section.component';
import { GuidelineFilterComponent } from './browse/components/guideline-filter/guideline-filter.component';
import { LibraryModule } from './library/library.module';
import { AboutClarkComponent } from './content-pages/about-us/about-us.component';
import { ContributePageComponent } from './content-pages/contribute-page/contribute-page.component';
import { EditorialProcessComponent } from './content-pages/editorial-process/editorial-process.component';
import { ProfileLearningObjectsComponent } from './user-profile/components/profile-learning-objects/profile-learning-objects.component';
import { ProfileHeaderComponent } from './user-profile/components/profile-header/profile-header.component';
import { EditProfileComponent } from './user-profile/components/edit-profile/edit-profile.component';
import { HomeModule } from './home/home.module';
import { AboutPhilosophyComponent } from './content-pages/about-us/philosophy/philosophy.component';


/**
 * A feature collection module that bundles all feature modules related to the cube.
 *
 * @class CubeModule
 */
@NgModule({
  declarations: [
    CubeComponent,
    BrowseComponent,
    UserProfileComponent,
    CollectionsComponent,
    TermsOfServiceComponent,
    FilterComponent,
    AccessibilityStatementComponent,
    PressComponent,
    SplashComponent,
    AboutComponent,
    MediaCardComponent,
    MediaItemComponent,
    DonateComponent,
    FilterSectionComponent,
    GuidelineFilterComponent,
    AboutClarkComponent,
    ContributePageComponent,
    EditorialProcessComponent,
    ProfileLearningObjectsComponent,
    ProfileHeaderComponent,
    EditProfileComponent,
    AboutPhilosophyComponent,
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
    MatExpansionModule,
    MatTabsModule,

    // Local module imports
    CubeCoreModule,
    CubeSharedModule,
    CubeRoutingModule,
    SharedModule,
    ModalModule,
    CollectionModule,
    AboutUsModule,
    LibraryModule,
    MatTabsModule,
    MatExpansionModule,
    MatListModule,
    MatExpansionModule,
    HomeModule
  ],
})
export class CubeModule { }
