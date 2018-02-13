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
import { RouterComponent } from './shared/breadcrumb/router.component';

const detailRoute = {
    path: 'details/:username/:learningObjectName', component: DetailsComponent, data: { breadcrumb: 'Details' }};
const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full'},
    detailRoute,
    { path: 'home', component: HomeComponent, },
    { path: 'academics', component: RouterComponent, data: { breadcrumb: 'Academics'  },
        children: [{path: '', component: AcademicsComponent }, detailRoute]
    },
    { path: 'mapping', component: RouterComponent, data: { breadcrumb: 'Mapping' },
        children: [{path: '', component: MappingComponent }, detailRoute]
    },
    { path: 'modality', component: RouterComponent, data: { breadcrumb: 'Modality' },
        children: [{path: '', component: ModalityComponent }, detailRoute]
    },
    { path: 'browse/:query', component: RouterComponent, data: { breadcrumb: 'Browse' },
        children: [{path: '', component: BrowseComponent }, detailRoute]
    },
    {
        path: 'browse', component: RouterComponent, data: { breadcrumb: 'Browse' },
        children: [{ path: '', component: BrowseComponent}, detailRoute]
    },
    { path: 'library', component: RouterComponent, data: { breadcrumb: 'Library' },
        children: [{path: '', component: CartComponent }, detailRoute]
    },
    { path: 'login', component: LoginComponent, data: { hideNavbar: true, hideTopbar: true } },
    { path: 'register', component: RegisterComponent, data: { hideNavbar: true, hideTopbar: true } },
    { path: 'userprofile', component: UserProfileComponent, data: { breadcrumb: 'Profile' } },
    { path: 'userpreferences', component: UserPreferencesComponent, data: { breadcrumb: 'Preferences' } },
    // Catch All
    { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

export const RoutingModule: ModuleWithProviders = RouterModule.forRoot(routes);
