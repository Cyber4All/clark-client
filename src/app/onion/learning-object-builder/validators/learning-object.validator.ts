import { Injectable } from '@angular/core';
import { LearningOutcomeErrorGroup, LearningOutcomeValidator } from './learning-outcome.validator';
import { LearningOutcome, LearningObject } from '@cyber4all/clark-entity';

export const OBJECT_ERRORS = {
  NO_NAME: 'Learning object must have a name',
  SHORT_NAME: 'A learning object\'s name must be longer than 3 characters',
  EXISTING_NAME: 'A learning object with this name already exists',
  NO_DESCRIPTION: 'A learning object must have a description',
  NO_LEVELS: 'A learning object must have academic levels',
  NO_OUTCOMES: 'A learning object must have learning outcomes'
};

export const OUTCOME_ERRORS = {
  NO_VERB: 'A learning outcome must have a verb to save',
  NO_BLOOM: 'A learning outcome must have a bloom level to save',
  NO_TEXT: 'A learning outcome must have text to submit'
};

export interface LearningObjectError {
  [key: string]: {
    value: any,
    error: string
  };
}

/**
 * This class holds all errors in the current learning object and separates them into
 * two category: errors that prevent saving, and errors that prevent submitting
 *
 * @export
 * @class LearningObjectErrorGroup
 */
export class LearningObjectErrorGroup {
  private _saveErrors: Map<string, string> = new Map();
  private _submitErrors: Map<string, string> = new Map();

  /**
   * Return a  map containing all errors that prevent the Learning Object from saving
   *
   * @readonly
   * @memberof LearningObjectErrorGroup
   */
  get saveErrors() {
    return this._saveErrors;
  }

  /**
   * Return a  map containing all errors that prevent the Learning Object from submitting
   *
   * @readonly
   * @memberof LearningObjectErrorGroup
   */
  get submitErrors() {
    return this._submitErrors;
  }

  /**
   * Set an error for a particular learning object field
   *
   * @param {('save' | 'submit')} type the type of error to be set
   * @param {string} property the property on which to set the error
   * @param {string} error the client-presentable error text
   * @memberof LearningObjectErrorGroup
   */
  setError(type: 'save' | 'submit', property: string, error: string) {
    if (type === 'save') {
      this.saveErrors.set(property, error);
    } else if (type === 'submit') {
      this.submitErrors.set(property, error);
    }
  }

  /**
   * Delete an error from a property. If no type is specified, remove's the error from the first map it's found in,
   * starting with the saveErrors map.
   *
   * @param {string} property the property on which to delete the error
   * @param {('save' | 'submit')} [type] the map from which to delete the error
   * @memberof LearningObjectErrorGroup
   */
  deleteError(property: string, type?: 'save' | 'submit') {
    if (type) {
      if (type === 'save') {
        this.saveErrors.delete(property);
      } else if (type === 'submit') {
        this.submitErrors.delete(property);
      }
    } else {
      // we didn't specify a type, so remove from the first one we find
      if (!this.saveErrors.delete(property)) {
        this.submitErrors.delete(property);
      }
    }
  }
}

/**
 * This class get's injected into the builder and the builder-store and is responsible for
 * acting as the single point of truth for all learning object errors in the builder.
 *
 * @export
 * @class LearningObjectValidator
 */
@Injectable()
export class LearningObjectValidator {
  submissionMode: boolean;
  errors = new LearningObjectErrorGroup();

  constructor(public outcomeValidator: LearningOutcomeValidator) {}

  /**
   * Returns a boolean that reflects whether or not this object has any errors
   * that would prevent it from being saved.
   *
   * @returns {boolean}
   * @memberof LearningObjectValidator
   */
  get saveable(): boolean {
    return !this.errors.saveErrors.size;
  }

  /**
   * Returns a boolean that reflects whether or not this object has any errors
   * that would prevent it from being submitted.
   *
   * @returns {boolean}
   * @memberof LearningObjectValidator
   */
  get submittable(): boolean {
    return !this.errors.submitErrors.size && !this.outcomeValidator.errors.submitErrors.size;
  }

  /**
   * Calls validator functions directly on relevant properties of a learning object and stores the results
   *
   * @param {LearningObject} object
   * @memberof LearningObjectValidator
   */
  validateLearningObject(object: LearningObject) {
    this.validateName(object.name);
    this.validateAcademicLevels(object.levels);
    this.validateDescription(object.goals[0].text);

    if (object.outcomes && object.outcomes.length) {
      for (const o of object.outcomes) {
        this.validateOutcome(o);
      }
    } else {
      this.errors.setError('submit', 'outcomes', OBJECT_ERRORS.NO_OUTCOMES);
    }
  }

  /**
   * Returns the current error for the passed property. If submissionMode is true and
   * there is no error for the property in the saveErrors Map, the submitErrors map is checked
   *
   * @param {string} property
   * @returns {string | undefined}
   * @memberof LearningObjectValidator
   */
  get(property: string): string {
    let error = this.errors.saveErrors.get(property);

    if (this.submissionMode) {
      // if we're submitting and we haven't found a save error, check the submit errors
      if (!error) {
        error = this.errors.submitErrors.get(property);
      }
    }

    return error;
  }

