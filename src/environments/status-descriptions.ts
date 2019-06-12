import { LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StatusDescriptions {

  private templates = {
    unreleased() {
      return 'This Learning Object is visible only to you. Submit it for review to make it publicly available.';
    },
    rejected() {
      return 'This Learning Object was rejected. Contact your review team for further information.';
    },
    waiting(collection: string) {
      return `This Learning Object is waiting to be reviewed by the ${collection} review team. It is not yet released and cannot be edited until the review process is complete.`;
    },
    review(collection: string) {
      return `This Learning Object is currently under review by the ${collection} review team. It is not yet released and cannot be edited until the review process is complete.`
    },
    proofing() {
      return 'This Learning Object is currently undergoing proofing by the CLARK editorial team. It is not yet released and cannot be edited until the proofing process is complete.'
    },
    released(collection: string) {
      return `This Learning Object is released in the ${collection} collection and can be browsed for.`;
    }
  };

  constructor(private collectionService: CollectionService) { }

  async getDescription(status: LearningObject.Status, collectionAbbreviation?: string) {
    const needsCollection = [LearningObject.Status.RELEASED, LearningObject.Status.WAITING, LearningObject.Status.REVIEW];
    let collection: string;

    if (needsCollection.includes(status)) {
      collection = (await this.collectionService.getCollection(collectionAbbreviation)).name;
    }

    return this.templates[status](collection);
  }
}
