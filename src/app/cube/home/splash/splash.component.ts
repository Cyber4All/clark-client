import { Component, OnInit } from '@angular/core';
import { GoogleTagService } from '../google-tag.service';
import { MetricService } from 'app/core/metric-module/metric.service';

@Component({
  selector: 'clark-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {
  numReleasedObjects = 0; // default number of released objects before the service provides a new number

  constructor(
    private metricService: MetricService,
    public googleTagService: GoogleTagService
    ) { }

  ngOnInit(): void {
    this.metricService.getLearningObjectStats().then(stats => {
      this.numReleasedObjects = Math.floor(stats.released / 10) * 10;
    });
  }
}
