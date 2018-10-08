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
  SET_NAME = 5,
  TOGGLE_ACADEMIC_LEVEL = 6
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
  fetch(name: string): Promise<LearningObject> {
    // TODO replace this code with a call to the onion's LearningObjectService
    return this.http
      .get(USER_ROUTES.GET_LEARNING_OBJECT(this.auth.username, name), {
        withCredentials: true
      })
      .toPromise()
      .then((res: any) => {
        this.learningObject = LearningObject.instantiate(res);
        this.outcomes = this.parseOutcomes(this.learningObject.outcomes);
        return this.learningObject;
      });
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
   * @param {*} data data that should be passed to action handler
   * @returns {Promise<any>}
   * @memberof BuilderStore
   */
  async execute(action: number, data: any): Promise<any> {
    switch (action) {
      case BUILDER_ACTIONS.CREATE_OUTCOME:
        return await this.createOutcome();
      case BUILDER_ACTIONS.DELETE_OUTCOME:
        return await this.deleteOutcome(data.id);
      case BUILDER_ACTIONS.MUTATE_OUTCOME:
        return this.mutateOutcome(data.id, data.params);
      default:
        console.error('Error! Invalid action taken!');
        return;
    }
  }

  ///////////////////////////////
  //  BUILDER ACTION HANDLERS  //
  ///////////////////////////////


  private async createOutcome() {
    throw new Error('Not yet implemented!');
  }

  private async deleteOutcome(id: string) {
    throw new Error('Not yet implemented!');
  }

  private async mutateOutcome(id: string, params: {verb?: string, bloom?: string, text?: string}) {
    let outcome = this.outcomes.get(id);


    if (Object.keys(params).includes('text')) {
      // TODO debounce this
    } else if  (Object.keys(params).includes('verb') && typeof params.verb === 'undefined') {
      outcome = new LearningOutcome(this.learningObject);
      outcome.id = id;
      this.outcomes.set(id, outcome);
    } else {
      if (params.bloom && params.bloom !== outcome.bloom) {
        outcome.bloom = params.bloom;
        outcome.verb = Array.from(verbs[params.bloom].values())[0];
      } else if (params.verb) {
        outcome.verb = params.verb;
      }

      // @ts-ignore
      this.outcomes.set(outcome.id, LearningOutcome.instantiate(this.learningObject, outcome));
      this.event.next({ type: 'outcome', payload: this.outcomes });
    }

    // TODO delayed service interaction here
  }

  private mapStandardOutcomeMapping(id: string, standardOutcomeId: string) {
    throw new Error('Not yet implemented!');
  }

  private unmapStandardOutcomeMapping(id: string, standardOutcomeId: string) {
    throw new Error('Not yet implemented!');
  }

  private setName(name: string) {
    throw new Error('Not yet implemented!');
  }

  private toggleAcademicLevel(level: string) {
    throw new Error('Not yet implemented!');
  }
}
