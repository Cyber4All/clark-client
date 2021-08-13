/**
 * Provide abstract representations for standard outcomes.
 */
import { Outcome } from '../outcome/outcome';
import { STANDARD_OUTCOME_ERRORS } from './error-messages';
import { EntityError } from '../errors/entity-error';
import { String } from 'aws-sdk/clients/batch';

/**
 * A class to represent a standard outcome. Immutable.
 * @class
 */
export class StandardOutcome implements Outcome {
  private _id: string;
  get id(): string {
    return this._id;
  }
  set id(id: string) {
    if (!this.id) {
      this._id = id;
    } else {
      throw new EntityError(STANDARD_OUTCOME_ERRORS.ID_SET, 'id');
    }
  }

  _name: string;
  /**
   * @property {string} name the label of the guideline
   */
  get name(): string {
    return this._name;
  }
  set name(name: string) {
    if (name && name.trim()) {
      this._name = name;
    } else {
      throw new EntityError(STANDARD_OUTCOME_ERRORS.INVALID_NAME, 'name');
    }
  }

  _levels: string[];
  /**
   *
   * @property {string[]} levels the levels the guideline applies to
   */
  get levels(): string[] {
    return this._levels;
  }
  set levels(levels: string[]) {
    if (levels && Array.isArray(levels)) {
      this._levels = levels;
    } else {
      throw new EntityError(STANDARD_OUTCOME_ERRORS.INVALID_LEVELS, 'levels');
    }
  }

  _year: string;
  /**
   *
   * @property {string[]} year the year that the guideline is published
   */
  get year(): string {
    return this._year;
  }
  set year(year: string) {
    if (year && year.trim() && !isNaN(Number(year))) {
      this._year = year;
    } else {
      throw new EntityError(STANDARD_OUTCOME_ERRORS.INVALID_YEAR, 'year');
    }
  }

  _frameworkId: String;
  /**
   *
   * @property {string[]} frameworkId the framework identifier that the guideline is associated with
   */
  get frameworkId(): string {
    return this._frameworkId;
  }
  set frameworkId(frameworkId: string) {
    if (frameworkId && frameworkId.trim()) {
      this._frameworkId = frameworkId;
    } else {
      throw new EntityError(STANDARD_OUTCOME_ERRORS.INVALID_FRAMEWORK_ID, 'frameworkId');
    }
  }

  _guideline: String;
  /**
   *
   * @property {string[]} guideline the description of the guideline
   */
  get guideline(): string {
    return this._guideline;
  }
  set guideline(guideline: string) {
    if (guideline && guideline.trim()) {
      this._guideline = guideline;
    } else {
      throw new EntityError(STANDARD_OUTCOME_ERRORS.INVALID_GUIDELINE, 'guideline');
    }
  }

  /**
   * Creates an instance of StandardOutcome.
   * @param {Partial<StandardOutcome>} [outcome]
   * @memberof StandardOutcome
   */
  constructor(outcome?: any) {
    // @ts-ignore Id will be undefined on creation
    this._id = undefined;
    this._name = '';
    this._levels = [];
    this._year = '';
    this._frameworkId = undefined;
    this._guideline = '';

    if (outcome) {
      this.copyOutcome(outcome);
    }
  }
  /**
   * Copies properties of outcome to this outcome if defined
   *
   * @private
   * @param {Partial<StandardOutcome>} outcome
   * @memberof StandardOutcome
   */
  private copyOutcome(outcome: any): void {
    if (outcome.id) {
      this.id = outcome.id;
    }
    if (outcome.name) {
      this.name = outcome.name;
    }
    if (outcome.levels) {
      this.levels = outcome.levels;
    }
    if (outcome.year) {
      this.year = outcome.year;
    }
    if (outcome.frameworkId) {
      this.frameworkId = outcome.frameworkId;
    }
    if (outcome.guideline) {
      this.guideline = outcome.guideline;
    }
  }

  /**
   * Converts StandardOutcome to plain object without functions and private properties
   *
   * @returns {Partial<StandardOutcome>}
   * @memberof StandardOutcome
   */
  public toPlainObject(): Partial<StandardOutcome> {
    const outcome: Partial<StandardOutcome> = {
      id: this.id,
      name: this.name,
      levels: this.levels,
      year: this.year,
      frameworkId: this.frameworkId,
      guideline: this.guideline
    };
    return outcome;
  }
}
