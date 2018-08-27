import { NgModule, ModuleWithProviders } from '@angular/core';

import { ModalService } from './modal.service';
import { ContextMenuComponent } from './contextmenu.component';
import { DialogMenuComponent } from './dialogmenu.component';

import { CommonModule } from '@angular/common';
import { ClickOutsideModule } from 'ng-click-outside';
import { ToasterModule } from '../toaster';
import { CheckBoxComponent } from './checkbox.component';

export * from './modal.service';
export * from './contextmenu.component';
export * from './dialogmenu.component';
export * from './modal-list-element';
export * from './position';


@NgModule({
  imports: [CommonModule, ToasterModule.forRoot(), ClickOutsideModule],
  declarations: [ContextMenuComponent, DialogMenuComponent, CheckBoxComponent],
  exports: [ContextMenuComponent, DialogMenuComponent, CheckBoxComponent]
})

export class ModalModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ModalModule,
      providers: [ModalService]
    };
  }
}
