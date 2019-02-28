import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnsupportedComponent } from './unsupported.component';
import { NotFoundComponent} from './not-found.component';

const clark_routes: Routes = [
  { path: 'auth', loadChildren: 'app/auth/auth.module#AuthModule', data: { hideNavbar: true } },
  { path: 'onion', loadChildren: 'app/onion/onion.module#OnionModule' },
  { path: 'admin', loadChildren: 'app/admin/admin.module#AdminModule' },
  { path: 'unsupported', component: UnsupportedComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: '', loadChildren: 'app/cube/cube.module#CubeModule' },
  { path: '**', redirectTo: '', pathMatch: 'full'},
];

export const ClarkRoutingModule: ModuleWithProviders = RouterModule.forRoot(clark_routes, { enableTracing: true });
