import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnsupportedComponent } from './unsupported.component';
import { NotFoundComponent } from './not-found.component';
import { AccessGroupGuard } from './core/access-group-guard';
import { UnauthorizedComponent } from './unauthorized.component';

// eslint-disable-next-line @typescript-eslint/naming-convention
const clark_routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('app/new-auth/new-auth.module').then(m => m.NewAuthModule),
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
  { path: 'collections', loadChildren: () => import('app/collection/collection.module').then(m => m.CollectionModule)},
  { path: 'unsupported', component: UnsupportedComponent, data: { title: 'Unsupported'}},
  { path: 'not-found', component: NotFoundComponent, data: { title: 'Not Found'}},
  { path: 'unauthorized/:code/:redirect', component: UnauthorizedComponent, data: {title: 'Unauthorized'}},
  { path: '', loadChildren: () => import('app/cube/cube.module').then(m => m.CubeModule) },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(clark_routes, {
    scrollPositionRestoration: 'enabled', // or 'top'
    anchorScrolling: 'enabled',
    scrollOffset: [0, 64], // [x, y] - adjust scroll offset
  })],
  exports: [RouterModule]
})
export class ClarkRoutingModule { }
