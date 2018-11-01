import { ModuleWithProviders, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LearningObjectBuilderComponent } from './learning-object-builder/learning-object-builder.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from '../core/auth-guard.service';
import { OnionComponent } from './onion.component';
import { LearningObjectBuilderModule } from './learning-object-builder/learning-object-builder.module';

/**
 * Contains all whitelisted routes for the application, stored in an Routes array.
 * Route Guards are passed in an array, meaning there can be multiple, to the canActivate property.
 * Read more about Angular routes at: https://angular.io/guide/router#configuration
 *
 * @author Sean Donnelly
 */
const onion_routes: Routes = [
  {
    path: '', component: OnionComponent, children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { state: 'dashboard' } },
      { path: 'learning-object-builder',
        loadChildren: () => LearningObjectBuilderModule, data: {state: 'builder'}
      },
      { path: 'learning-object-builder/:learningObjectId',
        loadChildren: () => LearningObjectBuilderModule, data: {state: 'builder'}
      },
      /* { path: 'learning-object-builder', component: LearningObjectBuilderComponent, canActivate: [AuthGuard],
        children: [
          { path: '', component: InfoPageComponent },
          { path: 'info', component: InfoPageComponent },
          { path: 'outcomes', component: OutcomePageComponent },
          { path: 'materials', component: MaterialsPageComponent }
        ]
      },
      { path: 'learning-object-builder/:learningObjectName', component: LearningObjectBuilderComponent, canActivate: [AuthGuard], resolve: {
        learningObject: LearningObjectResolve
      } }, */

      // Load Neutrino module
      // TODO: content should redirect, only show child routes
      // { path: 'content',
      //   loadChildren: 'app/onion/content-upload/app/content-upload.module#ContentUploadModule', canActivate: [UserVerifiedGuard] },

      // else redirect to DashboardComponent
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
export const OnionRoutingModule: ModuleWithProviders = RouterModule.forChild(onion_routes);
