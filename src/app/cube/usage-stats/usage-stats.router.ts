import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsageStatsComponent } from './usage-stats.component';

const routes: Routes = [{ path: '', component: UsageStatsComponent }];

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UsageStatsRoutingModule: ModuleWithProviders<any> = RouterModule.forChild(
  routes
);
