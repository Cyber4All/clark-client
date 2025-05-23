/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { UsageStats } from '../../../shared/types/usage-stats';
import { MetricService } from 'app/core/metric-module/metric.service';

@Component({
  selector: 'clark-about-clark',
  templateUrl: './about-clark.component.html',
  styleUrls: ['./about-clark.component.scss']
})
export class AboutClarkComponent implements OnInit {
  objectStatsLoaded = false;
  userStatsLoaded = false;

  usageStats: UsageStats = {
    objects: {
      released: 0,
      total: 0,
      review: 0,
      downloads: 0,
      topDownloads: [],
      lengths: {
        nanomodule: 0,
        micromodule: 0,
        module: 0,
        unit: 0,
        course: 0
      },
      status: {
        waiting: 0,
        peerReview: 0,
        acceptedMinor: 0,
        acceptedMajor: 0,
        proofing: 0
      },
      collections: { number: 0 }
    },
    outcomes: {
      remember_and_understand: 0,
      apply_and_analyze: 0,
      evaluate_and_synthesize: 0
    },
    users: {
      accounts: 0,
      organizations: 0
    }
  };

  constructor(private metricService: MetricService) { }

  async ngOnInit() {
    await this.metricService.getLearningObjectStats().then(stats => {
      this.usageStats.objects.released = stats.released;
      this.usageStats.objects.review = stats.review;
      this.usageStats.objects.downloads = stats.downloads;
      this.usageStats.objects.collections = stats.collections;
      this.objectStatsLoaded = true;
    });
    await this.metricService.getUserMetrics().then(stats => {
      this.usageStats.users.accounts = stats.accounts;
      this.usageStats.users.organizations = stats.organizations;
      this.userStatsLoaded = true;
    });

  }

}
