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
import { PopupTemplatesModule } from './popup-templates/popup-templates.module';
import { SharedComponents } from '../components/shared-components.module';
import { SidePanelModule } from './side-panel/side-panel.module';
import { ToasterModule } from './toaster/toaster.module';
import { ChatbotModule } from './chatbot/chatbot.module';

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
    SidePanelModule,
    TeleporterModule,
    ToasterModule,
    ChatbotModule
  ],
  exports: [
    // CLARK modules
    ChangeLogModule,
    ContextMenuModule,
    FileBrowserModule,
    ModalModule,
    PopupModule,
    PopupTemplatesModule,
    SidePanelModule,
    TeleporterModule,
    ToasterModule,
    ChatbotModule
  ]
})
export class SharedModules {}
