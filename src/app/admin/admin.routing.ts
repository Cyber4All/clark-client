import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminGuard } from 'app/core/admin.guard';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { LearningObjectsComponent } from './pages/learning-objects/learning-objects.component';
import { UsersComponent } from './pages/users/users.component';

/**
 * Contains all whitelisted routes for the application, stored in an Routes array.
 * Route Guards are passed in an array, meaning there can be multiple, to the canActivate property.
 * Read more about Angular routes at: https://angular.io/guide/router#configuration
 *
 * @author Nick Winner Yo
 */
const admin_routes: Routes = [
  {
    path: '', component: AdminComponent, canActivate: [ AdminGuard ], children: [
      // TODO THESE NEED AN ADMIN GUARD TO PREVENT ACCESS BY CURATORS
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'learning-objects', component: LearningObjectsComponent },
      { path: 'users', component: UsersComponent },
      { path: '', redirectTo: 'analytics', pathMatch: 'full' }
    ],
  },
  { path: ':collection', redirectTo: '/admin/:collection/analytics', pathMatch: 'full' },
  {
    path: ':collection', component: AdminComponent, children: [
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'learning-objects', component: LearningObjectsComponent },
      { path: 'reviewers', component: UsersComponent },
    ],
  },
];
export const AdminRoutingModule: ModuleWithProviders = RouterModule.forChild(admin_routes);
