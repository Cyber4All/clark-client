import { OrganizationListComponent } from './organization-list/organization-list.component';
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
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
import { AccessibilityStatementComponent } from './accessibility-statement/accessibility-statement.component';
import { PressComponent } from './press/press.component';
import { environment } from '@env/environment';
import { OutagePageComponent } from './outage-page/outage-page.component';
import { TopicBrowseComponent } from './topic-browse/topic-browse.component';

const details = {
  path: 'details',
  loadChildren: 'app/cube/details/details.module#DetailsModule'
};

const library = environment.experimental ? {
  path: 'library',
  canActivate: [AuthGuard],
  loadChildren: 'app/cube/library/library.module#LibraryModule'
} : {
  path: 'library',
  component: CartComponent,
  canActivate: [AuthGuard],
  data: { title: 'Your Library' }
};

const cube_routes: Routes = [
  {
    path: '',
    component: CubeComponent,
    children: [
      { path: 'home', component: HomeComponent, data: { title: 'Home'} },
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'c/:abvName', component: CollectionDetailsComponent },
      { path: 'c', component: CollectionsComponent },
      { path: 'organization/:query', component: OrganizationListComponent },
      {
        path: 'topicbrowse',
        component: TopicBrowseComponent,
        data: { title: 'Browse Learning Objects'}
      },
      {
        path: 'browse',
        component: BrowseComponent,
        data: { title: 'Browse Learning Objects'}
      },
      {
        path: 'press',
        component: PressComponent,
        data: { title: 'Press and Media'}
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
        path: 'system/accessibility-statement',
        component: AccessibilityStatementComponent,
        data: { title: 'Accessibility'}
      },
      {
        path: 'system/status',
        component: OutagePageComponent
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
      details,
      library,
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
