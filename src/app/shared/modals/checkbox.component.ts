import { Component, Output, Input, ElementRef, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'clark-checkbox',
  template: `
    <div class="checkbox" (click)="toggle(func)" [ngClass]="{'active': checked}"></div>
    `
})
export class CheckBoxComponent implements OnChanges {
  @Input() checked = false;
  @Input() func: string;

  @Output() checkboxChecked: EventEmitter<string> = new EventEmitter();
  @Output() checkboxUnchecked: EventEmitter<string> = new EventEmitter();
  @Output() action: EventEmitter<string> = new EventEmitter();

  constructor(private elementRef: ElementRef) { }

  toggle(f: string) {
    this.checked = !this.checked;
    this.sendEvent(f);
  }

  sendEvent(message) {
    if (typeof message === 'undefined') {
      message = '';
    }

    if (this.checked) {
      this.checkboxChecked.emit(message);
    } else {
      this.checkboxUnchecked.emit(message);
    }

    this.action.emit((this.checked) ? message : '-' + message);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.sendEvent(this.func);
  }
}