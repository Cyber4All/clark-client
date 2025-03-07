import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CollectionIndexComponent } from './pages/collection-index/collection-index.component';
import { XPCyberComponent } from './pages/xp-cyber/xp-cyber.component';
import { CollectionNcyteComponent } from './pages/collection-ncyte/collection-ncyte.component';
import { Collection502Component } from './pages/collection-502/collection-502.component';
import { NotFoundComponent } from 'app/not-found.component';
import { NcyteDashboardComponent } from './pages/collection-ncyte/dashboard/dashboard.component';
import { SecurityInjectionsComponent } from './pages/security-injections/security-injections.component';
import { NcyteDashboardGuard } from '../core/client-module/ncyte-dashboard.guard';


// eslint-disable-next-line @typescript-eslint/naming-convention
const collection_routes: Routes = [
    {
        path: '',
        redirectTo: '/c',
        pathMatch: 'full'
    },
    {
        path: 'xpcyber',
        component: XPCyberComponent
    },
    {
        path: 'ncyte',
        component: CollectionNcyteComponent
    },
    {
        path: 'ncyte/dashboard',
        component: NcyteDashboardComponent,
        canActivate: [NcyteDashboardGuard]
    },
    {
        path: '502-project',
        component: Collection502Component
    },
    {
        path: '502_project',
        redirectTo: '502-project'
    },
    {
        path: 'secinj',
        component: SecurityInjectionsComponent
    },
    {
        path: '**',
        component: NotFoundComponent,
        pathMatch: 'full',
    }
];

@NgModule({
    imports: [RouterModule.forChild(collection_routes)],
    exports: [RouterModule]
})
export class CollectionsRoutingModule { }
