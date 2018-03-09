import { LearningOutcomeComponent } from './components/learning-outcome.component';
import { SuggestionModule } from './../suggestion/suggestion.module';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DndModule } from 'ng2-dnd';
import { LearningObjectBuilderComponent } from './learning-object-builder.component';
import { ContentEditableDirective } from './contenteditable-model.directive';
import { TextEditorComponent } from './text-editor.component';
import { CKEditorModule } from 'ng2-ckeditor';

import { OnionRoutingModule } from '../onion.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SuggestionModule,
    ReactiveFormsModule,
    HttpModule,
    CKEditorModule,
    OnionRoutingModule,
    DndModule.forRoot()
  ],
  declarations: [
    LearningObjectBuilderComponent,
    TextEditorComponent,
    ContentEditableDirective,
    LearningOutcomeComponent,
  ],
  exports: [LearningObjectBuilderComponent]
})
export class LearningObjectBuilderModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: LearningObjectBuilderModule
    }
  }
}