import { Injectable } from '@angular/core';
import { LearningOutcomeValidator } from './learning-outcome.validator';
import {
  LearningOutcome,
  LearningObject,
  SubmittableLearningOutcome,
  SubmittableLearningObject,
} from '@entity';

export interface LearningObjectError {
  [key: string]: {
    value: any;
    error: string;
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
   * Return a map containing all errors that prevent the Learning Object from saving
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
   * Retrieves the first string error for a learning object, checks save errors first, then checks submit errors if
   * no save errors found and submissionMode is true
   *
   * @readonly
   * @type {string}
   * @memberof LearningObjectValidator
   */
  get nextError(): string {
    let error: string = this.errors.saveErrors.values().next().value;

    if (!error) {
      error = this.outcomeValidator.errors.saveErrors.values().next().value;
    }

    if (!error && this.submissionMode) {
      error = this.errors.submitErrors.values().next().value;
    }

    if (!error && this.submissionMode) {
      error = this.outcomeValidator.errors.submitErrors.values().next().value;
    }

    return error;
  }

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
    return (
      !this.errors.submitErrors.size &&
      !this.outcomeValidator.errors.submitErrors.size
    );
  }

  /**
   * Calls validator functions directly on relevant properties of a learning object and stores the results
   *
   * @param {LearningObject} object
   * @memberof LearningObjectValidator
   */
  validateLearningObject(
    object: Partial<LearningObject>,
    outcomes?: Map<string, Partial<LearningOutcome>>
  ) {
    let submitErrors;
    this.errors.saveErrors.clear();
    this.errors.submitErrors.clear();
    this.outcomeValidator.errors.saveErrors.clear();
    this.outcomeValidator.errors.submitErrors.clear();

    try {
      // submit errors
      const testObject = new LearningObject(
        Object.assign(object.toPlainObject ? object.toPlainObject() : object, {
          outcomes: outcomes ? Array.from(outcomes.values()) : undefined,
        })
      );
      // this is to explicitly test the validity of the objects name since the setter accepts empty strings
      testObject.name = object.name;
      submitErrors = SubmittableLearningObject.validateObject(testObject);

      for (const s in submitErrors) {
        if (
          s.toLowerCase() !== 'outcomes' ||
          typeof submitErrors[s] === 'string'
        ) {
          this.errors.setError('submit', s, submitErrors[s]);
        } else {
          // these are outcome errors and should be stored in the outcomeValidator error Map
          const outcomeErrors: [{ index: number; text: string }] =
            submitErrors[s];
          const ids = Array.from(outcomes.keys());

          for (let i = 0, l = outcomeErrors.length; i < l; i++) {
            this.outcomeValidator.errors.setOutcomeError(
              'submit',
              ids[outcomeErrors[i].index],
              outcomeErrors[i].text
            );
          }
        }
      }
    } catch (error) {
      // TODO please this is disgusting
      const property = error.message.split(' ')[0].toLowerCase();
      this.errors.setError('save', property, error.message);
    }
  }

  validateLearningOutcome(outcome: Partial<LearningOutcome>) {
    let submitErrors;
    this.outcomeValidator.errors.saveErrors.delete(outcome.id);
    this.outcomeValidator.errors.submitErrors.delete(outcome.id);

    try {
      // submit errors
      submitErrors = SubmittableLearningOutcome.validateOutcome(
        new LearningOutcome(outcome)
      );

      // eslint-disable-next-line guard-for-in
      for (const s in submitErrors) {
        this.outcomeValidator.errors.setOutcomeError(
          'submit',
          outcome.id,
          submitErrors[s]
        );
      }
    } catch (error) {
      // save errors
      this.outcomeValidator.errors.setOutcomeError(
        'save',
        outcome.id,
        error.message
      );
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

    // if we haven't found a save error, check the submit errors
    if (!error) {
      error = this.errors.submitErrors.get(property);
    }

    return error;
  }

  /**
   * Returns the current error for the passed outcome id. If submissionMode is true and
   * there is no error for the id in the outcomes saveErrors Map, the outcomes submitErrors map is checked
   *
   * @param {string} property
   * @returns {string | undefined} either returns undefined or an array where
   * the first index is the error and the second index is the type (save or submit)
   * @memberof LearningObjectValidator
   */
  getOutcome(id: string): string | undefined {
    let error = this.outcomeValidator.errors.saveErrors.get(id);

    if (!error) {
      error = this.outcomeValidator.errors.submitErrors.get(id);
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
    const value = !submit
      ? this.errors.saveErrors.get(property)
      : this.errors.submitErrors.get(property);

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
}
