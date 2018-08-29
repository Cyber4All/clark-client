import { OrganizationListComponent } from './organization-list/organization-list.component';
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { DetailsComponent } from './details/details.component';
import { CartComponent } from './cart/cart.component';
import { BrowseComponent } from './browse/browse.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserPreferencesComponent } from './user-profile/user-preferences/user-preferences.component';
import { RouterComponent } from './shared/breadcrumb/router.component';
import { AuthGuard } from '../core/auth-guard.service';
import { CubeComponent } from './cube.component';
import { CollectionComponent } from './collections/collection.component';
import { ProfileGuard } from './core/profile.guard';
import { UserResolver } from './core/user.resolver';

// Declared as a separate constant to be included as a child for breadcrumbs
const detailRoute = {
  path: 'details/:username/:learningObjectName', component: DetailsComponent, data: { breadcrumb: 'Details' }
};
const cube_routes: Routes = [
  {
    path: '', component: CubeComponent, children: [
      detailRoute,
      { path: 'home', component: HomeComponent },
      { path: 'c/:name', component: CollectionComponent },
      { path: 'organization/:query', component: OrganizationListComponent },
      {
        path: 'browse/:query', component: RouterComponent, data: { breadcrumb: 'Browse', blockForCrumbs: true },
        children: [{ path: '', component: BrowseComponent }, detailRoute]
      },
      {
        path: 'browse', component: RouterComponent, data: { breadcrumb: 'Browse' },
        children: [{ path: '', component: BrowseComponent }, detailRoute]
      },
      {
        path: 'library', component: RouterComponent, canActivate: [AuthGuard],
        children: [{ path: '', component: CartComponent }, detailRoute]
      },
      { path: 'users/:username', component: UserProfileComponent, resolve: {
        user: UserResolver
      }},
      { path: 'users/:username/preferences', component: UserPreferencesComponent, data: { breadcrumb: 'Preferences' },
        canActivate: [AuthGuard]
      },
      // Catch All
      { path: '**', component: UserProfileComponent, pathMatch: 'full', canActivate: [ProfileGuard] },
    ]
  }
];

export const CubeRoutingModule: ModuleWithProviders = RouterModule.forChild(cube_routes);
