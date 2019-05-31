import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileBrowserComponent } from './file-browser/file-browser.component';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';
import { FileListViewComponent } from './file-list-view/file-list-view.component';
import { FileBreadcrumbComponent } from './file-breadcrumb/file-breadcrumb.component';
import { FilePreviewComponent } from './file-preview/file-preview.component';
import { FileSizePipe } from './file-list-view/file-size.pipe';
import { ContextMenuModule } from 'ngx-contextmenu';
import { TooltipModule } from '../tooltips/tip.module';

@NgModule({
  imports: [
    CommonModule,
    ScrollDispatchModule,
    ContextMenuModule,
    TooltipModule
  ],
  exports: [FileBrowserComponent],
  declarations: [
    FileBrowserComponent,
    FileListViewComponent,
    FileBreadcrumbComponent,
    FilePreviewComponent,
    FileSizePipe
  ],
  providers: []
})
export class FileBrowserModule {}
