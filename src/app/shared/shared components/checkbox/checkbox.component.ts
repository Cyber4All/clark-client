import {
  Component,
  Output,
  Input,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  ChangeDetectorRef,
} from '@angular/core';

@Component({
  selector: 'clark-checkbox',
  template: `
    <button
      class="checkbox"
      id="checkbox"
      aria-label="Checkbox"
      (activate)="(state = !state) && animate()"
      [ngClass]="{ 'active': state, 'disabled': disabled, 'animating': animating }"
    >
      <i class="fas fa-check"></i>
    </button>
  `,
  styleUrls: [ 'checkbox.component.scss' ],
})
export class CheckBoxComponent implements OnChanges {
  private _state = false;
  private _animating = false;

  @Input() value: boolean = undefined;
  @Input() disabled = false;

  @Output() checkboxChecked: EventEmitter<void> = new EventEmitter();
  @Output() checkboxUnchecked: EventEmitter<void> = new EventEmitter();
  @Output() action: EventEmitter<boolean> = new EventEmitter();

  constructor(private cd: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value && this.state !== changes.value.currentValue) {
      this._state = changes.value.currentValue;
    }
  }

  get state() {
    if (!this.disabled) {
      return this._state;
    }
  }

  set state(value: boolean) {
      this._state = value;
      this.sendEvent();
  }

  get animating() {
    return this._animating;
  }

  /**
   * Trigger the burst animation on the checkbox
   */
  animate() {
    this._animating = true;
    this.cd.detectChanges();

    setTimeout(() => {
      this._animating = false;
      this.cd.detectChanges();
    }, 500);
  }

  /**
   * Emit a boolean event upwards
   */
  sendEvent() {
    if (this._state) {
      this.checkboxChecked.emit();
    } else {
      this.checkboxUnchecked.emit();
    }

    this.action.emit(this.state);
  }
}
