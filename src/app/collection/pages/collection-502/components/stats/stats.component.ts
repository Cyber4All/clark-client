import { Component, OnInit } from '@angular/core';
import { CollectionService } from 'app/core/collection.service';

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

  constructor(private collectionService: CollectionService) { }

  async ngOnInit() {
    await this.collectionService.getCollectionMetricsData().then((res: any) => {
      this.objDownload = res.metrics.downloads;
      this.objReleased = res.metrics.statusMetrics[0].released;
      const num = res.metrics.statusMetrics[0].waiting + res.metrics.statusMetrics[0].peerReview + res.metrics.statusMetrics[0].proofing;
      this.objReview = num;
      this.authorCollection = res.metrics.authors.length;
    });
  }

}
