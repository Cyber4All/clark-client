import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { LearningObjectsComponent } from './components/learning-objects/learning-objects.component';
import { PhilosophyComponent } from './components/philosophy/philosophy.component';
import { CuratorComponent } from './components/curator/curator.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { FooterComponent } from './components/footer/footer.component';
import { NiceChallengeComponent } from './nice-challenge.component';
import { IncludedModule } from '../../../collection/shared/included/included.module';

@NgModule({
  declarations: [
    HeaderComponent,
    LearningObjectsComponent,
    PhilosophyComponent,
    CuratorComponent,
    StatisticsComponent,
    FooterComponent,
    NiceChallengeComponent,
  ],
  imports: [
    IncludedModule,
    CommonModule,
  ],
  exports: [
    NiceChallengeComponent,
  ],
})
export class NiceChallengeModule { }
