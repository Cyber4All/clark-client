import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from '../dashboard/dashboard.component';

import { SplashComponent } from './components/splash/splash.component';
import { SearchComponent } from './components/search/search.component';
import { FormsModule } from '@angular/forms';
import { ListComponent } from './components/list/list.component';
import { SharedModule } from 'app/shared/shared.module';
import { DashboardItemComponent } from './components/new-dashboard-item/dashboard-item.component';
import { SidePanelModule } from './components/side-panel/side-panel.module';
import { SidePanelContentComponent } from './components/side-panel-content/side-panel-content.component';
import { LearningObjectComponent } from './components/side-panel-content/learning-object/learning-object.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent
      }
    ]),
    SharedModule,
    SidePanelModule
  ],
  declarations: [
    DashboardComponent,
    SplashComponent,
    SearchComponent,
    ListComponent,
    DashboardItemComponent,
    SidePanelContentComponent,
    LearningObjectComponent
  ]
})
export class DashboardModule { }
