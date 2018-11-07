import { Injectable } from '@angular/core';
import { LearningObject, LearningOutcome, User } from '@cyber4all/clark-entity';
import { AuthService } from 'app/core/auth.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { verbs } from '@cyber4all/clark-taxonomy';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import {
  LearningObjectValidator,
  OBJECT_ERRORS
} from './validators/learning-object.validator';
import { Url } from '@cyber4all/clark-entity/dist/learning-object';

/**
 * Defines a list of actions the builder can take
 *
 * @export
 * @enum {number}
 */
export enum BUILDER_ACTIONS {
  CREATE_OUTCOME,
  DELETE_OUTCOME,
  MUTATE_OUTCOME,
  MAP_STANDARD_OUTCOME,
  UNMAP_STANDARD_OUTCOME,
  MUTATE_OBJECT,
  ADD_MATERIALS,
  DELETE_MATERIALS,
  ADD_CONTRIBUTOR,
  REMOVE_CONTRIBUTOR,
  ADD_URL,
  UPDATE_URL,
  REMOVE_URL,
  UPDATE_MATERIAL_NOTES,
  UPDATE_FILE_DESCRIPTION,
  UPDATE_FOLDER_DESCRIPTION
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

  // manages a cache of object data that needs to be saved (debounced)
  private objectCache$: BehaviorSubject<any> = new BehaviorSubject(undefined);

  // manages a cache of outcome data that needs to be saved (debounced)
  private outcomeCache$: BehaviorSubject<any> = new BehaviorSubject(undefined);

  // fired when this service is destroyed
  private destroyed$: Subject<void> = new Subject();

  // fired when this service needs to propagate changes to the learning object down to children components
  public learningObjectEvent: BehaviorSubject<
    LearningObject
  > = new BehaviorSubject(undefined);

  // fired when this service needs to propagate changes to the learning object down to children components
  public outcomeEvent: BehaviorSubject<
    Map<string, LearningOutcome>
  > = new BehaviorSubject(undefined);

