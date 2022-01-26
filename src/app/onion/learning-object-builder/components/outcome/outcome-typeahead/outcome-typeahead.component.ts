import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { taxonomy, levels } from '@cyber4all/clark-taxonomy';

@Component({
  selector: 'clark-outcome-typeahead',
  templateUrl: './outcome-typeahead.component.html',
  styleUrls: ['./outcome-typeahead.component.scss'],
})
export class OutcomeTypeaheadComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('verbElement') verbElement: ElementRef;

  @Input() verb: string;
  @Input() bloom: string;
  @Input() text: string;

  goodVerb: boolean;

  input$ = new Subject<KeyboardEvent>();
  componentDestroyed$ = new Subject<void>();

  menu = false;

  // Create event emitters
  @Output() selectedVerb: EventEmitter<string> = new EventEmitter();
  @Output() selectedCategory: EventEmitter<string> = new EventEmitter();
  @Output() enteredText: EventEmitter<string> = new EventEmitter();
  // this event emitter helps to change the overflow value from hidden to visible when the dropdown button is clicked
  @Output() overflowValue: EventEmitter<any> = new EventEmitter();

  /**
   * Listen for click aways from the dropdown menu
   */
  @HostListener('document:click', ['$event']) clickout() {
    this.toggleMenu(false);
    // when there are clicks away from the dropdown menu, the overflow is set to hidden (false)
    this.overflowValue.emit(false);
  }

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.bloom && changes.verb) {
      this.goodVerb = true;
    }
  }

  ngOnInit() {
    // listen for 'input' events on the input and parse verb & category (level)
    this.input$
      .pipe(
        map((event) => (event.target as HTMLInputElement).value.trim()),
        takeUntil(this.componentDestroyed$)
      )
      .subscribe((val: string) => {
        // remove bullets and update the text of the outcome
        const regex = /^\d\.\s+|[a-z]\)\s+|•\s+|[A-Z]\.\s+|[IVX]+\.\s+/;
        const i = val.search(regex);
        if (i === 0) {
          val = val.replace(regex, '');
        }

        const index = val.indexOf(' ');
        this.text = val;

        if (!this.verb) {
          // we haven't set a verb yet, let's set the verb now
          if (index >= 0) {
            // make sure we're doing this after a 'space' character
            this.verb = val.substring(0, index);
            this.verb =
              this.verb.charAt(0).toUpperCase() + this.verb.substring(1); // capitalize the first letter of the verb
            this.text = val.substring(index).trim();
            this.goodVerb = this.isGoodVerb(this.verb);

            // emit changes to parent
            if (this.goodVerb) {
              this.selectedVerb.emit(this.verb);
            }
          }
        } else if (index === -1 && this.text.length === 0) {
          // we've backspaced to the verb, remove the dropdown and put the text inline
          this.text = this.verb;

          this.verb = undefined;
          this.bloom = undefined;
          this.goodVerb = false;
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
      // when the dropdown menu is clicked, the overflow value is set to visible (true)
      this.overflowValue.emit(true);
    }
    this.menu = value;
  }

  /**
   * Set's the verb from the dropdown menu and emits the change to parent component
   *
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
   *
   * @param verb {string} verb to be checked
   * @return {boolean} true if verb is found, false otherwise
   */
  isGoodVerb(verb: string, noEmit?: boolean): boolean {
    const levelsArray = Array.from(levels.values());
    for (let i = 0, l = levelsArray.length; i < l; i++) {
      // for this level, grab it's verbs and check if the current verb is in that list
      if (taxonomy.taxons[levelsArray[i]].verbs.includes(verb.toLowerCase())) {
        this.bloom = levelsArray[i];
        if (!noEmit) {
          this.selectedCategory.emit(this.bloom);
        }
        return true;
      }
    }

    this.bloom = undefined;
    return false;
  }

  /**
   * Takes currently selected verb and returns formatted version
   *
   * @return {string} formatted verb
   */
  getVerb() {
    return (this.verb ? this.verb.trim() : '') + ' ' + this.text.trim();
  }

  /**
   * Return list of verbs in selected category
   */
  get verbsInSelectedCategory(): string[] {
    return taxonomy.taxons[this.bloom].verbs;
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
