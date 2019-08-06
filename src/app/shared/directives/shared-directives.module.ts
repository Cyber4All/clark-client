// Core
import { NgModule } from '@angular/core';

// Angular Directives
import { ActivateDirective } from './activate.directive';
import { AutofocusDirective } from './autofocus.directive';
import { LearningObjectCardDirective } from './learning-object-card.directive';
import { TipDirective } from './tip.directive';

@NgModule({
  declarations: [
    ActivateDirective,
    AutofocusDirective,
    LearningObjectCardDirective,
    TipDirective
  ],
  exports: [
    ActivateDirective,
    AutofocusDirective,
    LearningObjectCardDirective,
    TipDirective
  ]
})
export class SharedDirectivesModule {}
