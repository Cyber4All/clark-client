import { Injectable } from '@angular/core';

export const OBJECT_ERRORS = {
  NO_NAME: 'Learning object must have a name!',
  SHORT_NAME: 'A learning object\'s name must be longer than 3 characters!',
  NO_DESCRIPTION: 'A learning object must have a description!'
};

export interface LearningObjectError {
  [key: string]: {
    value: string,
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

  /**
   * Returns a boolean that reflects whether or not this object has any errors
   * that would prevent it from being saved.
   *
   * @returns {boolean}
   * @memberof LearningObjectValidator
   */
  saveable(): boolean {
    return !this.errors.saveErrors.size;
  }

  /**
   * Returns a boolean that reflects whether or not this object has any errors
   * that would prevent it from being submitted.
   *
   * @returns {boolean}
   * @memberof LearningObjectValidator
   */
  submittable(): boolean {
    return !this.errors.submitErrors.size;
  }

  /**
   * Returns the current error for the passed property. If submissionMode is true and
   * there is no error for the property in the saveErrors Map, the submitErrors map is checked
   *
   * @param {string} property
   * @returns {string | undefined}
   * @memberof LearningObjectValidator
   */
  get(property: string): string | undefined {
    let error = this.errors.saveErrors.get(property);

    if (this.submissionMode) {
      if (!error) {
        error = this.errors.submitErrors.get(property);
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
  validateName(name: string): LearningObjectError | null {
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
  validateDescription(description: string): LearningObjectError | null {
    let error;

    if (!description) {
      error = OBJECT_ERRORS.NO_DESCRIPTION;
    }

    if (error) {
      this.errors.setError('submit', 'description', error);
      return { invalidDescription: { value: description, error } };
    }

    return null;
  }
}
