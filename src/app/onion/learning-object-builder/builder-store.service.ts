import { Injectable } from '@angular/core';
import {
  LearningObject,
  LearningOutcome,
  User,
  StandardOutcome
} from '@entity';
import { AuthService } from 'app/core/auth.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { taxonomy } from '@cyber4all/clark-taxonomy';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { LearningObjectValidator } from './validators/learning-object.validator';
import { CollectionService } from 'app/core/collection.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FileUploadMeta } from './components/content-upload/app/services/typings';
import { Title } from '@angular/platform-browser';

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
  ADD_FILE_META,
  DELETE_MATERIALS,
  ADD_CONTRIBUTOR,
  REMOVE_CONTRIBUTOR,
  ADD_URL,
  UPDATE_URL,
  REMOVE_URL,
  UPDATE_MATERIAL_NOTES,
  UPDATE_FILE_DESCRIPTION,
  UPDATE_FOLDER_DESCRIPTION,
  DELETE_FILES
}

export enum BUILDER_ERRORS {
  CREATE_OBJECT,
  DUPLICATE_OBJECT_NAME,
  CREATE_OUTCOME,
  FETCH_OBJECT,
  FETCH_OBJECT_MATERIALS,
  UPDATE_FILE_DESCRIPTION,
  UPDATE_OBJECT,
  UPDATE_OUTCOME,
  SUBMIT_REVIEW,
  CANCEL_SUBMISSION,
  DELETE_OUTCOME,
  ADD_FILE_META,
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

  // keep track of outcomes that exist locally haven't been saved to service yet
  private newOutcomes: Map<string, any> = new Map();

  // manages a cache of object data that needs to be saved (debounced)
  private objectCache$: BehaviorSubject<any> = new BehaviorSubject(undefined);

  // manages a cache of outcome data that needs to be saved (debounced)
  private outcomeCache$: BehaviorSubject<any> = new BehaviorSubject(undefined);

  // fired when this service is destroyed
  private destroyed$: Subject<void> = new Subject();

  // false until a save operation is attempted, true after that
  public touched: boolean;

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

