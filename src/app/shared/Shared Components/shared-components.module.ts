// Angular Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Clark Components
import { CarouselComponent } from './carousel/carousel.component';
import { CheckBoxComponent } from './checkbox/checkbox.component';
import { CollectionCardComponent } from './collection-card/collection-card.component';
import { GenericCollectionLogoComponent } from './generic-collection-logo/generic-collection-logo.component';
import { IndicatorComponent } from './indicator/indicator.component';
import { ProgressComponent } from './progress/progress.component';
import { ToggleSwitchComponent } from './toggle-switch/toggle-switch.component';
import { UserCardComponent } from './user-card/user-card.component';

// CLARK Directives
import { ActivateDirective } from './directives/activate.directive';
import { AutofocusDirective } from './directives/autofocus.directive';
import { LearningObjectCardDirective } from './directives/learning-object-card.directive';

// CLARK Pipes
import { CollectionPipe } from './pipes/collection.pipe';

@NgModule({
  imports: [
    // angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  declarations: [
    // components
    CarouselComponent,
    CheckBoxComponent,
    CollectionCardComponent,
    GenericCollectionLogoComponent,
    IndicatorComponent,
    ProgressComponent,
    ToggleSwitchComponent,
    UserCardComponent,
    // directives
    ActivateDirective,
    AutofocusDirective,
    LearningObjectCardDirective,
    // pipes
    CollectionPipe
  ],
  exports: [
    // components
    CarouselComponent,
    CheckBoxComponent,
    CollectionCardComponent,
    GenericCollectionLogoComponent,
    IndicatorComponent,
    ProgressComponent,
    ToggleSwitchComponent,
    UserCardComponent,
    // directives
    ActivateDirective,
    AutofocusDirective,
    LearningObjectCardDirective,
    // pipes
    CollectionPipe
  ]
})
export class SharedComponents {}
