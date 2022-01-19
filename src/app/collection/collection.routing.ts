/* eslint-disable @typescript-eslint/naming-convention */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CollectionIndexComponent } from './pages/collection-index/collection-index.component';
import { NiceChallengeComponent } from './pages/nice-challenge/nice-challenge.component';
import { CollectionNcyteComponent } from './pages/collection-ncyte/collection-ncyte.component';

const collection_routes: Routes = [
    {
        path: '',
        component: CollectionIndexComponent,
    },
    {
        path: 'nice',
        component: NiceChallengeComponent
    },
    {
        path: 'ncyte',
        component: CollectionNcyteComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(collection_routes)],
    exports: [RouterModule]
})
export class CollectionsRoutingModule { }
