import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CollectionIndexComponent } from './pages/collection-index/collection-index.component';
import { NiceChallengeComponent } from './pages/nice-challenge/nice-challenge.component';

const collection_routes: Routes = [
    {
        path: '',
        component: CollectionIndexComponent,
    },
    {
        path: 'nice',
        component: NiceChallengeComponent
    },
];

export const CollectionsRoutingModule: ModuleWithProviders = RouterModule.forChild(collection_routes);
