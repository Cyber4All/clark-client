import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { LearningOutcome } from '@cyber4all/clark-entity';
import {
  BuilderStore,
  BUILDER_ACTIONS as actions
} from '../../builder-store.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-outcome-page',
  templateUrl: './outcome-page.component.html',
  styleUrls: ['./outcome-page.component.scss'],
})
export class OutcomePageComponent implements OnInit, OnDestroy {
  private _outcomes: Map<string, LearningOutcome> = new Map();
  destroyed$: Subject<void> = new Subject();

  // flags
  activeOutcome: string;

  constructor(private store: BuilderStore, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    // listen for outcome events and update component store
    this.store.outcomeEvent
      .pipe(
        takeUntil(this.destroyed$)
      )
      .subscribe((payload: Map<string, LearningOutcome>) => {
        if (payload) {
          this.outcomes = payload;
        }
      });
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
    return Array.from(this._outcomes.values());
  }

  /**
   * Set component stored outcomes map and create iterable array
   *
   * @memberof OutcomePageComponent
   */
  set outcomes(outcomes: Map<string, LearningOutcome>) {
    this._outcomes = outcomes;
    if (outcomes.size && !this.activeOutcome) {
      setTimeout(() => {
        this.activeOutcome = outcomes.values().next().value.id;
      }, 100);
    }
  }

  setActiveOutcome(id: string) {
    if (id !== this.activeOutcome) {
      this.store.sendOutcomeCache();
      this.activeOutcome = id;
    }
  }

  mutateOutcome(id: string, params: any) {
    const outcome = this.outcomes.get(id);

    this.store.execute(actions.MUTATE_OUTCOME, { id, params });
  }

  newOutcome() {
    this.store.execute(actions.CREATE_OUTCOME, {}).then(id => {
      setTimeout(() => {
        this.activeOutcome = id;
      }, 100);
    });
  }

  deleteOutcome(id: string) {
    this.store.execute(actions.DELETE_OUTCOME, { id }).then(() => {
      if (this.iterableOutcomes.length) {
        setTimeout(() => {
          this.activeOutcome = this.iterableOutcomes[
            this.iterableOutcomes.length - 1
          ].id;
        }, 100);
      }
    });
  }

  toggleStandardOutcome(data: {
    standardOutcome: LearningOutcome;
    value: boolean;
  }) {
    this.store.execute(
      data.value
        ? actions.MAP_STANDARD_OUTCOME
        : actions.UNMAP_STANDARD_OUTCOME,
      { id: this.activeOutcome, standardOutcome: data.standardOutcome }
    );
  }

  ngOnDestroy() {
    // observable cleanup on component destroy
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
