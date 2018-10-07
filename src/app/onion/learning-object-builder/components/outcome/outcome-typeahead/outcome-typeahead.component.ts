import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { verbs, levels } from '@cyber4all/clark-taxonomy';

@Component({
  selector: 'clark-outcome-typeahead',
  templateUrl: './outcome-typeahead.component.html',
  styleUrls: ['./outcome-typeahead.component.scss']
})
export class OutcomeTypeaheadComponent implements OnInit, OnDestroy {

  @ViewChild('verbElement') verbElement: ElementRef;

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

  constructor() {
  }

  ngOnInit() {
    // listen for 'input' events on the input and parse verb & category (level)
    this.input$
      .pipe(map((event) => (event.target as HTMLInputElement).value.trim()))
      .takeUntil(this.componentDestroyed$).subscribe((val: string) => {
        const index = val.indexOf(' ');
        this.text = val;

        if (!this.verb) {
          // we haven't set a verb yet, let's set the verb now
          if (index) {
            // make sure we're doing this after a 'space' character
            this.verb = val.substring(0, index);
            this.text = val.substring(index).trim();
            this.goodVerb = this.isGoodVerb(this.verb);
          }
        } else {
          // we've already set a verb
          if (this.text === '') {
            // we've backspaced everything, set the verb as text and clear the verb
            this.text = this.verb;
            this.verb = undefined;
            this.goodVerb = undefined;
          }
        }

        // emit changes to parent component
        this.emit();
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

    this.emit();
  }

  /**
   * Iterate the list of levels and their verbs and check to see if passed verb is valid
   * @param verb {string} verb to be checked
   * @return {boolean} true if verb is found, false otherwise
   */
  isGoodVerb(verb: string): boolean {
    const levelsArray = Array.from(levels.values());
    for (let i = 0, l = levelsArray.length; i < l; i++) {
      // for this level, grab it's verbs and check if the current verb is in that list
      if (Array.from(verbs[levelsArray[i]].values()).includes(verb)) {
        this.category = levelsArray[i];
        return true;
      }
    }

    this.category = undefined;
    return false;
  }

  /**
   * Emit selected verb, selected category, and current text to parent component
   */
  emit() {
    this.selectedVerb.emit(this.getVerb());
    this.selectedCategory.emit(this.category);
    this.enteredText.emit(this.text);
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