  constructor(
    private auth: AuthService,
    private learningObjectService: LearningObjectService,
    private collectionService: CollectionService,
    private validator: LearningObjectValidator,
    private titleService: Title
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

  /**
   * Retrieve a learning object from the service by id
   *
   * @param {string} id
   * @returns {Promise<LearningObject>}
   * @memberof BuilderStore
   */
  fetch(id: string): Promise<LearningObject> {
    this.touched = true;
    return this.learningObjectService
      .getLearningObject(id)
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
   * Retrieves materials for learning object
   *
   * @returns void
   * @memberof BuilderStore
   */
  fetchMaterials(): void {
    this.learningObjectService
      .getMaterials(this.learningObject.author.username, this.learningObject.id)
      .then(materials => {
        this.learningObject.materials = materials;
        this.learningObjectEvent.next(this.learningObject);
      })
      .catch(e => {
        this.handleServiceError(e, BUILDER_ERRORS.FETCH_OBJECT_MATERIALS);
      });
  }

  /**
   * Retrieves the learning objects children
   *
   */
  async getChildren(): Promise<LearningObject[]> {
    return await this.learningObjectService.getChildren(
      this.learningObject.id
    );

  }

  /**
   * Sets the learning objects children after they have been reorderd
   */
  async setChildren(children: string[]) {
    this.serviceInteraction$.next(true);
    await this.learningObjectService.setChildren(this.learningObject.name, this.learningObject.author.username, children);
    this.serviceInteraction$.next(false);
  }

  /**
   * Creates and stores a new blank learning object
   *
   * @returns {LearningObject} new blank learning object
   * @memberof BuilderStore
   */
  makeNew(): LearningObject {
    this.titleService.setTitle('New Learning Object | CLARK');
    this.learningObject = new LearningObject({ author: this.auth.user });
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
      case BUILDER_ACTIONS.ADD_FILE_META:
        return await this.addFileMeta(data.files);
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
      case BUILDER_ACTIONS.DELETE_FILES:
        return await this.removeFiles(data.fileIds);
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

  private createOutcome() {
    const outcome: Partial<LearningOutcome> = {
      bloom: '',
      verb: '',
      text: '',
      mappings: []
    };
    outcome.id = genId();

    // this outcome needs to be created in the API, not modified, so store it in newOutcomes map
    this.newOutcomes.set(outcome.id, true);

    this.outcomes.set(outcome.id, outcome);
    this.outcomeEvent.next(this.outcomes);

    this.validator.validateLearningOutcome(outcome);

    return outcome.id;
  }

  private deleteOutcome(id: string) {
    // grab the outcome that's about to be deleted
    const outcome: Partial<LearningOutcome> = this.outcomes.get(id);

    // delete the outcome
    this.outcomes.delete(id);
    this.outcomeEvent.next(this.outcomes);

    this.validator.validateLearningObject(this.learningObject, this.outcomes);

    // we make a service call here instead of referring to the saveObject method since the API has a different route for outcome deletion
    this.serviceInteraction$.next(true);
    this.learningObjectService
      .deleteOutcome(
        this.learningObject.id,
        (<Partial<LearningOutcome> & { serviceId?: string }>outcome)
          .serviceId || id
      )
      .then(() => {
        this.serviceInteraction$.next(false);
      })
      .catch(e => this.handleServiceError(e, BUILDER_ERRORS.DELETE_OUTCOME));
  }

  private mutateOutcome(
    id: string,
    params: { verb?: string; bloom?: string; text?: string }
  ) {
    const outcome = this.outcomes.get(id);

    if (params.bloom && params.bloom !== outcome.bloom) {
      outcome.bloom = params.bloom;
      outcome.verb = taxonomy.taxons[params.bloom].verbs[0];
    } else if (params.verb) {
      outcome.verb = params.verb;
    } else if (typeof params.text === 'string') {
      outcome.text = params.text;
    }

    this.outcomes.set(outcome.id, outcome);
    this.outcomeEvent.next(this.outcomes);

    // validateLearningObject here over validateLearningOutcome to remove a "must contain one valid outcome" error if it exists
    this.validator.validateLearningObject(this.learningObject, this.outcomes);

    this.saveOutcome(
      {
        id: outcome.id,
        bloom: outcome.bloom,
        verb: outcome.verb,
        text: outcome.text,
        serviceId: (<Partial<LearningOutcome> & { serviceId?: string }>outcome)
          .serviceId
      },
      true
    );

    return outcome;
  }

  private mapStandardOutcomeMapping(
    id: string,
    standardOutcome: StandardOutcome
  ) {
    const outcome = this.outcomes.get(id);
    outcome.mappings.push(standardOutcome);

    this.outcomes.set(outcome.id, outcome);
    this.outcomeEvent.next(this.outcomes);

    this.saveOutcome(
      {
        id:
          (<Partial<LearningOutcome> & { serviceId?: string }>outcome)
            .serviceId || outcome.id,
        mappings: outcome.mappings.map(x => x.id)
      },
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
      {
        id:
          (<Partial<LearningOutcome> & { serviceId?: string }>outcome)
            .serviceId || outcome.id,
        mappings: outcome.mappings.map(x => x.id)
      },
      true
    );
  }

  // TODO type this parameter
  private mutateObject(data: any) {
    const dataProperties = Object.keys(data);

    const learningObject: Partial<
      LearningObject
    > = this.learningObject.toPlainObject();

    for (const k of dataProperties) {
      learningObject[k] = data[k];
    }

    this.validator.validateLearningObject(learningObject, this.outcomes);

    if (!this.validator.get('name')) {
      this.learningObject = new LearningObject(learningObject);
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
  private async addFileMeta(files: FileUploadMeta[]): Promise<any> {
    this.serviceInteraction$.next(true);
    await this.learningObjectService
      .addFileMeta({
      files,
      username: this.learningObject.author.username,
      objectId: this.learningObject.id
      })
      .then(() => {
         this.fetchMaterials();
      })
      .catch(e => {
        this.handleServiceError(e, BUILDER_ERRORS.ADD_FILE_META);
    });
    this.serviceInteraction$.next(false);
  }
  /**
   * Adds Url to Learning Object's materials
   *
   * @memberof BuilderStore
   */
  private addUrl(): void {
    this.learningObject.materials.urls.push({ url: '', title: '' });
    this.learningObjectEvent.next(this.learningObject);
  }

  /**
   * Updates Url at given index
   * Also checks for valid Url and title field input against the supplied regex pattern
   * @param {number} index
   * @param {Url} url
   * @memberof BuilderStore
   */
  private updateUrl(index: number, url: LearningObject.Material.Url): void {
    const validUrlExpr = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    if (url.url.match(validUrlExpr) && url.title !== '') {
      this.learningObject.materials.urls[index] = url;
      this.learningObjectEvent.next(this.learningObject);
      this.saveObject({
        'materials.urls': this.learningObject.materials.urls
      });
    }
  }

  /**
   * Removes Url from Learning Object's materials at given index
   *
   * @param {number} index
   * @memberof BuilderStore
   */
  private removeUrl(index: number): void {
    if (index !== undefined) {
      this.learningObject.materials.urls.splice(index, 1);
    }
    this.learningObjectEvent.next(this.learningObject);
    this.saveObject({
      'materials.urls': this.learningObject.materials.urls
    });
  }

  /**
   * Updates Learning Object's material notes
   *
   * @param {string} notes
   * @returns {*}
   * @memberof BuilderStore
   */
  private updateNotes(notes: string): void {
    this.learningObject.materials.notes = notes;
    this.learningObjectEvent.next(this.learningObject);
    this.saveObject({ 'materials.notes': notes });
  }

  /**
   * Updates description for file and re-fetches Learning Object
   *
   * @param {*} fileId
   * @param {*} description
   * @returns void
   * @memberof BuilderStore
   */
  private updateFileDescription(fileId: any, description: any): void {
    const index = this.findFile(fileId);
    this.learningObject.materials.files[index].description = description;
    this.learningObjectService
      .updateFileDescription(
        this.learningObject.author.username,
        this.learningObject.id,
        fileId,
        description
      )
      .then(e => {
        this.learningObjectEvent.next(this.learningObject);
      })
      .catch(e =>
        this.handleServiceError(e, BUILDER_ERRORS.UPDATE_FILE_DESCRIPTION)
      );
  }

  /**
   * Updates folder description if index is provided. Else creates adds new folder description
   *
   * @param {string} [path]
   * @param {number} [index]
   * @param {string} description
   * @memberof BuilderStore
   */
  private updateFolderDescription(params: {
    path?: string;
    index?: number;
    description: string;
  }): void {
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
    this.learningObjectEvent.next(this.learningObject);
    this.saveObject({
      'materials.folderDescriptions': this.learningObject.materials
        .folderDescriptions
    });
  }

  /**
   * Removes files from array of file meta
   *
   * @private
   * @param {string[]} fileIds
   * @memberof BuilderStore
   */
  private removeFiles(fileIds: string[]) {
    fileIds.forEach(fileId => {
      const index = this.findFile(fileId);
      this.learningObject.materials.files.splice(index, 1);
    });
    this.learningObjectEvent.next(this.learningObject);
    this.learningObjectEvent.next(this.learningObject);
  }

  /**
   * Returns index of file
   *
   * @private
   * @param {string} fileId
   * @returns {number}
   * @memberof BuilderStore
   */
  private findFile(fileId: string): number {
    let index = -1;
    for (let i = 0; i < this.learningObject.materials.files.length; i++) {
      const file = this.learningObject.materials.files[i];
      if (file.id === fileId) {
        index = i;
        break;
      }
    }
    return index;
  }

  ///////////////////////////
  //  SERVICE INTERACTION  //
  ///////////////////////////

  /**
   * Checks for submittable object, returns true if it's submittable and false otherwise
   *@param {string} [collection]
   * @memberof BuilderStore
   */
  public canSubmit(): boolean {
    this.validator.validateLearningObject(this.learningObject, this.outcomes);
    this.validator.submissionMode = true;

    return this.validator.saveable && this.validator.submittable;
  }

  public cancelSubmission(): void {
    this.collectionService
      .unsubmit({
        learningObjectId: this.learningObject.id,
        userId: this.learningObject.author.id,
      })
      .then(() => {
        this.learningObject.status = LearningObject.Status.UNRELEASED;
        this.validator.submissionMode = false;
        this.learningObjectEvent.next(this.learningObject);
      })
      .catch(e => {
        this.handleServiceError(e, BUILDER_ERRORS.CANCEL_SUBMISSION);
      });
  }

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

      if (!this.learningObject.id) {
        this.createLearningObject(value);
      } else {
        // this is an existing object and we can save it (has a saveable name)
        this.updateLearningObject(value);
      }
    }

    if (this.outcomeCache$.getValue()) {
      this.saveOutcome(this.outcomeCache$.getValue());
    }
  }

  /**
   * Handles service interaction for creating a LearningObject
   *
   * @private
   * @param {Partial<LearningObject>} object
   * @memberof BuilderStore
   */
  private createLearningObject(object: Partial<LearningObject>) {
    this.serviceInteraction$.next(true);
    object.status = LearningObject.Status.UNRELEASED;
    this.learningObjectService
      .create(object, this.auth.username)
      .then(learningObject => {
        this.learningObject = learningObject;
        this.serviceInteraction$.next(false);
      })
      .catch(e => {
        this.serviceInteraction$.next(false);
        if (e.status === 409) {
          // tried to save an object with a name that already exists
          this.validator.errors.saveErrors.set(
            'name',
            'A learning object with this name already exists! The title should be unique within your learning objects.'
          );
          this.handleServiceError(e, BUILDER_ERRORS.DUPLICATE_OBJECT_NAME);
        } else {
          this.handleServiceError(e, BUILDER_ERRORS.CREATE_OBJECT);
        }
      });
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
        if (e.status === 409) {
          // tried to save an object with a name that already exists
          this.validator.errors.saveErrors.set(
            'name',
            'A learning object with this name already exists! The title should be unique within your learning objects.'
          );
          this.handleServiceError(e, BUILDER_ERRORS.DUPLICATE_OBJECT_NAME);
        } else {
          this.handleServiceError(e, BUILDER_ERRORS.UPDATE_OBJECT);
        }
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

      if (this.newOutcomes.get(newValue.id)) {
        // this is a new outcome that hasn't been saved, create it
        this.createLearningOutcome(newValue);
      } else {
        // this is an existing outcome, modify it
        this.updateLearningOutcome(newValue);
      }

      if (this.objectCache$.getValue()) {
        this.saveObject(this.objectCache$.getValue());
      }
    }
  }

  /**
   * Handles service interaction for creating a LearningOutcome
   *
   * @private
   * @param {LearningOutcome} newOutcome
   * @memberof BuilderStore
   */
  private createLearningOutcome(newOutcome: LearningOutcome) {
    this.serviceInteraction$.next(true);
    this.learningObjectService
      .addLearningOutcome(this.learningObject.id, newOutcome)
      .then((serviceId: string) => {
        this.serviceInteraction$.next(false);
        // delete the id from the newOutcomes map so that the next time it's modified, we know to save it instead of creating it
        this.newOutcomes.delete(newOutcome.id);
        // retrieve the outcome from the map keyed by it's temp ID, and then delete that entry;
        const outcome: Partial<LearningOutcome> & {
          serviceId?: string;
        } = this.outcomes.get(newOutcome.id);
        // store the temporary id in the outcome so that the page component know's which outcome to keep focused
        outcome.serviceId = serviceId;
        // re-enter outcome into map
        this.outcomes.set(newOutcome.id, outcome);
        this.outcomeEvent.next(this.outcomes);
      })
      .catch(e => this.handleServiceError(e, BUILDER_ERRORS.CREATE_OUTCOME));
  }

  /**
   * Handles service interaction for updating a LearningOutcome
   *
   * @private
   * @param {Partial<LearningOutcome>} outcome
   * @memberof BuilderStore
   */
  private updateLearningOutcome(outcome: Partial<LearningOutcome>) {
    // deep copy the value to modify it before sending it to the service
    const updateValue: Partial<LearningOutcome> & {
      serviceId?: string;
    } = Object.assign(outcome);
    // if this item has a serviceId property, it was created during this session and thus it's ID property was generated here
    // and doesn't correspond with it's id in the database. Replace the id property with the serviceId property before sending
    if (updateValue.serviceId) {
      updateValue.id = updateValue.serviceId;
    }
    // delete any lingering serviceId properties before sending to service
    delete updateValue.serviceId;
    this.serviceInteraction$.next(true);
    this.learningObjectService
      .saveOutcome(this.learningObject.id, updateValue as any)
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

/**
 * Generate a unique id. (straight from stack overflow)
 * Used for learning outcomes that are blank and cannot be saved. Replaced once saveable with an ID from the service
 */
function genId() {
  const S4 = () => {
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
