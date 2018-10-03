import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// Other
import { routes } from './content-upload.routes';
import { DropzoneModule } from '@cyber4all/ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from '@cyber4all/ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from '@cyber4all/ngx-dropzone-wrapper';
import { environment } from '../environments/environment';

// Services
import { LearningObjectService } from '../../core/learning-object.service';
import { FileStorageService } from './services/file-storage.service';

// Components
import { FileManagerComponent } from './file-manager/file-manager.component';

import { ContentUploadComponent } from './content-upload.component';
import { UploadComponent } from './upload/upload.component';

import { SharedModule } from '../../../shared/shared.module';
import { ContextMenuModule } from 'ngx-contextmenu';
import { UrlManagerComponent } from './upload/url-manager/url-manager.component';
import { FileUploadStatusComponent } from './upload/file-upload-status/file-upload-status.component';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface =
  environment.DROPZONE_CONFIG;

@NgModule({
  declarations: [
    ContentUploadComponent,
    UploadComponent,
    FileManagerComponent,
    UrlManagerComponent,
    FileUploadStatusComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    HttpClientModule,
    DropzoneModule,
    ContextMenuModule,
    routes
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
