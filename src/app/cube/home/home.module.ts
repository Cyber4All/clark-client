import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { CubeSharedModule } from '../shared/cube-shared.module';
import { PhilosophyComponent } from './components/philosophy/philosophy.component';
import { SplashComponent } from './components/splash/splash.component';
import { AboutComponent } from './components/about/about.component';
import { UsageComponent } from './components/usage/usage.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    CubeSharedModule,
    RouterModule
  ],
  exports: [HomeComponent],
  declarations: [HomeComponent, PhilosophyComponent, SplashComponent, AboutComponent, UsageComponent],
  providers: []
})
export class HomeModule {}
