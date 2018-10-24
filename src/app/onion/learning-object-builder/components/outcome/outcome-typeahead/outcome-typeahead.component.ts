import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { map, filter, takeUntil } from 'rxjs/operators';
import { verbs, levels } from '@cyber4all/clark-taxonomy';
import 'rxjs/add/operator/takeUntil';
import { LearningOutcome } from '@cyber4all/clark-entity';
import { BuilderStore } from '../../../builder-store.service';

@Component({
  selector: 'clark-outcome-typeahead',
  templateUrl: './outcome-typeahead.component.html',
  styleUrls: ['./outcome-typeahead.component.scss']
})
export class OutcomeTypeaheadComponent implements OnInit, OnDestroy {

  @ViewChild('verbElement') verbElement: ElementRef;

  @Input() outcome: LearningOutcome;

  verb: string;
  category: string;

  goodVerb: boolean;
  text = '';

  input$ = new Subject<KeyboardEvent>();
  componentDestroyed$ = new Subject<void>();

  menu = false;

  @Output() selectedVerb: EventEmitter<string> = new EventEmitter();
  @Output() selectedCategory: EventEmitter<string> = new EventEmitter();
  @Output() enteredText: EventEmitter<string> = new EventEmitter();

  /**
   * Listen for click aways from the dropdown menu
   */
  @HostListener('document:click', ['$event']) clickout() {
    this.toggleMenu(false);
  }

  constructor(private store: BuilderStore) { }

  ngOnInit() {
    // initialize typeahead with current outcome values
    if (this.outcome) {
      this.verb = this.outcome.verb;
      this.text = this.outcome.text;
      this.category = this.outcome.bloom;

      this.goodVerb = this.isGoodVerb(this.verb, true);
    }

    this.store.outcomeEvent.pipe(
      takeUntil(this.componentDestroyed$)
    ).subscribe((payload: Map<string, LearningOutcome>) => {
      if (payload && payload.get(this.outcome.id).bloom !== this.category) {
        // reset component with new bloom and verb
        this.category = this.outcome.bloom;
        this.verb = this.outcome.verb;

        this.goodVerb = this.isGoodVerb(this.verb, true);
      }
    });

    // listen for 'input' events on the input and parse verb & category (level)
    this.input$
      .pipe(map((event) => (event.target as HTMLInputElement).value.trim()))
      .takeUntil(this.componentDestroyed$).subscribe((val: string) => {
        const index = val.indexOf(' ');
        this.text = val;

        if (!this.verb) {
          // we haven't set a verb yet, let's set the verb now
          if (index >= 0) {
            // make sure we're doing this after a 'space' character
            this.verb = val.substring(0, index);
            this.verb = this.verb.charAt(0).toUpperCase() + this.verb.substring(1); // capitalize the first letter of the verb
            this.text = val.substring(index).trim();
            this.goodVerb = this.isGoodVerb(this.verb);

            // emit changes to parent
            if (this.goodVerb) {
              this.selectedVerb.emit(this.verb);
            }
          }

        }

        if (this.goodVerb) {
          this.enteredText.emit(this.text);
        }
    });
  }

  /**
   * Show or hide the verb dropdown menu
   */
  toggleMenu(value, event?) {
    if (event) {
      event.stopPropagation();
    }

    this.menu = value;
  }

  /**
   * Set's the verb from the dropdown menu and emits the change to parent component
   * @param verb {string} verb to set
   */
  setVerb(verb: string) {
    this.verb = verb;
    this.toggleMenu(false);

    if (this.goodVerb) {
      this.selectedVerb.emit(this.verb);
    }
  }

  /**
   * Iterate the list of levels and their verbs and check to see if passed verb is valid
   * @param verb {string} verb to be checked
   * @return {boolean} true if verb is found, false otherwise
   */
  isGoodVerb(verb: string, noEmit?: boolean): boolean {
    const levelsArray = Array.from(levels.values());
    for (let i = 0, l = levelsArray.length; i < l; i++) {
      // for this level, grab it's verbs and check if the current verb is in that list
      if (Array.from(verbs[levelsArray[i]].values()).includes(verb.charAt(0).toUpperCase() + verb.substring(1))) {
        this.category = levelsArray[i];
        if (!noEmit) {
          this.selectedCategory.emit(this.category);
        }
        return true;
      }
    }

    this.category = undefined;
    return false;
  }

  /**
   * Takes currently selected verb and returns formatted version
   * @return {string} formatted verb
   */
  getVerb() {
    return (this.verb ? this.verb.trim() : '') + ' ' + this.text.trim();
  }

  /**
   * Return list of verbs in selected category
   */
  get verbsInSelectedCategory(): string[] {
    return Array.from(verbs[this.category].values());
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }

}
