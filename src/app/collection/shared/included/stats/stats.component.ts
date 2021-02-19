import { Component, Input, OnInit } from '@angular/core';
import { CollectionService } from 'app/core/collection.service';


@Component({
  selector: 'clark-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  @Input() collectionName: string;
  constructor(private collectionService: CollectionService) {

   }

  public collectionMetrics;
  public authorCollection;
  public objDownload;
  public objReview;
  public objReleased;

  ngOnInit(): void {
    this.collectionService.getCollectionMetricsData(this.collectionName).then((res: any) => {
      this.collectionMetrics = res;

      this.authorCollection = res.metrics.authorsCount;
      this.objDownload = res.metrics.downloads;
      this.objReview = res.metrics.saves;
      this.objReleased = res.metrics.saves;
    });

  }


}
