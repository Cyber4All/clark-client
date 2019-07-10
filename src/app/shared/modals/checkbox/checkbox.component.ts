import {
  Component,
  Output,
  Input,
  EventEmitter,
  SimpleChanges,
  OnChanges
} from '@angular/core';

@Component({
  selector: 'clark-checkbox',
  template: `
    <div
      class="checkbox"
      id="checkbox"
      aria-label="Clickable checkbox"
      (activate)="setStatus(!checked, true)"
      [ngClass]="{ active: checked, disabled: disabled }"
    ></div>
  `,
  styleUrls: [ 'checkbox.component.scss' ]
})
export class CheckBoxComponent implements OnChanges {
  checked = false;
  @Input() setValue: boolean;
  @Input() func: string;
  @Input() externalState = false;
  @Input() disabled = false;

  @Output() checkboxChecked: EventEmitter<string> = new EventEmitter();
  @Output() checkboxUnchecked: EventEmitter<string> = new EventEmitter();
  @Output() action: EventEmitter<string> = new EventEmitter();

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.setValue) {
      // this was set from the outside, so we don't need to fire an event
      this.setStatus(changes.setValue.currentValue, false);
    }
  }

  setStatus(value = true, shouldFire: boolean) {
    if (!this.externalState) {
      this.checked = value;
    }

    if (shouldFire) {
      this.sendEvent(this.func);
    }
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

    this.action.emit(this.checked ? message : '-' + message);
  }
}
