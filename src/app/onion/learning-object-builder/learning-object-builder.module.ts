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
import { TooltipModule } from '@cyber4all/clark-tooltip';
import { LearningObjectMetadataComponent } from './components/learning-object/metadata/metadata.component';
import { LearningObjectDescriptionComponent } from './components/learning-object/description/description.component';

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
    TooltipModule
  ],
  declarations: [
    LearningObjectBuilderComponent,
    TextEditorComponent,
    ContentEditableDirective,
    LearningOutcomeComponent,
    LearningObjectMetadataComponent,
    LearningObjectDescriptionComponent
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
