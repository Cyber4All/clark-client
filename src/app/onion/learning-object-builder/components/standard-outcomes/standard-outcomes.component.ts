import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy
} from '@angular/core';
import { LearningOutcome } from '@cyber4all/clark-entity';
import { OutcomeService } from 'app/core/outcome.service';
import { BuilderStore } from '../../builder-store.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { takeUntil, debounceTime, filter, map } from 'rxjs/operators';

interface SuggestedOutcome extends LearningOutcome {
  suggested?: boolean;
}

@Component({
  selector: 'clark-standard-outcomes',
  templateUrl: './standard-outcomes.component.html',
  styleUrls: ['./standard-outcomes.component.scss']
})
export class StandardOutcomesComponent implements OnInit, OnChanges, OnDestroy {
  // id of the currently selected outcome
  @Input()
  activeOutcome: string;

  searchStringValue = '';
  searchString$: BehaviorSubject<string> = new BehaviorSubject('');
  suggestString$: Subject<string> = new Subject();
  componentDestroyed$: Subject<void> = new Subject();

  suggestions: SuggestedOutcome[] = [];
  searchResults: SuggestedOutcome[] = [];

  activeOutcomeSubscription: Subscription;

  loading = false;

  constructor(
    private outcomeService: OutcomeService,
    private store: BuilderStore
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.activeOutcome && changes.activeOutcome.currentValue) {
      this.searchString$.next('');

      // if we have an open subscription to an outcome, close it
      if (this.activeOutcomeSubscription) {
        this.activeOutcomeSubscription.unsubscribe();
      }

      // grab full selected outcome from activeOutcome id and suggest outcomes for it
      const currentOutcome = this.store.outcomes.get(this.activeOutcome);
      this.suggestString$.next(currentOutcome.verb + ' ' + currentOutcome.text);

      // subscribe to the store service and filter out the activeOutcome
      this.activeOutcomeSubscription = this.store.event
        .pipe(
          takeUntil(this.componentDestroyed$),
          filter(
            x => x.type === 'outcome' && x.payload.get(this.activeOutcome)
          ),
          map(x => x.payload.get(this.activeOutcome))
        )
        .subscribe((outcome: LearningOutcome) => {
          // this outcome is the currently selected outcome, this function fires everytime the outcome's text changes
          this.suggestString$.next(outcome.verb + ' ' + outcome.text);
        });
    }
  }

  ngOnInit() {
    // handle searching
    this.searchString$
      .pipe(
        takeUntil(this.componentDestroyed$),
        debounceTime(650)
      )
      .subscribe(() => {
        if (!this.searchStringValue || this.searchStringValue === '') {
          // string was empty, clear results
          this.searchResults = [];
        } else {
          // perform search
          this.loading = true;
          this.outcomeService.getOutcomes({
              text: this.searchStringValue
            })
            .then(results => {
              if (this.suggestions.length) {
                // if we have suggestions, tag any of the search results that are also suggestions
                const suggestedIds: string[] = this.suggestions.map(o => o.id);
                this.searchResults = results.outcomes.map(o => {
                  o.suggested = suggestedIds.includes(o.id);
                  return o;
                });
              } else {
                this.searchResults = results.outcomes;
              }

              this.loading = false;
            });
        }
      });

    // handle suggesting
    this.suggestString$
      .pipe(
        takeUntil(this.componentDestroyed$),
        debounceTime(1000)
      )
      .subscribe((val: string) => {
        if (val && val !== '') {
          this.loading = true;
          this.outcomeService
            .suggestOutcomes(this.store.learningObject, { text: val })
            .then(results => {
              this.suggestions = results;
              this.loading = false;
            });
        }
      });
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
