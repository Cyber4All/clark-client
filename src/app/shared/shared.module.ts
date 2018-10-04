// Core
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// Shared 3rd Party Modules
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { ClickOutsideModule } from 'ng-click-outside';
import { ToasterModule } from './toaster';
// Shared CLARK Modules
import { ModalModule } from './modals';
// Components
import { BrowseByMappingsComponent } from './browse-by-mappings/browse-by-mappings.component';
import { MessageComponent } from './navbar/message/message.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FileListViewComponent } from './filesystem/file-list-view/file-list-view.component';
import { ContextMenuModule } from 'ngx-contextmenu';
import { FileBreadcrumbComponent } from './filesystem/file-breadcrumb/file-breadcrumb.component';
import { FileBrowserComponent } from './filesystem/file-browser/file-browser.component';
import { FilePreviewComponent } from './filesystem/file-preview/file-preview.component';
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
    VirtualScrollModule,
    ClickOutsideModule,
    ModalModule,
    ToasterModule,
    ContextMenuModule,
    TooltipModule,
    PopupModule,
    ClarkContextMenuModule.forRoot()
  ],
  providers: [],
  declarations: [
    BrowseByMappingsComponent,
    NavbarComponent,
    MessageComponent,
    FileBrowserComponent,
    FileListViewComponent,
    FileBreadcrumbComponent,
    FilePreviewComponent,
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
<<<<<<< HEAD
    CookiesComponent
=======
>>>>>>> dashboard-enhancement
  ],
  exports: [
    BrowseByMappingsComponent,
    NavbarComponent,
    FileBrowserComponent,
    FileListViewComponent,
    FileBreadcrumbComponent,
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
    VirtualScrollModule,
    PopupModule,
<<<<<<< HEAD
    CookiesComponent
=======
    ContextMenuModule,
    ClarkContextMenuModule,
>>>>>>> dashboard-enhancement
  ]
})
export class SharedModule {}
