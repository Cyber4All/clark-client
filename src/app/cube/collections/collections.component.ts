import { Component, OnInit } from '@angular/core';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { Collection } from '../../core/collection-module/collections.service';

import { CollectionCardComponent } from '../../shared/components/collection-card/collection-card.component';

@Component({
    selector: 'clark-collections',
    templateUrl: './collections.component.html',
    styleUrls: ['./collections.component.scss'],
    standalone: true,
    imports: [CollectionCardComponent]
})
export class CollectionsComponent implements OnInit {

  collections: Collection[];

  constructor(private collectionService: CollectionService) { }

  ngOnInit() {
    this.collectionService
      .getCollections()
      .then((collections: Collection[]) => {
        this.collections = collections;
      })
      .catch(e => {
        console.error(e.message);
      });
  }

}
