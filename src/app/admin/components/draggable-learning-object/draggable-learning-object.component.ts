import { Component, OnInit, Input } from '@angular/core';
import { CollectionService } from '../../../core/collection.service';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-draggable-learning-object',
  templateUrl: './draggable-learning-object.component.html',
  styleUrls: ['./draggable-learning-object.component.scss']
})
export class DraggableLearningObjectComponent implements OnInit {
  @Input() learningObject: LearningObject;
  collection;
  constructor(
    private collectionService: CollectionService,
  ) { }

  async ngOnInit() {
    await this.fetchCollection(this.learningObject.collection);
  }

  async fetchCollection(abvName: string) {
    this.collection = await this.collectionService.getCollectionMetadata(abvName);
  }

    get date() {
      // tslint:disable-next-line:radix
      return new Date(parseInt(this.learningObject.date));
    }

}

