import { Component, Input, OnInit } from '@angular/core';
import { CollectionService } from 'app/core/collection.service';


@Component({
  selector: 'clark-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  @Input() collectionName: string;
  name: string;

  constructor(private collectionService: CollectionService) {}

  objDownload: number;
  objReview: number;
  objReleased: number;
  authorCollection: number;

  ngOnInit(): void {
    this.collectionService.getCollectionMetricsData(this.collectionName).then((res: any ) => {
      this.objDownload = res.metrics.downloads;
      this.objReleased = res.metrics.statusMetrics[0].released;
      const num = res.metrics.statusMetrics[0].waiting + res.metrics.statusMetrics[0].peerReview + res.metrics.statusMetrics[0].proofing;
      this.objReview = num;
      this.authorCollection = res.metrics.authors.length;
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
