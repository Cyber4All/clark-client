import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CubeComponent } from './cube/cube.component';

// TODO: Import cube routes to expose

const clark_routes: Routes = [
  { path: 'auth', loadChildren: 'app/auth/auth.module#AuthModule' },
  { path: '', loadChildren: 'app/cube/cube.module#CubeModule' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

export const ClarkRoutingModule: ModuleWithProviders = RouterModule.forRoot(clark_routes);
