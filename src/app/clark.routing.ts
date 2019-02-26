import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnsupportedComponent } from './unsupported.component';
import { NotFoundComponent } from './not-found.component';
import { AccessGroupGuard } from './core/access-group-guard';

const clark_routes: Routes = [
  {
    path: 'auth',
    loadChildren: 'app/auth/auth.module#AuthModule',
    data: { hideNavbar: true }
  },
  {
    path: 'admin/learning-object-builder/:learningObjectId',
    loadChildren:
      'app/onion/learning-object-builder/learning-object-builder.module#LearningObjectBuilderModule',
    canActivate: [AccessGroupGuard],
    data: { state: 'builder', accessGroups: ['admin', 'editor'] }
  },
  { path: 'onion', loadChildren: 'app/onion/onion.module#OnionModule' },

  { path: 'unsupported', component: UnsupportedComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: '', loadChildren: 'app/cube/cube.module#CubeModule' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

export const ClarkRoutingModule: ModuleWithProviders = RouterModule.forRoot(
  clark_routes
);
