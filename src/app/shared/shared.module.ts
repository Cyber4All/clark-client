// Core
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// Shared 3rd Party Modules
import { ClickOutsideModule } from 'ng-click-outside';

import { ToasterModule } from './toaster';
// Shared CLARK Modules
import { ModalModule } from './modals';
// Components
import { MessageComponent } from './navbar/message/message.component';
import { NavbarComponent } from './navbar/navbar.component';
import { TooltipModule } from './tooltips/tip.module';
import { IndicatorComponent } from './indicator/indicator.component';
import { LearningObjectListingComponent } from './learning-object/learning-object.component';
import { UserCardComponent } from './user-card/user-card.component';
import { LearningObjectCardDirective } from './directives/learning-object-card.directive';
import { FilterComponent } from './filter/filter.component';
import { MappingsFilterComponent } from './mappings-filter/mappings-filter.component';
import { SearchComponent } from './search/search.component';
import { AutofocusDirective } from './directives/autofocus.directive';
import { RatingStarsComponent } from './rating-stars/rating-stars.component';
import { NewRatingComponent } from './new-rating/new-rating.component';
import { LearningObjectRatingsComponent } from './learning-object-ratings/learning-object-ratings.component';
import { ReportRatingComponent } from './report-rating/report-rating.component';
import { ProgressComponent } from './progress/progress.component';
import { PopupModule } from './popups/popup.module';
import { CookiesComponent } from './cookies/cookies.component';
import { ContextMenuModule as ClarkContextMenuModule } from './contextmenu/contextmenu.module';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { EmailBannerComponent } from './email-banner/email-banner.component';
import { TeleporterModule } from './teleporter/teleporter.module';
import { NewRatingResponseComponent } from './new-rating-response/new-rating-response.component';
import { TextEditorComponent } from './text-editor.component';
import { CollectionCardComponent } from './collection-card/collection-card.component';
import { CKEditorModule } from 'ng2-ckeditor';
import { CarouselComponent } from './carousel/carousel.component';
import { DownloadNoticePopupComponent } from './popup-templates/download-notice-popup/download-notice-popup.component';
import { CollectionSelectorPopupComponent } from './popup-templates/collection-selector-popup/collection-selector-popup.component';
import { CollectionsGridComponent } from './collections-grid/collections-grid.component';
import { GenericCollectionLogoComponent } from './generic-collection-logo/generic-collection-logo.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { CollectionPipe } from './pipes/collection.pipe';
import { ToggleSwitchComponent } from './toggle-switch/toggle-switch.component';
import { ChangelogModalComponent } from './changelog-modal/changelog-modal.component';
import { ChangelogListComponent } from './changelog-list/changelog-list.component';
import { ChangelogItemComponent } from './changelog-item/changelog-item.component';
import { IdentificationPillComponent } from './identification-pill/identification-pill.component';

/**
 * Contains all stateless UI modules (directives, components, pipes) that are used across the app.
 *
 * @class SharedModule
 */
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ClickOutsideModule,
    ModalModule,
    ToasterModule,
    TooltipModule,
    PopupModule,
    ClarkContextMenuModule.forRoot(),
    TeleporterModule,
    CKEditorModule,
  ],
  declarations: [
    NavbarComponent,
    MessageComponent,
    IndicatorComponent,
    LearningObjectListingComponent,
    UserCardComponent,
    LearningObjectCardDirective,
    FilterComponent,
    MappingsFilterComponent,
    SearchComponent,
    AutofocusDirective,
    RatingStarsComponent,
    NewRatingComponent,
    LearningObjectRatingsComponent,
    ReportRatingComponent,
    ProgressComponent,
    CookiesComponent,
    EmailBannerComponent,
    NewRatingResponseComponent,
    TextEditorComponent,
    CarouselComponent,
    CollectionsGridComponent,
    CollectionCardComponent,
    CarouselComponent,
    DownloadNoticePopupComponent,
    CollectionSelectorPopupComponent,
    CollectionsGridComponent,
    GenericCollectionLogoComponent,
    TermsOfServiceComponent,
    CollectionPipe,
    ToggleSwitchComponent,
    ChangelogModalComponent,
    ChangelogListComponent,
    ChangelogItemComponent,
    IdentificationPillComponent,
  ],
  exports: [
    NavbarComponent,
    TooltipModule,
    IndicatorComponent,
    LearningObjectListingComponent,
    UserCardComponent,
    LearningObjectCardDirective,
    FilterComponent,
    MappingsFilterComponent,
    AutofocusDirective,
    RatingStarsComponent,
    NewRatingComponent,
    LearningObjectRatingsComponent,
    ProgressComponent,
    VirtualScrollerModule,
    PopupModule,
    CookiesComponent,
    ClarkContextMenuModule,
    EmailBannerComponent,
    TeleporterModule,
    NewRatingResponseComponent,
    TextEditorComponent,
    CarouselComponent,
    CollectionsGridComponent,
    CollectionCardComponent,
    ToasterModule,
    DownloadNoticePopupComponent,
    CollectionSelectorPopupComponent,
    CollectionCardComponent,
    CarouselComponent,
    CollectionsGridComponent,
    GenericCollectionLogoComponent,
    CollectionPipe,
    ToggleSwitchComponent,
    ChangelogModalComponent,
    ChangelogListComponent,
    ChangelogItemComponent,
    IdentificationPillComponent,
    ModalModule,
  ]
})
export class SharedModule {}
