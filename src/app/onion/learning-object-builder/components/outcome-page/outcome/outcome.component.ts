import { verbs, levels } from '@cyber4all/clark-taxonomy';
import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ViewChild
} from '@angular/core';
import { ModalService } from '../../../../../shared/modals';

import { fromEvent } from 'rxjs';
import { COPY } from './outcome.copy';
import 'rxjs/add/operator/debounceTime';

import { LearningObjectErrorStoreService } from '../../../errorStore';
import { LearningObjectStoreService } from '../../../store';
import { SuggestionService } from './standard-outcomes/suggestion/services/suggestion.service';
import { LearningOutcome, Outcome } from '@cyber4all/clark-entity';

@Component({
  selector: 'onion-outcome-component',
  templateUrl: 'outcome.component.html',
  styleUrls: ['./outcome.component.scss'],
  providers: [SuggestionService]
})
export class LearningObjectOutcomeComponent implements OnChanges, OnInit, OnDestroy {
  copy = COPY;
  @Input() outcome: LearningOutcome;
  @Input() index;
  @Input() submitted: number;
  @Output() deleteIndex: EventEmitter<Number> = new EventEmitter<Number>();

  @ViewChild('outcomeInput', {read: ElementRef}) outcomeInput: ElementRef;


  suggestOpen = false;
  suggestIndex: number;
  mappings: Array<Object>;
  bloomLevels;
  outcomeSuggestionText = '';

  classVerbs: { [level: string]: Set<string> };

  constructor(
    private suggestionService: SuggestionService,
    public modalService: ModalService,
    public errorStore: LearningObjectErrorStoreService,
    private store: LearningObjectStoreService,
  ) {}

  setupView(first?: boolean) {
    // FIXME: classVerbs should be sorted at the API
    this.classVerbs = this.sortVerbs();
    if (first && !this.outcome.text) {
      if (!this.outcome.bloom) {
        this.outcome.bloom = Object.keys(this.classVerbs)[0];
      }

      this.outcome.verb = Array.from(this.classVerbs[this.outcome.bloom || 'Remember and Understand'].values())[0];
    }

    this.suggestionService.updateMappings(this.outcome.mappings);
  }

  ngOnInit() {
    this.bloomLevels = levels;

    this.suggestionService.mappedSubject.subscribe(val => {
      this.mappings = val;
    });

    this.suggestionService.updateMappings(this.outcome.mappings);
    this.setupView(true);

    // pass the outcome text to the suggestion component
    this.outcomeSuggestionText = this.outcome.text;
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    fromEvent(this.outcomeInput.nativeElement, 'input').map(x => x['currentTarget'].value).debounceTime(650).subscribe(val => {
      this.outcomeSuggestionText = val;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (Object.values(changes).map(c => c.firstChange).indexOf(false) >= 0) {
      // don't call this on initialize, leave that for ngOnInit
      this.setupView();
    }
  }

  sortVerbs() {
    const sortedVerbs = verbs;
    sortedVerbs['Apply and Analyze'] = new Set(
      Array.from(sortedVerbs['Apply and Analyze']).sort(function(a, b) {
        const textA = a.toUpperCase();
        const textB = b.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      })
    );
    sortedVerbs['Remember and Understand'] = new Set(
      Array.from(sortedVerbs['Remember and Understand']).sort(function(a, b) {
        const textA = a.toUpperCase();
        const textB = b.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      })
    );
    sortedVerbs['Evaluate and Synthesize'] = new Set(
      Array.from(sortedVerbs['Evaluate and Synthesize']).sort(function(a, b) {
        const textA = a.toUpperCase();
        const textB = b.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      })
    );
    return sortedVerbs;
  }

  registerBloomsLevel(level) {
    this.outcome.bloom = level;
    this.outcome.verb = Array.from(this.classVerbs[this.outcome.bloom].values())[0];
  }

  updateFocus(i) {
    if (i !== this.suggestIndex) {
      this.suggestOpen = false;
    }
  }

  deleteOutcome() {
    this.deleteIndex.emit(this.index);
  }

  validate(): boolean {
    // check bloom, text, and verb
    if (this.outcome.bloom === '') {
      return false;
    }
    return !(this.outcome.text === '' || this.outcome.verb === '');
  }

  ngOnDestroy() {
    this.suggestionService.mappedSubject.unsubscribe();
  }

  updateSidebarText() {
    this.store.dispatch({ type: 'UPDATE_SIDEBAR_TEXT', request: { name: this.outcome.verb + ' ' + this.outcome.text } });
  }
}
