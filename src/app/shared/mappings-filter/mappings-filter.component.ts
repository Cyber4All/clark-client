import { Component, OnInit, EventEmitter, Output, ElementRef, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { OutcomeService } from '../../core/outcome.service';
import { LearningOutcome } from '@cyber4all/clark-entity';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'clark-mappings-filter',
  templateUrl: './mappings-filter.component.html',
  styleUrls: ['./mappings-filter.component.scss']
})
export class MappingsFilterComponent implements OnInit, OnDestroy {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Output() add: EventEmitter<{category: string, filter: string}> = new EventEmitter();
  @Output() remove: EventEmitter<{category: string, filter: string}> = new EventEmitter();

  outcomes: {source: string, outcomes: LearningOutcome[]}[];

  subs: Subscription[] = [];

  // flags
  focused = false;
  loading = false;
  clickedInside = false;
  resultsDown = false;
  sourcesDown = false;

  // TODO: sources should be fetched from an API route to allow dynamic configuration
  sources = [
    'CAE Cyber Defense',
    'CAE Cyber Ops',
    'CS2013',
    'NCWF',
    'NCWF KSAs',
    'NCWF Tasks',
    'CSEC'
  ];

  filter: { name?: string, author?: string, date?: string, filterText?: string } = {};


  @HostListener('window:click') handleClickAway() {
    console.log(this.clickedInside);
    if (this.clickedInside) {
      this.clickedInside = false;
    } else {
      // close sources first and leave results open
      if (this.sourcesDown) {
        this.sourcesDown = false;
      } else {
        this.resultsDown = false;
      }
    }
  }

  constructor(private outcomeService: OutcomeService) { }

  ngOnInit() {

    this.subs.push(
      Observable.fromEvent(this.searchInput.nativeElement, 'input')
      .map(x => x['currentTarget'].value)
      .debounceTime(650)
      .subscribe(val => {
        this.loading = true;
        this.filter.filterText = val;
        this.outcomeService.getOutcomes(this.filter).then((res: {total: number, outcomes: LearningOutcome[]}) => {
          this.loading = false;
          this.outcomes = this.separateOutcomes(res.outcomes);
          console.log(this.outcomes);
        });
      })
    );
  }

  ngOnDestroy() {
    for (let i = 0, l = this.subs.length; i < l; i++) {
      this.subs[i].unsubscribe();
    }
  }

  preventClose() {
    this.clickedInside = true;
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
