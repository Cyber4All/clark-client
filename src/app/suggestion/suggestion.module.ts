import { SuggestionService } from './suggestion.service';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuggestionComponent } from './suggestion.component';
@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [
    SuggestionComponent,
  ],
  providers: [
    SuggestionService
  ],
  declarations: [SuggestionComponent]
})
export class SuggestionModule { }
