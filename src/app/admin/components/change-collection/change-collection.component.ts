import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Collection, CollectionService } from 'app/core/collection-module/collections.service';
import { LearningObject } from '@entity';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { LearningObjectService } from 'app/core/learning-object-module/learning-object/learning-object.service';

@Component({
  selector: 'clark-change-collection',
  templateUrl: './change-collection.component.html',
  styleUrls: ['./change-collection.component.scss']
})
export class ChangeCollectionComponent implements OnInit {
  collections: Collection[] = [];
  selectedCollection: string;

  @Input() object: LearningObject;

  @Output() close: EventEmitter<void> = new EventEmitter();

  constructor(
    private collectionService: CollectionService,
    private learningObjectService: LearningObjectService,
    private toaster: ToastrOvenService
  ) { }

  async ngOnInit(): Promise<void> {
    this.collections = await this.collectionService.getCollections();
  }

  /**
   * Selects the new collection to move to
   *
   * @param collection The abv collection name
   */
  selectCollection(collection: string) {
    this.selectedCollection = collection;
  }

  /**
   * Confirms the object's new submitted collection
   */
  confirm() {
    this.learningObjectService.updateSubmittedCollection(this.object.cuid, this.selectedCollection)
      .then(() => this.object.collection = this.selectedCollection)
      .catch(() => this.toaster.error('Error', 'There was an error changing collections, please try again later.'))
      .finally(() => this.close.emit());
  }
}
