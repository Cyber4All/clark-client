import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextEditorComponent } from './text-editor.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    TextEditorComponent
  ],
  exports: [
    TextEditorComponent
  ],
})
export class TextEditorModule { }
