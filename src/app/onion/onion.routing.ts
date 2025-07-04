import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../core/auth-module/auth-guard.service';
import { OnionComponent } from './onion.component';

/**
 * Contains all whitelisted routes for the application, stored in an Routes array.
 * Route Guards are passed in an array, meaning there can be multiple, to the canActivate property.
 * Read more about Angular routes at: https://angular.io/guide/router#configuration
 *
 * @author Sean Donnelly
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
const onion_routes: Routes = [
  {
    path: '',
    component: OnionComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren:
          () => import('../onion/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard],
        data: { state: 'dashboard', title: 'Your Dashboard' }
      },
      {
        path: 'learning-object-builder',
        loadChildren:
          () => import('../onion/learning-object-builder/learning-object-builder.module').then(m => m.LearningObjectBuilderModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'learning-object-builder/:cuid/:version',
        loadChildren:
          () => import('../onion/learning-object-builder/learning-object-builder.module').then(m => m.LearningObjectBuilderModule),
        canActivate: [AuthGuard]
      },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(onion_routes)],
  exports: [RouterModule]
})
export class OnionRoutingModule { }

