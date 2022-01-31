/* eslint-disable @typescript-eslint/naming-convention */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadComponent } from './upload/upload.component';

export const router: Routes = [
  // { path: 'upload/:learningObjectName', component: UploadComponent }
];
@NgModule({
  imports: [RouterModule.forChild(router)],
  exports: [RouterModule]
})
export class routes { }
