import { Component, OnInit } from '@angular/core';
import { CollectionService } from 'app/core/collection.service';

@Component({
  selector: 'clark-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {

  collections;

  constructor(private collectionService: CollectionService) { }

  ngOnInit() {
    this.collectionService
      .getCollections()
      .then(collections => {
        this.collections = collections;
      })
      .catch(e => {
        console.error(e.message);
      });
  }

}
