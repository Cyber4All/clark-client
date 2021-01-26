import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionIndexComponent } from './pages/collection-index/collection-index.component';
import { GenericPageComponent } from './pages/generic-page/generic-page.component';
import { CuratorCardComponent } from './shared/included/curator-card/curator-card.component';
import { StatCardComponent } from './shared/included/stat-card/stat-card.component';
import { SecurityInjectionsComponent } from './pages/security-injections/security-injections.component';
import { CollectionsRoutingModule} from './collection.routing';
import { CollectionNcyteComponent } from './pages/collection-ncyte/collection-ncyte.component';


@NgModule({
  declarations: [
    CollectionIndexComponent,
    GenericPageComponent,
    CuratorCardComponent,
    StatCardComponent,
    SecurityInjectionsComponent,
    CollectionNcyteComponent
  ],
  imports: [
    CommonModule,
    CollectionsRoutingModule
  ]
})
export class CollectionModule { }
