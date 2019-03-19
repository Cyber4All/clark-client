import { ModuleWithProviders, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LearningObjectBuilderComponent } from './learning-object-builder/learning-object-builder.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from '../core/auth-guard.service';
import { OnionComponent } from './onion.component';
import { LearningObjectBuilderModule } from './learning-object-builder/learning-object-builder.module';
import { LearningObjectBuilderGuard } from './core/learning-object-builder.guard';

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
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { state: 'dashboard' }
      },
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
        canActivate: [AuthGuard, LearningObjectBuilderGuard],
        data: { state: 'builder' }
      },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
export const OnionRoutingModule: ModuleWithProviders = RouterModule.forChild(
  onion_routes
);
