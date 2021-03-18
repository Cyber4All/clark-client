import { Component, Input, OnInit } from '@angular/core';
import { CollectionService } from 'app/core/collection.service';

@Component({
  selector: 'clark-curators',
  templateUrl: './curators.component.html',
  styleUrls: ['./curators.component.scss']
})
export class CuratorsComponent implements OnInit {
  @Input() collectionName: string;
  curators: any;

  constructor(private collectionService: CollectionService) { }

  async ngOnInit(): Promise<void> {
      this.curators = await this.collectionService.getCollectionCuratorsInfo(this.collectionName);
  }

}
