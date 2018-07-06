import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild } from '@angular/core';
import { OutcomeSuggestion } from '@cyber4all/clark-entity';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import { OutcomeService } from '../../core/outcome.service';
import {
  SuggestionService
} from '../../onion/learning-object-builder/components/outcome-page/outcome/standard-outcomes/suggestion/services/suggestion.service';
import { ModalListElement, ModalService, Position } from '../../shared/modals';

@Component({
  selector: 'clark-browse-by-mappings-component',
  templateUrl: './browse-by-mappings.component.html',
  styleUrls: ['./browse-by-mappings.component.scss']
})
export class BrowseByMappingsComponent implements OnInit, AfterViewChecked, OnChanges {
  // Inputs
  @Input() dimensions = {}; // should be of format {w?: number (in pixels), h?: number (in pixels)}
  @Input() source: string;
  // array of applied mappings (grabbed from service on init and then updated when above input/output actions require it
  @Input() mappings: Array<OutcomeSuggestion> = [];
  // dictates whether this component should remain in the document flow or not (IE if this is in a modal, inflow should be false)
  @Input() inflow: boolean;

  // Outputs
  @Output('done') done = new EventEmitter<boolean>();
  @Output('sourceChanged') sourceChanged = new EventEmitter<string>();

  @ViewChild('mappingSearchInput', {read: ElementRef}) mappingsSearchInput: ElementRef;

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

  mappingsQueryInProgress = false;

  // array of results (outcomes) from a query
  queriedMappings: any[] = [];

  // empty observable to be instantiated after the view is checked
  // will watch the input and query the database after user has stopped typing
  mappingsFilterInput: Observable<string>;
  mappingsFilterInputError = false;

  mappingsQueryError = false;

  @Input() showMappedOutcomesTitle;

  constructor(
    private modalService: ModalService,
    private outcomeService: OutcomeService,
    public mappingService: SuggestionService
  ) { }

  ngOnInit() {
    this.mappingService.author = this.sources[0];

    // check if the service has filterText and author and conditionally populate component
    // if someone opens component, performs a query, closes the component, and then reopens the component
    if (this.mappingService.filterText && this.mappingService.author) {
      this.mappingsQueryInProgress = true;
      this.getOutcomes().then(() => {
        this.mappingsQueryInProgress = false;
      });
    }

    // if this.inflow === undefined, set it to true, else leave it alone
    if (this.inflow === undefined) {
      this.inflow = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.mappingsInput) {
      this.mappings = changes.mappingsInput.currentValue;
    }
  }

  ngAfterViewChecked() {
    // TODO change binding to use a FormControl
    // instantiate observable to watch input and fire events when user stops typing
    if (!this.mappingsFilterInput) {
      try {
        // try here in the off chance that this event loop is called before the component actually loads
        // (EG inside the learning outcome component in object builder)
        this.bindFilterInput();
      } catch (error) {
        // if this is true, we know to try again when a source is selected
        this.mappingsFilterInputError = true;
      }
    }
  }

  bindFilterInput() {
    this.mappingsFilterInput = Observable
      .fromEvent(this.mappingsSearchInput.nativeElement, 'input')
      .map(x => x['currentTarget'].value).debounceTime(650);

      // listen for user to stop typing in the text input and perform query
    this.mappingsFilterInput.subscribe(val => {
      if (this.mappingService.author && this.mappingService.author !== '') {
        this.mappingsQueryInProgress = true;
        this.getOutcomes().then(() => {
          this.mappingsQueryInProgress = false;
        });
      }
    });
  }

  // emits from the done event emitter (useful if this component is in a modal)
  close() {
    this.done.emit(true);
  }

  // displays the sources dropdown contextmenu
  showSources(event) {
    this.modalService.makeContextMenu(
      'SourceContextMenu',
      'dropdown',
      this.sources.map(s => new ModalListElement(s, s, (s === this.mappingService.author) ? 'active' : undefined)),
      this.inflow,
      null,
      new Position(
        this.modalService.offset(event.currentTarget).left - (190 - event.currentTarget.offsetWidth),
        this.modalService.offset(event.currentTarget).top + 50))
      .subscribe(val => {
        if (val !== 'null') {
          this.mappingService.author = val;
          this.mappingsQueryInProgress = true;

          if (this.mappingsFilterInputError || !this.mappingsFilterInput) {
            // if we had an error when we tried to bind to the search input in the AfterViewChecked, try again now that we
            // know the component is loaded and displayed
            try {
              this.bindFilterInput();
              this.mappingsFilterInputError = false;
            } catch (error) {
              this.mappingsFilterInputError = false;
            }
          }

          this.getOutcomes().then(() => {
            this.mappingsQueryInProgress = false;
          });
        }
      });
  }

  // queries database with author and filterText
  getOutcomes(): Promise<void> {
    this.mappingsQueryError = false;
    const filters = {
      filterText: this.mappingService.filterText,
      author: this.mappingService.author
    };
    return this.outcomeService.getOutcomes(filters).then(res => {
      this.queriedMappings = res['outcomes'];
      if (!this.queriedMappings.length && this.mappingService.filterText !== '') {
        this.mappingsQueryError = true;
      }
    });
  }

  // checks lists of outcomes for a specific outcome
  checkOutcomes(outcome): boolean {
    if (this.mappings && this.mappings.length) {
      for (let i = 0; i < this.mappings.length; i++) {
        if (this.mappings[i]['id'] === outcome.id) {
          return true;
        }
      }
    }
    return false;
  }

  // adds an outcome to the list of selected outcomes
  addOutcome(outcome) {
    if (!this.mappings || (outcome && !this.mappings.filter(x => x.id === outcome.id).length)) {
      this.mappingService.addMapping(outcome);
    }
  }

  // removes an outcome from list of selected outcomes
  removeOutcome(outcome) {
    if (outcome && this.mappings.filter(x => x.id === outcome.id).length) {
      this.mappingService.removeMapping(outcome);
    }
  }

  // truncates and appends an ellipsis to block of text based on maximum number of characters
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
