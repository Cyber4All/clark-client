import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { LearningObjectStatusIndicatorComponent } from './status-indicator/status-indicator.component';
import { SubmitComponent } from './submit/submit.component';
import { EditChangelogComponent } from './edit-changelog/edit-changelog.component';
import { FormsModule } from '@angular/forms';
import { NgxSimpleTextEditorModule } from 'ngx-simple-text-editor';

@NgModule({
  declarations: [
    LearningObjectStatusIndicatorComponent,
    SubmitComponent,
    EditChangelogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgxSimpleTextEditorModule
  ],
  exports: [
    LearningObjectStatusIndicatorComponent,
    SubmitComponent,
    EditChangelogComponent
  ]
})
export class OnionSharedModule { }
