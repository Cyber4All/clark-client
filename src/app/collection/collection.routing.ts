import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CollectionIndexComponent } from './pages/collection-index/collection-index.component';

const collection_routes: Routes = [
    {
        path: '',
        component: CollectionIndexComponent,
    },
];

export const CubeRoutingModule: ModuleWithProviders = RouterModule.forChild(collection_routes);