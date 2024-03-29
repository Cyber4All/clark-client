import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileBrowserComponent } from './file-browser/file-browser.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FileListViewComponent } from './file-list-view/file-list-view.component';
import { FileBreadcrumbComponent } from './file-breadcrumb/file-breadcrumb.component';
import { FilePreviewComponent } from './file-preview/file-preview.component';
import { FileSizePipe } from './file-list-view/file-size.pipe';
import { FileListItemComponent } from './file-list-view/components/file-list-item/file-list-item.component';
import { FolderListItemComponent } from './file-list-view/components/folder-list-item/folder-list-item.component';
import { SharedDirectivesModule } from 'app/shared/directives/shared-directives.module';
import { SharedComponents } from 'app/shared/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    ScrollingModule,
    SharedDirectivesModule,
    SharedComponents,
  ],
  exports: [FileBrowserComponent, FileListItemComponent],
  declarations: [
    FileBrowserComponent,
    FileListViewComponent,
    FileListItemComponent,
    FolderListItemComponent,
    FileBreadcrumbComponent,
    FilePreviewComponent,
    FileSizePipe,
  ],
  providers: []
})
export class FileBrowserModule {}
