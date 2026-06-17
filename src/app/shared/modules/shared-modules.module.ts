// Angular Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Third-Party Modules
import { ClickOutsideModule } from 'ng-click-outside';

// Clark Modules

import { ContextMenuModule } from './contextmenu/contextmenu.module';

import { ModalModule } from './modals/modal.module';







@NgModule({
  imports: [
    // angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // third-party modules
    ClickOutsideModule,
    ContextMenuModule,
    ModalModule.forRoot(),
],
  exports: [
    ContextMenuModule,
    ModalModule,
]
})
export class SharedModules {}
