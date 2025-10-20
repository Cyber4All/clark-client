import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SearchItemDocument } from '../../../../../../../entity/standard-guidelines/search-index';
import { LearningOutcome } from '@entity';
import { RelevancyService } from '../../../../../../core/learning-object-module/relevancy/relevancy.service';

@Injectable({
  providedIn: 'root'
})
export class AlignmentService {

  constructor(
    private relevancyService: RelevancyService,
  ) { }

  // The available guidelines to align to
  private guidelines = new BehaviorSubject<SearchItemDocument[]>([]);

  // The outcomes for the learning object at hand
  private outcomes = new BehaviorSubject<LearningOutcome[]>([]);

  guidelines$: Observable<SearchItemDocument[]> = this.guidelines.asObservable();
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
  setGuidelinesArray(suggestedGuidelines: SearchItemDocument[]): void {
    this.guidelines.next(suggestedGuidelines);
  }

  /**
   * Set the outcomes for the learning object being mapped
   */
  setOutcomes(loOutcomes: LearningOutcome[]): void {
    loOutcomes.map(outcome => {
      outcome.mappings.map(mapping => {
        mapping.id = mapping.guidelineId;
      });
    });
    this.outcomes.next(loOutcomes);
  }

  async saveOutcomeMappings(oldOutcomes: LearningOutcome[], learningObjectId: string) {
    // See what outcomes have been updated
    const updatedOutcomes: LearningOutcome[] = this.diffOutcomeArrays(oldOutcomes, this.outcomes.value, 'id');

    // Now just save them with the API
    for (const outcome of updatedOutcomes) {
      // Parse the array of full guidelines to just the ids
      const outcomeMappingIds = outcome.mappings.map(mapping => mapping.id);
      await this.relevancyService.updateLearningOutcomeMappings(learningObjectId, outcome.id, outcomeMappingIds);
    }
  }



  diffOutcomeArrays(oldArr, newArr, key): LearningOutcome[] {
    const oldMap = new Map(oldArr.map(item => [item[key], item]));
    const newMap = new Map(newArr.map(item => [item[key], item]));

    const updated = [...newMap.entries()]
      .filter(([id, newItem]) => {
        const oldItem = oldMap.get(id);
        return oldItem && JSON.stringify(oldItem) !== JSON.stringify(newItem);
      })
      .map(([, item]) => item);

    return updated as LearningOutcome[];
  }

}
