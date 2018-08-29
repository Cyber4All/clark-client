import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CollectionService } from './collection.service';

@Component({
  selector: 'cube-collection',
  templateUrl: 'collection.component.html',
  styleUrls: ['collection.component.scss']
})
export class CollectionComponent implements OnInit {
  name;
  collection;
  myStyle;
  width = 100;
  height = 100;
  constructor(
    private route: ActivatedRoute,
    private collectionProvider: CollectionService,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      params['name'] ? this.name = params['name'] : this.name = '';
      this.fetchCollection(this.name);
    });
  }

  fetchCollection(name: string) {
    this.collection = this.collectionProvider.fetchCollection(name);
  }
}
