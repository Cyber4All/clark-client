// Core
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// Shared 3rd Party Modules
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { CheckBoxModule } from 'clark-checkbox';
import { ClickOutsideModule } from 'ng-click-outside';
import { ParticlesModule } from 'angular-particle';
import { NotificationModule } from '../shared/notifications';
// Shared CLARK Modules
import { ModalModule } from './modals';
// Components
import { BrowseByMappingsComponent } from './browse-by-mappings/browse-by-mappings.component';
import { MessageComponent } from './navbar/message/message.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FileListViewComponent } from './filesystem/file-list-view/file-list-view.component';
import { FileGridViewComponent } from './filesystem/file-grid-view/file-grid-view.component';
import { ContextMenuModule } from 'ngx-contextmenu';
import { TooltipModule } from '@cyber4all/clark-tooltip';
import { FileBreadcrumbComponent } from './filesystem/file-breadcrumb/file-breadcrumb.component';
import { FileBrowserComponent } from './filesystem/file-browser/file-browser.component';
import { FilePreviewComponent } from './filesystem/file-preview/file-preview.component';

/**
 * Contains all stateless UI modules (directives, components, pipes) that are used across the app.
 *
 * @class SharedModule
 */
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ParticlesModule,
    VirtualScrollModule,
    ClickOutsideModule,
    CheckBoxModule,
    ModalModule,
    NotificationModule,
    TooltipModule,
    ContextMenuModule
  ],
  providers: [],
  declarations: [
    BrowseByMappingsComponent,
    NavbarComponent,
    MessageComponent,
    FileBrowserComponent,
    FileListViewComponent,
    FileGridViewComponent,
    FileBreadcrumbComponent,
    FilePreviewComponent
  ],
  exports: [
    BrowseByMappingsComponent,
    NavbarComponent,
    FileBrowserComponent,
    FileListViewComponent,
    FileGridViewComponent,
    FileBreadcrumbComponent,
    TooltipModule
  ]
})
export class SharedModule {}
