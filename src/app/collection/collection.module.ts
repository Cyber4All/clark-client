
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionIndexComponent } from './pages/collection-index/collection-index.component';
import { GenericPageComponent } from './pages/generic-page/generic-page.component';
import { SecurityInjectionsComponent } from './pages/security-injections/security-injections.component';
import { CollectionsRoutingModule} from './collection.routing';
import { CollectionNcyteComponent } from './pages/collection-ncyte/collection-ncyte.component';
import { HeaderNcyteComponent } from './pages/collection-ncyte/header-ncyte/header-ncyte.component';
import { FooterComponent } from './pages/collection-ncyte/footer/footer.component';
import { CuratorsComponent } from './pages/collection-ncyte/curators/curators.component';
import { StatsComponent } from './pages/collection-ncyte/stats/stats.component';
import { ResourceComponent } from './pages/collection-ncyte/resource/resource.component';
import { FeatureComponent } from './pages/collection-ncyte/feature/feature.component';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { IncludedModule } from './shared/included/included.module';

import {
  CollectionLearningObjectListComponent
 } from './pages/collection-ncyte/feature/collection-learning-object-list/collection-learning-object-list.component';

import {
  CollectionLearningObjectCardComponent
 } from './pages/collection-ncyte/feature/collection-learning-object-card/collection-learning-object-card.component';

import { CuratorCardComponent } from './pages/collection-ncyte/curators/curator-card/curator-card.component';



@NgModule({
  declarations: [
    CollectionIndexComponent,
    GenericPageComponent,
    SecurityInjectionsComponent,
    CollectionNcyteComponent,
    HeaderNcyteComponent,
    FooterComponent,
    CollectionLearningObjectListComponent,
    CollectionLearningObjectCardComponent,
    CuratorsComponent,
    StatsComponent,
    ResourceComponent,
    FeatureComponent,
    CuratorCardComponent,
  ],
  imports: [
    CommonModule,
    IncludedModule,
    CollectionsRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [LearningObjectService]
})
export class CollectionModule { }
