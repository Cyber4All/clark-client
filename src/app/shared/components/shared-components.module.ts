// Angular Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Third-Party Modules
import { CKEditorModule } from 'ng2-ckeditor';

// CLARK Modules
import { SharedDirectivesModule } from '../directives/shared-directives.module';
import { SharedPipesModule } from '../pipes/shared-pipes.module';

// CLARK Components
import { CarouselComponent } from './carousel/carousel.component';
import { CheckBoxComponent } from './checkbox/checkbox.component';
import { CollectionCardComponent } from './collection-card/collection-card.component';
import { CollectionsGridComponent } from './collections-grid/collections-grid.component';
import { GenericCollectionLogoComponent } from './generic-collection-logo/generic-collection-logo.component';
import { IndicatorComponent } from './indicator/indicator.component';
import { ProgressComponent } from './progress/progress.component';
import { RatingStarsComponent } from './rating-stars/rating-stars.component';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { ToggleSwitchComponent } from './toggle-switch/toggle-switch.component';
import { UserCardComponent } from './user-card/user-card.component';
import { SkipLinkComponent } from './skip-link/skip-link.component';
import { CookiePopupComponent } from './cookie-popup/cookie-popup.component';
import { AddEvaluatorComponent } from './add-evaluator/add-evaluator.component';
import { UserDropdownComponent } from './add-evaluator/components/user-dropdown/user-dropdown.component';
import { InputFieldComponent } from './input-field/input-field.component';
import { MatInputModule } from '@angular/material/input';
import {
  HighlightedLearningObjectComponent
} from './add-evaluator/components/highlighted-learning-object/highlighted-learning-object.component';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { AuthorCardComponent } from 'app/shared/components/author-card/author-card.component';
import { CollectionsDropdownComponent } from './collections-dropdown/collections-dropdown.component';
@NgModule({
  imports: [
    // angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    // third-part modules
    CKEditorModule,
    VirtualScrollerModule,
    // CLARK modules
    SharedDirectivesModule,
    SharedPipesModule,
  ],
  declarations: [
    // components
    CarouselComponent,
    CheckBoxComponent,
    CollectionCardComponent,
    CollectionsGridComponent,
    GenericCollectionLogoComponent,
    IndicatorComponent,
    ProgressComponent,
    RatingStarsComponent,
    TextEditorComponent,
    ToggleSwitchComponent,
    UserCardComponent,
    SkipLinkComponent,
    CookiePopupComponent,
    AddEvaluatorComponent,
    UserDropdownComponent,
    HighlightedLearningObjectComponent,
    InputFieldComponent,
    AuthorCardComponent,
    CollectionsDropdownComponent,
  ],
  exports: [
    // components
    CarouselComponent,
    CheckBoxComponent,
    CollectionCardComponent,
    CollectionsDropdownComponent,
    CollectionsGridComponent,
    GenericCollectionLogoComponent,
    IndicatorComponent,
    ProgressComponent,
    RatingStarsComponent,
    TextEditorComponent,
    ToggleSwitchComponent,
    UserCardComponent,
    SkipLinkComponent,
    CookiePopupComponent,
    AddEvaluatorComponent,
    InputFieldComponent,
    AuthorCardComponent
  ]
})
export class SharedComponents {}
