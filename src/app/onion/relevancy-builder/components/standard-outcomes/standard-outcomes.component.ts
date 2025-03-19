import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { Guideline } from '@entity';
import { GuidelineService } from 'app/core/standard-guidelines-module/standard-guidelines.service';
import { BuilderStore } from '../../builder-store.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { takeUntil, debounceTime, filter, map } from 'rxjs/operators';
import { SearchItemDocument } from 'entity/standard-guidelines/search-index';

export interface SuggestedOutcome extends SearchItemDocument {
  suggested?: boolean;
}

@Component({
  selector: 'clark-relevancy-outcomes',
  templateUrl: './standard-outcomes.component.html',
  styleUrls: ['./standard-outcomes.component.scss']
})
export class StandardOutcomesComponent implements OnChanges, OnDestroy {
  // id of the currently selected outcome
  @Input()
  activeOutcome: string;

  @Output()
  toggleMapping: EventEmitter<{
    standardOutcome: Guideline;
    value: boolean;
  }> = new EventEmitter();

  searchStringValue = '';
  searchString$: BehaviorSubject<string> = new BehaviorSubject('');

  suggestStringValue = '';
  suggestString$: Subject<string> = new Subject();

  componentDestroyed$: Subject<void> = new Subject();

  suggestions: SuggestedOutcome[] = [];
  searchResults: SuggestedOutcome[] = [];

  loading = undefined;

  constructor(
    private guidelineService: GuidelineService,
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
    this.loading = 'search';
    // set the selected outcome in the store
    this.store.active(this.activeOutcome);

    if (changes.activeOutcome && changes.activeOutcome.currentValue) {
      this.searchString$.next('');
      const tempSuggestString = this.store.getOutcomeText();

      if (this.suggestStringValue !== tempSuggestString) {
        this.suggestStringValue = tempSuggestString;
        this.suggestString$.next(this.suggestStringValue);
      } else {
        this.suggestions = [];
        this.suggestStringValue = '';
      }
    }
    this.loading = undefined;
  }

  toggleStandardOutcome(guideline: any, value: boolean) {
    guideline = new Guideline(guideline);
    this.toggleMapping.emit({ standardOutcome: guideline, value: value });
  }

  performSearch() {
    if (!this.searchStringValue || this.searchStringValue === '') {
      // string was empty, clear results
      this.searchResults = [];
    } else {
      // perform search
      this.loading = 'search';
      this.guidelineService
        .getGuidelines({
          text: this.searchStringValue,
          deprecated: 'false'
        })
        .then((res) => {
          if (this.suggestions.length) {
            // if we have suggestions, tag any of the search results that are also suggestions
            const suggestedIds: string[] = this.suggestions.map((o) => o._id);
            this.searchResults = res.results.map((searchItem) => {
              // @ts-ignore temporary non-saveable property indicating whether or not this guideline
              // was BOTH suggested and retrieved from the search result
              searchItem.suggested = suggestedIds.includes(searchItem._id);
              return searchItem;
            });
          } else {
            this.searchResults = res.results;
          }

          this.loading = undefined;
        });
    }
  }

  performSuggest(val: string) {
    if (val && val !== '') {
      this.loading = 'suggest';
      this.guidelineService
        .getGuidelines({
          text: val,
          deprecated: 'false'
        })
        .then((res) => {
          this.suggestions = res.results.map((o) => {
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
