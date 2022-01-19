/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { UsageStats } from '../../../shared/types/usage-stats';
import { UsageStatsService } from '../../../core/usage-stats/usage-stats.service';
import { TopDownloadsComponent } from 'app/cube/usage-stats/top-downloads/top-downloads.component';

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
      review: 0,
      downloads: 0,
      collections: { number: 0},
      topDownloads: [],
      lengths: {
        nanomodule: 0,
        micromodule: 0,
        module: 0,
        unit: 0,
        course: 0
      },
      outcomes: {
        remember_and_understand: 0,
        apply_and_analyze: 0,
        evaluate_and_synthesize: 0
      }
    },
    users: {
      accounts: 0,
      organizations: 0
    }
  };

  constructor(private statsService: UsageStatsService) { }

  ngOnInit() {
    this.statsService.getLearningObjectStats().then(stats => {
      this.usageStats.objects.released = stats.released;
      this.usageStats.objects.review = stats.review;
      this.usageStats.objects.downloads = stats.downloads;
      this.usageStats.objects.collections = stats.collections;
      this.objectStatsLoaded = true;
    });
    this.statsService.getUserStats().then(stats => {
      this.usageStats.users.accounts = stats.accounts;
      this.usageStats.users.organizations = stats.organizations;
      this.userStatsLoaded = true;
    });

  }

}
