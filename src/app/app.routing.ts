import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AcademicsComponent } from './academics/academics.component';
import { MappingComponent } from './mapping/mapping.component';
import { ModalityComponent } from './modality/modality.component';
import { DetailsComponent } from './learning-object-details/details/details.component'
import { CartComponent } from './cart/cart.component';
import { BrowseComponent } from './browse/browse.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

const routes: Routes = [
    { path: '', redirectTo: '', pathMatch: 'full', component: HomeComponent },
    { path: 'home', component: HomeComponent, data: { breadcrumb: 'Home' } },
    { path: 'academics', component: AcademicsComponent, data: { breadcrumb: 'Academics' } },
    { path: 'mapping', component: MappingComponent, data: { breadcrumb: 'Mapping' } },
    { path: 'modality', component: ModalityComponent, data: { breadcrumb: 'Modality' } },
    { path: 'details/:id', component: DetailsComponent, data: { breadcrumb: 'Details' } },
    { path: "cart", component: CartComponent },
    { path: 'browse', component: BrowseComponent, data: { breadcrumb: 'Browse' } },
    { path: 'userprofile', component: UserProfileComponent, data: { breadcrumb: 'Profile' } },
    // Catch All
    { path: '**', redirectTo: '' }
];

export const RoutingModule: ModuleWithProviders = RouterModule.forRoot(routes);
