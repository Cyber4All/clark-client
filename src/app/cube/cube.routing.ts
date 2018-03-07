import { ModuleWithProviders, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { DetailsComponent } from './learning-object-details/details/details.component';
import { CartComponent } from './cart/cart.component';
import { BrowseComponent } from './browse/browse.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { LoginComponent } from '../auth/login/login.component';
import { RegisterComponent } from '../auth/register/register.component';
import { RouterComponent } from './cube-shared/breadcrumb/router.component';
import { AuthGuard } from '../core/auth-guard.service';
import { AuthResolve } from '../auth/auth.resolver';
import { CubeComponent } from './cube.component';

// Declared as a separate constant to be included as a child for breadcrumbs
const detailRoute = {
  path: 'details/:username/:learningObjectName', component: DetailsComponent, data: { breadcrumb: 'Details' }
};
const cube_routes: Routes = [
  {
    path: '', component: CubeComponent, children: [
      detailRoute,
      { path: 'home', component: HomeComponent },
      {
        path: 'browse/:query', component: RouterComponent, data: { breadcrumb: 'Browse' },
        children: [{ path: '', component: BrowseComponent }, detailRoute]
      },
      {
        path: 'browse', component: RouterComponent, data: { breadcrumb: 'Browse' },
        children: [{ path: '', component: BrowseComponent }, detailRoute]
      },
      {
        path: 'library', component: RouterComponent, data: { breadcrumb: 'Library' }, canActivate: [AuthGuard],
        children: [{ path: '', component: CartComponent }, detailRoute]
      },
      // { path: 'userprofile', component: UserProfileComponent, data: { breadcrumb: 'Profile' }, canActivate: [AuthGuard] },
      // { path: 'userpreferences', component: UserPreferencesComponent, data: { breadcrumb: 'Preferences' }, canActivate: [AuthGuard] },
      // Catch All
      { path: '**', redirectTo: '/home', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(cube_routes)],
  exports: [RouterModule]
})
export class CubeRoutingModule { }
