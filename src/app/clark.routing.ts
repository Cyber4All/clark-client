import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnsupportedComponent } from './unsupported.component';

const clark_routes: Routes = [
  { path: 'auth', loadChildren: 'app/auth/auth.module#AuthModule', data: { hideNavbar: true } },
  { path: 'onion', loadChildren: 'app/onion/onion.module#OnionModule' },
  { path: 'unsupported', component: UnsupportedComponent },
  { path: '', loadChildren: 'app/cube/cube.module#CubeModule' },
  { path: '**', redirectTo: '', pathMatch: 'full'},
];

export const ClarkRoutingModule: ModuleWithProviders = RouterModule.forRoot(clark_routes);
