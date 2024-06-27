import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { BrowseComponent } from './browse/browse.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AuthGuard } from '../core/auth-module/auth-guard.service';
import { CubeComponent } from './cube.component';
import { CollectionsComponent } from './collections/collections.component';
import { CollectionDetailsComponent } from './collection-details/collection-details.component';
import { ProfileResovler } from './core/profile.resolver';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { AccessibilityStatementComponent } from './accessibility-statement/accessibility-statement.component';
import { PressComponent } from './press/press.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { DonateComponent } from './donate/donate.component';
import { AboutClarkComponent } from './content-pages/about-us/about-us.component';
import { ContributePageComponent } from './content-pages/contribute-page/contribute-page.component';
import { EditorialProcessComponent } from './content-pages/editorial-process/editorial-process.component';
import { NotFoundComponent } from 'app/not-found.component';
import { CollectionsGuard } from 'app/core/collection-module/collections.guard';

// eslint-disable-next-line @typescript-eslint/naming-convention
const cube_routes: Routes = [
  {
    path: '',
    component: CubeComponent,
    children: [
      { path: 'home', component: HomeComponent, data: { title: 'Home', hideTopBar: 'true' } },
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'c/:abvName', component: CollectionDetailsComponent, canActivate: [CollectionsGuard] },
      { path: 'c', component: CollectionsComponent },
      {
        path: 'about',
        component: AboutUsComponent,
      },
      {
        path: 'contribute-page',
        component: ContributePageComponent,
        data: { title: 'Contributors Page' }
      },
      {
        path: 'about-us',
        component: AboutClarkComponent,
      },
      {
        path: 'browse',
        component: BrowseComponent,
        data: { title: 'Browse Learning Objects' }
      },
      {
        path: 'press',
        component: PressComponent,
        data: { title: 'Press and Media' }
      },
      {
        path: 'donate',
        component: DonateComponent,
        data: { title: 'Donate to CLARK' }
      },
      {
        path: 'system/usage',
        loadChildren: () => import('app/cube/usage-stats/usage-stats.module').then(m => m.UsageStatsModule),
        data: { title: 'System Usage' }
      },
      {
        path: 'collections/:collectionName',
        loadChildren: () => import('app/collection/collection.module').then(m => m.CollectionModule),
        data: { title: 'Collections' }
      },
      {
        path: 'system/termsofservice',
        component: TermsOfServiceComponent,
        data: { title: 'Terms of Service' }
      },
      {
        path: 'system/accessibility-statement',
        component: AccessibilityStatementComponent,
        data: { title: 'Accessibility' }
      },
      {
        path: 'users/:username',
        component: UserProfileComponent,
        resolve: {
          user: ProfileResovler
        }
      },
      {
        path: 'editorial-process',
        component: EditorialProcessComponent,
      },
      {
        path: 'details',
        loadChildren: () => import('../cube/details/details.module').then(m => m.DetailsModule)
      },
      {
        path: 'library',
        loadChildren: () => import('../cube/library/library.module').then(l => l.LibraryModule),
        canActivate: [AuthGuard]
      },
      // Catch All
      {
        path: '**',
        component: NotFoundComponent,
        pathMatch: 'full',
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(cube_routes)],
  exports: [RouterModule]
})
export class CubeRoutingModule { }
