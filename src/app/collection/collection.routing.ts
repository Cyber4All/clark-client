import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CollectionIndexComponent } from './pages/collection-index/collection-index.component';
import {CollectionNcyteComponent} from './pages/collection-ncyte/collection-ncyte.component';

const collection_routes: Routes = [
    {
        path: '',
        component: CollectionIndexComponent,
    },
    {
        path: 'ncyte',
        component: CollectionNcyteComponent
    }


];


export const CollectionsRoutingModule: ModuleWithProviders = RouterModule.forChild(collection_routes);