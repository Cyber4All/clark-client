import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from '../dashboard/dashboard.component';

import { SplashComponent } from './components/splash/splash.component';
import { SearchComponent } from './components/search/search.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent
      }
    ])
  ],
  declarations: [
    DashboardComponent,
    SplashComponent,
    SearchComponent
  ]
})
export class DashboardModule { }
