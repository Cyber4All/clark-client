import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminGuard } from 'app/core/admin.guard';
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
      { path: 'learning-objects', component: LearningObjectsComponent, data: { canScroll: false } },
      { path: 'users', component: UsersComponent },
      { path: '', redirectTo: 'learning-objects', pathMatch: 'full' }
    ],
  },
  { path: ':collection', redirectTo: '/admin/:collection/learning-objects', pathMatch: 'full' },
  {
    path: ':collection', component: AdminComponent, children: [
      { path: 'learning-objects', component: LearningObjectsComponent, data: { canScroll: false } },
      { path: 'reviewers', component: UsersComponent },
    ],
  },
];
export const AdminRoutingModule: ModuleWithProviders = RouterModule.forChild(admin_routes);
