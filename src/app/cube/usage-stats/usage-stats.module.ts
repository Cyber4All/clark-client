import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsageStatsComponent } from './usage-stats.component';
import { ChartsModule } from 'ng2-charts';
import { DistributionChartComponent } from './distribution-chart/distribution-chart.component';
import { UsageStatsRoutingModule } from './usage-stats.router';
import { HeatMapComponent } from './heat-map/heat-map.component';
import { CounterBlockComponent } from './counter-block/counter-block.component';
import { TopDownloadsComponent } from './top-downloads/top-downloads.component';

@NgModule({
  imports: [CommonModule, ChartsModule, UsageStatsRoutingModule],
  exports: [UsageStatsComponent],
  declarations: [
    UsageStatsComponent,
    DistributionChartComponent,
    HeatMapComponent,
    CounterBlockComponent,
    TopDownloadsComponent
  ],
  providers: []
})
export class UsageStatsModule {}
