import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  ElementRef,
  ViewChild,
  OnDestroy,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { OutcomeService } from '../../core/outcome.service';
import { LearningOutcome } from '@cyber4all/clark-entity';
import {  Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime, map, filter } from 'rxjs/operators'

import 'rxjs/add/operator/debounceTime';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'clark-mappings-filter',
  templateUrl: './mappings-filter.component.html',
  styleUrls: ['./mappings-filter.component.scss']
})
export class MappingsFilterComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() source: string;
  @Input() close: Subject<boolean>;
  @Input() focus: Subject<boolean>;
  @Input() blur: Subject<boolean>;

  @Output() didFocus: EventEmitter<any> = new EventEmitter();
  @Output() add: EventEmitter<{ category: string, filter: string }> = new EventEmitter();
  @Output() remove: EventEmitter<{ category: string, filter: string }> = new EventEmitter();
  @Output() toggleSource: EventEmitter<string> = new EventEmitter();

  outcomes: {source: string, outcomes: LearningOutcome[]}[];

  // fired when the component is destroyed
  destroyed$: Subject<void> = new Subject();

  // flags
  focused = false;
  loading = false;
  clickedInsideResults = false;
  clickedInsideSources = false;
  resultsDown = false;
  sourcesDown = false;

  // this array is fetched from the outcome service and populated
  possibleSources = [];

  // if set, this is the last outcome that was emitted as an addition
  focusedOutcome: LearningOutcome;

  filter: { name?: string, author?: string, date?: string, filterText?: string } = {};


  /**
   * Listener for handling clicking away from a dropdown
   * @param step If true, will close the top-most dropdown and return. (1 at a time) otherwise closes everything
   */
  @HostListener('window:click') handleClickAway(step?: boolean) {
    let stop = false;

    if (this.clickedInsideSources) {
      this.clickedInsideSources = false;
    } else {
      this.sourcesDown = false;
      stop = true;
    }

    if (stop && step) {
      return;
    }

    if (this.clickedInsideResults) {
      this.clickedInsideResults = false;
    } else {
      this.resultsDown = false;
    }
  }

  @HostListener('window:keyup', ['$event']) handleEscape(event: KeyboardEvent) {
    this.closeDropdowns(true);
  }

  constructor(private outcomeService: OutcomeService, private router: Router) {
    this.router.events.pipe(
      takeUntil(this.destroyed$),
      filter(x => x instanceof NavigationEnd),
    ).subscribe((val: NavigationEnd) => {
      if (/browse/.test(val.urlAfterRedirects) && !/standardOutcome/.test(val.urlAfterRedirects)) {
        // we've cleared the input, remove the pill
        this.clear();
      }
    })
  }

  ngOnInit() {
    // listen for events on the search input and call search functions or clear results list
    fromEvent(this.searchInput.nativeElement, 'input').pipe(
      map(x => x['currentTarget'].value),
      takeUntil(this.destroyed$),
      debounceTime(650)
    )
    .subscribe(val => {
      if (val && val !== '') {
        this.loading = this.resultsDown = true;
        this.filter.filterText = val;
        this.getOutcomes(this.filter);
      } else {
        this.loading = this.resultsDown = false;
        this.outcomes = [];
      }
    })

    // listen for the instruction to close from the parent and close dropdowns
    if (this.close) {
      this.close.pipe(
        takeUntil(this.destroyed$)
      ).subscribe({
        next: () => {
          this.closeDropdowns();
        }
      });
    }

    // listen for the instruction to focus the search input from the parent and handle it
    if (this.focus) {
      this.focus.pipe(
        takeUntil(this.destroyed$)
      ).subscribe({
        next: () => {
          this.searchInput.nativeElement.focus();
        }
      });
    }

    // listen for the instruction to blur the search input from the parent and handle it
    if (this.blur) {
      this.blur.pipe(
        takeUntil(this.destroyed$)
      ).subscribe({
        next: () => {
          this.searchInput.nativeElement.blur();
        }
      });
    }

    // fetch list of sources
    this.outcomeService.getSources().then(val => {
      this.possibleSources = val;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.close) {
      this.clickedInsideResults = this.clickedInsideSources = this.resultsDown = this.sourcesDown = false;
    }

    if (changes.source) {
      this.filter.author = changes.source.currentValue;
      this.closeDropdowns(true);

      if (this.resultsDown) {
        this.loading = true;
        this.getOutcomes(this.filter);
      }
    }
  }

  /**
   * Handles the focus event on the search input. Initiates the results dropdown if needed and emits the event to the parent
   *
   * @param {string} inputValue
   * @memberof MappingsFilterComponent
   */
  focusInput(inputValue: string) {
    if (inputValue && inputValue !== '' && !this.resultsDown) {
      this.resultsDown = true;
      this.loading = true;
      this.getOutcomes(this.filter);
    }

    this.focused = true;
    this.didFocus.emit();
  }

  /**
   * Emits the addition of an outcome to the parent components and sets it as the focused outcome
   *
   * @param {LearningOutcome} outcome
   * @memberof MappingsFilterComponent
   */
  addOutcome(outcome: LearningOutcome) {
    this.focusedOutcome = outcome;
    this.add.emit({ category: 'mappings', filter: outcome.id });
  }

  /**
   * * Emits the removal of an outcome to the parent component and removes the focused outcome
   *
   * @param {LearningOutcome} outcome the otucome to remove
   * @memberof MappingsFilterComponent
   */
  removeOutcome(outcome: LearningOutcome) {
    this.focusedOutcome = undefined;
    this.remove.emit({ category: 'mappings', filter: outcome.id });
  }
  
  /**
   * Prevents the closure of a dropdown
   *
   * @param {('results' | 'sources')} dropdown the dropdown to prevent closure of
   * @memberof MappingsFilterComponent
   */
  preventClose(dropdown: 'results' | 'sources') {
    if (dropdown === 'results') {
      this.clickedInsideResults = true;
    } else {
      this.clickedInsideSources = true;
    }
  }

  /**
   * Closes dropdowns (like search results and the sources list)
   *
   * @param {boolean} [step] if true, closes only first open dropdown, otherwise forces all dropdowns to close
   * @memberof MappingsFilterComponent
   */
  closeDropdowns(step?: boolean) {
    this.clickedInsideResults = this.clickedInsideSources = false;

    if (step) {
      if (this.sourcesDown) {
        this.sourcesDown = false;
      } else {
        this.resultsDown = false;
      }
    } else {
      this.resultsDown = this.sourcesDown = false;
    }
  }

  clear() {
    this.searchInput.nativeElement.value = '';
    this.removeOutcome(this.focusedOutcome);
  }

  /**
   * Fetch outcomes from service with any selected filters
   *
   * @private
   * @param {{ name?: string, author?: string, date?: string, filterText?: string }} filter
   * @memberof MappingsFilterComponent
   */
  private getOutcomes(filter: { name?: string, author?: string, date?: string, filterText?: string }) {
    this.outcomeService.getOutcomes(filter).then((res: {total: number, outcomes: LearningOutcome[]}) => {
      this.loading = false;
      this.outcomes = this.separateOutcomes(res.outcomes);
    });
  }

  /**
   * Takes an array of outcomes and separates them by source
   *
   * @private
   * @param {LearningOutcome[]} outcomes
   * @returns {{source: string, outcomes: LearningOutcome[]}[]}
   * @memberof MappingsFilterComponent
   */
  private separateOutcomes(outcomes: LearningOutcome[]): {source: string, outcomes: LearningOutcome[]}[] {
    const results: {source: string, outcomes: LearningOutcome[]}[] = [];
    const sources = [];

    for (let i = 0, l = outcomes.length; i < l; i++) {
      if (!sources.includes(outcomes[i].author)) {
        // we haven't seen this outcome yet
        sources.push(outcomes[i].author);
        results.push({source: outcomes[i].author, outcomes: [outcomes[i]]});
      } else {
        // we've already seen it
        const index = sources.indexOf(outcomes[i].author);
        results[index].outcomes.push(outcomes[i]);
      }
    }

    return results;
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
