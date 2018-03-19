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
import { TooltipModule } from '@cyber4all/clark-tooltip';
import { SharedModule } from '../../shared/shared.module';
import { BloomsSelectorComponent } from './components/blooms-selector/blooms-selector.component';
import { StandardOutcomesComponent } from './components/standard-outcomes/standard-outcomes.component';
import { LearningObjectDescriptionComponent } from './components/learning-object/description.component';
import { LearningObjectOutcomeContainerComponent } from './components/learning-object/outcome-container/outcome-container.component';
import { LearningObjectMetadataComponent } from './components/learning-object/metadata/metadata.component';

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
    TooltipModule,
    SharedModule
  ],
  declarations: [
    LearningObjectBuilderComponent,
    TextEditorComponent,
    LearningOutcomeComponent,
    BloomsSelectorComponent,
    StandardOutcomesComponent,
    LearningObjectMetadataComponent,
    LearningObjectDescriptionComponent,
    LearningObjectOutcomeContainerComponent,
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
