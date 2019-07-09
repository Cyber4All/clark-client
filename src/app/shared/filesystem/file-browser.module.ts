import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileBrowserComponent } from './file-browser/file-browser.component';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';
import { FileListViewComponent } from './file-list-view/file-list-view.component';
import { FileBreadcrumbComponent } from './file-breadcrumb/file-breadcrumb.component';
import { FilePreviewComponent } from './file-preview/file-preview.component';
import { FileSizePipe } from './file-list-view/file-size.pipe';
import { TooltipModule } from '../tooltips/tip.module';
import { FileListItemComponent } from './file-list-view/components/file-list-item/file-list-item.component';
import { FolderListItemComponent } from './file-list-view/components/folder-list-item/folder-list-item.component';

@NgModule({
  imports: [
    CommonModule,
    ScrollDispatchModule,
    TooltipModule
  ],
  exports: [FileBrowserComponent],
  declarations: [
    FileBrowserComponent,
    FileListViewComponent,
    FileListItemComponent,
    FolderListItemComponent,
    FileBreadcrumbComponent,
    FilePreviewComponent,
    FileSizePipe
  ],
  providers: []
})
export class FileBrowserModule {}
