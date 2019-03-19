import { LearningOutcome } from './learning-outcome';
import { levels, taxonomy } from '@cyber4all/clark-taxonomy';
import { LEARNING_OUTCOME_ERROR_MESSAGES } from './error-messages';
import { StandardOutcome } from '../standard-outcome/standard-outcome';

// Defaults

// Valid values
const validBloom = levels[0];
// @ts-ignore
const validVerb = (taxonomy.taxons[validBloom] as { verbs: string[] }).verbs[0];
const validText = 'This is valid text';
const validStandardOutcome = new StandardOutcome({
  author: 'Some developer',
  name: 'Valid StandardOutcome',
  date: Date.now().toString(),
  outcome: 'I am a valid standard outcome',
});

// Invalid values
const invalidBloom = 'not a bloom taxon';
const invalidVerb = 'not a bloom verb';
const invalidText: undefined = undefined;

describe('Class: LearningOutcome', () => {
  let outcome: LearningOutcome;
  beforeEach(() => {
    outcome = new LearningOutcome();
  });

  it('should return a new blank LearningOutcome', () => {
    expect(outcome).toBeDefined();
  });
  it('should return a new LearningOutcome with valid bloom taxon, bloom verb, text, and mappings', () => {
    const someOutcome: Partial<LearningOutcome> = {
      bloom: validBloom,
      verb: validVerb,
      text: validText,
      mappings: [validStandardOutcome],
    };
    const newOutcome = new LearningOutcome(someOutcome);
    expect(newOutcome).toBeDefined();
  });
  it('should set a valid bloom taxon', () => {
    outcome.bloom = validBloom;
    expect(outcome.bloom).toEqual(validBloom);
  });
  it('should set an invalid bloom taxon and thrown an error', () => {
    const errorMessage = LEARNING_OUTCOME_ERROR_MESSAGES.INVALID_BLOOM(
      invalidBloom,
    );
    try {
      outcome.bloom = invalidBloom;
      fail(`Expected ${errorMessage}`);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should set a valid bloom verb', () => {
    outcome.bloom = validBloom;
    outcome.verb = validVerb;
    expect(outcome.verb).toEqual(validVerb);
  });
  it('should set an invalid bloom verb and thrown an error', () => {
    const errorMessage = LEARNING_OUTCOME_ERROR_MESSAGES.INVALID_VERB(
      outcome.bloom,
      invalidVerb,
    );
    outcome.bloom = validBloom;
    try {
      outcome.verb = invalidVerb;
      fail(`Expected ${errorMessage}`);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should set valid outcome text', () => {
    outcome.text = validText;
    expect(outcome.text).toEqual(validText);
  });
  it('should set invalid outcome text and thrown an error', () => {
    const errorMessage = LEARNING_OUTCOME_ERROR_MESSAGES.INVALID_TEXT;
    try {
      // @ts-ignore Text will not be a string for this text case
      outcome.text = invalidText;
      fail(`Expected ${errorMessage}`);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should map learning outcome to standard outcome', () => {
    const index = outcome.mapTo(validStandardOutcome);
    expect(outcome.mappings[index]).toEqual(validStandardOutcome);
  });
  it('should unmap learning outcome from standard outcome', () => {
    const index = outcome.mapTo(validStandardOutcome);
    expect(outcome.unmap(index)).toEqual(validStandardOutcome);
    expect(outcome.mappings[index]).not.toBeDefined();
  });
});
