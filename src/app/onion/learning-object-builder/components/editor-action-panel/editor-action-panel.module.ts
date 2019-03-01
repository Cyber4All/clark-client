import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EditorActionPanelComponent} from './editor-action-panel.component';
import {SharedModule} from '../../../../shared/shared.module';
import {ChangeStatusModalComponent} from './change-status-modal/change-status-modal.component';
import {OnionSharedModule} from '../../../shared/onion-shared.module';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    EditorActionPanelComponent,
    ChangeStatusModalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    OnionSharedModule,
    HttpClientModule,
  ],
  exports: [
    EditorActionPanelComponent,
  ],
})
export class EditorActionPanelModule { }
