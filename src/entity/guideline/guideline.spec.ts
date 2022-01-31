import { Guideline } from './guideline';
import { GUIDELINE_ERRORS } from './error-messages';
import { LEVEL } from 'entity/standard-guidelines/IGuideline';

// Invalid values
const invalidName: null = undefined;
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
const invalidDate: null = null;

describe('Class: Guideline', () => {
  let outcome: Guideline;
  beforeEach(() => {
    outcome = new Guideline();
  });

  it('should return a new blank Guideline', () => {
    expect(outcome).toBeDefined();
  });
  it('should return a new Guideline with valid properties', () => {
    const someOutcome: Partial<Guideline> = {
      guidelineName: 'guideline',
      guidelineId: '1111111111111111111111',
      levels: [LEVEL.HIGH],
      year: '2021',
    };
    const newOutcome = new Guideline(someOutcome);
    expect(newOutcome).toBeDefined();
  });
  it('should set invalid name and thrown an error', () => {
    const errorMessage = GUIDELINE_ERRORS.INVALID_NAME;
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      outcome.name = invalidName;
      fail(new Error(`Expected ${errorMessage}`));
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should set invalid year and thrown an error', () => {
    const errorMessage = GUIDELINE_ERRORS.INVALID_YEAR;
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      outcome.year = invalidDate;
      fail(new Error(`Expected ${errorMessage}`));
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
});
