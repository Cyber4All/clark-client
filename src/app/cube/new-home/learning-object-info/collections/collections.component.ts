import { Component, OnInit } from '@angular/core';
import { Collection, CollectionService } from 'app/core/collection.service';

@Component({
  selector: 'clark-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {

  collections = [];
  show = ['nccp', 'ncyte', 'intro_to_cyber'];

  constructor(
    private collectionService: CollectionService
    ) { }

  ngOnInit(): void {
    this.collectionService
    .getCollections()
    .then((collections: Collection[]) => {
      this.collections = collections;
    })
    .catch(e => {
      console.error(e.message);
    });

    this.collections = this.collections.filter(col => {
      this.show.includes(col.abvName);
    })

  }

}
