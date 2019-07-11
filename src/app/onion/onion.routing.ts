import { ModuleWithProviders, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../core/auth-guard.service';
import { OnionComponent } from './onion.component';
import { environment } from '@env/environment';

import { DashboardComponent } from './dashboard/dashboard.component';
import { OldDashboardComponent } from './old-dashboard/old-dashboard.component';

/**
 * Contains all whitelisted routes for the application, stored in an Routes array.
 * Route Guards are passed in an array, meaning there can be multiple, to the canActivate property.
 * Read more about Angular routes at: https://angular.io/guide/router#configuration
 *
 * @author Sean Donnelly
 */
const dashboard = environment.experimental
  ? {
    path: 'dashboard',
    loadChildren:
      'app/onion/dashboard/dashboard.module#DashboardModule',
    canActivate: [AuthGuard],
    data: { state: 'dashboard', title: 'Your Dashboard' }
  }
  : {
    path: 'dashboard',
    component: OldDashboardComponent,
    canActivate: [AuthGuard],
    data: { state: 'dashboard', title: 'Your Dashboard' }
  };
const onion_routes: Routes = [
  {
    path: '',
    component: OnionComponent,
    children: [
      dashboard,
      {
        path: 'learning-object-builder',
        loadChildren:
          'app/onion/learning-object-builder/learning-object-builder.module#LearningObjectBuilderModule',
        canActivate: [AuthGuard],
        data: { state: 'builder' }
      },
      {
        path: 'learning-object-builder/:learningObjectId',
        loadChildren:
          'app/onion/learning-object-builder/learning-object-builder.module#LearningObjectBuilderModule',
        canActivate: [AuthGuard],
        data: { state: 'builder' }
      },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
export const OnionRoutingModule: ModuleWithProviders = RouterModule.forChild(
  onion_routes
);
