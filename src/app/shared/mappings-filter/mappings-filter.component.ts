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
  SimpleChanges,
  IterableDiffers,
  DoCheck,
  IterableDiffer
} from '@angular/core';
import { OutcomeService } from '../../core/outcome.service';
import { LearningOutcome } from '@cyber4all/clark-entity';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'clark-mappings-filter',
  templateUrl: './mappings-filter.component.html',
  styleUrls: ['./mappings-filter.component.scss']
})
export class MappingsFilterComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() source: string;
  @Input() close: Subject<any>;

  @Output() add: EventEmitter<{ category: string, filter: string }> = new EventEmitter();
  @Output() remove: EventEmitter<{ category: string, filter: string }> = new EventEmitter();
  @Output() toggleSource: EventEmitter<string> = new EventEmitter();

  outcomes: {source: string, outcomes: LearningOutcome[]}[];

  subs: Subscription[] = [];

  // flags
  focused = false;
  loading = false;
  clickedInsideResults = false;
  clickedInsideSources = false;
  resultsDown = false;
  sourcesDown = false;

  // TODO: sources should be fetched from an API route to allow dynamic configuration
  possibleSources = [
    'CAE Cyber Defense',
    'CAE Cyber Ops',
    'CS2013',
    'NCWF',
    'NCWF KSAs',
    'NCWF Tasks',
    'CSEC'
  ];

  filter: { name?: string, author?: string, date?: string, filterText?: string } = {};


  /**
   * 
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

  constructor(private outcomeService: OutcomeService) { }

  ngOnInit() {

    this.subs.push(
      Observable.fromEvent(this.searchInput.nativeElement, 'input')
      .map(x => x['currentTarget'].value)
      .debounceTime(650)
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
    );

    if (this.close) {
      this.subs.push(this.close.subscribe(val => {
        this.closeDropdowns();
      }));
    }
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

  ngOnDestroy() {
    for (let i = 0, l = this.subs.length; i < l; i++) {
      this.subs[i].unsubscribe();
    }

    this.subs = [];
  }

  focusInput(inputValue: string) {
    if (inputValue && inputValue !== '' && !this.resultsDown) {
      this.resultsDown = true;
      this.loading = true;
      this.getOutcomes(this.filter);
    }

    this.focused = true;
  }

  addOutcome(outcome: LearningOutcome) {
    this.add.emit({ category: 'mappings', filter: outcome.id });
  }

  removeOutcome(outcome: LearningOutcome) {
    this.remove.emit({ category: 'mappings', filter: outcome.id });
  }

  preventClose(event: MouseEvent, dropdown: 'results' | 'sources') {
    if (dropdown === 'results') {
      this.clickedInsideResults = true;
    } else {
      this.clickedInsideSources = true;
    }
  }

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

  private getOutcomes(filter) {
    this.outcomeService.getOutcomes(filter).then((res: {total: number, outcomes: LearningOutcome[]}) => {
      this.loading = false;
      this.outcomes = this.separateOutcomes(res.outcomes);
    });
  }

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

}
