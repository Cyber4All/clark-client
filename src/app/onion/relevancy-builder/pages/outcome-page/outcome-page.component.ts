import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningOutcome, StandardOutcome } from '@entity';
import {
  BuilderStore,
  BUILDER_ACTIONS as actions
} from '../../builder-store.service';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { LearningObjectValidator } from '../../validators/learning-object.validator';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-relevancy-outcome-page',
  templateUrl: './outcome-page.component.html',
  styleUrls: ['./outcome-page.component.scss']
})
export class OutcomePageComponent implements OnInit, OnDestroy {

  private _outcomes: Map<string, LearningOutcome> = new Map();
  destroyed$: Subject<void> = new Subject();
  learningObject: LearningObject;

  // flags
  activeOutcome: string;
  // passed outcome id from query params
  passedId: string;

  saveable: boolean;

  constructor(
    private toaster: ToastrOvenService,
    private store: BuilderStore,
    private validator: LearningObjectValidator,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // listen for outcome events and update component stores
    this.store.learningObjectEvent
    .pipe(
      filter(learningObject => learningObject !== undefined),
      takeUntil(this.destroyed$)
    ).subscribe((payload: LearningObject) => {
      this.learningObject = payload;
    });
    // subscribe to params from activated route
    this.route.paramMap.pipe(takeUntil(this.destroyed$)).subscribe(params => {
      this.setActiveOutcome(params.get('id'));
    });

    // listen for outcome events and update component store
    this.store.outcomeEvent
      .pipe(takeUntil(this.destroyed$))
      .subscribe((payload: Map<string, LearningOutcome>) => {
        if (payload) {
          // reset our outcomes map
          this.outcomes = payload;
        }
      });
      this.validateNewOutcome();
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
      this.activeOutcome = outcomes.values().next().value.id;
    }
  }

  setActiveOutcome(id: string) {
    if (id !== this.activeOutcome) {
      this.store.sendOutcomeCache();
      this.activeOutcome = id;
    }
  }

  mutateOutcome(id: string, params: any) {
    this.store.execute(actions.MUTATE_OUTCOME, { id, params }).then((outcome: LearningOutcome) => {
      this.validator.validateLearningOutcome(outcome);
      this.validateNewOutcome();
    });
  }

  newOutcome() {
    this.store.execute(actions.CREATE_OUTCOME, {}).then(id => {
      // TODO remove this
      const outcome = this.store.outcomeEvent.getValue().get(id);
      this.validator.validateLearningOutcome(outcome);
      this.validateNewOutcome();
      setTimeout(() => {
        this.activeOutcome = id;
      }, 100);
    });
  }

  deleteOutcome(id: string) {
    this.store.execute(actions.DELETE_OUTCOME, { id }).then(() => {
      this.validateNewOutcome();
      if (this.iterableOutcomes.length) {
        setTimeout(() => {
          this.activeOutcome = this.iterableOutcomes[
            this.iterableOutcomes.length - 1
          ].id;
        }, 100);
      }
    }).catch(error => {
      if (typeof error === 'string') {
        this.toaster.error('Error saving learning object!', error);
      } else {
        console.error(error);
      }
    });
  }

  toggleStandardOutcome(data: {
    standardOutcome: StandardOutcome;
    value: boolean;
  }) {
    this.store.execute(
      data.value
        ? actions.MAP_STANDARD_OUTCOME
        : actions.UNMAP_STANDARD_OUTCOME,
      { id: this.activeOutcome, standardOutcome: data.standardOutcome }
    );
  }

  // This functions validates that an outcome is valid. if valid, enables the Add Outcome button
  validateNewOutcome() {
    const lastOutcome = this.iterableOutcomes[this.iterableOutcomes.length - 1];
    if (lastOutcome === undefined) {
      this.saveable = true;
    } else {
      if (lastOutcome.bloom !== '' && lastOutcome.text !== '' && lastOutcome.verb !== '') {
        this.saveable = true;
      } else {
        this.saveable = false;
      }
    }
  }

  ngOnDestroy() {
    // observable cleanup on component destroy
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
