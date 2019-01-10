import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsageStatsComponent } from './usage-stats.component';
import { ChartsModule } from 'ng2-charts';
import { DistributionChartComponent } from './distribution-chart/distribution-chart.component';

@NgModule({
  imports: [CommonModule, ChartsModule],
  exports: [UsageStatsComponent],
  declarations: [UsageStatsComponent, DistributionChartComponent],
  providers: []
})
export class UsageStatsModule {}
