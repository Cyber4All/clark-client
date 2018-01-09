import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AcademicsComponent } from './academics/academics.component';
import { MappingComponent } from './mapping/mapping.component';
import { ModalityComponent } from './modality/modality.component';

const routes: Routes = [
    { path: '', redirectTo: '', pathMatch: 'full', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'academics', component: AcademicsComponent },
    { path: 'mapping', component: MappingComponent },
    { path: 'modality', component: ModalityComponent },

    // Catch All
    { path: '**', redirectTo: '' }
];

export const RoutingModule: ModuleWithProviders = RouterModule.forRoot(routes);
