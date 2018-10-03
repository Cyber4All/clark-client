import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { verbs } from '@cyber4all/clark-taxonomy';

@Component({
  selector: 'clark-outcome-typeahead',
  templateUrl: './outcome-typeahead.component.html',
  styleUrls: ['./outcome-typeahead.component.scss']
})
export class OutcomeTypeaheadComponent implements OnInit, OnDestroy {

  @ViewChild('verbElement') verbElement: ElementRef;

  verbsList: string[];

  verb: string;
  text = '';

  input$ = new Subject<void>();
  componentDestroyed$ = new Subject<void>();

  menu = false;

  @Output() outcome: EventEmitter<string> = new EventEmitter();

  @HostListener('document:click', ['$event']) clickout(event) {
    this.toggleMenu(false);
  }

  constructor() {
    this.verbsList = Array.from(verbs['Remember and Understand'].values());
  }

  ngOnInit() {
    // @ts-ignore
    this.input$.pipe(map((event) => event.target.value.trim())).subscribe((val: string) => {
      const index = val.indexOf(' ');
      this.text = val;

      if (!this.verb) {
        if (index) {
          this.verb = val.substring(0, index);
          this.text = val.substring(index).trim();
        }
      } else {
        if (this.text === '') {
          this.text = this.verb;
          this.verb = undefined;
        }
      }

      this.emit();
    });
  }

  toggleMenu(value, event?) {
    if (event) {
      event.stopPropagation();
    }

    this.menu = value;
  }

  setVerb(verb: string) {
    this.verb = verb;
    this.toggleMenu(false);

    this.emit();
  }

  emit() {
    this.outcome.emit(this.output);
  }

  get output() {
    return (this.verb ? this.verb.trim() : '') + ' ' + this.text.trim();
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }

}
