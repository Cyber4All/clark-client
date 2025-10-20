import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorialActionPadComponent } from './editorial-action-pad.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { TaggingBuilderComponent } from './tagging-builder/tagging-builder.component';
import { TopicsComponent } from './components/topics/topics.component';
import { TagsComponent } from './components/tags/tags.component';
import { FormsModule } from '@angular/forms';
import { GuidelinesComponent } from './components/guidelines/guidelines.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OnionCoreModule } from 'app/onion/core/core.module';
import { LearningObjectBuilderModule } from 'app/onion/learning-object-builder/learning-object-builder.module';
import { StandardOutcomesComponent } from 'app/onion/learning-object-builder/components/standard-outcomes/standard-outcomes.component';

@NgModule({
  declarations: [
    EditorialActionPadComponent,
    TaggingBuilderComponent,
    TopicsComponent,
    TagsComponent,
    GuidelinesComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MatExpansionModule,
    MatChipsModule,
    MatCheckboxModule,
    LearningObjectBuilderModule
  ],
  exports: [EditorialActionPadComponent],
})
export class EditorialActionPadModule { }
