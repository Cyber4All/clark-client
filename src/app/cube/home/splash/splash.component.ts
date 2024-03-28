import { Component, OnInit } from '@angular/core';
import { UsageStatsService } from 'app/cube/core/usage-stats/usage-stats.service';
import { GoogleTagService } from '../google-tag.service';
import { UtilityService } from 'app/core/utility.service';

@Component({
  selector: 'clark-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {
  numReleasedObjects = 0; // default number of released objects before the service provides a new number
  resourceCount = 0; // default number of resources before the service provides a new number
  constructor(
    private usageStatsService: UsageStatsService,
    public googleTagService: GoogleTagService,
    private utilityService: UtilityService
    ) { }

  async ngOnInit(): Promise<void> {
    this.usageStatsService.getLearningObjectStats().then(stats => {
      this.numReleasedObjects = Math.floor(stats.released / 10) * 10;
    });
    await this.utilityService.getAllResources().then((res: any) => {
      this.resourceCount = Math.floor(res.total / 10) * 10;
    });
  }

  /**
   * Alert message for users leaving the site
   */
  leavingSite() {
    window.alert('You are now leaving CLARK. You will be redirected to the CAE Resource Directory.');
  }
}
