import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Other
import { routes } from './content-upload.routes';
import { DropzoneModule, DROPZONE_CONFIG,DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { environment } from '../environments/environment';

// Services
import { LearningObjectService } from '../../../../core/learning-object.service';
import { FileStorageService } from './services/file-storage.service';

// Components
import { FileManagerComponent } from './file-manager/file-manager.component';

import { ContentUploadComponent } from './content-upload.component';
import { UploadComponent } from './upload/upload.component';

import { SharedModule } from '../../../../../shared/shared.module';
import { ContextMenuModule } from 'ngx-contextmenu';
import { UrlManagerComponent } from './upload/url-manager/url-manager.component';
import { FileUploadStatusComponent } from './upload/file-upload-status/file-upload-status.component';
import { UrlRowComponent } from './upload/url-manager/url-row/url-row.component';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface =
  environment.DROPZONE_CONFIG;

@NgModule({
  declarations: [
    ContentUploadComponent,
    UploadComponent,
    FileManagerComponent,
    UrlManagerComponent,
    FileUploadStatusComponent,
    UrlRowComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    DropzoneModule,
    ContextMenuModule,
    routes
  ],
  exports: [
    RouterModule,
    UploadComponent,
    FileManagerComponent,
    FileUploadStatusComponent,
    UrlManagerComponent,
    UrlRowComponent
  ],
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
