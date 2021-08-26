import { Injectable } from '@angular/core';
import {
  LearningObject,
  LearningOutcome,
  Guideline,
  Topic
} from '@entity';
import { Subject } from 'rxjs';
import { LearningObjectValidator } from './validators/learning-object.validator';
import { HttpErrorResponse } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { UriRetrieverService } from 'app/core/uri-retriever.service';
import { RelevancyService } from 'app/core/relevancy.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';

/**
 * Defines a list of actions the builder can take
 *
 * @export
 * @enum {number}
 */
export enum BUILDER_ACTIONS {
  MAP_STANDARD_OUTCOME,
  UNMAP_STANDARD_OUTCOME,
}

export enum BUILDER_ERRORS {
  FETCH_OBJECT,
  UPDATE_OBJECT,
  UPDATE_OUTCOME,
  SERVICE_FAILURE
}

/**
 * A central storage repository for communication between learning object builder components.
 * Maintains a stateful, single-source store for all possible actions as well as handlers for accepting those actions.
 *
 * @export
 * @class BuilderStore
 */
@Injectable()
export class BuilderStore {
  private _learningObject: LearningObject;
  private _outcomes: LearningOutcome[];
  private _topics: string[] = [];

  // fired when this service is destroyed
  private destroyed$: Subject<void> = new Subject();

  constructor(
    private toaster: ToastrOvenService,
    private relevancyService: RelevancyService,
    private validator: LearningObjectValidator,
    private titleService: Title,
    private uriRetriever: UriRetrieverService,
  ) {}

  get learningObject() {
    return this._learningObject;
  }

  get outcomes() {
    return this._outcomes;
  }

  get topics(): string[] {
    return this._topics;
  }

  /**
   * Retrieve a learning object from the service by id
   *
   * @param {string} id
   * @returns {Promise<LearningObject>}
   * @memberof BuilderStore
   */
  fetch(id: string): Promise<LearningObject> {
    return this.uriRetriever.getLearningObject({id}, ['outcomes']).toPromise().then(object => {
      this._learningObject = object;
      // this learning object is submitted, ensure submission mode is on
      this.validator.submissionMode =
        this._learningObject.status &&
        ![
          LearningObject.Status.UNRELEASED,
          LearningObject.Status.REJECTED
        ].includes(this._learningObject.status);
      this._outcomes = this._learningObject.outcomes;
      this._topics = this._learningObject.topics || [];
      // set the title of page to the learning object name
      this.titleService.setTitle(this._learningObject.name + ' | CLARK');
      return this._learningObject;
    }).catch(e => {
      this.handleServiceError(e, BUILDER_ERRORS.FETCH_OBJECT);
      return null;
    });
  }

  /**
   * Service call to retrieve all topics in our system
   *
   * @returns array of topics
   */
  getTopics(): Promise<Topic[]> {
    return this.relevancyService.getTopics();
  }

  /**
   * Local store for a learning objects tagged topics
   * @param arr array of topic ids
   */
  storeTopics(arr: string[]): void {
    this._topics = arr;
  }

  /**
   * Adds a guideline to a given outcome
   *
   * @param outcomeId The outcome id
   * @param guideline The guideline to add
   */
  addGuideline(outcomeId: string, guideline: Guideline) {
    const outcome = this._outcomes.find(o => o.id === outcomeId);
    const index = outcome.mappings.findIndex(g => g.guidelineId === guideline.guidelineId);
    if (index < 0) {
      outcome.mappings.push(guideline);
    }
  }

  /**
   * Removes a guideline from a given outcome
   *
   * @param outcomeId The outcome id
   * @param guidelineId The guideline id to remove
   */
  removeGuideline(outcomeId: string, guidelineId: string) {
    const outcome = this._outcomes.find(o => o.id === outcomeId);
    const index = outcome.mappings.findIndex(g => g.guidelineId === guidelineId);
    if (index >= 0) {
      outcome.mappings.splice(index, 1);
    }
  }

  /**
   * This saves the mapped topics and outcome mappings to the database
   */
  async save() {
    try {
      await this.relevancyService.updateObjectTopics(this._learningObject.author.username, this._learningObject.id, this._topics);
      for (let i = 0; i < this.outcomes.length; i++) {
        await this.relevancyService.updateLearningOutcomeMappings(
          this._learningObject.author.username,
          this._learningObject.id,
          this.outcomes[i].id,
          this.outcomes[i].mappings.map(g => g.guidelineId)
        );
      }
    } catch (e) {
      this.toaster.error('Error!', e.message || 'There was an error saving the topics and mappings, please try again later');
    }
  }

  /**
   * This functions handles service level errors by setting service error observable
   * If the status code is a 500, then the service failure error is set
   *
   * @private
   * @param {HttpErrorResponse} error
   * @param {BUILDER_ERRORS} builderError
   * @memberof BuilderStore
   */
  private handleServiceError(
    error: HttpErrorResponse,
    builderError: BUILDER_ERRORS
  ) {
    this.toaster.error('Error!', 'Could not save learning object, please try again later');
  }
}
