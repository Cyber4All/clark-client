import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EditorActionPanelComponent} from './editor-action-panel.component';
import {SharedModule} from '../../../../shared/shared.module';
import {ChangeStatusModalComponent} from './change-status-modal/change-status-modal.component';
import {OnionSharedModule} from '../../../shared/onion-shared.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({
    exports: [
        EditorActionPanelComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        OnionSharedModule,
        EditorActionPanelComponent,
        ChangeStatusModalComponent
    ],
    providers: [
        provideHttpClient(withInterceptorsFromDi())
    ]
})
export class EditorActionPanelModule { }
