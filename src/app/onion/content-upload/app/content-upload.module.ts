import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Routes, RouterModule } from '@angular/router';

// Other
import { routes } from './content-upload.routes';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { environment } from '../environments/environment';

// Services
import { LearningObjectService } from '../../core/learning-object.service';
import { FileStorageService } from './services/file-storage.service';

// Components
import { FileManagerComponent } from './file-manager/file-manager.component';
import { UploadQueueComponent } from './file-manager/upload-queue/upload-queue.component';

import { ContentUploadComponent } from './content-upload.component';
import { UploadComponent } from './upload/upload.component';

import { TooltipModule } from '@cyber4all/clark-tooltip';
import { ContextMenuModule } from 'ngx-contextmenu';
import { FileGridViewComponent } from './file-manager/file-grid-view/file-grid-view.component';
import { FileListViewComponent } from './file-manager/file-list-view/file-list-view.component';
import { SharedModule } from '../../../shared/shared.module';
import { EncodeUriComponentPipe } from '../../../shared/pipes/encoded-url.pipe';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface =
  environment.DROPZONE_CONFIG;

@NgModule({
  declarations: [
    ContentUploadComponent,
    UploadComponent,
    FileManagerComponent,
    UploadQueueComponent,
    FileGridViewComponent,
    FileListViewComponent,
    // TODO: Remove import should be imported in shared
    EncodeUriComponentPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpModule,
    DropzoneModule,
    TooltipModule,
    routes,
    ContextMenuModule.forRoot()
  ],
  exports: [RouterModule],
  providers: [
    LearningObjectService,
    FileStorageService,
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    }
  ],
  bootstrap: [ContentUploadComponent]
})
export class ContentUploadModule {}
