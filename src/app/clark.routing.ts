import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnsupportedComponent } from './unsupported.component';
import { NotFoundComponent } from './not-found.component';
import { AccessGroupGuard } from './core/access-group-guard';

const clark_routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('app/auth/auth.module').then(m => m.AuthModule),
    data: { hideNavbar: true }
  },
  {
    path: 'admin/learning-object-builder/:learningObjectId',
    loadChildren:
      () => import('app/onion/learning-object-builder/learning-object-builder.module').then(m => m.LearningObjectBuilderModule),
    canActivate: [AccessGroupGuard],
    data: { state: 'builder', accessGroups: ['admin', 'editor'] }
  },
  { path: 'onion', loadChildren: () => import('app/onion/onion.module').then(m => m.OnionModule) },
  { path: 'admin', loadChildren: () => import('app/admin/admin.module').then(m => m.AdminModule) },
  { path: 'unsupported', component: UnsupportedComponent, data: { title: 'Unsupported'}},
  { path: 'not-found', component: NotFoundComponent, data: { title: 'Not Found'}},
  { path: '', loadChildren: () => import('app/cube/cube.module').then(m => m.CubeModule) },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

export const ClarkRoutingModule: ModuleWithProviders = RouterModule.forRoot(
  clark_routes
);
