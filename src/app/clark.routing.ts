import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CubeComponent } from './cube/cube.component';

// TODO: Import cube routes to expose

const routes: Routes = [
  { path: '', loadChildren: 'app/cube/cube.module#CubeModule' },
  { path: '**', redirectTo: 'cube', pathMatch: 'full' }
];

export const ClarkRoutingModule: ModuleWithProviders = RouterModule.forRoot(routes);
