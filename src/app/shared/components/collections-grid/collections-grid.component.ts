import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Collection, CollectionService } from 'app/core/collection-module/collections.service';

@Component({
  selector: 'clark-collections-grid',
  templateUrl: './collections-grid.component.html',
  styleUrls: ['./collections-grid.component.scss']
})
export class CollectionsGridComponent implements OnInit {

  // list of collections from service
  @Input() collections: Collection[];

  // highlights collection if one is already present
  @Input() currentCollection: string;

  // collections that cannot be selected
  @Input() preselect: string[];

  // a string that defines why a user can't select any collections defined in the preselect input
  @Input() preselectReason: string;

  // fires when the user selects a collection
  @Output() selected: EventEmitter<string> = new EventEmitter();

  // flags
  loading = false;
  licenseAccepted = false;

  constructor(private collectionService: CollectionService) { }

  async ngOnInit() {
    // if no collections list was passed through component input, fetch them here
    if (!this.collections) {
      this.collections = await this.loadCollections();
    }
  }

  /**
   * Load a list of collections
   *
   * @return {Promise<Collection[]>} list of collections from service
   */
  async loadCollections(): Promise<Collection[]> {
    this.loading = true;
    return  this.collectionService.getCollections().then(val => {
      this.loading = false;
      return val;
    }).catch(error => {
      this.loading = false;
      return [];
    });
  }

  select(collection: string) {
    this.currentCollection = collection;
    this.selected.emit(collection);
  }

  isPreselected(collectionAbv: string) {
    return this.preselect && this.preselect.includes(collectionAbv);
  }
}
