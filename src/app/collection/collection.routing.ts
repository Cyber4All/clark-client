import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CollectionIndexComponent } from './pages/collection-index/collection-index.component';
import { NiceChallengeComponent } from './pages/nice-challenge/nice-challenge.component';
import { CollectionNcyteComponent } from './pages/collection-ncyte/collection-ncyte.component';
import { Collection502Component } from './pages/collection-502/collection-502.component'

// eslint-disable-next-line @typescript-eslint/naming-convention
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
    },
    {
        path: '502',
        component: Collection502Component
    }
];

@NgModule({
    imports: [RouterModule.forChild(collection_routes)],
    exports: [RouterModule]
})
export class CollectionsRoutingModule { }
