import { Injectable } from '@angular/core';
import { LearningObject, LearningOutcome } from '@cyber4all/clark-entity';
import { HttpClient } from '@angular/common/http';
import { USER_ROUTES } from '@env/route';
import { AuthService } from 'app/core/auth.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { verbs } from '@cyber4all/clark-taxonomy';
import { LearningObjectService } from 'app/onion/core/learning-object.service';

/**
 * Defines a list of actions the builder can take
 *
 * @export
 * @enum {number}
 */
export enum BUILDER_ACTIONS {
  CREATE_OUTCOME = 0,
  DELETE_OUTCOME = 1,
  MUTATE_OUTCOME = 2,
  MAP_STANDARD_OUTCOME = 3,
  UNMAP_STANDARD_OUTCOME = 4,
  MUTATE_OBJECT = 5,
  ADD_MATERIALS = 6,
  DELETE_MATERIALS = 7
}

/**
 * A central storage repository for communication between learning object builder components.
 * Maintains a redux-like store for all possible actions as well as handlers for accepting those actions.
 *
 * @export
 * @class BuilderStore
 */
@Injectable()
export class BuilderStore {
  private _learningObject: LearningObject;
  private _outcomesMap: Map<string, LearningOutcome> = new Map();

  // manages a cache of data that needs to be saved (debounced)
  private objectCache$: BehaviorSubject<any> = new BehaviorSubject(undefined);

  private outcomeCache$: BehaviorSubject<any> = new BehaviorSubject(undefined);

  // fired when this service is destroyed
  private destroyed$: Subject<void> = new Subject();

  // fired when this service needs to propagate changes to the learning object down to children components
  public learningObjectEvent: BehaviorSubject<LearningObject> = new BehaviorSubject(undefined);

  // fired when this service needs to propagate changes to the learning object down to children components
  public outcomeEvent: BehaviorSubject<Map<string, LearningOutcome>> = new BehaviorSubject(undefined);

