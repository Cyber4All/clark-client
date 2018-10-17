import { Injectable } from '@angular/core';
import { LearningObject, LearningOutcome } from '@cyber4all/clark-entity';
import { HttpClient } from '@angular/common/http';
import { USER_ROUTES } from '@env/route';
import { AuthService } from 'app/core/auth.service';
import { Subject } from 'rxjs';
import { verbs } from '@cyber4all/clark-taxonomy';

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
  MUTATE_OBJECT = 5
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

  event: Subject<{type: string, payload: any}> = new Subject();

  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Retrieve stored learning object
   *
   * @readonly
   * @memberof BuilderStore
   */
  get learningObject() {
    return this._learningObject;
  }

  /**
   * Retrieve stored outcomes
   *
   * @memberof BuilderStore
   */
  get outcomes() {
    return this._outcomesMap;
  }

  /**
   * Set stored learning object
   *
   * @param {LearningObject} object the object to set
   * @memberof BuilderStore
   */
  set learningObject(object: LearningObject) {
    this._learningObject = object;
    this.event.next({type: 'object', payload: this.learningObject});
  }

  /**
   * Set stored outcomes
   *
   * @memberof BuilderStore
   */
  set outcomes(map: Map<string, LearningOutcome>) {
    this._outcomesMap = map;
    this.event.next({type: 'outcome', payload: this.outcomes});
  }

  /**
   * Retrieve a learning object from the service by name
   *
   * @param {string} name
   * @returns {Promise<LearningObject>}
   * @memberof BuilderStore
   */
  async fetch(name: string): Promise<LearningObject> {
    // TODO replace this code with a call to the onion's LearningObjectService
    const res: any = await this.http
      .get(USER_ROUTES.GET_LEARNING_OBJECT(this.auth.username, name), {
        withCredentials: true
      })
      .toPromise();
    this.learningObject = LearningObject.instantiate(res);
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

  ///////////////////////////////
  //  BUILDER ACTION HANDLERS  //
  ///////////////////////////////

  private async createOutcome() {
    const outcome = new LearningOutcome(this.learningObject);
    outcome.id = genId();

    this.outcomes.set(outcome.id, outcome);
    this.event.next({type: 'outcome', payload: this.outcomes});
    // TODO service call here

    return outcome.id;
  }

  private async deleteOutcome(id: string) {
    // TODO service call here
    this.outcomes.delete(id);
    this.event.next({ type: 'outcome', payload: this.outcomes });
  }

  private async mutateOutcome(id: string, params: {verb?: string, bloom?: string, text?: string}) {
    const outcome = this.outcomes.get(id);

    if (params.bloom && params.bloom !== outcome.bloom) {
      outcome.bloom = params.bloom;
      outcome.verb = Array.from(verbs[params.bloom].values())[0];
    } else if (params.verb) {
      outcome.verb = params.verb;
    } else if (typeof params.text === 'string') {
      // TODO debounce here
      outcome.text = params.text;
    }

    this.outcomes.set(outcome.id, outcome);
    this.event.next({type: 'outcome', payload: this.outcomes});

    // TODO delayed service interaction here
  }

  private async mapStandardOutcomeMapping(id: string, standardOutcome: LearningOutcome) {
    const outcome = this.outcomes.get(id);
    outcome.mappings.push(standardOutcome);

    this.outcomes.set(outcome.id, outcome);
    this.event.next({type: 'outcome', payload: this.outcomes});

    // TODO service call here
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
    this.event.next({type: 'outcome', payload: this.outcomes});
  }

  // TODO type this parameter
  private mutateObject(data: any) {
    const dataProperties = Object.keys(data);

    // TODO optimize this
    for (const k of dataProperties) {
      this.learningObject[k] = data[k];
    }

    // TODO debounced service call here
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
