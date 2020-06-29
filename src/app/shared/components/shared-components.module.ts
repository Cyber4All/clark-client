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



@NgModule({
  imports: [
    // angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // third-party modules
    CKEditorModule,
    // CLARK Modules
    SharedDirectivesModule,
    SharedPipesModule
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
    SkipLinkComponent,
  ]
})
export class SharedComponents {}
