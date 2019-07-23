import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipComponent } from './tooltip.component';
import { TipDirective } from './tip.directive';

export { TipDirective } from './tip.directive';
export { TooltipComponent } from './tooltip.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    TooltipComponent,
    TipDirective
  ],
  exports: [
    TooltipComponent,
    TipDirective
  ],
  entryComponents: [
    TooltipComponent
  ]
})
export class TooltipModule { }
