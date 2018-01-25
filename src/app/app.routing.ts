import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AcademicsComponent } from './academics/academics.component';
import { MappingComponent } from './mapping/mapping.component';
import { ModalityComponent } from './modality/modality.component';
import { DetailsComponent } from './learning-object-details/details/details.component';
import { CartComponent } from './cart/cart.component';
import { BrowseComponent } from './browse/browse.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

const routes: Routes = [
    { path: '', redirectTo: '', pathMatch: 'full', component: HomeComponent },
    { path: 'login', component: LoginComponent, data: { hideNavbar: true, hideTopbar: true } },
    { path: 'register', component: RegisterComponent, data: { hideNavbar: true, hideTopbar: true } },
    { path: 'home', component: HomeComponent },
    { path: 'academics', component: AcademicsComponent, data: { breadcrumb: 'Academics' } },
    { path: 'mapping', component: MappingComponent, data: { breadcrumb: 'Mapping' } },
    { path: 'modality', component: ModalityComponent, data: { breadcrumb: 'Modality' } },
    { path: 'details/:username/:learningObjectName', component: DetailsComponent, data: { breadcrumb: 'Details' } },
    { path: 'cart', component: CartComponent, data: { breadcrumb: 'Cart' } },
    { path: 'browse', component: BrowseComponent, data: { breadcrumb: 'Browse' } },
    { path: 'userprofile', component: UserProfileComponent, data: { breadcrumb: 'Profile' } },
    { path: 'userpreferences', component: UserPreferencesComponent, data: { breadcrumb: 'Preferences' } },
    // Catch All
    { path: '**', redirectTo: '' }
];

export const RoutingModule: ModuleWithProviders = RouterModule.forRoot(routes);
