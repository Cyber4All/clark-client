import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadComponent } from './upload/upload.component';

export const router: Routes = [
  // { path: 'upload/:learningObjectName', component: UploadComponent }
];

export const routes: ModuleWithProviders<any> = RouterModule.forChild(router);
