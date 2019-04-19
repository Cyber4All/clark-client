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
      { path: 'users', component: UsersComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ],
  },
  { path: ':collection', redirectTo: '/admin/:collection/reviewers', pathMatch: 'full' },
  {
    path: ':collection', component: AdminComponent, children: [
      { path: 'reviewers', component: UsersComponent },
    ],
  },
];
export const AdminRoutingModule: ModuleWithProviders = RouterModule.forChild(admin_routes);
