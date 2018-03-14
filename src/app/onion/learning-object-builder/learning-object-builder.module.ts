import { LearningOutcomeComponent } from './components/learning-outcome.component';
import { SuggestionModule } from './suggestion/suggestion.module';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DndModule } from 'ng2-dnd';
import { LearningObjectBuilderComponent } from './learning-object-builder.component';
import { TextEditorComponent } from './text-editor.component';
import { CKEditorModule } from 'ng2-ckeditor';

import { OnionRoutingModule } from '../onion.routing';
import { SharedModule } from '../../shared/shared.module';
import { BloomsSelectorComponent } from './components/blooms-selector/blooms-selector.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SuggestionModule,
    ReactiveFormsModule,
    HttpModule,
    CKEditorModule,
    OnionRoutingModule,
    DndModule.forRoot(),
    SharedModule
  ],
  declarations: [
    LearningObjectBuilderComponent,
    TextEditorComponent,
    LearningOutcomeComponent,
    BloomsSelectorComponent,
  ],
  exports: [LearningObjectBuilderComponent]
})
export class LearningObjectBuilderModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: LearningObjectBuilderModule
    };
  }
}
