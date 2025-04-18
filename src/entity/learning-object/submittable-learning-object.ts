import { LearningObject } from './learning-object';
import { SubmittableLearningOutcome } from '../learning-outcome/submittable-learning-outcome';
import { SUBMITTABLE_LEARNING_OBJECT_ERRORS } from './error-messages';
import { EntityError } from '../errors/entity-error';
import { LearningOutcome } from '../learning-outcome/learning-outcome';
import { User } from '@entity';

export class SubmittableLearningObject extends LearningObject {
  get description(): string {
    return this.description;
  }

  /**
   * Sets trimmed text to description
   * If empty, throws an error
   *
   * @memberof SubmittableLearningObject
   */
  set description(description: string) {
    SubmittableLearningObject.validateDescription(description);
    this.description = description.trim();
  }

  get contributors(): User[] {
    return this.contributors;
  }

  set contributors(contributors: User[]) {
    SubmittableLearningObject.validateContributors(contributors);
    this.contributors = contributors;
  }

  /**
   * Adds outcome using parent's addOutcome method if it is a SubmittableOutcome.
   *  If not a SubmittableOutcome a new SubmittableOutcome is created with outcome's properties and added.
   *
   * @param {SubmittableLearningOutcome} outcome
   * @returns {number}
   * @memberof SubmittableLearningObject
   */
  addOutcome(outcome: SubmittableLearningOutcome): number {
    return super.addOutcome(
      outcome instanceof SubmittableLearningOutcome
        ? outcome
        : new SubmittableLearningOutcome(outcome),
    );
  }

  /**
   * Removes the object's i-th learning outcome.
   * Attempts to remove last outcome results in an error because the object must have
   * at least one SubmittableOutcome to be a SubmittableLearningObject
   *
   * @param {number} index
   * @returns {SubmittableLearningOutcome} the learning outcome which was remove
   * @memberof SubmittableLearningObject
   */
  removeOutcome(index: number): SubmittableLearningOutcome {
    if (this.outcomes.length > 1) {
      return super.removeOutcome(index);
    } else {
      throw new EntityError(
        SUBMITTABLE_LEARNING_OBJECT_ERRORS.INVALID_OUTCOMES,
        'outcomes',
      );
    }
  }

  /**
   * Adds SubmittableLearningObject to this object's children
   * If not a SubmittableLearningObject a new SubmittableLearningObject is created with outcome's properties and added.
   *
   * @param {SubmittableLearningObject} object
   * @returns {number}
   * @memberof SubmittableLearningObject
   */
  addChild(object: SubmittableLearningObject): number {
    return super.addChild(
      object instanceof SubmittableLearningObject
        ? object
        : new SubmittableLearningObject(object),
    );
  }

  /**
   * Creates an instance of SubmittableLearningObject.
   *
   * @param {LearningObject} object
   * @memberof SubmittableLearningObject
   */
  constructor(object: LearningObject) {
    super(object);
    this.description = object.description;
    this.validateOutcomes(object.outcomes as SubmittableLearningOutcome[]);
  }

  /**
   * Validates outcomes contain at least one SubmittableOutcome and that all outcomes are SubmittableOutcomes
   *
   * @private
   * @param {SubmittableLearningOutcome[]} outcomes
   * @memberof SubmittableLearningObject
   */
  private validateOutcomes(outcomes: SubmittableLearningOutcome[]): void {
    if (outcomes && outcomes.length) {
      outcomes.map(outcome => this.addOutcome(outcome));
    } else {
      throw new EntityError(
        SUBMITTABLE_LEARNING_OBJECT_ERRORS.INVALID_OUTCOMES,
        'outcomes',
      );
    }
  }
}

export namespace SubmittableLearningObject {
  // Matches anything that does not have a closing HTML tag.
  // Example: https://regex101.com/r/qDSGWv/1
  const NON_TERMINATING_HTML_REGEX = /<([a-z]+)(\s[^>]*)?(?<!\/)>(?![\s\S]*<\/\1>)/gi;

  export function validateName(name: string) {
    try {
      new LearningObject({ name });
    } catch (e) {
      throw new EntityError(e.message, 'name');
    }
  }
  export function validateDescription(description: string) {
    if (!description || !description.trim()) {
      throw new EntityError(
        SUBMITTABLE_LEARNING_OBJECT_ERRORS.INVALID_DESCRIPTION,
        'description',
      );
    }

    // st-editor will always close HTML tags, so theoretically we shouldn't hit this.
    if (description.match(NON_TERMINATING_HTML_REGEX)) {
      throw new EntityError(SUBMITTABLE_LEARNING_OBJECT_ERRORS.INVALID_DESCRIPTION_BAD_HTML, 'description');
    }
  }
  export function validateOutcomes(outcomes: LearningOutcome[]) {
    if (outcomes && outcomes.length) {
      const errors = outcomes
        .map((outcome, index) => ({
          index,
          ...SubmittableLearningOutcome.validateOutcome(outcome),
        }))
        .filter(err => !!err && Object.keys(err).length > 1);
      if (errors.length) {
        throw { property: 'outcomes', message: errors };
      }
    } else {
      throw new EntityError(
        SUBMITTABLE_LEARNING_OBJECT_ERRORS.INVALID_OUTCOMES,
        'outcomes',
      );
    }
  }
  export function validateChildren(children: LearningObject[]) {
    if (children && children.length) {
      const errors = children
        .map((child, index) => ({
          index,
          ...SubmittableLearningObject.validateObject(child),
        }))
        .filter(err => !!err && Object.keys(err).length > 1);
      if (errors.length) {
        throw { property: 'children', message: errors };
      }
    }
  }
  export function validateNotes(notes: string) {
    // st-editor will always close HTML tags, so theoretically we shouldn't hit this.
    if (notes.match(NON_TERMINATING_HTML_REGEX)) {
      throw new EntityError(SUBMITTABLE_LEARNING_OBJECT_ERRORS.INVALID_NOTES_BAD_HTML, 'notes');
    }
  }

  export function validateContributors(contributors: User[]) {
    if (contributors.length <= 0) {
      throw { property: 'contributors', message: 'At least one contributor must be added to the object' };
    }
  }

  export function validateObject(
    object: LearningObject,
  ): { [index: string]: EntityError } | undefined {
    const errors: { [index: string]: EntityError } = {};
    const validationFunctions = [
      {
        function: SubmittableLearningObject.validateName,
        arguments: [object.name],
      },
      {
        function: SubmittableLearningObject.validateDescription,
        arguments: [object.description],
      },
      {
        function: SubmittableLearningObject.validateOutcomes,
        arguments: [object.outcomes],
      },
      {
        function: SubmittableLearningObject.validateContributors,
        arguments: [object.contributors]
      },
      {
        function: SubmittableLearningObject.validateNotes,
        arguments: [object.materials.notes]
      }
    ];
    validationFunctions.forEach(func => {
      try {
        // @ts-ignore Arguments are valid since they are predefined
        func.function(...func.arguments);
      } catch (e) {
        errors[e.property] = e.message || e;
      }
    });
    return Object.keys(errors).length ? errors : undefined;
  }
}
