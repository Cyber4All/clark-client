import { Component, Input, OnInit } from '@angular/core';
import { MetricService } from 'app/core/metric-module/metric.service';


@Component({
  selector: 'clark-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  @Input() collectionName: string;
  name: string;

  constructor(private metricService: MetricService) { }

  objDownload: number;
  objReview: number;
  objReleased: number;
  authorCollection: number;

  ngOnInit(): void {
    this.metricService.getCollectionMetrics(this.collectionName).then((res: any) => {
      this.objDownload = res.downloads;
      this.objReleased = res.statusMetrics[0].count;
      const num = res.statusMetrics[0].waiting + res.statusMetrics[0].peerReview + res.statusMetrics[0].proofing;
      this.objReview = num;
      this.authorCollection = res.authors.length;
    });

    switch (this.collectionName) {
      case 'nice':
        this.name = 'NICE';
        break;
      case 'ncyte':
        this.name = 'NCyTE';
        break;
    }
  }
}
