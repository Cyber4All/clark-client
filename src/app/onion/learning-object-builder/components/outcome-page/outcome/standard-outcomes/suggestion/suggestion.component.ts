import { SuggestionService } from './services/suggestion.service';
import {
  Component, EventEmitter, Input, KeyValueDiffers, KeyValueDiffer, OnInit, OnDestroy,
  OnChanges, Output, SimpleChanges, SimpleChange, ChangeDetectorRef
} from '@angular/core';
import { providers } from 'ng2-dnd';
import { OutcomeSuggestion, StandardOutcome } from '@cyber4all/clark-entity';

/*
  TODO: Automatically check or hide standards that are currently mapped from the suggestion view
  TODO: Uncheck/unhide an outcome that is deselected from the mappings-list view
*/

@Component({
  selector: 'onion-suggestion-component',
  templateUrl: './suggestion.component.html',
  styleUrls: ['suggestion.component.scss']
})
export class SuggestionComponent implements OnInit, OnChanges {

  private _differ: any;
  @Input('mappings') mappings: Array<OutcomeSuggestion> = [];
  @Input('outcome') outcome: string;

  standardAppear: boolean;
  standardOutcomes: Array<StandardOutcome> = [];
  connection;
  filter = {
    author: undefined,
    date: undefined,
    name: undefined,
    page: 1,
    limit: 10
  };
  pageCount: number = 0;


  constructor(private loader: SuggestionService, private _differs: KeyValueDiffers) {
    this._differ = _differs.find(this.filter).create();
  }

  ngOnInit() {
    this.standardAppear = false;
    this.connection = this.loader.observe().subscribe(data => {
      this.standardOutcomes = data as Array<StandardOutcome>;
      
      this.pageCount = this.loader.mappings.total;
      
    });
    this.loader.emit(this.outcome, this.filter);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.outcome) {
      this.loader.emit(this.outcome, this.filter);
    }
  }

  open(content) {
    this.standardAppear = !this.standardAppear;
  }

  updateDate(e) {
    this.filter.date = e;
    this.loader.emit(this.outcome, this.filter);
  }

  updateSource(e) {
    this.filter.author = e;
    this.loader.emit(this.outcome, this.filter);
  }

  updateName(e) {
    this.filter.name = e;
    this.loader.emit(this.outcome, this.filter);
  }

  toggleStandard(suggestion) {
      if (!this.mappings || !this.mappings.filter(x => x.id === suggestion.id).length) {
        this.addStandard(suggestion);
      } else {
        this.removeStandard(suggestion);
      }
  }

  addStandard(suggestion) {
    if (!this.mappings || (suggestion && !this.mappings.filter(x => x.id === suggestion.id).length)) {
      this.loader.addMapping(suggestion);
    }
  }

  removeStandard(suggestion) {
    // Remove from local Map
    if (suggestion && this.mappings.filter(x => x.id === suggestion.id).length) {
      this.loader.removeMapping(suggestion);
    }
  }

  standardShouldHide(s) {
    return this.loader.mappedStandards.filter(outcome => {
      return outcome.id === s.id;
    }).length > 0;
  }

  // creates an array of numbers where each represents a page that can be navigated to.
  // defaults to a grand total of 5 pages, either your page in the middle and two on each side,
  // or (if you're say on page 2) 1 page on the left and 3 pages on the right. (1, [2], 3, 4, 5)
  pages() {
    const total = 5;
    const cursor = +this.filter.page;
    let count = 1;
    let upCount = 1;
    let downCount = 1;
    const arr = [cursor];

    if (this.standardOutcomes.length) {
      while (count < Math.min(total, this.pageCount)) {
        if (cursor + upCount <= this.pageCount) {
          arr.push(cursor + upCount++);
          count++;
        }

        if (cursor - downCount > 0) {
          arr.unshift(cursor - downCount++);
          count++;
        }
      }
    } else {
      return [];
    }

    return arr;
  }

  // navigate to previous page
  prevPage() {
    const page = +this.filter.page - 1;
    if (page > 0) {
      this.filter.page = page;
      this.loader.emit(this.outcome, this.filter);

    }
  }

  // navigate to next page
  nextPage() {
    const page = +this.filter.page + 1;
    if (page <= this.pageCount) {
      this.filter.page = page;
      this.loader.emit(this.outcome, this.filter);
    }
  }

  // navigate to a numbered page
  goToPage(page) {
    if (page > 0 && page <= this.pageCount) {
      this.filter.page = +page;
      this.loader.emit(this.outcome, this.filter);

    }
  }
}
