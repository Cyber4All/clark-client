import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LearningObjectBuilderComponent } from './learning-object-builder.component';
import { OutcomeComponent } from './outcome/outcome.component';
import { OutcomeTypeaheadComponent } from './outcome/outcome-typeahead/outcome-typeahead.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    LearningObjectBuilderComponent,
    OutcomeComponent,
    OutcomeTypeaheadComponent
  ],
})
export class LearningObjectBuilderModule { }
