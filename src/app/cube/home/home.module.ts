import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { CubeSharedModule } from '../shared/cube-shared.module';
import { PhilosophyComponent } from './components/philosophy/philosophy.component';
import { StatCountersComponent } from './stat-counters/stat-counters.component';
import { SplashComponent } from './components/splash/splash.component';
import { AboutComponent } from './components/about/about.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    CubeSharedModule,
    RouterModule
  ],
  exports: [HomeComponent],
  declarations: [HomeComponent, PhilosophyComponent, StatCountersComponent, SplashComponent, AboutComponent],
  providers: []
})
export class HomeModule {}
