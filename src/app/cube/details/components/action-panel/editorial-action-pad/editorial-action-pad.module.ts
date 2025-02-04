import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorialActionPadComponent } from './editorial-action-pad.component';
import { SharedModule } from 'app/shared/shared.module';
import { TaggingBuilderComponent } from './tagging-builder/tagging-builder.component';
import { TopicsComponent } from './components/topics/topics.component';
import { TagsComponent } from './components/tags/tags.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    EditorialActionPadComponent,
    TaggingBuilderComponent,
    TopicsComponent,
    TagsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule
  ],
  exports: [ EditorialActionPadComponent ],
})
export class EditorialActionPadModule {}
