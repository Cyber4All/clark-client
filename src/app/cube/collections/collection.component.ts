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

  async fetchCollection(name: string) {
    this.collection = await this.collectionService.getCollectionMetadata(name);
  }

  getKey() {
    return this.collection.abvName;
  }
}
