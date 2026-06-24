import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsageStatsComponent } from './usage-stats.component';
import { NgChartsModule } from 'ng2-charts';
import { DistributionChartComponent } from './distribution-chart/distribution-chart.component';
import { UsageStatsRoutingModule } from './usage-stats.router';
import { HeatMapComponent } from './heat-map/heat-map.component';
import { CounterBlockComponent } from './counter-block/counter-block.component';
import { TopDownloadsComponent } from './top-downloads/top-downloads.component';

@NgModule({
    imports: [CommonModule, NgChartsModule, UsageStatsRoutingModule, UsageStatsComponent,
        DistributionChartComponent,
        HeatMapComponent,
        CounterBlockComponent,
        TopDownloadsComponent],
    exports: [
        UsageStatsComponent,
        DistributionChartComponent,
        TopDownloadsComponent
    ],
    providers: []
})
export class UsageStatsModule { }
