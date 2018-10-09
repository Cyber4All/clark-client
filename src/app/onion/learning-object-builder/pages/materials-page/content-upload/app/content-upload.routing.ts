import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadComponent } from './upload/upload.component';
import { ContentUploadComponent } from './content-upload.component';

export const router: Routes = [
  { path: '', component: ContentUploadComponent,
    children: [
      { path: 'upload/:learningObjectName', component: UploadComponent}
    ] }
  // { path: 'upload/:learningObjectName', component: UploadComponent }
];

export const UploadRoutes: ModuleWithProviders = RouterModule.forChild(router);
