import { SubmittableLearningOutcome } from './submittable-learning-outcome';
import { LearningOutcome } from './learning-outcome';
import { SUBMITTABLE_LEARNING_OUTCOME_ERROR_MESSAGES } from './error-messages';

// Defaults

// Valid values
const validText = 'This is valid text';

// Invalid values
const invalidText = '';

describe('Class: SubmittableLearningOutcome', () => {
  let outcome: SubmittableLearningOutcome;
  beforeEach(() => {
    const someOutcome = new LearningOutcome({ text: validText });
    outcome = new SubmittableLearningOutcome(someOutcome);
  });

  it('should return a new SubmittableLearningOutcome', () => {
    expect(outcome).toBeDefined();
  });
  it('should validate a SubmittableLearningOutcome', () => {
    const errors = SubmittableLearningOutcome.validateOutcome(outcome);
    expect(errors).not.toBeDefined();
  });
  it('should validate a non SubmittableLearningOutcome and return error object', () => {
    const errors = SubmittableLearningOutcome.validateOutcome(
      new LearningOutcome(),
    );
    console.log('ERRORS: ', errors);
    expect(errors).toBeDefined();
  });
  it('should set invalid outcome text and thrown an error', () => {
    const errorMessage =
      SUBMITTABLE_LEARNING_OUTCOME_ERROR_MESSAGES.INVALID_TEXT;
    try {
      outcome.text = invalidText;
      fail(new Error(`Expected ${errorMessage}`));
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
});
