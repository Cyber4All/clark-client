import { LearningObjectOutcomeComponent } from './components/outcome-page/outcome/outcome.component';
import { SuggestionModule } from './components/outcome-page/outcome/standard-outcomes/suggestion/suggestion.module';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DndModule } from 'ng2-dnd';
import { LearningObjectBuilderComponent } from './learning-object-builder.component';
import { TextEditorComponent } from './components/text-editor.component';
import { CKEditorModule } from 'ng2-ckeditor';

import { OnionRoutingModule } from '../onion.routing';
import { TooltipModule } from '@cyber4all/clark-tooltip';
import { SharedModule } from '../../shared/shared.module';
import { BloomsSelectorComponent } from './components/outcome-page/outcome/blooms-selector/blooms-selector.component';
import { StandardOutcomesComponent } from './components/outcome-page/outcome/standard-outcomes/standard-outcomes.component';

// Presentational Components
import { LearningObjectMetadataComponent } from './components/info-page/metadata/metadata.component';
import { LearningObjectDescriptionComponent } from './components/info-page/description.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

// Container Components
import { LearningObjectOutcomePageComponent } from './components/outcome-page/outcome-page.component';
import { InfoPageComponent } from './components/info-page/info-page.component';

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
    BloomsSelectorComponent,
    StandardOutcomesComponent,
    LearningObjectMetadataComponent,
    LearningObjectDescriptionComponent,
    LearningObjectOutcomeComponent,
    LearningObjectMetadataComponent,
    LearningObjectDescriptionComponent,
    LearningObjectOutcomePageComponent,
    SidebarComponent,
    InfoPageComponent
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
