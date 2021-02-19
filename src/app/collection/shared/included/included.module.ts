import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningObjectService } from 'app/cube/learning-object.service';
import {CollectionLearningObjectCardComponent} from './collection-learning-object-card/collection-learning-object-card.component';
import {CollectionLearningObjectListComponent} from './collection-learning-object-list/collection-learning-object-list.component';
import {CuratorsComponent} from './curators/curators.component';
import {CuratorCardComponent} from './curators/curator-card/curator-card.component';
import { StatsComponent } from './stats/stats.component';


@NgModule({
  declarations: [
    CollectionLearningObjectCardComponent,
    CollectionLearningObjectListComponent,
    CuratorCardComponent,
    CuratorsComponent,
    StatsComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    CollectionLearningObjectCardComponent,
    CollectionLearningObjectListComponent,
    CuratorCardComponent,
    CuratorsComponent,
    StatsComponent
  ],
  providers: [LearningObjectService]
})
export class IncludedModule {

 }
