import { SuggestionService } from './suggestion.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuggestionComponent } from './suggestion.component';
@NgModule({
  imports: [
    CommonModule,
    NgbModule,
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
