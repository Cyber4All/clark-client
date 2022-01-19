/* eslint-disable @typescript-eslint/naming-convention */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminGuard } from 'app/core/admin.guard';
import { LearningObjectsComponent } from './pages/learning-objects/learning-objects.component';
import { UsersComponent } from './pages/users/users.component';
import { FeaturedComponent } from './pages/featured/featured.component';

/**
 * Contains all routes for the module, stored in a Routes array.
 * Route Guards are passed in an array, meaning there can be multiple, to the canActivate property.
 * Read more about Angular routes at: https://angular.io/guide/router#configuration
 *
 * @author Nick Winner
 */
const admin_routes: Routes = [
  {
    path: '', component: AdminComponent, canActivate: [ AdminGuard ], children: [
      { path: 'learning-objects',
      component: LearningObjectsComponent,
      data: { canScroll: false, title: 'Collection Dashboard Learning Objects'}
      },
      { path: 'featured/learning-objects',
      component: FeaturedComponent,
      data: { canScroll: false, title: 'Collection Dashboard Featured Learning Objects'}
      },
      { path: 'users', component: UsersComponent, data: { title: 'Collection Dashboard Users'} },
      { path: '', redirectTo: 'learning-objects', pathMatch: 'full' }
    ],
  },
  { path: ':collection', redirectTo: '/admin/:collection/learning-objects', pathMatch: 'full' },
  {
    path: ':collection', component: AdminComponent, children: [
      { path: 'learning-objects', component: LearningObjectsComponent,
        data: { canScroll: false, title: 'Collection Dashboard Learning Objects' } },
      { path: 'reviewers', component: UsersComponent, data: { title: 'Collection Dashboard Reviewers'}},
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(admin_routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
