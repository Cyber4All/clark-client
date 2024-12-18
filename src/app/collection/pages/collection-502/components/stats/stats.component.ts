import { Component, OnInit } from '@angular/core';
import { MetricService } from 'app/core/metric-module/metric.service';

@Component({
  selector: 'clark-502-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class Stats502Component implements OnInit {
  collectionName = '502_project';
  name: string;

  objDownload: number;
  objReview: number;
  objReleased: number;
  authorCollection: number;

  constructor(private metricService: MetricService) { }

  async ngOnInit() {
    await this.metricService.getCollectionMetrics(this.collectionName).then((res: any) => {
      this.objDownload = res.downloads;
      this.objReleased = res.statusMetrics[0].count;
      const num = res.statusMetrics[0].waiting + res.statusMetrics[0].peerReview + res.statusMetrics[0].proofing;
      this.objReview = num;
      this.authorCollection = res.authors.length;
    });
  }

}
