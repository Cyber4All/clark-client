import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { LearningObjectStatusIndicatorComponent } from './status-indicator/status-indicator.component';
import { SubmitComponent } from './submit/submit.component';
import { EditChangelogComponent } from './edit-changelog/edit-changelog.component';
import { FormsModule } from '@angular/forms';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

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
    VirtualScrollerModule
  ],
  exports: [
    LearningObjectStatusIndicatorComponent,
    SubmitComponent,
    EditChangelogComponent
  ]
})
export class OnionSharedModule { }
