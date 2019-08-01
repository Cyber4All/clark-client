import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Other
import { routes } from './content-upload.routes';

// Services
import { LearningObjectService } from '../../../../core/learning-object.service';
import { FileManagementService } from './services/file-management.service';

// Components
import { FileManagerComponent } from './file-manager/file-manager.component';

import { ContentUploadComponent } from './content-upload.component';
import { UploadComponent } from './upload/upload.component';

import { SharedModule } from '../../../../../shared/shared.module';
import { UrlManagerComponent } from './upload/url-manager/url-manager.component';
import { FileUploadStatusComponent } from './upload/file-upload-status/file-upload-status.component';
import { UrlRowComponent } from './upload/url-manager/url-row/url-row.component';
import { FileBrowserModule } from 'app/shared/shared modules/filesystem/file-browser.module';

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
    FileBrowserModule,
    FormsModule,
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
  providers: [LearningObjectService, FileManagementService],
  bootstrap: [ContentUploadComponent]
})
export class ContentUploadModule {}
