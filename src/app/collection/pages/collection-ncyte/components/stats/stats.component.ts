import { Component, Input, OnInit } from '@angular/core';
import { MetricService } from 'app/core/metric-module/metric.service';

@Component({
  selector: 'clark-ncyte-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  @Input() collectionName: string;
  name: string;

  objDownload: number;
  objReview: number;
  objReleased: number;
  objSaved: number;
  authorCollection: number;

  constructor(private metricService: MetricService) { }

  async ngOnInit() {
    switch (this.collectionName) {
      case 'nice':
        this.name = 'NICE';
        break;
      case 'ncyte':
        this.name = 'NCyTE';
        break;
    }

    await this.metricService.getCollectionMetrics(this.collectionName).then((res: any) => {
      this.objDownload = res.downloads;
      this.objSaved = res.saves;
      this.objReleased = res.statusMetrics[0].count;
      const num = res.statusMetrics[0].waiting + res.statusMetrics[0].peerReview + res.statusMetrics[0].proofing;
      this.objReview = num;
      this.authorCollection = res.authors.length;
    });
  }

}
