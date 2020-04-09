import { NgModule, ModuleWithProviders } from '@angular/core';

import { ModalService } from './modal.service';
import { ContextMenuComponent } from './contextmenu.component';
import { DialogMenuComponent } from './dialogmenu.component';

import { CommonModule } from '@angular/common';
import { ClickOutsideModule } from 'ng-click-outside';
import { SharedDirectivesModule } from 'app/shared/directives/shared-directives.module';

export * from './modal.service';
export * from './contextmenu.component';
export * from './dialogmenu.component';
export * from './modal-list-element';
export * from './position';


@NgModule({
  imports: [CommonModule, ClickOutsideModule, SharedDirectivesModule],
  declarations: [ContextMenuComponent, DialogMenuComponent],
  exports: [ContextMenuComponent, DialogMenuComponent]
})

export class ModalModule {
  static forRoot(): ModuleWithProviders<ModalModule> {
    return {
      ngModule: ModalModule,
      providers: [ModalService]
    };
  }
}
