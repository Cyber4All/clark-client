import { Component, OnInit, Output, Input, EventEmitter, AfterViewChecked } from '@angular/core';
import { ModalService, Position, ModalListElement } from '../../../shared/modals';
import { OutcomeService } from '../../core/services/outcome.service';

// RXJS
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'browse-by-mappings-component',
  templateUrl: './browse-by-mappings.component.html',
  styleUrls: ['./browse-by-mappings.component.scss']
})
export class BrowseByMappingsComponent implements OnInit, AfterViewChecked {
  // Inputs
  @Input('open') open: boolean;
  @Input('source') source;

  // Outputs
  @Output('mappings') mappings = new EventEmitter<Array<any>>();
  @Output('closed') closed = new EventEmitter<boolean>();

  // TODO: sources should be fetched from an API route to allow dynamic configuration
  sources = ['NCWF', 'CAE', 'CS2013'];
  mappingsQueryInProgress = false;
  mappingsFilters: { filterText: string, author: string, date: string } = {
    filterText: '',
    author: '',
    date: ''
  };
  queriedMappings: any[] = [];
  standardOutcomes: any[] = [];
  mappingsFilterInput: Observable<string>;
  mappingsCheckbox: any;
  mappingsQueryError = false;

  constructor(private modalService: ModalService, private outcomeService: OutcomeService) { }

  ngOnInit() {
  }

  ngAfterViewChecked() {
    if (this.open && !this.mappingsFilterInput) {
      this.mappingsFilterInput = Observable
        .fromEvent(document.getElementById('mappingsFilter'), 'input')
        .map(x => x['currentTarget'].value).debounceTime(650);

      this.mappingsFilterInput.subscribe(val => {
        if (this.mappingsFilters.author && this.mappingsFilters.author !== '') {
          this.mappingsQueryInProgress = true;
          this.getOutcomes().then(() => {
            this.mappingsQueryInProgress = false;
          });
        }
      });
    }
  }

  close() {
    this.mappings.emit(this.standardOutcomes);
    this.closed.emit(true);
  }

  showSources(event) {
    this.modalService.makeContextMenu(
      'SourceContextMenu',
      'dropdown',
      this.sources.map(s => new ModalListElement(s, s, (s === this.mappingsFilters.author) ? 'active' : undefined)),
      null,
      new Position(
        this.modalService.offset(event.currentTarget).left - (190 - event.currentTarget.offsetWidth),
        this.modalService.offset(event.currentTarget).top + 50))
      .subscribe(val => {
        if (val !== 'null') {
          this.mappingsFilters.author = val;
          this.mappingsQueryInProgress = true;
          this.getOutcomes().then(() => {
            this.mappingsQueryInProgress = false;
          });
        }
      });
  }

  getOutcomes(): Promise<void> {
    this.mappingsQueryError = false;
    return this.outcomeService.getOutcomes(this.mappingsFilters).then(res => {
      this.queriedMappings = res;
      if (!this.queriedMappings.length && this.mappingsFilters.filterText !== '') {
        this.mappingsQueryError = true;
      }
    });
  }

  checkOutcomes(outcome): boolean {
    for (let i = 0; i < this.standardOutcomes.length; i++) {
      if (this.standardOutcomes[i]['id'] === outcome.id) {
        return true;
      }
    }
    return false;
  }

  addOutcome(outcome) {
    if (!this.checkOutcomes(outcome)) {
      const o = { id: outcome.id, name: outcome.name, source: this.mappingsFilters.author, date: outcome.date, outcome: outcome.outcome };
      (<{ id: string, name: string, date: string, outcome: string }[]>this.standardOutcomes).push(o);
    }
  }

  removeOutcome(outcome) {
    for (let i = 0; i < this.standardOutcomes.length; i++) {
      if (this.standardOutcomes[i]['id'] === outcome.id) {
        this.standardOutcomes.splice(i, 1);
        return;
      }
    }
  }

  outcomeText(text: string, max: number = 150, margin: number = 10): string {
    let outcome = text.substring(0, max);
    const spaceAfter = text.substring(max).indexOf(' ') + outcome.length;
    const spaceBefore = outcome.lastIndexOf(' ');

    if (outcome.charAt(outcome.length - 1) === '.') {
      return outcome;
    } else if (outcome.charAt(outcome.length - 1) === ' ') {
      return outcome.substring(0, outcome.length - 1) + '...';
    }

    // otherwise we're in the middle of a word and should attempt to finsih the word before adding an ellpises
    if (spaceAfter - outcome.length - 1 <= margin) {
      outcome = text.substring(0, spaceAfter);
    } else {
      outcome = text.substring(0, spaceBefore);
    }

    return outcome.trim() + '...';
  }

}