  // true when there is a save operation in progress or while there are changes that are cached but not yet saved
  public serviceInteraction: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private http: HttpClient, private auth: AuthService, private learningObjectService: LearningObjectService) {
    // subscribe to our objectCache$ observable and initiate calls to save object after a debounce
    this.objectCache$.pipe(
      debounceTime(650),
      takeUntil(this.destroyed$)
    ).subscribe(cache => {
      if (cache !== undefined) {
        // cache is undefined on initial subscription and immediately after a save request has been successfully initiated
        this.saveObject(cache);
      }
    });

    // subscribe to our outcomeCache$ observable and initiate calls to save outcome after a debounce
    this.outcomeCache$.pipe(
      debounceTime(650),
      takeUntil(this.destroyed$)
    ).subscribe(cache => {
      if (cache !== undefined) {
        // cache is undefined on initial subscription and immediately after a save request has been successfully initiated
        this.saveOutcome(cache);
      }
    });
  }

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
  }

  /**
   * Set stored outcomes
   *
   * @memberof BuilderStore
   */
  private set outcomes(map: Map<string, LearningOutcome>) {
    this._outcomesMap = map;
    this.outcomeEvent.next(this.outcomes);
  }

  /**
   * Retrieve a learning object from the service by name
   *
   * @param {string} name
   * @returns {Promise<LearningObject>}
   * @memberof BuilderStore
   */
  async fetch(name: string): Promise<LearningObject> {
    this.learningObject = await this.learningObjectService.getLearningObject(name);
    this.outcomes = this.parseOutcomes(this.learningObject.outcomes);
    return this.learningObject;
  }

  /**
   * Creates and stores a new blank learning object
   *
   * @returns {LearningObject} new blank learning object
   * @memberof BuilderStore
   */
  makeNew(): LearningObject {
    this.learningObject = new LearningObject(this.auth.user);
    this.outcomes = new Map();
    return this.learningObject;
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
    return new Map(outcomes.map((outcome): [string, LearningOutcome] => [outcome.id, outcome]));
  }

  /**
   * Executes a specific action handler based on the passed action parameter
   *
   * @param {number} action predefined action from the BUILDER_ACTIONS enum
   * @param {*} [data] (optional) data that should be passed to action handler
   * @returns {Promise<any>}
   * @memberof BuilderStore
   */
  async execute(action: number, data?: any): Promise<any> {
    switch (action) {
      case BUILDER_ACTIONS.MUTATE_OBJECT:
        return await this.mutateObject(data);
      case BUILDER_ACTIONS.CREATE_OUTCOME:
        return await this.createOutcome();
      case BUILDER_ACTIONS.DELETE_OUTCOME:
        return await this.deleteOutcome(data.id);
      case BUILDER_ACTIONS.MUTATE_OUTCOME:
        return await this.mutateOutcome(data.id, data.params);
      case BUILDER_ACTIONS.MAP_STANDARD_OUTCOME:
        return await this.mapStandardOutcomeMapping(data.id, data.standardOutcome);
      case BUILDER_ACTIONS.UNMAP_STANDARD_OUTCOME:
        return await this.unmapStandardOutcomeMapping(data.id, data.standardOutcome);
      default:
        console.error('Error! Invalid action taken!');
        return;
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

  private async createOutcome() {
    const outcome = new LearningOutcome(this.learningObject);
    outcome.id = genId();

    this.outcomes.set(outcome.id, outcome);
    this.outcomeEvent.next(this.outcomes);

    // TODO service interaction here

    return outcome.id;
  }

  private async deleteOutcome(id: string) {
    // TODO service call here
    this.outcomes.delete(id);
    this.outcomeEvent.next(this.outcomes);
  }

  private async mutateOutcome(id: string, params: {verb?: string, bloom?: string, text?: string}) {
    const outcome = this.outcomes.get(id);

    if (params.bloom && params.bloom !== outcome.bloom) {
      outcome.bloom = params.bloom;
      outcome.verb = Array.from(verbs[params.bloom].values())[0];
    } else if (params.verb) {
      outcome.verb = params.verb;
    } else if (typeof params.text === 'string') {
      outcome.text = params.text;
    }

    this.outcomes.set(outcome.id, outcome);
    this.outcomeEvent.next(this.outcomes);

    this.saveOutcome({ id: outcome.id, bloom: outcome.bloom, verb: outcome.verb, text: outcome.text }, true);
  }

  private async mapStandardOutcomeMapping(id: string, standardOutcome: LearningOutcome) {
    const outcome = this.outcomes.get(id);
    outcome.mappings.push(standardOutcome);

    this.outcomes.set(outcome.id, outcome);
    this.outcomeEvent.next(this.outcomes);

    this.saveOutcome({ id: outcome.id, mappings: outcome.mappings.map(x => x.id) }, true);
  }

  private unmapStandardOutcomeMapping(id: string, standardOutcome: LearningOutcome) {
    const outcome = this.outcomes.get(id);
    const mappedOutcomes = outcome.mappings;

    for (let i = 0, l = mappedOutcomes.length; i < l; i++) {
      if (mappedOutcomes[i].id === standardOutcome.id) {
        outcome.mappings.splice(i, 1);
        break;
      }
    }

    this.outcomes.set(outcome.id, outcome);
    this.outcomeEvent.next(this.outcomes);

    this.saveOutcome({ id: outcome.id, mappings: outcome.mappings.map(x => x.id) }, true);
  }

  // TODO type this parameter
  private mutateObject(data: any) {
    const dataProperties = Object.keys(data);

    // TODO optimize this
    for (const k of dataProperties) {
      this.learningObject[k] = data[k];
    }

    this.saveObject(data, true);
  }

  ///////////////////////////
  //  SERVICE INTERACTION  //
  ///////////////////////////

  private async saveObject(data: any, delay?: boolean) {
    const value = this.objectCache$.getValue();

    this.serviceInteraction.next(true);

    if (delay) {
      const newValue = value ? Object.assign(value, data) : data;
      this.objectCache$.next(newValue);
    } else {
      // clear the cache before submission so that any late arrivals will be cached for the next query
      this.objectCache$.next(undefined);

      // append learning object id to payload
      value.id = this.learningObject.id;

      console.log('saving object changes', value);

      // send cached changes to server
      this.learningObjectService.save(value).then(() => {
        this.serviceInteraction.next(false);
      }).catch((err) => {
        console.log('Error! ', err);
        this.serviceInteraction.next(false);
      });
    }
  }

  private async saveOutcome(data: any, delay?: boolean) {
    if (delay) {
      const id = data.id;

      // ensure that an outcome id is spepcified
      if (!id) {
        throw new Error('Error! No outcome id specified for mutation!');
      }

      // retrieve current cached Map from storage and get the current cached value for given id
      const value = this.outcomeCache$.getValue();

      const newValue = value ? Object.assign(value, data) : data;
      this.outcomeCache$.next(newValue);
    } else {
      // clear the cache here so that new requests start a new cache
      this.outcomeCache$.next(undefined);

      delete data.id;

      console.log('saving outcome', data);

      // service call
      this.learningObjectService.saveOutcome(this.learningObject.id, data).then(() => {
        this.serviceInteraction.next(false);
      }).catch((err) => {
        console.log('Error! ', err);
        this.serviceInteraction.next(false);
      });
    }
  }
}

/**
   * Generate a unique id.
   * Used for learning outcomes that are blank and cannot be published. Replaced once saveable with an ID from the service
   */
  function genId() {
    const S4 = function() {
      // tslint:disable-next-line:no-bitwise
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      S4() +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      S4() +
      S4()
    );
  }
