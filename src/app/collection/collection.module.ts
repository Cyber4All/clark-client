import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionIndexComponent } from './pages/collection-index/collection-index.component';
import { GenericPageComponent } from './pages/generic-page/generic-page.component';
import { CuratorCardComponent } from './shared/included/curator-card/curator-card.component';
import { StatCardComponent } from './shared/included/stat-card/stat-card.component';
import { SecurityInjectionsComponent } from './pages/security-injections/security-injections.component';
import { CollectionsRoutingModule} from './collection.routing';
import { CollectionNcyteComponent } from './pages/collection-ncyte/collection-ncyte.component';
import { HeaderNcyteComponent } from './pages/collection-ncyte/header-ncyte/header-ncyte.component';
import { ObjectListComponent } from './pages/collection-ncyte/object-list/object-list.component';
import { ObjectItemComponent } from './pages/collection-ncyte/object-list/object-item/object-item.component';
import { FooterComponent } from './pages/collection-ncyte/footer/footer.component';
import { CuratorsComponent } from './pages/collection-ncyte/curators/curators.component';
import { CuratorItemComponent } from './pages/collection-ncyte/curators/curator-item/curator-item.component';
import { StatsComponent } from './pages/collection-ncyte/stats/stats.component';
import { ResourceComponent } from './pages/collection-ncyte/resource/resource.component';
import { ResourceInfoComponent } from './pages/collection-ncyte/resource/resource-info/resource-info.component';


@NgModule({
  declarations: [
    CollectionIndexComponent,
    GenericPageComponent,
    CuratorCardComponent,
    StatCardComponent,
    SecurityInjectionsComponent,
    CollectionNcyteComponent,
    HeaderNcyteComponent,
    ObjectListComponent,
    ObjectItemComponent,
    FooterComponent,
    CuratorsComponent,
    CuratorItemComponent,
    StatsComponent,
    ResourceComponent,
    ResourceInfoComponent
  ],
  imports: [
    CommonModule,
    CollectionsRoutingModule
  ]
})
export class CollectionModule { }
