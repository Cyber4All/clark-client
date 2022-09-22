import { Component, OnInit } from '@angular/core';
import { UsageStatsService } from 'app/cube/core/usage-stats/usage-stats.service';
import { GoogleTagService } from '../google-tag.service';

@Component({
  selector: 'clark-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {
  numReleasedObjects = 0; // default number of released objects before the service provides a new number

  constructor(
    private usageStatsService: UsageStatsService,
    public googleTagService: GoogleTagService
    ) { }

  ngOnInit(): void {
    this.usageStatsService.getLearningObjectStats().then(stats => {
      this.numReleasedObjects = Math.floor(stats.released / 10) * 10;
    });
  }
}
