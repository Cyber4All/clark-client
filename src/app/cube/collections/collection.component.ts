import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CollectionService } from 'app/core/collection.service';

@Component({
  selector: 'cube-collection',
  templateUrl: 'collection.component.html',
  styleUrls: ['collection.component.scss']
})
export class CollectionComponent implements OnInit {
  key: string;
  collection;
  myStyle;
  width = 100;
  height = 100;
  constructor(
    private route: ActivatedRoute,
    private collectionService: CollectionService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.key = params.name;
      this.fetchCollection(params.name);
    });
  }

  fetchCollection(name: string) {
    this.collection = this.collectionService.getCollections()
      .then(collections => collections.filter(c => c.abvName === name)[0])
      .catch(e => {
        throw e;
      });
  }
}
