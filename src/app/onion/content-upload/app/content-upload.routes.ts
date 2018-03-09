import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadComponent } from './upload/upload.component';
import { ViewComponent } from './view/view.component';


export const router: Routes = [
    { path: 'upload/:learningObjectName', component: UploadComponent },
    { path: 'view/:learningObjectName', component: ViewComponent },
];




export const routes: ModuleWithProviders = RouterModule.forChild(router);