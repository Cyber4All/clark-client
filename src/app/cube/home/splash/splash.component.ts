import { Component, OnInit } from '@angular/core';
import { GoogleTagService } from '../google-tag.service';
import { MetricService } from '../../../core/metric-module/metric.service';
import { UtilityService } from '../../../core/utility-module/utility.service';

@Component({
  selector: 'clark-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {
  numReleasedObjects = 0; // default number of released objects before the service provides a new number
  resourceCount = 0; // default number of resources before the service provides a new number
  constructor(
    private metricService: MetricService,
    public googleTagService: GoogleTagService,
    public utilityService: UtilityService
    ) { }

  async ngOnInit(): Promise<void> {
    await this.metricService.getLearningObjectStats().then(stats => {
      this.numReleasedObjects = Math.floor(stats.released / 10) * 10;
    });
    await this.utilityService.getAllResources().then((res: any) => {
      this.resourceCount = Math.floor(res.total / 10) * 10;
    });
  }
}
