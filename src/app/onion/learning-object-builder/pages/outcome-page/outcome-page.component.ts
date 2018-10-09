import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningOutcome } from '@cyber4all/clark-entity';
import { BuilderStore, BUILDER_ACTIONS as actions } from '../../builder-store.service';
import { Subject } from 'rxjs';
import { takeUntil, map, filter } from 'rxjs/operators';

@Component({
  selector: 'clark-outcome-page',
  templateUrl: './outcome-page.component.html',
  styleUrls: ['./outcome-page.component.scss']
})
export class OutcomePageComponent implements OnInit, OnDestroy {
  private _outcomes: Map<string, LearningOutcome> = new Map();
  private _outcomesIterable: LearningOutcome[] = [];
  destroyed$: Subject<void> = new Subject();

  constructor(private store: BuilderStore) {}

  ngOnInit() {
    // listen for outcome events and update component stores
    this.store.event.pipe(
      filter(x => x.type === 'outcome'),
      map(x => x.payload),
      takeUntil(this.destroyed$)
    ).subscribe((payload: Map<string, LearningOutcome>) => {
      this.outcomes = payload;
    });

    if (this.store.outcomes) {
      this.outcomes = this.store.outcomes;
    }
  }

  /**
   * Retrieve Map version of outcomes
   *
   * @memberof OutcomePageComponent
   */
  get outcomes() {
    return this._outcomes;
  }

  /**
   * Retrieve iterable-version of outcomes
   *
   * @readonly
   * @memberof OutcomePageComponent
   */
  get iterableOutcomes() {
    return this._outcomesIterable;
  }

  /**
   * Set component stored outcomes map and create iterable array
   *
   * @memberof OutcomePageComponent
   */
  set outcomes(outcomes: Map<string, LearningOutcome>) {
    this._outcomes = outcomes;
    this._outcomesIterable = Array.from(outcomes.values());
  }

  mutateOutcome(id: string, params: any) {
    const outcome = this.outcomes.get(id);

    if (outcome.verb && outcome.bloom) {
      this.store.execute(actions.MUTATE_OUTCOME, { id, params });
    }
  }

  ngOnDestroy() {
    // observable cleanup on component destroy
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