  /**
   * Returns the current error for the passed outcome id. If submissionMode is true and
   * there is no error for the id in the outcomes saveErrors Map, the outcomes submitErrors map is checked
   *
   * @param {string} property
   * @returns {string | undefined}
   * @memberof LearningObjectValidator
   */
  getOutcome(id: string) {
    let error = this.outcomeValidator.errors.saveErrors.get(id);

    if (this.submissionMode) {
      if (!error) {
        error = this.outcomeValidator.errors.submitErrors.get(id);
      }
    }

    return error;
  }

  /**
   * Takes a property name and returns a boolean that reflects whether or not the property is
   * valid or not
   *
   * @param {string} property
   * @param {boolean} [submit]
   * @returns {boolean}
   * @memberof LearningObjectValidator
   */
  checkValidProperty(property: string, submit?: boolean): boolean {
    const value = !submit ? this.errors.saveErrors.get(property) : this.errors.submitErrors.get(property);

    // not tracking property so it should default to valid
    if (typeof value === 'undefined') {
      return true;
    }

    // tracking property but it's invalid
    if (value) {
      return false;
    }

    return true;
  }

  ///////////////////////////
  //  VALIDATOR FUNCTIONS  //
  ///////////////////////////

  /* All of these functions should either return a LearningObjectError object or null
  so that they can be used as FormGroup custom validators */

  /**
   * Validate a learning object's name
   *
   * @param {string} name
   * @returns {LearningObjectError | null}
   * @memberof LearningObjectValidator
   */
  validateName(name: string): LearningObjectError {
    this.errors.deleteError('name');

    let error;

    if (!name) {
      error = OBJECT_ERRORS.NO_NAME;
    } else if (name.length < 3) {
      error = OBJECT_ERRORS.SHORT_NAME;
    }

    if (error) {
      this.errors.setError('save', 'name', error);
      return { invalidName: { value: name, error } };
    }

    this.errors.deleteError('name');

    return null;
  }

  /**
   * Validate a learning object's description
   *
   * @param {string} description
   * @returns {(LearningObjectError | null)}
   * @memberof LearningObjectValidator
   */
  validateDescription(description: string): LearningObjectError {
    this.errors.deleteError('description');

    let error;

    if (!description || description === '') {
      error = OBJECT_ERRORS.NO_DESCRIPTION;
    }

    if (error) {
      this.errors.setError('submit', 'description', error);
      return { invalidDescription: { value: description, error } };
    }

    return null;
  }

  /**
   * Validate a learning object's list of academic levels
   *
   * @param {string[]} levels
   * @returns {LearningObjectError}
   * @memberof LearningObjectValidator
   */
  validateAcademicLevels(levels: string[]): LearningObjectError {
    this.errors.deleteError('levels');

    let error;

    if (!levels || !levels.length) {
      error = OBJECT_ERRORS.NO_LEVELS;
    }

    if (error) {
      this.errors.setError('submit', 'levels', error);
      return { invalidLevels: { value: levels, error } };
    }

    return null;
  }

  /**
   *  Validate a learning oultcome
   *
   * @param {string} id the id of the learning outcome
   * @param {string} bloom
   * @param {string} verb
   * @param {string} text
   * @returns {LearningObjectError}
   * @memberof LearningObjectValidator
   */
  validateOutcome(outcome: LearningOutcome): LearningObjectError {
    if (!outcome.id) {
      throw new Error('Error! No outcome id included!');
    }

    this.outcomeValidator.errors.deleteOutcomeError(outcome.id);

    let error;
    let errorType: 'save' | 'submit';
    let errorValue: 'verb' | 'bloom' | 'text';

    if (!outcome.bloom || outcome.bloom === '') {
      error = OUTCOME_ERRORS.NO_BLOOM;
      errorType = 'save';
      errorValue = 'bloom';
    } else if (!outcome.verb || outcome.verb === '') {
      error = OUTCOME_ERRORS.NO_VERB;
      errorType = 'save';
      errorValue = 'verb';
    } else if (!outcome.text || outcome.text === '') {
      error = OUTCOME_ERRORS.NO_TEXT;
      errorType = 'submit';
      errorValue = 'text';
    }

    if (error) {
      // add error to map
      this.outcomeValidator.errors.setOutcomeError(errorType, outcome.id, error);

      if (errorType === 'submit') {
        // since we're evaluating all save errors first, if we hit a submit error, clear any save errors from the map
        this.errors.deleteError('outcomes');
        this.outcomeValidator.errors.deleteOutcomeError(outcome.id, 'save');
      }

      // return an object that can be handled by an Angular FormGroup
      return { invalidOutcome: { value: outcome[errorValue], error } };
    }

    this.outcomeValidator.errors.deleteOutcomeError(outcome.id);
    return null;
  }
}
