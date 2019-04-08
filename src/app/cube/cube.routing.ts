import { OrganizationListComponent } from './organization-list/organization-list.component';
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { DetailsComponent } from './details/details.component';
import { CartComponent } from './cart/cart.component';
import { BrowseComponent } from './browse/browse.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserPreferencesComponent } from './user-profile/user-preferences/user-preferences.component';
import { AuthGuard } from '../core/auth-guard.service';
import { CubeComponent } from './cube.component';
import { CollectionsComponent } from './collections/collections.component';
import { CollectionDetailsComponent } from './collection-details/collection-details.component';
import { ProfileGuard } from './core/profile.guard';
import { UserResolver } from './core/user.resolver';

const cube_routes: Routes = [
  {
    path: '',
    component: CubeComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'c/:name', component: CollectionDetailsComponent },
      { path: 'c', component: CollectionsComponent },
      { path: 'organization/:query', component: OrganizationListComponent },
      {
        path: 'browse/:query',
        component: BrowseComponent
      },
      {
        path: 'browse',
        component: BrowseComponent
      },
      {
        path: 'details/:username/:learningObjectName',
        component: DetailsComponent
      },
      {
        path: 'library',
        component: CartComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'system/usage',
        loadChildren: 'app/cube/usage-stats/usage-stats.module#UsageStatsModule'
      },
      {
        path: 'users/:username',
        component: UserProfileComponent,
        resolve: {
          user: UserResolver
        }
      },
      {
        path: 'users/:username/preferences',
        component: UserPreferencesComponent,
        canActivate: [AuthGuard]
      },
      // Catch All
      {
        path: '**',
        component: UserProfileComponent,
        pathMatch: 'full',
        canActivate: [ProfileGuard]
      }
    ]
  }
];

export const CubeRoutingModule: ModuleWithProviders = RouterModule.forChild(
  cube_routes
);
