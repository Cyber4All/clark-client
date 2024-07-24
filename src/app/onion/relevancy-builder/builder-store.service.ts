import { Injectable } from '@angular/core';
import {
  LearningObject,
  LearningOutcome,
  Guideline,
  Topic
} from '@entity';
import { Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { UriRetrieverService } from 'app/core/learning-object-module/uri-retriever.service';
import { RelevancyService } from 'app/core/learning-object-module/relevancy/relevancy.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { TopicsService } from 'app/core/learning-object-module/topics/topics.service';

/**
 * A central storage repository for communication between relevancy builder components.
 * Maintains a stateful, single-source store for all possible actions as well as handlers for accepting those actions.
 *
 * @export
 * @class BuilderStore
 */
@Injectable({
  providedIn: 'root'
})
export class BuilderStore {
  private _learningObject: LearningObject;
  private _outcomes: LearningOutcome[];
  private _topics: string[] = [];
  private _activeOutcome: string;

  // fired when this service is destroyed
  private destroyed$: Subject<void> = new Subject();

  constructor(
    private toaster: ToastrOvenService,
    private relevancyService: RelevancyService,
    private topicsService: TopicsService,
    private titleService: Title,
    private uriRetriever: UriRetrieverService,
  ) { }

  get learningObject() {
    return this._learningObject;
  }

  get outcomes() {
    return this._outcomes;
  }

  get topics(): string[] {
    return this._topics;
  }

  get activeGuidelines(): string[] {
    const outcome = this._outcomes.find(o => o.id === this._activeOutcome);
    return (outcome && outcome.mappings) ? outcome.mappings.map(obj => obj.guidelineId) : [];
  }

  public active(id: string) {
    this._activeOutcome = id;
  }

  public getOutcomeText() {
    const outcome = this._outcomes.find(o => o.id === this._activeOutcome);
    return outcome.verb + ' ' + outcome.text;
  }

  /**
   * Retrieve a learning object from the service by id
   *
   * @param {string} id
   * @returns {Promise<LearningObject>}
   * @memberof BuilderStore
   */
  fetch(id: string): Promise<LearningObject> {
    return this.uriRetriever.getLearningObject({ id }, ['outcomes']).toPromise().then(object => {
      this._learningObject = object;
      this._outcomes = this._learningObject.outcomes;
      this._topics = this._learningObject.topics || [];
      // set the title of page to the learning object name
      this.titleService.setTitle('CLARK | ' + this._learningObject.name);
      return this._learningObject;
    }).catch(e => {
      this.toaster.error('Error!', 'Could not retrieve learning object, please try again later.');
      return null;
    });
  }

  /**
   * Service call to retrieve all topics in our system
   *
   * @returns array of topics
   */
  getTopics(): Promise<Topic[]> {
    return this.topicsService.getTopics();
  }

  /**
   * Local store for a learning objects tagged topics
   *
   * @param arr array of topic ids
   */
  storeTopics(arr: string[]): void {
    this._topics = arr;
  }

  /**
   * Adds a guideline to a given outcome
   *
   * @param outcomeId The outcome id
   * @param guideline The guideline to add
   */
  addGuideline(outcomeId: string, guideline: Guideline) {
    const outcome = this._outcomes.find(o => o.id === outcomeId);
    const index = outcome.mappings.findIndex(g => g.guidelineId === guideline.guidelineId);
    if (index < 0) {
      outcome.mappings.push(guideline);
    }
  }

  /**
   * Removes a guideline from a given outcome
   *
   * @param outcomeId The outcome id
   * @param guidelineId The guideline id to remove
   */
  removeGuideline(outcomeId: string, guidelineId: string) {
    const outcome = this._outcomes.find(o => o.id === outcomeId);
    const index = outcome.mappings.findIndex(g => g.guidelineId === guidelineId);
    if (index >= 0) {
      outcome.mappings.splice(index, 1);
    }
  }

  /**
   * This saves the mapped topics and outcome mappings to the database
   */
  async save() {
    try {
      await this.relevancyService.updateObjectTopics(this._learningObject.id, this._topics);
      for (let i = 0; i < this.outcomes.length; i++) {
        await this.relevancyService.updateLearningOutcomeMappings(
          this._learningObject.id,
          this.outcomes[i].id,
          this.outcomes[i].mappings.map(g => g.guidelineId)
        );
      }
    } catch (e) {
      this.toaster.error('Error!', e.message || 'There was an error saving the topics and mappings, please try again later');
    }
  }
}
