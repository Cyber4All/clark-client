import { LearningObject } from './learning-object';
import { SubmittableLearningObject } from './submittable-learning-object';
import { LearningOutcome } from '../learning-outcome/learning-outcome';
import { SubmittableLearningOutcome } from '../learning-outcome/submittable-learning-outcome';
import { SUBMITTABLE_LEARNING_OBJECT_ERRORS } from './error-messages';

// Defaults

// Valid Values
const validName = 'This is a valid name';
const validDescription = 'This is a valid description';
const validOutcomeText = 'This is valid text';
const validOutcome = new LearningOutcome({ text: validOutcomeText });
const validSubmittableOutcome = new SubmittableLearningOutcome(validOutcome);
const validObject = new LearningObject({
  name: validName,
  description: validDescription,
  outcomes: [validSubmittableOutcome],
});

// Invalid values
const invalidDescription = '';
const invalidOutcome = new LearningOutcome();
const invalidChild = new LearningObject();

describe('Class: SubmittableLearningObject', () => {
  let object: SubmittableLearningObject;
  beforeEach(() => {
    object = new SubmittableLearningObject(validObject);
  });

  it('should return a new SubmittableLearningObject', () => {
    expect(object).toBeDefined();
  });
  it('should set an invalid description and throw an error', () => {
    const errorMessage = SUBMITTABLE_LEARNING_OBJECT_ERRORS.INVALID_DESCRIPTION;
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      object.description = invalidDescription;
      fail(`Expected ${errorMessage}`);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should add an invalid outcome and throw an error', () => {
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      object.addOutcome(invalidOutcome);
      fail(`Expected error to occur`);
    } catch (e) {
      expect(e.message).toBeDefined();
    }
  });
  it('should fail to remove last outcome and throw an error', () => {
    const errorMessage = SUBMITTABLE_LEARNING_OBJECT_ERRORS.INVALID_OUTCOMES;
    try {
      object.outcomes.forEach((_, index) => object.removeOutcome(index));
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should add an invalid child object and throw an error', () => {
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      object.addChild(invalidChild);
      fail(`Expected error to occur`);
    } catch (e) {
      expect(e.message).toBeDefined();
    }
  });
  it('should validate a SubmittableLearningObject', () => {
    const errors = SubmittableLearningObject.validateObject(object);
    expect(errors).not.toBeDefined();
  });
  it('should validate a non SubmittableLearningObject and return error object', () => {
    const errors = SubmittableLearningObject.validateObject(
      new LearningObject({
        outcomes: [
          new LearningOutcome({ text: 'VALID TEST' }),
          new LearningOutcome(),
        ],
        children: [new LearningObject(), validObject],
      }),
    );
    console.log('ERRORS: ', errors);
    expect(errors).toBeDefined();
  });
});
