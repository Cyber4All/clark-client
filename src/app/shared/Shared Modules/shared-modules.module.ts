// Angular Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Third-Party Modules
import { ClickOutsideModule } from 'ng-click-outside';
import { CKEditorModule } from 'ng2-ckeditor';

// Clark Modules
import { ChangeLogModule } from './changelogs/changelog.module';
import { CollectionsGridModule } from './collections-grid/collections-grid.module';
import { ContextMenuModule } from './contextmenu/contextmenu.module';
import { FileBrowserModule } from './filesystem/file-browser.module';
import { ModalModule } from './modals/modal.module';
import { PopupModule } from './popups/popup.module';
import { TeleporterModule } from './teleporter/teleporter.module';
import { ToasterModule } from './toaster';
import { TooltipModule } from './tooltips/tip.module';
import {PopupTemplatesModule} from './popup-templates/popup-templates.module';
import {RatingStarsModule} from './rating-stars/rating-stars.module';
import {TextEditorModule} from './text-editor/text-editor.module';

@NgModule({
  imports: [
    // angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // third-party modules
    ClickOutsideModule,
    CKEditorModule,
    // CLARK modules
    ChangeLogModule,
    CollectionsGridModule,
    ContextMenuModule,
    FileBrowserModule,
    ModalModule.forRoot(),
    PopupModule,
    PopupTemplatesModule,
    RatingStarsModule,
    TeleporterModule,
    TextEditorModule,
    ToasterModule,
    TooltipModule,
  ],
  exports: [
    // CLARK modules
    ChangeLogModule,
    CollectionsGridModule,
    ContextMenuModule,
    FileBrowserModule,
    ModalModule,
    PopupModule,
    PopupTemplatesModule,
    RatingStarsModule,
    TeleporterModule,
    TextEditorModule,
    ToasterModule,
    TooltipModule,
  ]
})
export class SharedModules {}
