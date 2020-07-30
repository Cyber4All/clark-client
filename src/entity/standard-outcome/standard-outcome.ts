/**
 * Provide abstract representations for standard outcomes.
 */
import { Outcome } from '../outcome/outcome';
import { STANDARD_OUTCOME_ERRORS } from './error-messages';
import { EntityError } from '../errors/entity-error';

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
  _author: string;
  /**
   * @property {string} source
   *       the organization or document this outcome is drawn from
   */
  get author(): string {
    return this._author;
  }
  set author(author: string) {
    if (author && author.trim()) {
      this._author = author;
    } else {
      throw new EntityError(STANDARD_OUTCOME_ERRORS.INVALID_AUTHOR, 'author');
    }
  }

  _source: string;
  /**
   * @property {string} source
   *       the organization or document this outcome is drawn from
   */
  get source(): string {
    return this._source;
  }
  set source(source: string) {
    if (source && source.trim()) {
      this._source = source;
    } else {
      throw new EntityError(STANDARD_OUTCOME_ERRORS.INVALID_AUTHOR, 'source');
    }
  }

  _name: string;
  /**
   * @property {string} name the label or unit of the outcome
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

  _date: string;
  /**
   * @property {string} date the year this standard was established
   */
  get date(): string {
    return this._date;
  }
  set date(date: string) {
    if (date) {
      this._date = date;
    } else {
      throw new EntityError(STANDARD_OUTCOME_ERRORS.INVALID_DATE, 'date');
    }
  }
  /**
   * @property {string} outcome the text of the outcome
   */
  _outcome: string;
  get outcome(): string {
    return this._outcome;
  }
  set outcome(outcome: string) {
    if (outcome && outcome.trim()) {
      this._outcome = outcome;
    } else {
      throw new EntityError(STANDARD_OUTCOME_ERRORS.INVALID_OUTCOME, 'outcome');
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
    this._author = '';
    this._source = '';
    this._name = '';
    this._date = '';
    this._outcome = '';
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
    if (outcome._id) {
      this.id = outcome._id;
    }
    if (outcome.author) {
      this.author = outcome.author;
    }
    if (outcome.source) {
      this.source = outcome.source;
    }
    if (outcome.name) {
      this.name = outcome.name;
    }
    if (outcome.date) {
      this.date = outcome.date;
    }
    if (outcome.outcome) {
      this.outcome = outcome.outcome;
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
      author: this.author,
      source: this.source,
      name: this.name,
      date: this.date,
      outcome: this.outcome,
    };
    return outcome;
  }
}
