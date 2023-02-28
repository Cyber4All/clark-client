import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningObjectService } from 'app/cube/learning-object.service';
import {CollectionLearningObjectCardComponent} from './collection-learning-object-card/collection-learning-object-card.component';
import {CollectionLearningObjectListComponent} from './collection-learning-object-list/collection-learning-object-list.component';
import {CuratorsComponent} from './curators/curators.component';
import {CuratorCardComponent} from './curators/curator-card/curator-card.component';
import { StatsComponent } from './stats/stats.component';
import { FeatureComponent } from './feature/feature.component';
import { RouterModule } from '@angular/router';
import { CollectionFeatureComponent } from './collection-feature/collection-feature.component';
import { FeatureCardsComponent } from './collection-feature/components/feature-cards/feature-cards.component';
import { FeatureCardsFiveotwoComponent } from './feature-cards-fiveotwo/feature-cards-fiveotwo.component';



@NgModule({
  declarations: [
    CollectionLearningObjectCardComponent,
    CollectionLearningObjectListComponent,
    CuratorCardComponent,
    CuratorsComponent,
    StatsComponent,
    FeatureComponent,
    CollectionFeatureComponent,
    FeatureCardsComponent,
    FeatureCardsFiveotwoComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    CollectionLearningObjectCardComponent,
    CollectionLearningObjectListComponent,
    CuratorCardComponent,
    CuratorsComponent,
    StatsComponent,
    FeatureComponent,
    CollectionFeatureComponent,
  ],
  providers: [LearningObjectService]
})
export class IncludedModule {

 }
