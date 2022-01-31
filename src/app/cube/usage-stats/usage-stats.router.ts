import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsageStatsComponent } from './usage-stats.component';

const routes: Routes = [{ path: '', component: UsageStatsComponent }];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsageStatsRoutingModule { }
