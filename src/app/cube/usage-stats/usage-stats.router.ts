import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsageStatsComponent } from './usage-stats.component';

const routes: Routes = [{ path: '', component: UsageStatsComponent }];

export const UsageStatsRoutingModule: ModuleWithProviders<any> = RouterModule.forChild(
  routes
);
