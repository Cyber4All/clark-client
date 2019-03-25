/**
 * Provide abstract representations for generic outcomes.
 */

/**
 * Core information fundamental to any sort of outcome.
 * @interface
 */
export interface Outcome {
  // properties of source
  id?: string;
  author: string; // standard outcome sources have 'authors' like 'NCWF' or 'CAE'
  name: string; // standard outcome sources have 'names' like 'K0027' or 'Operating Systems Concepts'
  date: string;
  // specifics of outcome
  outcome: string;
}

export interface OutcomeSuggestion extends Outcome {
  id: any; // do NOT have any database dependencies in entities
}
