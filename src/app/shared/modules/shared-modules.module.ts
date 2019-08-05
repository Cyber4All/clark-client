// Angular Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Third-Party Modules
import { ClickOutsideModule } from 'ng-click-outside';

// Clark Modules
import { ChangeLogModule } from './changelogs/changelog.module';
import { ContextMenuModule } from './contextmenu/contextmenu.module';
import { FileBrowserModule } from './filesystem/file-browser.module';
import { ModalModule } from './modals/modal.module';
import { PopupModule } from './popups/popup.module';
import { TeleporterModule } from './teleporter/teleporter.module';
import { ToasterModule } from './toaster';
import { PopupTemplatesModule } from './popup-templates/popup-templates.module';
import { SharedComponents } from '../components/shared-components.module';

@NgModule({
  imports: [
    // angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // third-party modules
    ClickOutsideModule,
    // CLARK modules
    ChangeLogModule,
    ContextMenuModule,
    FileBrowserModule,
    ModalModule.forRoot(),
    PopupModule,
    PopupTemplatesModule,
    SharedComponents,
    TeleporterModule,
    ToasterModule,
  ],
  exports: [
    // CLARK modules
    ChangeLogModule,
    ContextMenuModule,
    FileBrowserModule,
    ModalModule,
    PopupModule,
    PopupTemplatesModule,
    TeleporterModule,
    ToasterModule,
  ]
})
export class SharedModules {}
