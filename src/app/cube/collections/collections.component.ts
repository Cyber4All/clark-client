import { Component, OnInit } from '@angular/core';
import { CollectionService } from 'app/core/collection.service';
import { Collection } from '../../core/collection.service';

@Component({
  selector: 'clark-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
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
