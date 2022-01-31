/* eslint-disable @typescript-eslint/member-ordering*/
import { GUIDELINE_ERRORS } from './error-messages';
import { EntityError } from '../errors/entity-error';
import { LEVEL, VALID_LEVELS } from '../standard-guidelines/IGuideline';
import { SearchItem } from 'entity/standard-guidelines/search-index';

/**
 * A class to represent a standard guideline. Immutable.
 *
 * @class
 */
export class Guideline implements SearchItem {
  id: string;
  author: string;
  guidelineId: string;
  guidelineName: string;
  guidelineDescription: string;
  frameworkName: string;
  frameworkDescription: string;
  levels: LEVEL[];
  year: string;

  /**
   * Creates an instance of Guideline.
   *
   * @param guideline
   * @memberof Guideline
   */
  constructor(guideline?: any) {
    // @ts-ignore Id will be undefined on creation
    this.id = undefined;
    this.author = '';
    this.levels = [];
    this.year = '';
    this.guidelineId = undefined;
    this.frameworkName = '';
    this.frameworkDescription = '';
    this.guidelineName = '';
    this.guidelineDescription = '';

    if (guideline) {
      this.copyGuideline(guideline);
    }
  }
  /**
   * Copies properties of guideline to this guideline if defined
   *
   * @private
   * @param guideline
   * @memberof Guideline
   */
  private copyGuideline(guideline: any): void {
    if (guideline._id) {
      this.id = guideline._id;
    }
    if (guideline.author) {
      this.author = guideline.author;
    }
    if (guideline.levels) {
      this.levels = guideline.levels;
    }
    if (guideline.year) {
      this.year = guideline.year;
    }
    if (guideline.guidelineId) {
      this.guidelineId = guideline.guidelineId;
    }
    if (guideline.frameworkName) {
      this.frameworkName = guideline.frameworkName;
    }
    if (guideline.frameworkDescription) {
      this.frameworkDescription = guideline.frameworkDescription;
    }
    if (guideline.guidelineName) {
      this.guidelineName = guideline.guidelineName;
    }
    if (guideline.guidelineDescription) {
      this.guidelineDescription = guideline.guidelineDescription;
    }
  }

  /**
   * Converts Guideline to plain object without functions and private properties
   *
   * @memberof Guideline
   */
  public toPlainObject(): Partial<Guideline> {
    const guideline: Partial<Guideline> = {
      id: this.id,
      author: this.author,
      levels: this.levels,
      year: this.year,
      frameworkName: this.frameworkName,
      frameworkDescription: this.frameworkDescription,
      guidelineName: this.guidelineName,
      guidelineDescription: this.guidelineDescription
    };
    return guideline;
  }
}