  // true when there is a save operation in progress or while there are changes that are cached but not yet saved
  public serviceInteraction$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );

  constructor(
    private auth: AuthService,
    private learningObjectService: LearningObjectService,
    private validator: LearningObjectValidator
  ) {
    // subscribe to our objectCache$ observable and initiate calls to save object after a debounce
    this.objectCache$
      .pipe(
        debounceTime(650),
        takeUntil(this.destroyed$)
      )
      .subscribe(cache => {
        if (cache !== undefined) {
          // cache is undefined on initial subscription and immediately after a save request has been successfully initiated
          this.saveObject(cache);
        }
      });

    // subscribe to our outcomeCache$ observable and initiate calls to save outcome after a debounce
    this.outcomeCache$
      .pipe(
        debounceTime(650),
        takeUntil(this.destroyed$)
      )
      .subscribe(cache => {
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

    if (object.status === 'published') {
      this.validator.submissionMode = true;
    }
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
   * Retrieve a learning object from the service by id
   *
   * @param {string} id
   * @returns {Promise<LearningObject>}
   * @memberof BuilderStore
   */
  async fetch(id: string): Promise<LearningObject> {
    this.learningObject = await this.learningObjectService.getLearningObject(
      id
    );
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
    this.learningObject.goals = [{ text: '' }]; // initialzie empty description
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
      case BUILDER_ACTIONS.MUTATE_OBJECT:
        return await this.mutateObject(data);
      case BUILDER_ACTIONS.CREATE_OUTCOME:
        return await this.createOutcome();
      case BUILDER_ACTIONS.DELETE_OUTCOME:
        return await this.deleteOutcome(data.id);
      case BUILDER_ACTIONS.MUTATE_OUTCOME:
        return await this.mutateOutcome(data.id, data.params);
      case BUILDER_ACTIONS.MAP_STANDARD_OUTCOME:
        return await this.mapStandardOutcomeMapping(
          data.id,
          data.standardOutcome
        );
      case BUILDER_ACTIONS.UNMAP_STANDARD_OUTCOME:
        return await this.unmapStandardOutcomeMapping(
          data.id,
          data.standardOutcome
        );
      case BUILDER_ACTIONS.ADD_CONTRIBUTOR:
        return await this.addContributor(data.user);
      case BUILDER_ACTIONS.REMOVE_CONTRIBUTOR:
        return await this.removeContributor(data.user);
      case BUILDER_ACTIONS.ADD_URL:
        return await this.addUrl();
      case BUILDER_ACTIONS.UPDATE_URL:
        return await this.updateUrl(data.index, data.url);
      case BUILDER_ACTIONS.REMOVE_URL:
        return await this.removeUrl(data);
      case BUILDER_ACTIONS.UPDATE_MATERIAL_NOTES:
        return await this.updateNotes(data);
      case BUILDER_ACTIONS.UPDATE_FILE_DESCRIPTION:
        return await this.updateFileDescription(data.id, data.description);
      case BUILDER_ACTIONS.UPDATE_FOLDER_DESCRIPTION:
        return await this.updateFolderDescription({
          path: data.path,
          index: data.index,
          description: data.description
        });
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

    return outcome.id;
  }

  private async deleteOutcome(id: string) {
    // TODO service call here
    this.outcomes.delete(id);
    this.outcomeEvent.next(this.outcomes);
  }

  private async mutateOutcome(
    id: string,
    params: { verb?: string; bloom?: string; text?: string }
  ) {
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

    this.saveOutcome(
      {
        id: outcome.id,
        bloom: outcome.bloom,
        verb: outcome.verb,
        text: outcome.text
      },
      true
    );

    return outcome;
  }

  private async mapStandardOutcomeMapping(
    id: string,
    standardOutcome: LearningOutcome
  ) {
    const outcome = this.outcomes.get(id);
    outcome.mappings.push(standardOutcome);

    this.outcomes.set(outcome.id, outcome);
    this.outcomeEvent.next(this.outcomes);

    this.saveOutcome(
      { id: outcome.id, mappings: outcome.mappings.map(x => x.id) },
      true
    );
  }

  private unmapStandardOutcomeMapping(
    id: string,
    standardOutcome: LearningOutcome
  ) {
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

    this.saveOutcome(
      { id: outcome.id, mappings: outcome.mappings.map(x => x.id) },
      true
    );
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

  private addContributor(user: User) {
    this.learningObject.contributors.push(user);

    this.saveObject(
      {
        contributors: this.learningObject.contributors.map(x => x.id)
      },
      true
    );
  }

  private removeContributor(user: User) {
    // TODO send array of ids to server
    const index = this.learningObject.contributors
      .map(x => x.username)
      .indexOf(user.username);
    if (index >= 0) {
      this.learningObject.contributors.splice(index, 1);

      this.saveObject(
        {
          contributors: this.learningObject.contributors.map(x => x.id)
        },
        true
      );
    } else {
      console.error(
        'Error removing contributor! User not found in contributors array!'
      );
    }
  }

  /**
   * Adds Url to Learning Object's materials
   *
   * @memberof BuilderStore
   */
  addUrl(): void {
    this.learningObject.materials.urls.push({ url: '', title: '' });
  }

  /**
   * Updates Url at given index
   *
   * @param {number} index
   * @param {Url} url
   * @memberof BuilderStore
   */
  async updateUrl(index: number, url: Url): Promise<any> {
    if (!url.url.match(/https?:\/\/.+/i)) {
      url.url = `http://${url.url}`;
    }
    this.learningObject.materials.urls[index] = url;
    this.saveObject(this.learningObject.materials.urls);
  }

  /**
   * Removes Url from Learning Object's materials at given index
   *
   * @param {number} index
   * @memberof BuilderStore
   */
  async removeUrl(index: number): Promise<any> {
    if (index !== undefined) {
      this.learningObject.materials.urls.splice(index, 1);
    }
    this.saveObject(this.learningObject.materials.urls);
  }

  /**
   * Updates Learning Object's material notes
   *
   * @param {string} notes
   * @returns {*}
   * @memberof BuilderStore
   */
  async updateNotes(notes: string): Promise<any> {
    this.learningObject.materials.notes = notes;
    this.saveObject(this.learningObject.materials.notes);
  }

  /**
   * Updates description for file and re-fetches Learning Object
   *
   * @param {*} fileId
   * @param {*} description
   * @returns {Promise<any>}
   * @memberof BuilderStore
   */
  async updateFileDescription(fileId: any, description: any): Promise<any> {
    await this.learningObjectService.updateFileDescription(
      this.learningObject.author.username,
      this.learningObject.id,
      fileId,
      description
    );
    this.learningObject.materials = await this.learningObjectService.getMaterials(
      this.learningObject.author.username,
      this.learningObject.id
    );
  }

  /**
   * Updates folder description if index is provided. Else creates adds new folder description
   *
   * @param {string} [path]
   * @param {number} [index]
   * @param {string} description
   * @returns {Promise<any>}
   * @memberof BuilderStore
   */
  async updateFolderDescription(params: {
    path?: string;
    index?: number;
    description: string;
  }): Promise<any> {
    if (params.index !== undefined) {
      this.learningObject.materials.folderDescriptions[
        params.index
      ].description = params.description;
    } else {
      this.learningObject.materials.folderDescriptions.push({
        path: params.path,
        description: params.description
      });
    }
    await this.saveObject(this.learningObject.materials.folderDescriptions);
    this.learningObject.materials = await this.learningObjectService.getMaterials(
      this.learningObject.author.username,
      this.learningObject.id
    );
  }

  ///////////////////////////
  //  SERVICE INTERACTION  //
  ///////////////////////////

  // TODO break this into separate functions
  private async saveObject(data: any, delay?: boolean): Promise<any> {
    let value = this.objectCache$.getValue();

    if (delay || this.serviceInteraction$.getValue()) {
      const newValue = value ? Object.assign(value, data) : data;
      this.objectCache$.next(newValue);
    } else {
      // don't attempt to save if object isn't saveable, but keep cache so that we can try again later
      if (!this.validator.saveable) {
        return;
      }

      this.serviceInteraction$.next(true);

      // clear the cache before submission so that any late arrivals will be cached for the next query
      this.objectCache$.next(undefined);

      if (!value) {
        // if value is undefined here, this means we've called this function without a delay and there aren't any cached values
        // in this case we'll use the current data instead
        value = data;
      }

      if (!this.learningObject.id) {
        // this is a new learning object and we've been given a saveable name

        // append status property to data
        value.status = 'unpublished';

        console.log('creating', value);

        // create the object
        this.learningObjectService
          .create(value)
          .then((object: LearningObject) => {
            this.learningObject = object;
            this.serviceInteraction$.next(false);
          })
          .catch(err => {
            this.serviceInteraction$.next(false);
            if (err.status === 409) {
              // tried to save an object with a name that already exists
              this.validator.errors.saveErrors.set(
                'name',
                OBJECT_ERRORS.EXISTING_NAME
              );
              return;
            }
            console.error('Error! ', err);
          });
      } else {
        // this is an existing object and we can save it (has a saveable name)

        // append learning object id to payload
        value.id = this.learningObject.id;

        console.log('saving', value);

        // send cached changes to server
        this.learningObjectService
          .save(value)
          .then(() => {
            this.serviceInteraction$.next(false);
          })
          .catch(err => {
            this.serviceInteraction$.next(false);
            if (err.status === 409) {
              // tried to save an object with a name that already exists
              this.validator.errors.saveErrors.set(
                'name',
                OBJECT_ERRORS.EXISTING_NAME
              );
              return;
            }
            console.error('Error! ', err);
          });
      }
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

      // service call
      this.learningObjectService
        .saveOutcome(this.learningObject.id, data)
        .then(() => {
          this.serviceInteraction$.next(false);
        })
        .catch(err => {
          console.error('Error! ', err);
          this.serviceInteraction$.next(false);
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
