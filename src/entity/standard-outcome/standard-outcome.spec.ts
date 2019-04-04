import { StandardOutcome } from './standard-outcome';
import { STANDARD_OUTCOME_ERRORS } from './error-messages';

// Defaults

// Valid values
const validAuthor = 'Some valid author';
const validName = 'Valid Name';
const validDate = '2019';
const validOutcome = 'Some valid outcome';

// Invalid values
const invalidAuthor: null = null;
const invalidName: null = undefined;
const invalidDate: null = null;
const invalidOutcome = '';

describe('Class: StandardOutcome', () => {
  let outcome: StandardOutcome;
  beforeEach(() => {
    outcome = new StandardOutcome();
  });

  it('should return a new blank StandardOutcome', () => {
    expect(outcome).toBeDefined();
  });
  it('should return a new StandardOutcome with valid properties', () => {
    const someOutcome: Partial<StandardOutcome> = {
      author: validAuthor,
      name: validName,
      date: validDate,
      outcome: validOutcome,
    };
    const newOutcome = new StandardOutcome(someOutcome);
    expect(newOutcome).toBeDefined();
  });
  it('should set invalid author and thrown an error', () => {
    const errorMessage = STANDARD_OUTCOME_ERRORS.INVALID_AUTHOR;
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      outcome.author = invalidAuthor;
      fail(new Error(`Expected ${errorMessage}`));
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should set invalid name and thrown an error', () => {
    const errorMessage = STANDARD_OUTCOME_ERRORS.INVALID_NAME;
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      outcome.name = invalidName;
      fail(new Error(`Expected ${errorMessage}`));
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should set invalid date and thrown an error', () => {
    const errorMessage = STANDARD_OUTCOME_ERRORS.INVALID_DATE;
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      outcome.date = invalidDate;
      fail(new Error(`Expected ${errorMessage}`));
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
  it('should set invalid outcome and thrown an error', () => {
    const errorMessage = STANDARD_OUTCOME_ERRORS.INVALID_OUTCOME;
    try {
      // @ts-ignore Value may or may not match type signature for test purposes
      outcome.outcome = invalidOutcome;
      fail(new Error(`Expected ${errorMessage}`));
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }
  });
});
