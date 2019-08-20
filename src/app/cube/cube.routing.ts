import { OrganizationListComponent } from './organization-list/organization-list.component';
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { OldDetailsModule } from './old-details/details.module';
import { DetailsModule } from './details/details.module';
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
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { environment } from '@env/environment';

const cube_routes: Routes = [
  {
    path: '',
    component: CubeComponent,
    children: [
      { path: 'home', component: HomeComponent, data: { title: 'Home'} },
      { path: 'c/:abvName', component: CollectionDetailsComponent },
      { path: 'c', component: CollectionsComponent },
      { path: 'organization/:query', component: OrganizationListComponent },
      {
        path: 'browse/:query',
        component: BrowseComponent,
        data: { title: 'Search Results'}
      },
      {
        path: 'browse',
        component: BrowseComponent,
        data: { title: 'Browse Learning Objects'}
      },
      {
        path: 'details/:username/:learningObjectName',
        loadChildren: () => { return environment.experimental ? DetailsModule : OldDetailsModule }
      },
      {
        path: 'library',
        component: CartComponent,
        canActivate: [AuthGuard],
        data: { title: 'Your Library'}
      },
      {
        path: 'system/usage',
        loadChildren: 'app/cube/usage-stats/usage-stats.module#UsageStatsModule',
        data: { title: 'System Usage'}
      },
      {
        path: 'system/termsofservice',
        component: TermsOfServiceComponent,
        data: { title: 'Terms of Service'}
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

export const CubeRoutingModule: ModuleWithProviders = RouterModule.forChild(cube_routes);
