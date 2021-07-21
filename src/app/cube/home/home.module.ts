import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { CubeSharedModule } from '../shared/cube-shared.module';
import { PhilosophyComponent } from './components/philosophy/philosophy.component';
import { SplashComponent } from './components/splash/splash.component';
import { UsageComponent } from './components/usage/usage.component';
import { CollectionsComponent } from './components/collections/collections.component';
import { WhatClarkComponent } from './components/what-clark/what-clark.component';
import { FeaturedCollectionCardComponent } from './components/featured-collection-card/featured-collection-card.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    CubeSharedModule,
    RouterModule
  ],
  exports: [
    HomeComponent,
    UsageComponent,
  ],
  declarations: [
    HomeComponent,
    PhilosophyComponent,
    SplashComponent,
    UsageComponent,
    CollectionsComponent,
    WhatClarkComponent,
    FeaturedCollectionCardComponent,
  ],
  providers: []
})
export class HomeModule {}
