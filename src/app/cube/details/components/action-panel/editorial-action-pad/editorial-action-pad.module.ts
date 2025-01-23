import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorialActionPadComponent } from './editorial-action-pad.component';
import { SharedModule } from 'app/shared/shared.module';
import { TaggingBuilderComponent } from './tagging-builder/tagging-builder.component';

@NgModule({
  declarations: [
    EditorialActionPadComponent,
    TaggingBuilderComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [ EditorialActionPadComponent ],
})
export class EditorialActionPadModule {}
