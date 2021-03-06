import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DashboardComponent } from '../dashboard/dashboard.component';
import { SplashComponent } from './components/splash/splash.component';
import { SearchComponent } from './components/search/search.component';
import { FormsModule } from '@angular/forms';
import { ListComponent } from './components/list/list.component';
import { SharedModule } from 'app/shared/shared.module';
import { DashboardItemComponent } from './components/dashboard-item/dashboard-item.component';
import { SidePanelContentModule } from './components/side-panel-content/side-panel-content.module';
import { OnionSharedModule } from '../shared/onion-shared.module';

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
    OnionSharedModule,
    SidePanelContentModule
  ],
  declarations: [
    DashboardComponent,
    SplashComponent,
    SearchComponent,
    ListComponent,
    DashboardItemComponent
  ],
  exports: [
    DashboardItemComponent
  ]
})
export class DashboardModule { }
