// Core
import { NgModule } from '@angular/core';

// Angular Directives
import { ActivateDirective } from './activate.directive';
import { AutofocusDirective } from './autofocus.directive';
import { LearningObjectCardDirective } from './learning-object-card.directive';
import { TipDirective } from './tip.directive';
import { TrapFocusDirective } from './trap-focus.directive';
import { SidePanelModule } from './side-panel/side-panel.module';

@NgModule({
  imports: [
    SidePanelModule,
  ],
  declarations: [
    ActivateDirective,
    AutofocusDirective,
    LearningObjectCardDirective,
    TipDirective,
    TrapFocusDirective,
  ],
  exports: [
    ActivateDirective,
    AutofocusDirective,
    LearningObjectCardDirective,
    TipDirective,
    TrapFocusDirective,
    SidePanelModule,
  ]
})
export class SharedDirectivesModule {}
