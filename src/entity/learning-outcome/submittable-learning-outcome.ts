import { LearningOutcome } from './learning-outcome';
import { SUBMITTABLE_LEARNING_OUTCOME_ERROR_MESSAGES } from './error-messages';
import { EntityError } from '../errors/entity-error';

/**
 * A class to represent a submittable learning outcome.
 *
 * @class
 */
export class SubmittableLearningOutcome extends LearningOutcome {
  /**
   * Returns text from parent's getter
   *
   * @type {string}
   * @memberof SubmittableLearningOutcome
   */
  get text(): string {
    return this.text;
  }

  /**
   * Sets text to trimmed text string.
   * If text is empty an error is thrown
   *
   * @memberof SubmittableLearningOutcome
   */
  set text(text: string) {
    SubmittableLearningOutcome.validateText(text);
    this.text = text;
  }
  /**
   * Creates an instance of SubmittableLearningOutcome.
   *
   * @param {LearningOutcome} outcome
   * @memberof SubmittableLearningOutcome
   */
  constructor(outcome: LearningOutcome) {
    super(outcome);
    this.text = outcome.text;
  }
}

export namespace SubmittableLearningOutcome {
  export function validateText(text: string) {
    if (!text || !text.trim()) {
      throw new EntityError(
        SUBMITTABLE_LEARNING_OUTCOME_ERROR_MESSAGES.INVALID_TEXT,
        'text',
      );
    }
  }

  export function validateOutcome(
    outcome: LearningOutcome,
  ): { [index: string]: EntityError } | undefined {
    const errors: { [index: string]: EntityError } = {};
    const validationFunctions = [
      {
        function: SubmittableLearningOutcome.validateText,
        arguments: [outcome.text],
      },
    ];
    validationFunctions.forEach(func => {
      try {
        // @ts-ignore Arguments are valid since they are predefined
        func.function(...func.arguments);
      } catch (e) {
        errors[e.property] = e.message;
      }
    });
    return Object.keys(errors).length ? errors : undefined;
  }
}
