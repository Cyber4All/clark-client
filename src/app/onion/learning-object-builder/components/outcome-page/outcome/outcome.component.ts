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

@Component({
  selector: 'onion-outcome-component',
  templateUrl: 'outcome.component.html',
  styleUrls: ['./outcome.component.scss'],
  providers: [SuggestionService]
})
export class LearningObjectOutcomeComponent implements OnChanges, OnInit, OnDestroy {
  copy = COPY;
  @Input() outcome;
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
    if (first && !this.outcome._text) {
      // THIS CHECK ONLY PASSES BECAUSE VALIDATION PREVENTS SAVING OUTCOMES WITHOUT TEXT
      this.outcome._verb = Array.from(this.classVerbs[this.outcome._bloom].values())[0];
    }

    this.suggestionService.updateMappings(this.outcome._mappings);
  }

  ngOnInit() {
    this.bloomLevels = levels;

    this.suggestionService.mappedSubject.subscribe(val => {
      this.mappings = val;
      if (this.outcome) {
        this.outcome._mappings = this.mappings;
      }
    });

    this.suggestionService.updateMappings(this.outcome._mappings);
    this.setupView(true);

    // pass the outcome text to the suggestion component
    this.outcomeSuggestionText = this.outcome._text;
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
    this.outcome._bloom = level;
    this.outcome._verb = Array.from(this.classVerbs[this.outcome._bloom].values())[0];
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
    if (this.outcome._bloom === '') {
      return false;
    }
    return !(this.outcome._text === '' || this.outcome._verb === '');
  }

  ngOnDestroy() {
    this.suggestionService.mappedSubject.unsubscribe();
  }

  updateSidebarText() {
    this.store.dispatch({ type: 'UPDATE_SIDEBAR_TEXT', request: { name: this.outcome.verb + ' ' + this.outcome.text } });
  }
}
