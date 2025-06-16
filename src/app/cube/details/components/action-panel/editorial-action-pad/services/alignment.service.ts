import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SearchItem } from '../../../../../../../entity/standard-guidelines/search-index';
import { LearningOutcome } from '@entity';
import { selectedGuidelines } from './guidelines_data';

@Injectable({
  providedIn: 'root'
})
export class AlignmentService {

  // The available guidelines to align to
  private guidelines = new BehaviorSubject<SearchItem []>([]);

  // The outcomes for the learning object at hand
  private outcomes = new BehaviorSubject<LearningOutcome []>([]);

  guidelines$: Observable<SearchItem[]> = this.guidelines.asObservable();
  outcomes$: Observable<LearningOutcome[]> = this.outcomes.asObservable();

  /**
   * Getter for the guidelines and the outcomes
   */

  get alignableGuidelines() {
    return this.guidelines.value;
  }

  /**
   * Initialize the guidelines array
   */
  setGuidelinesArray(): void {
    // For right now since we're focusing on the core KSATs for
    // DCWF we are going to just put those in for now. This can be swapped out later
    // with a call to the api.
    this.guidelines.next(selectedGuidelines as SearchItem[]);
  }

  /**
   * Set the outcomes for the learning object being mapped
   */
  setOutcomes(loOutcomes: LearningOutcome[]): void {
    this.outcomes.next(loOutcomes);
  }

  addMappingToOutcome(mapping: SearchItem, outcomeId: string) {

  }

  removeMappingFromOutcome(mapping: SearchItem, outcomeId: string) {

  }

  saveOutcomeMappings(oldOutcomes: LearningOutcome[]) {

  }

  constructor() { }
}
