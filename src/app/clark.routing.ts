import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// TODO: Import cube routes to expose

const clark_routes: Routes = [
  { path: 'auth', loadChildren: 'app/auth/auth.module#AuthModule', data: { hideNavbar: true } },
  { path: 'onion', loadChildren: 'app/onion/onion.module#OnionModule' },
  { path: '', loadChildren: 'app/cube/cube.module#CubeModule' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

export const ClarkRoutingModule: ModuleWithProviders = RouterModule.forRoot(clark_routes);
