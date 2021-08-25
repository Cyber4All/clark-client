import { Injectable } from '@angular/core';
import {
  LearningObject,
  LearningOutcome,
  Guideline,
  Topic
} from '@entity';
import { AuthService } from 'app/core/auth.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { LearningObjectValidator } from './validators/learning-object.validator';
import { HttpErrorResponse } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { UriRetrieverService } from 'app/core/uri-retriever.service';
import { RelevancyService } from 'app/core/relevancy.service';

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
  private _outcomesMap: Map<string, Partial<LearningOutcome>> = new Map();

  // manages a cache of object data that needs to be saved (debounced)
  private objectCache$: BehaviorSubject<any> = new BehaviorSubject(undefined);

  // manages a cache of outcome data that needs to be saved (debounced)
  private outcomeCache$: BehaviorSubject<any> = new BehaviorSubject(undefined);

  // fired when this service is destroyed
  private destroyed$: Subject<void> = new Subject();

  // false until a save operation is attempted, true after that
  public touched: boolean;

  // true if builder is creating/editing a revision, false otherwise
  private _isRevision: boolean;

  // fired when this service needs to propagate changes to the learning object down to children components
  public learningObjectEvent: BehaviorSubject<
    LearningObject
  > = new BehaviorSubject(undefined);

  // fired when this service needs to propagate changes to the learning object down to children components
  public outcomeEvent: BehaviorSubject<
    Map<string, Partial<LearningOutcome>>
  > = new BehaviorSubject(undefined);

  // true when there is a save operation in progress or while there are changes that are cached but not yet saved
  public serviceInteraction$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );

  public serviceError$: Subject<BUILDER_ERRORS> = new Subject();

  private selectedTopics: string[] = [];

  constructor(
    private auth: AuthService,
    private learningObjectService: LearningObjectService,
    private relevancyService: RelevancyService,
    private validator: LearningObjectValidator,
    private titleService: Title,
    private uriRetriever: UriRetrieverService,
  ) {}

  /**
   * Retrieve stored learning object
   *
   * @readonly
   * @memberof BuilderStore
   */
  private get learningObject() {
    return this._learningObject;
  }

  /**
   * Retrieve stored outcomes
   *
   * @memberof BuilderStore
   */
  private get outcomes() {
    return this._outcomesMap;
  }

  /**
   * Set stored learning object
   *
   * @param {LearningObject} object the object to set
   * @memberof BuilderStore
   */
  private set learningObject(object: LearningObject) {
    this._learningObject = object;
    this.learningObjectEvent.next(this.learningObject);

    if (
      ![
        LearningObject.Status.UNRELEASED,
        LearningObject.Status.REJECTED
      ].includes(object.status)
    ) {
      this.validator.submissionMode = true;
    }
  }

  /**
   * Set stored outcomes
   *
   * @memberof BuilderStore
   */
  private set outcomes(map: Map<string, Partial<LearningOutcome>>) {
    this._outcomesMap = map;
    this.outcomeEvent.next(this.outcomes);
  }

  set isRevision(isRevision: boolean) {
    this._isRevision = isRevision;
  }

  /**
   * Retrieve a learning object from the service by id
   *
   * @param {string} id
   * @returns {Promise<LearningObject>}
   * @memberof BuilderStore
   */
  fetch(id: string, revisionId?: any, username?: string): Promise<LearningObject> {
    this.touched = true;

    // conditionally call either the getLearningObject function or the getLearningObjectRevision function based on function input
    const retrieve = this._isRevision && revisionId !== undefined && username ? async () => {
      // tslint:disable-next-line:triple-equals used to catch inadvertent type mismatch between number and string
      if (revisionId == 0) {
        revisionId = await this.learningObjectService.createRevision(username, id);
      }

      return this.learningObjectService.getLearningObjectRevision(username, id, revisionId);
    } : async () => {
      const value = this.uriRetriever.getLearningObject({id}, ['children', 'parents', 'materials', 'outcomes']);
      return value.toPromise();
    };

    return retrieve()
      .then(object => {
        this.learningObject = object;
        // this learning object is submitted, ensure submission mode is on
        this.validator.submissionMode =
          this.learningObject.status &&
          ![
            LearningObject.Status.UNRELEASED,
            LearningObject.Status.REJECTED
          ].includes(this.learningObject.status);
        this.outcomes = this.parseOutcomes(this.learningObject.outcomes);
        this.validator.validateLearningObject(
          this.learningObject,
          this.outcomes
        );
        // set the title of page to the learning object name
        this.titleService.setTitle(this.learningObject.name + ' | CLARK');
        return this.learningObject;
      })
      .catch(e => {
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
    this.selectedTopics = arr;
  }

  /**
   * Convert an array of Learning Outcomes to a map of LearningOutcomes keyed by id
   *
   * @private
   * @param {LearningOutcome[]} outcomes array of LearningOutcomes to convert
   * @return {Map<string, LearningOutcome}
   * @memberof BuilderStore
   */
  private parseOutcomes(outcomes: LearningOutcome[]) {
    return new Map(
      outcomes.map(
        (outcome): [string, LearningOutcome] => [outcome.id, outcome]
      )
    );
  }

  /**
   * Executes a specific action handler based on the passed action parameter
   *
   * @param {number} action predefined action from the BUILDER_ACTIONS enum
   * @param {*} [data] (optional) data that should be passed to action handler
   * @returns {Promise<any>}
   * @memberof BuilderStore
   */
  async execute(action: BUILDER_ACTIONS, data?: any): Promise<any> {
    switch (action) {
      case BUILDER_ACTIONS.MAP_STANDARD_OUTCOME:
        return await this.mapStandardOutcomeMapping(
          data.id,
          data.guideline
        );
      case BUILDER_ACTIONS.UNMAP_STANDARD_OUTCOME:
        return await this.unmapStandardOutcomeMapping(
          data.id,
          data.guideline
        );
    }
  }

  /**
   *
   *
   * @memberof BuilderStore
   */
  sendOutcomeCache() {
    const currentCacheValue = this.outcomeCache$.getValue();
    if (currentCacheValue) {
      this.saveOutcome(currentCacheValue);
    }
  }

  ///////////////////////////////
  //  BUILDER ACTION HANDLERS  //
  ///////////////////////////////
  private mapStandardOutcomeMapping(
    id: string,
    guideline: Guideline
  ) {
    const outcome = this.outcomes.get(id);
    outcome.mappings.push(guideline);

    this.outcomes.set(outcome.id, outcome);
    this.outcomeEvent.next(this.outcomes);

    this.saveOutcome(
      {
        id:
          (<Partial<LearningOutcome> & { serviceId?: string }>outcome)
            .serviceId || outcome.id,
        mappings: outcome.mappings.map(x => x.guidelineId)
      },
      true
    );
  }

  private unmapStandardOutcomeMapping(
    id: string,
    standardOutcome: any
  ) {
    const outcome = this.outcomes.get(id);
    const mappedOutcomes = outcome.mappings;

    for (let i = 0, l = mappedOutcomes.length; i < l; i++) {
      if (mappedOutcomes[i].guidelineId === standardOutcome.guidelineId) {
        outcome.mappings.splice(i, 1);
        break;
      }
    }

    this.outcomes.set(outcome.id, outcome);
    this.outcomeEvent.next(this.outcomes);

    this.saveOutcome(
      {
        id:
          (<Partial<LearningOutcome> & { serviceId?: string }>outcome)
            .serviceId || outcome.id,
        mappings: mappedOutcomes.map(x => x.guidelineId)
      },
      true
    );
  }

  ///////////////////////////
  //  SERVICE INTERACTION  //
  ///////////////////////////

  /**
   * Handles saving a LearningObject
   *
   * @private
   * @param {*} data
   * @param {boolean} [delay]
   * @returns
   * @memberof BuilderStore
   */
  private saveObject(data: any, delay?: boolean) {
    this.titleService.setTitle(this.learningObject.name + ' | CLARK');
    let value = this.objectCache$.getValue();
    this.touched = true;

    // if delay is true, combine the new properties with the object in the cache exit
    // the cache subject will automatically call this function again without a delay property
    if (delay || this.serviceInteraction$.getValue()) {
      const newValue = value ? Object.assign(value, data) : data;
      this.objectCache$.next(newValue);
    } else {
      const canSave =
        this.validator.saveable ||
        (this.validator.submissionMode && this.validator.submittable);
      // don't attempt to save if object isn't saveable, but keep cache so that we can try again later
      if (!canSave) {
        return;
      }

      // clear the cache before submission so that any late arrivals will be cached for the next query
      this.objectCache$.next(undefined);

      // if value is undefined here, this means we've called this function without a delay and there aren't any cached values
      // in this case we'll use the current data instead
      value = value || data;

      this.updateLearningObject(value);
    }

    if (this.outcomeCache$.getValue()) {
      this.saveOutcome(this.outcomeCache$.getValue());
    }
  }

  /**
   * Handles service interaction for updating a LearningObject
   *
   * @private
   * @param {Partial<LearningObject>} object
   * @memberof BuilderStore
   */
  private updateLearningObject(object: Partial<LearningObject>) {
    this.serviceInteraction$.next(true);
    this.learningObjectService
      .save(this.learningObject.id, this.learningObject.author.username, object)
      .then(() => {
        this.serviceInteraction$.next(false);
      })
      .catch(e => {
        this.handleServiceError(e, BUILDER_ERRORS.UPDATE_OBJECT);
      });
  }

  /**
   * Handles saving a LearningOutcome
   *
   * @private
   * @param {*} data
   * @param {boolean} [delay]
   * @returns
   * @memberof BuilderStore
   */
  private saveOutcome(data: any, delay?: boolean) {
    this.touched = true;
    // retrieve current cached Map from storage and get the current cached value for given id
    const cache = this.objectCache$.getValue();
    const newValue = cache ? Object.assign(cache, data) : data;

    // if delay is true, combine the new properties with the object in the cache subject
    // the cache subject will automatically call this function again without a delay property
    if (delay) {
      this.outcomeCache$.next(newValue);
    } else {
      // if the outcome isn't saveable or there was no data given to the function, do nothing
      const canSave =
        this.validator.outcomeValidator.outcomeSaveable(newValue.id) ||
        newValue;
      if (!canSave) {
        return;
      }

      // clear the cache here so that new requests start a new cache
      this.outcomeCache$.next(undefined);

      if (this.objectCache$.getValue()) {
        this.saveObject(this.objectCache$.getValue());
      }
    }
  }

  /**
   * Handles service interaction for adding a mapping to a LearningOutcome
   *
   * @private
   * @param {Partial<LearningOutcome>} outcome
   * @memberof BuilderStore
   */
  private addGuideline(outcome: Partial<LearningOutcome>) {
    this.serviceInteraction$.next(true);
    this.learningObjectService
      .addGuideline(this.learningObject.id, outcome, this._learningObject.author.username)
      .then(() => {
        this.serviceInteraction$.next(false);
      })
      .catch(e => this.handleServiceError(e, BUILDER_ERRORS.UPDATE_OUTCOME));
  }

    /**
   * Handles service interaction for deleting a mapping to a LearningOutcome
   *
   * @private
   * @param {Partial<LearningOutcome>} outcome
   * @memberof BuilderStore
   */
  private deleteGuideline(outcomeId: string, mappingId: string) {
    this.serviceInteraction$.next(true);
    this.learningObjectService
      .deleteGuideline(this.learningObject.id, outcomeId, this._learningObject.author.username, mappingId)
      .then(() => {
        this.serviceInteraction$.next(false);
      })
      .catch(e => this.handleServiceError(e, BUILDER_ERRORS.UPDATE_OUTCOME));
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
    this.serviceInteraction$.next(null);
    // If Angular's HTTP API has trouble connecting to an external API the status code will be 0
    if (error.status === 0 || error.status === 500) {
      this.serviceError$.next(BUILDER_ERRORS.SERVICE_FAILURE);
    } else {
      this.serviceError$.next(builderError);
    }
  }
}
