import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CollectionService, Collection } from 'app/core/collection.service';

@Component({
  selector: 'clark-collection-selector',
  templateUrl: './collection-selector.component.html',
  styleUrls: ['./collection-selector.component.scss']
})
export class CollectionSelectorComponent implements OnInit {
  // list of collections from service
  @Input() collections: Collection[];

  // highlights collection if one is already present
  @Input() currentCollection: string;

  // fires when the user selects a choice
  @Output() choice: EventEmitter<string> = new EventEmitter();

  // flags
  loading = false;

  constructor(private collectionService: CollectionService) { }

  async ngOnInit() {
    // if no collections list was passed through component input, fetch them here
    if (!this.collections) {
      this.collections = await this.loadCollections();
    }
  }

  /**
   * Load a list of collections
   * @return {Promise<Collection[]} list of collections from service
   */
  async loadCollections(): Promise<Collection[]> {
    this.loading = true;
    return  this.collectionService.getCollections().then(val => {
      this.loading = false;
      return val;
    }).catch(error => {
      console.log(error);
      this.loading = false;
      return [];
    });
  }

}
