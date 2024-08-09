/* eslint-disable @typescript-eslint/naming-convention */
import { LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection-module/collections.service';
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
      return `This Learning Object is waiting to be reviewed by the ${collection} review team.
       It is not yet released and cannot be edited until the review process is complete.`;
    },
    review(collection: string) {
      return `This Learning Object is currently under review by the ${collection} review team.
       It is not yet released and cannot be edited until the review process is complete.`;
    },
    accepted_major(collection: string) {
      return `This Learning Object has been asked for major revisions by either the ${collection}
      review team or the editorial team before moving further in the review process.`;
    },
    accepted_minor(collection: string) {
      return `This Learning Object has been asked for minor revisions by either the ${collection}
      review team or the editorial team before moving further in the review process.`;
    },
    proofing() {
      return `This Learning Object is currently undergoing proofing by the CLARK editorial team.
       It is not yet released and cannot be edited until the proofing process is complete.`;
    },
    released(collection: string) {
      return `This Learning Object is released in the ${collection} collection and can be browsed for.`;
    }
  };

  constructor(private collectionService: CollectionService) { }

  /**
   * Returns the appropriate status description for a given status and
   * fetches the appropriate collection from the abbreviated collection if needed
   *
   * @param {LearningObject.Status} status
   * @param {string} [collectionAbbreviation] the abbreviated name of the collection relevant to the supplied status
   * @returns {Promise<string>}
   * @memberof StatusDescriptions
   */
  async getDescription(status: LearningObject.Status, collectionAbbreviation?: string): Promise<string> {
    let collection: string;

    // the list of statuses that require loading the full collection
    const needsCollection = [
      LearningObject.Status.RELEASED, LearningObject.Status.WAITING, LearningObject.Status.REVIEW,
      LearningObject.Status.ACCEPTED_MAJOR, LearningObject.Status.ACCEPTED_MINOR,
    ];

    if (needsCollection.includes(status)) {
      collection = (await this.collectionService.getCollection(collectionAbbreviation)).name;
    }

    return this.templates[status](collection);
  }
}
