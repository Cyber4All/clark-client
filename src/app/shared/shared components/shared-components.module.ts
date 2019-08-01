// Angular Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Third-Party Modules
import { CKEditorModule } from 'ng2-ckeditor';

// Clark Components
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

// CLARK Directives
import { ActivateDirective } from './directives/activate.directive';
import { AutofocusDirective } from './directives/autofocus.directive';
import { LearningObjectCardDirective } from './directives/learning-object-card.directive';
import { TipDirective } from './directives/tip.directive';

// CLARK Pipes
import { CollectionPipe } from './pipes/collection.pipe';

@NgModule({
  imports: [
    // angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // third-party modules
    CKEditorModule
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
    // directives
    ActivateDirective,
    AutofocusDirective,
    LearningObjectCardDirective,
    TipDirective,
    // pipes
    CollectionPipe
  ],
  exports: [
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
    // directives
    ActivateDirective,
    AutofocusDirective,
    LearningObjectCardDirective,
    TipDirective,
    // pipes
    CollectionPipe
  ]
})
export class SharedComponents {}
