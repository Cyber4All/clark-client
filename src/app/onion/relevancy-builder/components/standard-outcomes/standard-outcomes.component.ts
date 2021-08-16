import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { LearningOutcome, StandardOutcome } from '@entity';
import { OutcomeService } from 'app/core/outcome.service';
import { BuilderStore } from '../../builder-store.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { takeUntil, debounceTime, filter, map } from 'rxjs/operators';

export interface SuggestedOutcome extends StandardOutcome {
  suggested?: boolean;
}
@Component({
  selector: 'clark-standard-outcomes',
  templateUrl: './standard-outcomes.component.html',
  styleUrls: ['./standard-outcomes.component.scss']
})
export class StandardOutcomesComponent implements OnChanges, OnDestroy {
  // id of the currently selected outcome
  @Input()
  activeOutcome: string;

  @Output()
  toggleMapping: EventEmitter<{
    standardOutcome: StandardOutcome;
    value: boolean;
  }> = new EventEmitter();

  searchStringValue = '';
  searchString$: BehaviorSubject<string> = new BehaviorSubject('');

  suggestStringValue = '';
  suggestString$: Subject<string> = new Subject();

  componentDestroyed$: Subject<void> = new Subject();

  suggestions: SuggestedOutcome[] = [];
  searchResults: SuggestedOutcome[] = [];

  selectedOutcomeIDs: string[] = [];

  activeOutcomeSubscription: Subscription;

  loading = undefined;

  constructor(
    private outcomeService: OutcomeService,
    private store: BuilderStore
  ) {
    // handle searching
    this.searchString$
      .pipe(takeUntil(this.componentDestroyed$), debounceTime(650))
      .subscribe(() => {
        this.performSearch();
      });

    // handle suggesting
    this.suggestString$
      .pipe(takeUntil(this.componentDestroyed$), debounceTime(1000))
      .subscribe((val: string) => {
        this.performSuggest(val);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.activeOutcome && changes.activeOutcome.currentValue) {
      this.searchString$.next('');

      // if we have an open subscription to an outcome, close it
      if (this.activeOutcomeSubscription) {
        this.activeOutcomeSubscription.unsubscribe();
      }

      // subscribe to the store service and filter out the activeOutcome
      this.activeOutcomeSubscription = this.store.outcomeEvent
        .pipe(
          takeUntil(this.componentDestroyed$),
          filter((x) => x && !!x.get(this.activeOutcome)),
          map((x) => x.get(this.activeOutcome))
        )
        .subscribe((outcome: LearningOutcome) => {
          // this outcome is the currently selected outcome, this function fires everytime the outcome's text changes
          if (outcome.verb && outcome.verb !== '') {
            // don't perform suggestions on an empty verb
            const tempSuggestString = outcome.verb + ' ' + outcome.text;

            // if the text has changed, requery for suggestions
            if (this.suggestStringValue !== tempSuggestString) {
              this.suggestStringValue = tempSuggestString;
              this.suggestString$.next(this.suggestStringValue);
            }

            // update the selected outcomes list
            if (outcome.mappings) {
              this.selectedOutcomeIDs = outcome.mappings.map((x) => x.id);
            }
          } else {
            this.suggestions = [];
            this.suggestStringValue = '';
          }
        });
    }
  }

  toggleStandardOutcome(standardOutcome: StandardOutcome, value: boolean) {
    standardOutcome = new StandardOutcome(standardOutcome);
    this.toggleMapping.emit({ standardOutcome, value });
  }

  performSearch() {
    if (!this.searchStringValue || this.searchStringValue === '') {
      // string was empty, clear results
      this.searchResults = [];
    } else {
      // perform search
      this.loading = 'search';
      this.outcomeService
        .getOutcomes({
          text: this.searchStringValue,
        })
        .then((results) => {
          if (this.suggestions.length) {
            // if we have suggestions, tag any of the search results that are also suggestions
            const suggestedIds: string[] = this.suggestions.map((o) => o.id);
            this.searchResults = results.outcomes.map((o) => {
              // @ts-ignore temporary non-saveable property indicating whether or not this outcome
              // was BOTH suggested and retrieved from the search result
              o.suggested = suggestedIds.includes(o.id);
              return o;
            });
          } else {
            this.searchResults = results.outcomes;
          }

          this.loading = undefined;
        });
    }
  }

  performSuggest(val: string) {
    if (val && val !== '') {
      this.loading = 'suggest';
      this.outcomeService
        .suggestOutcomes(this.store.learningObjectEvent.getValue(), {
          text: val,
        })
        .then((results) => {
          this.suggestions = results.map((o) => {
            // @ts-ignore temporary non-saveable property indicating whether or not this outcome
            // was BOTH suggested and retrieved from the search result
            o.suggested = true;
            return o;
          });
          this.loading = undefined;
        });
    }
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
