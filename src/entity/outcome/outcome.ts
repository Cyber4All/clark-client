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
  name: string;
  levels: string[];
  year: string;
  frameworkId: string;
  guideline: string;
}

export interface OutcomeSuggestion extends Outcome {
  id: any; // do NOT have any database dependencies in entities
}
