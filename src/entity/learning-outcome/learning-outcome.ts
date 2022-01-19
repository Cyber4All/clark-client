import { Guideline } from '../guideline/guideline';
import { levels, taxonomy } from '@cyber4all/clark-taxonomy';
import { LEARNING_OUTCOME_ERROR_MESSAGES } from './error-messages';
import { EntityError } from '../errors/entity-error';

/**
 * A class to represent a learning outcome.
 *
 * @class
 */
export class LearningOutcome {
  private _id: string;
  get id(): string {
    return this._id;
  }
  set id(id: string) {
    if (!this.id) {
      this._id = id;
    } else {
      throw new EntityError(LEARNING_OUTCOME_ERROR_MESSAGES.ID_SET, 'id');
    }
  }

  private _bloom!: string;
  /**
   * @property {string} bloom
   *       the bloom taxon of this learning outcome
   *       values are restricted according to available levels
   */
  get bloom(): string {
    return this._bloom;
  }
  set bloom(bloom: string) {
    if (bloom && levels.includes(bloom.toLowerCase())) {
      this._bloom = bloom.toLowerCase();
    } else {
      throw new EntityError(
        LEARNING_OUTCOME_ERROR_MESSAGES.INVALID_BLOOM(bloom),
        'bloom',
      );
    }
  }

  private _verb!: string;
  /**
   * @property {string} verb
   *       the verb this outcome text starts with (eg. define)
   *       values are restricted according to the bloom taxon
   */
  get verb(): string {
    return this._verb;
  }
  set verb(verb: string) {
    if (
      verb &&
      // @ts-ignore
      (taxonomy.taxons[this.bloom] as { verbs: string[] }).verbs.includes(
        verb.toLowerCase(),
      )
    ) {
      this._verb = verb.toLowerCase();
    } else {
      throw new EntityError(
        LEARNING_OUTCOME_ERROR_MESSAGES.INVALID_VERB(this.bloom, verb),
        'verb',
      );
    }
  }

  private _text!: string;
  /**
   * @property {string} text
   *       full text description of this outcome, except the verb
   */
  get text(): string {
    return this._text;
  }
  set text(text: string) {
    if (text !== undefined && text !== null) {
      this._text = text.trim();
    } else {
      throw new EntityError(
        LEARNING_OUTCOME_ERROR_MESSAGES.INVALID_TEXT,
        'text',
      );
    }
  }
  /**
   * @property {string} text
   *       full text of this outcome, with the verb
   */
  get outcome(): string {
    return `${this._verb} ${this._text}`;
  }

  private _mappings: Guideline[];
  /**
   * @property {Guideline[]} mappings (immutable)
   *       outcomes which presumably achieve similar things as this
   *
   * NOTE: individual elements are freely accessible, but the array
   *       reference itself is immutable, and elements can only be
   *       added and removed by the below functions
   */
  get mappings(): Guideline[] {
    return this._mappings;
  }
  /**
   * Maps a Guideline to this learning outcome.
   *
   * @returns {number} the index of the mapping
   */
  mapTo(mapping: Guideline): number {
    if (mapping) {
      const addingMapping =
        mapping instanceof Guideline
          ? mapping
          : new Guideline(mapping);
      return this._mappings.push(addingMapping) - 1;
    } else {
      throw new EntityError(
        LEARNING_OUTCOME_ERROR_MESSAGES.INVALID_MAPPING,
        'mappings',
      );
    }
  }

  /**
   * Removes the outcome's i-th mapping.
   *
   * @param {number} i the index to remove from the mappings array
   *
   * @returns {Guideline} the outcome which was removed
   */
  unmap(i: number): Guideline {
    return this._mappings.splice(i, 1)[0];
  }

  /**
   * sCreates an instance of LearningOutcome.
   *
   * @param {Partial<LearningOutcome>} [outcome]
   * @memberof LearningOutcome
   */
  constructor(outcome?: Partial<LearningOutcome>) {
    // @ts-ignore Id will be undefined on creation
    this._id = undefined;
    this._bloom = levels[0];
    // @ts-ignore
    this._verb = (taxonomy.taxons[this.bloom] as { verbs: string[] }).verbs[0];
    this._text = '';
    this._mappings = [];

    if (outcome) {
      this.copyOutcome(outcome);
    }
  }

  /**
   * Copies properties of outcome to this outcome if defined
   *
   * @private
   * @param outcome
   * @memberof LearningOutcome
   */
  private copyOutcome(outcome: any): void {
    if (outcome.id) {
      this.id = outcome.id;
    }
    this.bloom = outcome.bloom || this.bloom;
    this.verb = outcome.verb || this.verb;
    this.text = outcome.text || this.text;
    if (outcome.mappings) {
      (<Guideline[]>outcome.mappings).map(o => this.mapTo(o));
    }
  }
  /**
   * Converts LearningOutcome to plain object without functions and private properties
   *
   * @returns {Partial<LearningOutcome>}
   * @memberof LearningOutcome
   */
  public toPlainObject(): Partial<LearningOutcome> {
    const outcome: Partial<LearningOutcome> = {
      id: this.id,
      bloom: this.bloom,
      verb: this.verb,
      text: this.text,
      outcome: this.outcome,
      mappings: this.mappings.map(
        mapping => mapping.toPlainObject() as Guideline,
      ),
    };
    return outcome;
  }
}
