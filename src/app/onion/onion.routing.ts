/* eslint-disable @typescript-eslint/naming-convention */
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../core/auth-guard.service';
import { OnionComponent } from './onion.component';

import { DashboardComponent } from './dashboard/dashboard.component';

/**
 * Contains all whitelisted routes for the application, stored in an Routes array.
 * Route Guards are passed in an array, meaning there can be multiple, to the canActivate property.
 * Read more about Angular routes at: https://angular.io/guide/router#configuration
 *
 * @author Sean Donnelly
 */

const onion_routes: Routes = [
  {
    path: '',
    component: OnionComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren:
          () => import('app/onion/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard],
        data: { state: 'dashboard', title: 'Your Dashboard' }
      },
      {
        path: 'learning-object-builder',
        loadChildren:
          () => import('app/onion/learning-object-builder/learning-object-builder.module').then(m => m.LearningObjectBuilderModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'relevancy-builder/:learningObjectId',
        loadChildren:
          () => import('app/onion/relevancy-builder/relevancy-builder.module').then(m => m.RelevancyBuilderModule),
      },
      {
        path: 'learning-object-builder/:learningObjectId',
        loadChildren:
          () => import('app/onion/learning-object-builder/learning-object-builder.module').then(m => m.LearningObjectBuilderModule),
        canActivate: [AuthGuard]
      },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
export const OnionRoutingModule: ModuleWithProviders<any> = RouterModule.forChild(
  onion_routes
);
